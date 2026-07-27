#!/usr/bin/env python3
"""Validate Obsidian JSON Canvas structure, layout, and semantic edges."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from visual_map import normalize_vault_path


NODE_TYPES = {"text", "file", "link", "group"}
SIDES = {"top", "right", "bottom", "left"}
ENDS = {"none", "arrow"}
NODE_BASE_FIELDS = {"id", "type", "x", "y", "width", "height", "color"}
NODE_FIELDS = {
    "text": NODE_BASE_FIELDS | {"text"},
    "file": NODE_BASE_FIELDS | {"file", "subpath"},
    "link": NODE_BASE_FIELDS | {"url"},
    "group": NODE_BASE_FIELDS | {"label", "background", "backgroundStyle"},
}
EDGE_FIELDS = {
    "id",
    "fromNode",
    "fromSide",
    "fromEnd",
    "toNode",
    "toSide",
    "toEnd",
    "color",
    "label",
}
HEX_COLOR = re.compile(r"^#[0-9A-Fa-f]{6}$")


def _diagnostic(
    diagnostics: list[dict[str, str]],
    severity: str,
    code: str,
    message: str,
) -> None:
    diagnostics.append({"severity": severity, "code": code, "message": message})


def _valid_color(value: object) -> bool:
    return isinstance(value, str) and (
        value in {"1", "2", "3", "4", "5", "6"} or bool(HEX_COLOR.fullmatch(value))
    )


def _integer(value: object) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _overlap(left: dict[str, Any], right: dict[str, Any]) -> bool:
    return not (
        left["x"] + left["width"] <= right["x"]
        or right["x"] + right["width"] <= left["x"]
        or left["y"] + left["height"] <= right["y"]
        or right["y"] + right["height"] <= left["y"]
    )


def _inside(child: dict[str, Any], group: dict[str, Any]) -> bool:
    return (
        child["x"] >= group["x"]
        and child["y"] >= group["y"]
        and child["x"] + child["width"] <= group["x"] + group["width"]
        and child["y"] + child["height"] <= group["y"] + group["height"]
    )


def validate_canvas(
    canvas: object, *, strict: bool = False, max_nodes: int = 40
) -> dict[str, Any]:
    diagnostics: list[dict[str, str]] = []
    if not isinstance(canvas, dict):
        _diagnostic(diagnostics, "error", "invalid-top-level", "Canvas must be an object.")
        return {"valid": False, "diagnostics": diagnostics}

    unsupported = sorted(set(canvas) - {"nodes", "edges"})
    for field in unsupported:
        _diagnostic(
            diagnostics,
            "error",
            "unsupported-top-level",
            f"Unsupported top-level field: {field}.",
        )
    nodes = canvas.get("nodes")
    edges = canvas.get("edges")
    if not isinstance(nodes, list):
        _diagnostic(diagnostics, "error", "invalid-nodes", "nodes must be an array.")
        nodes = []
    if not isinstance(edges, list):
        _diagnostic(diagnostics, "error", "invalid-edges", "edges must be an array.")
        edges = []

    if len(nodes) > max_nodes:
        _diagnostic(
            diagnostics,
            "warning",
            "canvas-density",
            f"Canvas has {len(nodes)} nodes; split it above {max_nodes}.",
        )

    seen_ids: set[str] = set()
    node_ids: set[str] = set()
    geometry_nodes: list[dict[str, Any]] = []
    groups: list[dict[str, Any]] = []
    for index, node in enumerate(nodes):
        subject = f"nodes[{index}]"
        if not isinstance(node, dict):
            _diagnostic(diagnostics, "error", "invalid-node", f"{subject} must be an object.")
            continue
        node_id = node.get("id")
        if not isinstance(node_id, str) or not node_id:
            _diagnostic(diagnostics, "error", "missing-node-field", f"{subject}.id is required.")
        elif node_id in seen_ids:
            _diagnostic(diagnostics, "error", "duplicate-id", f"Duplicate id: {node_id}.")
        else:
            seen_ids.add(node_id)
            node_ids.add(node_id)

        node_type = node.get("type")
        if node_type not in NODE_TYPES:
            _diagnostic(
                diagnostics,
                "error",
                "invalid-node-type",
                f"{subject}.type must be text, file, link, or group.",
            )
        required = {
            "text": "text",
            "file": "file",
            "link": "url",
        }.get(node_type)
        if required and not isinstance(node.get(required), str):
            _diagnostic(
                diagnostics,
                "error",
                "missing-node-field",
                f"{subject}.{required} is required.",
            )

        for field in ("x", "y", "width", "height"):
            if not _integer(node.get(field)):
                _diagnostic(
                    diagnostics,
                    "error",
                    "invalid-geometry",
                    f"{subject}.{field} must be an integer.",
                )
        for field in ("width", "height"):
            if _integer(node.get(field)) and node[field] <= 0:
                _diagnostic(
                    diagnostics,
                    "error",
                    "invalid-geometry",
                    f"{subject}.{field} must be positive.",
                )

        if "color" in node and not _valid_color(node["color"]):
            _diagnostic(
                diagnostics,
                "error",
                "invalid-color",
                f"{subject}.color is invalid.",
            )
        if node_type in NODE_FIELDS:
            for field in sorted(set(node) - NODE_FIELDS[node_type]):
                _diagnostic(
                    diagnostics,
                    "error",
                    "unsupported-node-field",
                    f"{subject}.{field} is not in JSON Canvas 1.0.",
                )
        if node_type == "file" and isinstance(node.get("file"), str):
            try:
                normalized = normalize_vault_path(node["file"])
                if normalized != node["file"]:
                    raise ValueError("path is not normalized")
            except ValueError:
                _diagnostic(
                    diagnostics,
                    "error",
                    "invalid-file-path",
                    f"{subject}.file must be a normalized vault-relative path.",
                )
            subpath = node.get("subpath")
            if subpath is not None and (
                not isinstance(subpath, str) or not subpath.startswith("#")
            ):
                _diagnostic(
                    diagnostics,
                    "error",
                    "invalid-subpath",
                    f"{subject}.subpath must start with #.",
                )
        if node_type == "group" and node.get("backgroundStyle") not in {
            None,
            "cover",
            "ratio",
            "repeat",
        }:
            _diagnostic(
                diagnostics,
                "error",
                "invalid-background-style",
                f"{subject}.backgroundStyle is invalid.",
            )
        if node_type == "text" and len(str(node.get("text", ""))) > 800:
            _diagnostic(
                diagnostics,
                "warning",
                "long-node",
                f"{subject}.text is longer than 800 characters.",
            )
        if all(_integer(node.get(field)) for field in ("x", "y", "width", "height")):
            geometry_nodes.append(node)
            if node_type == "group":
                groups.append(node)

    for index, edge in enumerate(edges):
        subject = f"edges[{index}]"
        if not isinstance(edge, dict):
            _diagnostic(diagnostics, "error", "invalid-edge", f"{subject} must be an object.")
            continue
        edge_id = edge.get("id")
        if not isinstance(edge_id, str) or not edge_id:
            _diagnostic(diagnostics, "error", "missing-edge-field", f"{subject}.id is required.")
        elif edge_id in seen_ids:
            _diagnostic(diagnostics, "error", "duplicate-id", f"Duplicate id: {edge_id}.")
        else:
            seen_ids.add(edge_id)
        for field in ("fromNode", "toNode"):
            if not isinstance(edge.get(field), str):
                _diagnostic(
                    diagnostics,
                    "error",
                    "missing-edge-field",
                    f"{subject}.{field} is required.",
                )
            elif edge[field] not in node_ids:
                _diagnostic(
                    diagnostics,
                    "error",
                    "dangling-edge",
                    f"{subject}.{field} references a missing node.",
                )
        for field in ("fromSide", "toSide"):
            if field in edge and edge[field] not in SIDES:
                _diagnostic(
                    diagnostics,
                    "error",
                    "invalid-edge-side",
                    f"{subject}.{field} is invalid.",
                )
        for field in ("fromEnd", "toEnd"):
            if field in edge and edge[field] not in ENDS:
                _diagnostic(
                    diagnostics,
                    "error",
                    "invalid-edge-end",
                    f"{subject}.{field} is invalid.",
                )
        if "color" in edge and not _valid_color(edge["color"]):
            _diagnostic(
                diagnostics,
                "error",
                "invalid-color",
                f"{subject}.color is invalid.",
            )
        if not isinstance(edge.get("label"), str) or not edge["label"].strip():
            _diagnostic(
                diagnostics,
                "error",
                "unlabeled-edge",
                f"{subject}.label must name the semantic relationship.",
            )
        for field in sorted(set(edge) - EDGE_FIELDS):
            _diagnostic(
                diagnostics,
                "error",
                "unsupported-edge-field",
                f"{subject}.{field} is not in JSON Canvas 1.0.",
            )

    ordinary = [node for node in geometry_nodes if node.get("type") != "group"]
    overlap_severity = "error" if strict else "error"
    for left_index, left in enumerate(ordinary):
        for right in ordinary[left_index + 1 :]:
            if _overlap(left, right):
                _diagnostic(
                    diagnostics,
                    overlap_severity,
                    "node-overlap",
                    f"Nodes {left.get('id')} and {right.get('id')} overlap.",
                )
    for group in groups:
        for node in ordinary:
            if _overlap(group, node) and not _inside(node, group):
                _diagnostic(
                    diagnostics,
                    "warning",
                    "group-boundary",
                    f"Node {node.get('id')} crosses group {group.get('id')} bounds.",
                )

    return {
        "valid": not any(item["severity"] == "error" for item in diagnostics),
        "diagnostics": diagnostics,
    }


def _read_json(path: Path) -> tuple[object | None, list[dict[str, str]]]:
    try:
        return json.loads(path.read_text(encoding="utf-8")), []
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        return None, [
            {
                "severity": "error",
                "code": "invalid-json",
                "message": f"Cannot read valid UTF-8 JSON: {error}.",
            }
        ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("canvas", type=Path)
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--json", action="store_true", dest="json_output")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--max-nodes", type=int, default=40)
    args = parser.parse_args(argv)

    canvas, parse_diagnostics = _read_json(args.canvas)
    result = (
        {"valid": False, "diagnostics": parse_diagnostics}
        if parse_diagnostics
        else validate_canvas(canvas, strict=args.strict, max_nodes=args.max_nodes)
    )
    if args.manifest and not parse_diagnostics:
        from validate_manifest import validate_manifest

        manifest, manifest_parse = _read_json(args.manifest)
        manifest_result = (
            {"valid": False, "diagnostics": manifest_parse}
            if manifest_parse
            else validate_manifest(manifest, canvas)
        )
        result["diagnostics"].extend(manifest_result["diagnostics"])
        result["valid"] = result["valid"] and manifest_result["valid"]

    if args.json_output:
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    elif result["valid"]:
        print(f"Canvas valid: {args.canvas}")
        for item in result["diagnostics"]:
            print(f"{item['severity'].upper()} {item['code']}: {item['message']}")
    else:
        print(f"Canvas invalid: {args.canvas}", file=sys.stderr)
        for item in result["diagnostics"]:
            destination = sys.stderr if item["severity"] == "error" else sys.stdout
            print(
                f"{item['severity'].upper()} {item['code']}: {item['message']}",
                file=destination,
            )
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
