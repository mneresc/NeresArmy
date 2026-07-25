#!/usr/bin/env python3
"""Deterministically validate a Neres inclusive learner profile."""

from __future__ import annotations

import csv
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path
from typing import Any


REQUIRED_SECTIONS = [
    "# Perfil Operacional de Aprendizagem",
    "## 1. Como usar este documento",
    "## 2. Escopo, objetivo e prazo",
    "## 3. Fontes e evidências analisadas",
    "## 4. Síntese operacional",
    "## 5. Forças e teto de desafio",
    "## 6. Barreiras funcionais e de acesso",
    "## 7. Apoios eficazes, ineficazes e ainda não testados",
    "## 8. MDAR por competência",
    "## 9. Recomendações para desenho de materiais",
    "## 10. Recomendações para questões e feedback",
    "## 11. Recomendações para sessões e revisões",
    "## 12. Acessibilidade sem redução de expectativa",
    "## 13. Compactação, enriquecimento ou aceleração",
    "## 14. Contextos que alteram o desempenho",
    "## 15. Regras de adaptação para outras skills",
    "## 16. Incertezas, contradições e dados faltantes",
    "## 17. Gatilhos para reavaliação",
    "## 18. Limites não clínicos e consentimento",
]
PROVENANCE_MARKERS = (
    "[OBSERVADO]",
    "[AUTORRELATO]",
    "[INFERÊNCIA",
    "[CONFIRMADO PELO USUÁRIO]",
    "[DESCONHECIDO]",
)
TOP_LEVEL_FIELDS = {
    "profile_schema",
    "profile_status",
    "created_at",
    "updated_at",
    "scope",
    "consent",
    "evidence_summary",
}
NESTED_FIELDS = {
    "scope": {"subjects", "goals", "valid_until"},
    "consent": {"sensitive_data_storage", "artifact_analysis"},
    "evidence_summary": {
        "observed_artifacts",
        "self_report_items",
        "micro_assessments",
        "overall_confidence",
    },
}
REQUIRED_MAY_USE = {
    "confirmed_goals",
    "observed_strengths",
    "functional_access_needs",
    "evidence_backed_supports",
    "competency_specific_mdar",
}
REQUIRED_MUST_NOT_INFER = {
    "clinical_diagnosis",
    "intelligence_level",
    "fixed_learning_style",
    "global_capacity_from_one_subject",
}
CONTRACT_FIELDS = {
    "may_use",
    "must_not_infer",
    "adaptation_rules",
    "recheck_when",
}


def fold_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(char for char in normalized if not unicodedata.combining(char)).lower()


def parse_frontmatter(source: str) -> tuple[str, str, list[str]]:
    match = re.match(r"\A---\r?\n(.*?)\r?\n---\r?\n?([\s\S]*)\Z", source, re.DOTALL)
    if not match:
        return "", source, ["frontmatter ausente ou inválido"]
    return match.group(1), match.group(2), []


def parse_inline_list(raw: str, field: str, errors: list[str]) -> list[str] | None:
    if not raw.startswith("[") or not raw.endswith("]"):
        errors.append(f"{field} precisa ser uma lista YAML")
        return None
    inner = raw[1:-1].strip()
    if not inner:
        return []
    try:
        values = next(csv.reader([inner], skipinitialspace=True))
    except csv.Error:
        errors.append(f"{field} contém lista YAML inválida")
        return None
    cleaned = [value.strip().strip("'\"") for value in values]
    if any(not value for value in cleaned):
        errors.append(f"{field} contém item vazio")
        return None
    return cleaned


