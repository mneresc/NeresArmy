#!/usr/bin/env python3
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).parents[1]
SCRIPT = Path(__file__).with_name("validate_profile.py")
TEMPLATE = SKILL_ROOT / "assets" / "LEARNING_PROFILE.template.md"


def valid_profile() -> str:
    return TEMPLATE.read_text(encoding="utf-8").replace("YYYY-MM-DD", "2026-01-01")


def run_validator(content: str) -> subprocess.CompletedProcess[str]:
    with tempfile.TemporaryDirectory(prefix="inclusive-profile-") as directory:
        profile = Path(directory) / "LEARNING_PROFILE.md"
        profile.write_text(content, encoding="utf-8")
        return subprocess.run(
            [sys.executable, str(SCRIPT), str(profile)],
            capture_output=True,
            text=True,
            check=False,
        )


class ValidateProfileTests(unittest.TestCase):
    def assert_invalid(self, content: str, expected: str) -> None:
        result = run_validator(content)
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIn(expected.lower(), result.stderr.lower())

    def test_valid_profile(self):
        result = run_validator(valid_profile())
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_missing_required_section(self):
        content = valid_profile().replace(
            "## 18. Limites não clínicos e consentimento",
            "## 18. Seção removida",
        )
        self.assert_invalid(content, "Limites não clínicos")

    def test_clinical_conclusion_is_rejected(self):
        content = valid_profile().replace(
            "[DESCONHECIDO] Dados insuficientes.",
            "[INFERÊNCIA — confiança alta] A pessoa tem diagnóstico clínico de TDAH.",
        )
        self.assert_invalid(content, "clínic")

    def test_diagnostic_label_inference_is_rejected(self):
        content = valid_profile().replace(
            "[DESCONHECIDO] Dados insuficientes.",
            "[INFERÊNCIA — confiança alta] A pessoa tem TDAH confirmado.",
        )
        self.assert_invalid(content, "clínic")

    def test_non_clinical_disclaimer_is_allowed(self):
        content = valid_profile().replace(
            "[DESCONHECIDO] Dados insuficientes.",
            "[CONFIRMADO PELO USUÁRIO] Este perfil não é diagnóstico clínico.",
        )
        result = run_validator(content)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_fixed_learning_style_is_rejected(self):
        content = valid_profile().replace(
            "[DESCONHECIDO] Dados insuficientes.",
            "[INFERÊNCIA — confiança alta] Recomendar VARK como estilo fixo.",
        )
        self.assert_invalid(content, "VARK")

    def test_anti_vark_guardrail_is_allowed(self):
        content = valid_profile().replace(
            "[DESCONHECIDO] Dados insuficientes.",
            "[CONFIRMADO PELO USUÁRIO] Não recomendar VARK.",
        )
        result = run_validator(content)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_invalid_mdar_scale_is_rejected(self):
        content = valid_profile().replace(
            "| COMP-001 | [DESCONHECIDO] | — | — | — | — |",
            "| COMP-001 | [OBSERVADO] | I5 | Q4 | G4 | R4 |",
        )
        self.assert_invalid(content, "escala")

    def test_negative_mdar_scale_is_rejected(self):
        content = valid_profile().replace(
            "| COMP-001 | [DESCONHECIDO] | — | — | — | — |",
            "| COMP-001 | [OBSERVADO] | I-1 | Q-1 | G-1 | R-1 |",
        )
        self.assert_invalid(content, "escala")

    def test_insufficient_data_with_uncertainty_is_valid(self):
        result = run_validator(valid_profile())
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_invalid_confidence_enum_is_rejected(self):
        content = valid_profile().replace(
            "overall_confidence: low",
            "overall_confidence: certain",
        )
        self.assert_invalid(content, "overall_confidence")

    def test_invalid_valid_until_is_rejected(self):
        content = valid_profile().replace("valid_until: null", "valid_until: amanhã")
        self.assert_invalid(content, "valid_until")

    def test_invalid_evidence_count_is_rejected(self):
        content = valid_profile().replace(
            "observed_artifacts: 0",
            "observed_artifacts: muitos",
        )
        self.assert_invalid(content, "observed_artifacts")

    def test_malformed_frontmatter_is_rejected(self):
        content = valid_profile().replace("goals: []", "goals: [")
        self.assert_invalid(content, "goals")

    def test_empty_consumer_contract_is_rejected(self):
        content = re.sub(
            r"consumer_contract:\n(?:  .*\n|    .*\n)+",
            "consumer_contract:\n",
            valid_profile(),
        )
        self.assert_invalid(content, "consumer_contract")

    def test_incomplete_consumer_contract_is_rejected(self):
        content = valid_profile().replace("    - clinical_diagnosis\n", "")
        self.assert_invalid(content, "clinical_diagnosis")

    def test_prose_recommendation_without_provenance_is_rejected(self):
        content = valid_profile().replace(
            "- [DESCONHECIDO] Não personalizar sem evidência.",
            "Use sempre mapas mentais.",
        )
        self.assert_invalid(content, "marcador")

    def test_adaptation_rule_without_provenance_is_rejected(self):
        content = valid_profile().replace(
            "  adaptation_rules: []",
            "  adaptation_rules:\n    - Sempre reduzir a dificuldade.",
        )
        self.assert_invalid(content, "marcador")


if __name__ == "__main__":
    unittest.main()
