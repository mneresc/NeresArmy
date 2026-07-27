#!/usr/bin/env python3
"""Validate a visual-map sidecar manifest and its Canvas source mappings."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from visual_map import normalize_vault_path


REQUIRED_FIELDS = {
    "schemaVersion",
    "canvas",
    "sources",
    "nodeSources",
    "edgeSources",
    "omittedPropositions",
    "unresolvedAmbiguities",
    "archify",
}
SHA256 = re.compile(r"^[0-9a-f]{64}$")


def _add(
    diagnostics: list[dict[str, str]], severity: str, code: str, message: str
) -> None:
    diagnostics.append({"severity": severity, "code": code, "message": message})


def _reference_paths(references: object) -> set[str]:
    if not isinstance(references, list):
        return set()
    return {
        item["path"]
        for item in references
        if isinstance(item, dict) and isinstance(item.get("path"), str)
    }


def validate_manifest(
    manifest: object, canvas: object | None = None
) -> dict[str, Any]:
    diagnostics: list[dict[str, str]] = []
    if not isinstance(manifest, dict):
        _add(diagnostics, "error", "invalid-manifest", "Manifest must be an object.")
        return {"valid": False, "diagnostics": diagnostics}

    for field in sorted(REQUIRED_FIELDS - set(manifest)):
        _add(diagnostics, "error", "missing-manifest-field", f"Missing {field}.")
    if manifest.get("schemaVersion") != "visual-map-manifest/v1":
        _add(
            diagnostics,
            "error",
            "invalid-manifest-version",
            "schemaVersion must be visual-map-manifest/v1.",
        )
    try:
        if "canvas" in manifest:
            normalize_vault_path(manifest["canvas"])
    except (TypeError, ValueError):
        _add(
            diagnostics,
            "error",
            "invalid-manifest-path",
            "canvas must be a vault-relative normalized path.",
        )

    source_paths: set[str] = set()
    sources = manifest.get("sources")
    if not isinstance(sources, list):
        _add(diagnostics, "error", "invalid-sources", "sources must be an array.")
    else:
        for index, source in enumerate(sources):
            if not isinstance(source, dict):
                _add(
                    diagnostics,
                    "error",
                    "invalid-source",
                    f"sources[{index}] must be an object.",
                )
                continue
            try:
                path = normalize_vault_path(source.get("path"))
                if path != source.get("path"):
                    raise ValueError("not normalized")
                source_paths.add(path)
            except (TypeError, ValueError):
                _add(
                    diagnostics,
                    "error",
                    "invalid-source-path",
                    f"sources[{index}].path is invalid.",
                )
            if not isinstance(source.get("sha256"), str) or not SHA256.fullmatch(
                source["sha256"]
            ):
                _add(
                    diagnostics,
                    "error",
                    "invalid-source-hash",
                    f"sources[{index}].sha256 must be lowercase hexadecimal.",
                )

    node_sources = manifest.get("nodeSources")
    edge_sources = manifest.get("edgeSources")
    if not isinstance(node_sources, dict):
        _add(
            diagnostics,
            "error",
            "invalid-node-sources",
            "nodeSources must be an object.",
        )
        node_sources = {}
    if not isinstance(edge_sources, dict):
        _add(
            diagnostics,
            "error",
            "invalid-edge-sources",
            "edgeSources must be an object.",
        )
        edge_sources = {}

    synthetic_ids = set(manifest.get("syntheticIds") or [])
    if isinstance(canvas, dict):
        for collection, mappings in (
            (canvas.get("nodes", []), node_sources),
            (canvas.get("edges", []), edge_sources),
        ):
            if not isinstance(collection, list):
                continue
            for item in collection:
                if not isinstance(item, dict) or not isinstance(item.get("id"), str):
                    continue
                item_id = item["id"]
                if item_id in synthetic_ids:
                    continue
                references = mappings.get(item_id)
                paths = _reference_paths(references)
                if not paths:
                    _add(
                        diagnostics,
                        "error",
                        "missing-source-reference",
                        f"{item_id} has no source reference.",
                    )
                for path in sorted(paths - source_paths):
                    _add(
                        diagnostics,
                        "error",
                        "unknown-source-reference",
                        f"{item_id} references undeclared source {path}.",
                    )

    for field in ("omittedPropositions", "unresolvedAmbiguities"):
        if field in manifest and not isinstance(manifest[field], list):
            _add(diagnostics, "error", "invalid-manifest-field", f"{field} must be an array.")
    archify = manifest.get("archify")
    if not isinstance(archify, dict) or archify.get("status") not in {
        "not-used",
        "selected",
        "generated",
        "fallback",
        "failed",
    }:
        _add(
            diagnostics,
            "error",
            "invalid-archify-status",
            "archify.status is invalid.",
        )

    return {
        "valid": not any(item["severity"] == "error" for item in diagnostics),
        "diagnostics": diagnostics,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--canvas", type=Path)
    parser.add_argument("--json", action="store_true", dest="json_output")
    args = parser.parse_args(argv)
    try:
        manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
        canvas = (
            json.loads(args.canvas.read_text(encoding="utf-8")) if args.canvas else None
        )
        result = validate_manifest(manifest, canvas)
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        result = {
            "valid": False,
            "diagnostics": [
                {
                    "severity": "error",
                    "code": "invalid-json",
                    "message": f"Cannot read valid UTF-8 JSON: {error}.",
                }
            ],
        }
    if args.json_output:
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    elif result["valid"]:
        print(f"Manifest valid: {args.manifest}")
    else:
        print(f"Manifest invalid: {args.manifest}", file=sys.stderr)
        for item in result["diagnostics"]:
            print(
                f"{item['severity'].upper()} {item['code']}: {item['message']}",
                file=sys.stderr,
            )
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
