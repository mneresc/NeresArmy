#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_ROOT = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_ROOT))

from validate_canvas import validate_canvas  # noqa: E402
from validate_manifest import validate_manifest  # noqa: E402
from visual_map import (  # noqa: E402
    build_canvas,
    build_recall_canvas,
    normalize_vault_path,
    route_diagram,
    stable_id,
    update_canvas,
)


def minimal_canvas() -> dict:
    return {
        "nodes": [
            {
                "id": "1111111111111111",
                "type": "text",
                "x": 0,
                "y": 0,
                "width": 300,
                "height": 120,
                "text": "# Regra\n\nConteúdo",
            },
            {
                "id": "2222222222222222",
                "type": "text",
                "x": 400,
                "y": 0,
                "width": 300,
                "height": 120,
                "text": "# Exceção",
            },
        ],
        "edges": [
            {
                "id": "3333333333333333",
                "fromNode": "1111111111111111",
                "fromSide": "right",
                "toNode": "2222222222222222",
                "toSide": "left",
                "toEnd": "arrow",
                "label": "é limitada por",
            }
        ],
    }


def sample_ir() -> dict:
    return {
        "title": "Regra e exceção",
        "language": "pt-BR",
        "intent": "concept-map",
        "nodes": [
            {
                "semanticKey": "regra",
                "label": "Regra",
                "summary": "Conteúdo",
                "kind": "rule",
                "sourceReferences": [{"path": "Direito/Nota.md", "subpath": "#Regra"}],
                "recallPriority": 1,
            },
            {
                "semanticKey": "excecao",
                "label": "Exceção",
                "kind": "exception",
                "sourceReferences": [{"path": "Direito/Nota.md", "subpath": "#Exceção"}],
                "recallPriority": 2,
            },
        ],
        "edges": [
            {
                "semanticKey": "regra-excecao",
                "from": "regra",
                "to": "excecao",
                "relationType": "is_exception_to",
                "displayLabel": "é excepcionada por",
                "sourceReferences": [{"path": "Direito/Nota.md", "subpath": "#Exceção"}],
                "recallPriority": 3,
            }
        ],
    }


class CanvasValidationTests(unittest.TestCase):
    def codes(self, canvas: dict) -> set[str]:
        return {item["code"] for item in validate_canvas(canvas)["diagnostics"]}

    def test_valid_minimal_canvas(self):
        self.assertTrue(validate_canvas(minimal_canvas())["valid"])

    def test_duplicate_id(self):
        canvas = minimal_canvas()
        canvas["edges"][0]["id"] = canvas["nodes"][0]["id"]
        self.assertIn("duplicate-id", self.codes(canvas))

    def test_dangling_edge(self):
        canvas = minimal_canvas()
        canvas["edges"][0]["toNode"] = "ffffffffffffffff"
        self.assertIn("dangling-edge", self.codes(canvas))

    def test_invalid_node_type(self):
        canvas = minimal_canvas()
        canvas["nodes"][0]["type"] = "shape"
        self.assertIn("invalid-node-type", self.codes(canvas))

    def test_missing_node_field(self):
        canvas = minimal_canvas()
        del canvas["nodes"][0]["text"]
        self.assertIn("missing-node-field", self.codes(canvas))

    def test_invalid_edge_side(self):
        canvas = minimal_canvas()
        canvas["edges"][0]["toSide"] = "center"
        self.assertIn("invalid-edge-side", self.codes(canvas))

    def test_invalid_color(self):
        canvas = minimal_canvas()
        canvas["nodes"][0]["color"] = "blue"
        self.assertIn("invalid-color", self.codes(canvas))

    def test_node_overlap(self):
        canvas = minimal_canvas()
        canvas["nodes"][1]["x"] = 100
        self.assertIn("node-overlap", self.codes(canvas))

    def test_density_warning(self):
        canvas = {"nodes": [], "edges": []}
        for index in range(41):
            canvas["nodes"].append(
                {
                    "id": f"{index:016x}",
                    "type": "text",
                    "x": index * 400,
                    "y": 0,
                    "width": 300,
                    "height": 100,
                    "text": str(index),
                }
            )
        result = validate_canvas(canvas)
        self.assertTrue(result["valid"])
        self.assertIn("canvas-density", {d["code"] for d in result["diagnostics"]})

    def test_unsupported_top_level_metadata(self):
        canvas = minimal_canvas()
        canvas["generator"] = "test"
        self.assertIn("unsupported-top-level", self.codes(canvas))