def parse_scalar(raw: str, field: str, errors: list[str]) -> Any:
    value = raw.strip()
    if not value:
        errors.append(f"{field} não pode ficar vazio")
        return None
    if value == "null":
        return None
    if value in {"true", "false"}:
        return value == "true"
    if re.fullmatch(r"-?\d+", value):
        return int(value)
    if value.startswith("[") or value.endswith("]"):
        return parse_inline_list(value, field, errors)
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def parse_frontmatter_schema(frontmatter: str, errors: list[str]) -> dict[str, Any]:
    data: dict[str, Any] = {}
    current_section: str | None = None
    current_list: str | None = None

    for line_number, line in enumerate(frontmatter.splitlines(), start=2):
        if not line.strip():
            continue
        if "\t" in line:
            errors.append(f"frontmatter linha {line_number}: tabulação não permitida")
            continue
        indent = len(line) - len(line.lstrip(" "))
        stripped = line.strip()

        if indent == 0:
            current_list = None
            if ":" not in stripped:
                errors.append(f"frontmatter linha {line_number}: mapeamento inválido")
                current_section = None
                continue
            key, raw = stripped.split(":", 1)
            if key not in TOP_LEVEL_FIELDS:
                errors.append(f"frontmatter contém campo desconhecido: {key}")
                current_section = None
                continue
            if key in data:
                errors.append(f"frontmatter contém campo duplicado: {key}")
                current_section = None
                continue
            if key in NESTED_FIELDS:
                if raw.strip():
                    errors.append(f"{key} precisa ser um bloco YAML")
                data[key] = {}
                current_section = key
            else:
                data[key] = parse_scalar(raw, key, errors)
                current_section = None
            continue

        if indent == 2:
            current_list = None
            if current_section is None or ":" not in stripped:
                errors.append(f"frontmatter linha {line_number}: indentação inválida")
                continue
            key, raw = stripped.split(":", 1)
            if key not in NESTED_FIELDS[current_section]:
                errors.append(f"{current_section} contém campo desconhecido: {key}")
                continue
            section = data[current_section]
            if key in section:
                errors.append(f"{current_section}.{key} duplicado")
                continue
            field = f"{current_section}.{key}"
            if not raw.strip() and key in {"subjects", "goals"}:
                section[key] = []
                current_list = key
            else:
                section[key] = parse_scalar(raw, field, errors)
            continue

        if indent == 4 and stripped.startswith("- "):
            if current_section is None or current_list is None:
                errors.append(f"frontmatter linha {line_number}: item de lista sem campo")
                continue
            item = stripped[2:].strip().strip("'\"")
            if not item:
                errors.append(
                    f"{current_section}.{current_list} contém item vazio"
                )
            else:
                data[current_section][current_list].append(item)
            continue

        errors.append(f"frontmatter linha {line_number}: indentação não suportada")

    return data


def parse_iso_date(value: Any, field: str, errors: list[str]) -> date | None:
    if not isinstance(value, str):
        errors.append(f"{field} precisa ser uma data ISO YYYY-MM-DD")
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        errors.append(f"{field} não é uma data ISO válida")
        return None


def validate_frontmatter(data: dict[str, Any], errors: list[str]) -> None:
    missing_top = TOP_LEVEL_FIELDS - data.keys()
    for key in sorted(missing_top):
        errors.append(f"frontmatter sem {key}")

    if data.get("profile_schema") != "learning-profile/v1":
        errors.append(f"profile_schema inválido: {data.get('profile_schema')}")
    if data.get("profile_status") not in {"provisional", "user_confirmed"}:
        errors.append(f"profile_status inválido: {data.get('profile_status')}")

    created = parse_iso_date(data.get("created_at"), "created_at", errors)
    updated = parse_iso_date(data.get("updated_at"), "updated_at", errors)
    if created and updated and updated < created:
        errors.append("updated_at não pode ser anterior a created_at")

    for section_name, fields in NESTED_FIELDS.items():
        section = data.get(section_name)
        if not isinstance(section, dict):
            errors.append(f"frontmatter sem bloco {section_name}")
            continue
        for key in sorted(fields - section.keys()):
            errors.append(f"{section_name} sem {key}")

    scope = data.get("scope")
    if isinstance(scope, dict):
        for key in ("subjects", "goals"):
            value = scope.get(key)
            if not isinstance(value, list) or any(
                not isinstance(item, str) or not item.strip() for item in value
            ):
                errors.append(f"scope.{key} precisa ser uma lista de textos")
        valid_until = scope.get("valid_until")
        if valid_until is not None:
            parse_iso_date(valid_until, "valid_until", errors)

    consent = data.get("consent")
    if isinstance(consent, dict):
        for key in ("sensitive_data_storage", "artifact_analysis"):
            if not isinstance(consent.get(key), bool):
                errors.append(f"consent.{key} precisa ser booleano")

    evidence = data.get("evidence_summary")
    if isinstance(evidence, dict):
        for key in ("observed_artifacts", "self_report_items", "micro_assessments"):
            value = evidence.get(key)
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                errors.append(
                    f"evidence_summary.{key} precisa ser inteiro não negativo"
                )
        confidence = evidence.get("overall_confidence")
        if confidence not in {"low", "moderate", "high"}:
            errors.append(f"overall_confidence inválido: {confidence}")


