#!/usr/bin/env python3
"""Deterministically validate a Neres inclusive learner profile."""

from __future__ import annotations

import re
import sys
from datetime import date
from pathlib import Path


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
SCALAR_FIELDS = {
    "profile_schema": r"learning-profile/v1",
    "profile_status": r"(?:provisional|user_confirmed)",
    "created_at": r"\d{4}-\d{2}-\d{2}",
    "updated_at": r"\d{4}-\d{2}-\d{2}",
}


def parse_frontmatter(source: str) -> tuple[str, str, list[str]]:
    errors: list[str] = []
    match = re.match(r"\A---\r?\n(.*?)\r?\n---\r?\n?([\s\S]*)\Z", source, re.DOTALL)
    if not match:
        return "", source, ["frontmatter ausente ou inválido"]
    return match.group(1), match.group(2), errors


def field_value(frontmatter: str, key: str) -> str | None:
    match = re.search(rf"(?m)^{re.escape(key)}:\s*(.*?)\s*$", frontmatter)
    return match.group(1).strip() if match else None


def validate_frontmatter(frontmatter: str, errors: list[str]) -> None:
    for key, pattern in SCALAR_FIELDS.items():
        value = field_value(frontmatter, key)
        if value is None:
            errors.append(f"frontmatter sem {key}")
        elif not re.fullmatch(pattern, value):
            errors.append(f"{key} inválido: {value}")

    for key in ("scope", "consent", "evidence_summary"):
        if not re.search(rf"(?m)^{re.escape(key)}:\s*$", frontmatter):
            errors.append(f"frontmatter sem bloco {key}")

    for key in ("subjects", "goals", "valid_until"):
        if not re.search(rf"(?m)^\s{{2}}{re.escape(key)}:\s*.+$", frontmatter):
            errors.append(f"scope sem {key}")
    for key in ("sensitive_data_storage", "artifact_analysis"):
        if not re.search(rf"(?m)^\s{{2}}{re.escape(key)}:\s*(?:true|false)\s*$", frontmatter):
            errors.append(f"consent sem booleano {key}")
    for key in ("observed_artifacts", "self_report_items", "micro_assessments", "overall_confidence"):
        if not re.search(rf"(?m)^\s{{2}}{re.escape(key)}:\s*.+$", frontmatter):
            errors.append(f"evidence_summary sem {key}")

    for key in ("created_at", "updated_at"):
        value = field_value(frontmatter, key)
        if value:
            try:
                date.fromisoformat(value)
            except ValueError:
                errors.append(f"{key} não é uma data ISO válida")

    confidence = field_value(frontmatter, "overall_confidence")
    if confidence and confidence not in {"low", "moderate", "high"}:
        errors.append(f"overall_confidence inválido: {confidence}")


def validate_body(body: str, errors: list[str]) -> None:
    lines = body.splitlines()
    for section in REQUIRED_SECTIONS:
        if section not in lines:
            errors.append(f"seção obrigatória ausente: {section}")

    if not any(marker in body for marker in PROVENANCE_MARKERS):
        errors.append("nenhum marcador de proveniência encontrado")
    if "incerteza" not in body.lower() and "[DESCONHECIDO]" not in body:
        errors.append("o perfil precisa declarar incerteza ou desconhecimento")
    if not re.search(r"(?m)^consumer_contract:\s*$", body):
        errors.append("consumer_contract ausente")

    lower = body.lower()
    for line in lines:
        normalized = line.lower()
        if "diagnóstico clínico" in normalized or "diagnostico clinico" in normalized:
            is_explicit_context = "contexto" in normalized and "não é conclusão" in normalized
            if not is_explicit_context:
                errors.append("conclusão clínica proibida; registre apenas necessidade funcional autorizada")
                break
        if "vark" in normalized or "estilo de aprendizagem" in normalized:
            errors.append("VARK ou estilo fixo de aprendizagem não é permitido")
            break

    for axis, maximum in (("I", 4), ("Q", 3), ("G", 3), ("R", 3)):
        for raw in re.findall(rf"\b{axis}(\d+)\b", body):
            if int(raw) > maximum:
                errors.append(f"escala {axis} inválida: {axis}{raw}; máximo permitido é {axis}{maximum}")

    in_recommendations = False
    for line in lines:
        if line.startswith("## "):
            in_recommendations = bool(re.match(r"## (?:9|10|11|12|13|14)\.", line))
        if in_recommendations and line.lstrip().startswith("-") and not any(marker in line for marker in PROVENANCE_MARKERS):
            errors.append("recomendação sem marcador de evidência ou incerteza")
            break


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
    frontmatter, body, parse_errors = parse_frontmatter(source)
    errors.extend(parse_errors)
    if frontmatter:
        validate_frontmatter(frontmatter, errors)
    validate_body(body, errors)
    return errors


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Uso: python validate_profile.py <learning/LEARNING_PROFILE.md>", file=sys.stderr)
        return 2
    errors = validate_profile(Path(argv[1]))
    if errors:
        print("Perfil inválido:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Perfil válido: {argv[1]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
