#!/usr/bin/env python3
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("validate_profile.py")


def valid_profile() -> str:
    sections = "\n".join(
        [
            "# Perfil Operacional de Aprendizagem",
            "## 1. Como usar este documento\n[OBSERVADO] Uso consultivo.",
            "## 2. Escopo, objetivo e prazo\n[DESCONHECIDO] Prazo ainda não informado.",
            "## 3. Fontes e evidências analisadas\n[DESCONHECIDO] Nenhum arquivo analisado.",
            "## 4. Síntese operacional\n[INFERÊNCIA — confiança baixa] Ainda não há amostra.",
            "## 5. Forças e teto de desafio\n[DESCONHECIDO] A medir.",
            "## 6. Barreiras funcionais e de acesso\n[DESCONHECIDO] A investigar somente se relevante.",
            "## 7. Apoios eficazes, ineficazes e ainda não testados\n[DESCONHECIDO] Nenhum apoio testado.",
            "## 8. MDAR por competência\n| Competência | Evidência | I | Q | G | R | Fluência | Acesso/contexto | Incerteza | Próxima medição |\n| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |\n| COMP-001 | [DESCONHECIDO] | — | — | — | — | — | — | alta | microamostra |",
            "## 9. Recomendações para desenho de materiais\n- [DESCONHECIDO] Não personalizar sem evidência.",
            "## 10. Recomendações para questões e feedback\n- [DESCONHECIDO] A definir após amostra.",
            "## 11. Recomendações para sessões e revisões\n- [DESCONHECIDO] A definir após objetivo.",
            "## 12. Acessibilidade sem redução de expectativa\n- [DESCONHECIDO] Registrar apenas necessidade funcional autorizada.",
            "## 13. Compactação, enriquecimento ou aceleração\n- [DESCONHECIDO] Não decidir sem retenção e transferência.",
            "## 14. Contextos que alteram o desempenho\n- [DESCONHECIDO] Contexto ainda não observado.",
            "## 15. Regras de adaptação para outras skills\n```yaml\nconsumer_contract:\n  may_use:\n    - confirmed_goals\n    - observed_strengths\n    - functional_access_needs\n    - evidence_backed_supports\n    - competency_specific_mdar\n  must_not_infer:\n    - clinical_diagnosis\n    - intelligence_level\n    - fixed_learning_style\n    - global_capacity_from_one_subject\n  adaptation_rules: []\n  recheck_when: []\n```",
            "## 16. Incertezas, contradições e dados faltantes\n[DESCONHECIDO] Dados insuficientes.",
            "## 17. Gatilhos para reavaliação\n[DESCONHECIDO] Nova amostra, mudança de objetivo ou prazo.",
            "## 18. Limites não clínicos e consentimento\n[CONFIRMADO PELO USUÁRIO] Dados sensíveis não serão armazenados sem autorização.",
        ]
    )
    return f"""---
profile_schema: learning-profile/v1
profile_status: provisional
created_at: 2026-01-01
updated_at: 2026-01-01
scope:
  subjects: []
  goals: []
  valid_until: null
consent:
  sensitive_data_storage: false
  artifact_analysis: true
evidence_summary:
  observed_artifacts: 0
  self_report_items: 0
  micro_assessments: 0
  overall_confidence: low
---

{sections}
"""


def run_validator(content: str):
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
    def test_valid_profile(self):
        result = run_validator(valid_profile())
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_missing_required_section(self):
        result = run_validator(valid_profile().replace("## 18. Limites não clínicos e consentimento", "## 18. Seção removida"))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Limites não clínicos", result.stderr)

    def test_clinical_conclusion_is_rejected(self):
        result = run_validator(valid_profile().replace("[DESCONHECIDO] Dados insuficientes.", "[INFERÊNCIA — confiança alta] a pessoa tem diagnóstico clínico de TDAH."))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("clínic", result.stderr.lower())

    def test_fixed_learning_style_is_rejected(self):
        result = run_validator(valid_profile().replace("[DESCONHECIDO] Dados insuficientes.", "[INFERÊNCIA — confiança alta] Recomendar VARK como estilo fixo."))
        self.assertNotEqual(result.returncode, 0)
        self.assertRegex(result.stderr.lower(), r"vark|estilo")

    def test_invalid_mdar_scale_is_rejected(self):
        invalid = valid_profile().replace("| COMP-001 | [DESCONHECIDO] | — | — | — | — |", "| COMP-001 | [OBSERVADO] | I5 | Q4 | G4 | R4 |")
        result = run_validator(invalid)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("escala", result.stderr.lower())

    def test_insufficient_data_with_uncertainty_is_valid(self):
        result = run_validator(valid_profile())
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