def parse_consumer_contract(body: str, errors: list[str]) -> dict[str, list[str]]:
    blocks = re.findall(r"```ya?ml\s*\r?\n(.*?)\r?\n```", body, re.DOTALL)
    contract_source = next(
        (block for block in blocks if re.search(r"(?m)^consumer_contract:\s*$", block)),
        None,
    )
    if contract_source is None:
        errors.append("consumer_contract ausente ou fora de bloco YAML")
        return {}

    contract: dict[str, list[str]] = {}
    current_field: str | None = None
    lines = contract_source.splitlines()
    if not lines or lines[0].strip() != "consumer_contract:":
        errors.append("consumer_contract precisa iniciar o bloco YAML")
        return {}

    for line_number, line in enumerate(lines[1:], start=2):
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip(" "))
        stripped = line.strip()
        if indent == 2 and ":" in stripped:
            key, raw = stripped.split(":", 1)
            if key not in CONTRACT_FIELDS:
                errors.append(f"consumer_contract contém campo desconhecido: {key}")
                current_field = None
                continue
            if key in contract:
                errors.append(f"consumer_contract contém campo duplicado: {key}")
                current_field = None
                continue
            if raw.strip() == "[]":
                contract[key] = []
                current_field = None
            elif raw.strip():
                errors.append(f"consumer_contract.{key} precisa ser uma lista")
                current_field = None
            else:
                contract[key] = []
                current_field = key
            continue
        if indent == 4 and stripped.startswith("- ") and current_field:
            item = stripped[2:].strip().strip("'\"")
            if item:
                contract[current_field].append(item)
            else:
                errors.append(f"consumer_contract.{current_field} contém item vazio")
            continue
        errors.append(
            f"consumer_contract linha {line_number}: estrutura YAML inválida"
        )

    for key in sorted(CONTRACT_FIELDS - contract.keys()):
        errors.append(f"consumer_contract sem {key}")

    may_use = set(contract.get("may_use", []))
    for item in sorted(REQUIRED_MAY_USE - may_use):
        errors.append(f"consumer_contract.may_use sem {item}")
    for item in sorted(may_use - REQUIRED_MAY_USE):
        errors.append(f"consumer_contract.may_use contém valor desconhecido: {item}")

    must_not = set(contract.get("must_not_infer", []))
    for item in sorted(REQUIRED_MUST_NOT_INFER - must_not):
        errors.append(f"consumer_contract.must_not_infer sem {item}")
    for item in sorted(must_not - REQUIRED_MUST_NOT_INFER):
        errors.append(
            f"consumer_contract.must_not_infer contém valor desconhecido: {item}"
        )

    for key in ("adaptation_rules", "recheck_when"):
        for item in contract.get(key, []):
            if not any(marker in item for marker in PROVENANCE_MARKERS):
                errors.append(
                    f"consumer_contract.{key} contém recomendação sem marcador"
                )
                break

    return contract


def is_safe_negative_statement(folded: str) -> bool:
    return any(
        phrase in folded
        for phrase in (
            "nao e diagnostico",
            "nao constitui diagnostico",
            "nao inferir",
            "nao diagnosticar",
            "nao confirmar",
            "nao recomendar",
            "nao usar",
            "evitar vark",
            "proibido",
            "must_not_infer",
        )
    )