class DeterministicMapTests(unittest.TestCase):
    def test_stable_id_generation(self):
        self.assertEqual(stable_id("scope", "node", "key"), stable_id("scope", "node", "key"))
        self.assertRegex(stable_id("scope", "node", "key"), r"^[0-9a-f]{16}$")

    def test_stable_output_and_json_newlines(self):
        first = build_canvas(sample_ir())
        second = build_canvas(sample_ir())
        self.assertEqual(first, second)
        encoded = json.dumps(first, ensure_ascii=False)
        self.assertIn(r"\n", encoded)
        self.assertNotIn(r"\\n", encoded)
        self.assertTrue(validate_canvas(first)["valid"])

    def test_study_fixture(self):
        canvas = build_canvas(sample_ir())
        self.assertEqual(len(canvas["nodes"]), 2)
        self.assertEqual(canvas["edges"][0]["label"], "é excepcionada por")

    def test_recall_fixture_hides_relationship(self):
        recall = build_recall_canvas(sample_ir(), density="medium")
        self.assertEqual(recall["edges"][0]["label"], "[qual relação?]")
        self.assertNotIn("é excepcionada por", json.dumps(recall, ensure_ascii=False))

    def test_archify_selected_for_technical_sequence(self):
        decision = route_diagram("sequence", archify_available=True)
        self.assertEqual(decision["renderer"], "archify")

    def test_archify_unavailable_falls_back_to_canvas(self):
        decision = route_diagram("architecture", archify_available=False)
        self.assertEqual(decision["renderer"], "json-canvas")
        self.assertEqual(decision["reason"], "archify-unavailable")

    def test_update_preserves_unchanged_id_and_position(self):
        existing = build_canvas(sample_ir())
        existing["nodes"][0]["x"] = 777
        updated = update_canvas(existing, build_canvas(sample_ir()))
        self.assertEqual(updated["nodes"][0]["id"], existing["nodes"][0]["id"])
        self.assertEqual(updated["nodes"][0]["x"], 777)

    def test_windows_path_normalization(self):
        self.assertEqual(
            normalize_vault_path(r"Direito\AFO\Nota.md"),
            "Direito/AFO/Nota.md",
        )
        with self.assertRaises(ValueError):
            normalize_vault_path(r"..\segredo.md")


class ManifestTests(unittest.TestCase):
    def test_source_reference_validation(self):
        manifest = {
            "schemaVersion": "visual-map-manifest/v1",
            "canvas": "Tema.study.canvas",
            "sources": [{"path": "Notas/Tema.md", "sha256": "a" * 64}],
            "nodeSources": {"1111111111111111": []},
            "edgeSources": {},
            "omittedPropositions": [],
            "unresolvedAmbiguities": [],
            "archify": {"status": "not-used"},
        }
        result = validate_manifest(manifest, minimal_canvas())
        self.assertFalse(result["valid"])
        self.assertIn(
            "missing-source-reference",
            {item["code"] for item in result["diagnostics"]},
        )

    def test_cli_returns_nonzero_for_errors(self):
        with tempfile.TemporaryDirectory(prefix="visual-map-") as directory:
            canvas = Path(directory) / "invalid.canvas"
            canvas.write_text('{"nodes": [{}], "edges": []}', encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(SCRIPT_ROOT / "validate_canvas.py"), str(canvas)],
                capture_output=True,
                text=True,
                check=False,
            )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("invalid", result.stderr.lower())


if __name__ == "__main__":
    unittest.main()