def validate_clinical_and_style_claims(
    body: str,
    allow_sensitive_data: bool,
    errors: list[str],
) -> None:
    in_fence = False
    clinical_pattern = re.compile(
        r"\b(?:tdah|autis(?:mo|ta)|dislexia|deficiencia intelectual|"
        r"altas habilidades|superdotacao|diagnostico clinico|diagnostico de)\b"
    )
    style_pattern = re.compile(
        r"\b(?:vark|estilo de aprendizagem|estilo fixo|"
        r"aprendiz visual|aprendiz auditivo|aprendiz cinestesico)\b"
    )

    for line in body.splitlines():
        if line.strip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        folded = fold_text(line)
        if not folded:
            continue

        if clinical_pattern.search(folded):
            if is_safe_negative_statement(folded):
                pass
            elif "[INFERÊNCIA" in line or "[DESCONHECIDO]" in line:
                errors.append(
                    "conclusão clínica proibida; registre somente necessidade funcional"
                )
                break
            elif (
                "[AUTORRELATO]" in line
                or "[CONFIRMADO PELO USUÁRIO]" in line
            ) and allow_sensitive_data:
                pass
            else:
                errors.append(
                    "campo clínico sem consentimento ou apresentado como conclusão"
                )
                break

        if style_pattern.search(folded) and not is_safe_negative_statement(folded):
            errors.append("VARK ou estilo fixo usado como recomendação")
            break


def validate_recommendation_provenance(body: str, errors: list[str]) -> None:
    current_section = 0
    in_fence = False
    for line in body.splitlines():
        heading = re.match(r"##\s+(\d+)\.", line)
        if heading:
            current_section = int(heading.group(1))
            in_fence = False
            continue
        if line.strip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or current_section not in range(9, 16):
            continue
        stripped = line.strip()
        if not stripped or stripped.startswith("|"):
            continue
        if not any(marker in line for marker in PROVENANCE_MARKERS):
            errors.append(
                f"seção {current_section} contém recomendação sem marcador"
            )
            return


def validate_body(
    body: str,
    frontmatter: dict[str, Any],
    errors: list[str],
) -> None:
    lines = body.splitlines()
    previous_position = -1
    for section in REQUIRED_SECTIONS:
        positions = [index for index, line in enumerate(lines) if line == section]
        if not positions:
            errors.append(f"seção obrigatória ausente: {section}")
            continue
        if len(positions) > 1:
            errors.append(f"seção obrigatória duplicada: {section}")
        if positions[0] <= previous_position:
            errors.append(f"seção obrigatória fora de ordem: {section}")
        previous_position = positions[0]

    if not any(marker in body for marker in PROVENANCE_MARKERS):
        errors.append("nenhum marcador de proveniência encontrado")
    if "incerteza" not in fold_text(body) and "[DESCONHECIDO]" not in body:
        errors.append("o perfil precisa declarar incerteza ou desconhecimento")

    parse_consumer_contract(body, errors)

    consent = frontmatter.get("consent", {})
    allow_sensitive = bool(
        isinstance(consent, dict) and consent.get("sensitive_data_storage") is True
    )
    validate_clinical_and_style_claims(body, allow_sensitive, errors)

    for axis, maximum in (("I", 4), ("Q", 3), ("G", 3), ("R", 3)):
        for raw in re.findall(rf"(?<![A-Za-z0-9]){axis}\s*(-?\d+)\b", body):
            value = int(raw)
            if value < 0 or value > maximum:
                errors.append(
                    f"escala {axis} inválida: {axis}{raw}; permitido {axis}0–{axis}{maximum}"
                )

    validate_recommendation_provenance(body, errors)


def validate_profile(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"arquivo não encontrado: {path}"]
    if path.suffix.lower() != ".md":
        errors.append("o perfil precisa ser um arquivo Markdown")
    try:
        source = path.read_text(encoding="utf-8")
    except UnicodeError as error:
        return [f"arquivo não está em UTF-8: {error}"]

    frontmatter_source, body, parse_errors = parse_frontmatter(source)
    errors.extend(parse_errors)
    frontmatter: dict[str, Any] = {}
    if frontmatter_source:
        frontmatter = parse_frontmatter_schema(frontmatter_source, errors)
        validate_frontmatter(frontmatter, errors)
    validate_body(body, frontmatter, errors)
    return errors


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(
            "Uso: python validate_profile.py <learning/LEARNING_PROFILE.md>",
            file=sys.stderr,
        )
        return 2
    errors = validate_profile(Path(argv[1]))
    if errors:
        print("Perfil inválido:", file=sys.stderr)
        for error in dict.fromkeys(errors):
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Perfil válido: {argv[1]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
