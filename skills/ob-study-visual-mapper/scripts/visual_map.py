#!/usr/bin/env python3
"""Deterministic helpers for Obsidian study-map JSON Canvas artifacts."""

from __future__ import annotations

import copy
import hashlib
import math
import re
from pathlib import PurePosixPath
from typing import Any


ARCHIFY_INTENTS = {
    "architecture",
    "data-flow",
    "dataflow",
    "lifecycle",
    "pipeline",
    "process",
    "sequence",
    "state",
    "workflow",
}
COLOR_BY_KIND = {
    "central": "5",
    "condition": "3",
    "deadline": "3",
    "example": "4",
    "exception": "1",
    "prohibition": "1",
    "rule": "6",
    "source": "5",
}
RECALL_FRACTIONS = {"light": 0.25, "low": 0.25, "medium": 0.5, "high": 0.75}


def stable_id(*parts: object) -> str:
    """Return a stable 16-character lowercase hexadecimal semantic ID."""
    material = "\x1f".join(str(part).strip().casefold() for part in parts)
    return hashlib.sha256(material.encode("utf-8")).hexdigest()[:16]


def normalize_vault_path(raw_path: str) -> str:
    """Normalize a user-selected vault-relative path to Obsidian `/` form."""
    if not isinstance(raw_path, str) or not raw_path.strip():
        raise ValueError("vault path must be a non-empty string")
    if "\x00" in raw_path:
        raise ValueError("vault path contains a NUL byte")
    candidate = raw_path.strip().replace("\\", "/")
    if candidate.startswith("/") or re.match(r"^[A-Za-z]:/", candidate):
        raise ValueError("vault path must be relative")
    parts = [part for part in candidate.split("/") if part not in {"", "."}]
    if not parts or any(part == ".." for part in parts):
        raise ValueError("vault path must not escape the selected vault")
    if ":" in parts[0]:
        raise ValueError("vault path must not be a URL or drive path")
    return str(PurePosixPath(*parts))


def route_diagram(
    intent: str,
    *,
    archify_available: bool = False,
    sequential_thinking_available: bool = False,
) -> dict[str, Any]:
    """Choose the renderer without making optional integrations mandatory."""
    normalized = str(intent or "concept-map").strip().casefold().replace("_", "-")
    complex_reasoning = normalized in {
        "auto",
        "comparison",
        "competency",
        "exception-map",
        "formula-dependency",
    }
    if normalized in ARCHIFY_INTENTS:
        if archify_available:
            return {
                "intent": normalized,
                "renderer": "archify",
                "reason": "archify-improves-process-topology",
                "canvasRequired": True,
                "sequentialThinkingRecommended": sequential_thinking_available,
            }
        return {
            "intent": normalized,
            "renderer": "json-canvas",
            "reason": "archify-unavailable",
            "canvasRequired": True,
            "sequentialThinkingRecommended": sequential_thinking_available,
        }
    return {
        "intent": normalized,
        "renderer": "json-canvas",
        "reason": "canvas-best-fit",
        "canvasRequired": True,
        "sequentialThinkingRecommended": (
            sequential_thinking_available and complex_reasoning
        ),
    }


def _node_text(node: dict[str, Any]) -> str:
    label = str(node.get("label", "")).strip()
    summary = str(node.get("summary", "")).strip()
    return f"# {label}\n\n{summary}" if summary else f"# {label}"


def _node_height(node: dict[str, Any]) -> int:
    text = _node_text(node)
    estimated_lines = max(1, text.count("\n") + math.ceil(len(text) / 48))
    return max(120, min(320, 72 + estimated_lines * 24))


def _position(index: int, intent: str) -> tuple[int, int]:
    if intent in {"timeline", "process", "workflow", "sequence", "lifecycle"}:
        return index * 420, 0
    columns = 3
    return (index % columns) * 420, (index // columns) * 260


def _anchors(
    source: dict[str, Any], target: dict[str, Any]
) -> tuple[str, str]:
    delta_x = target["x"] - source["x"]
    delta_y = target["y"] - source["y"]
    if abs(delta_x) >= abs(delta_y):
        return ("right", "left") if delta_x >= 0 else ("left", "right")
    return ("bottom", "top") if delta_y >= 0 else ("top", "bottom")


def build_canvas(ir: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    """Render a small renderer-neutral IR as deterministic JSON Canvas 1.0."""
    title = str(ir.get("title") or "Study map").strip()
    intent = str(ir.get("intent") or "concept-map").strip().casefold()
    semantic_nodes = list(ir.get("nodes") or [])
    semantic_edges = list(ir.get("edges") or [])
    canvas_nodes: list[dict[str, Any]] = []
    by_key: dict[str, dict[str, Any]] = {}

    for index, source in enumerate(semantic_nodes):
        semantic_key = str(source.get("semanticKey") or source.get("label") or index)
        x, y = _position(index, intent)
        rendered: dict[str, Any] = {
            "id": stable_id(title, "node", semantic_key),
            "type": "text",
            "x": x,
            "y": y,
            "width": 320,
            "height": _node_height(source),
            "text": _node_text(source),
        }
        color = COLOR_BY_KIND.get(str(source.get("kind", "")).casefold())
        if color:
            rendered["color"] = color
        canvas_nodes.append(rendered)
        by_key[semantic_key] = rendered

    canvas_edges: list[dict[str, Any]] = []
    for index, source in enumerate(semantic_edges):
        from_key = str(source.get("from", ""))
        to_key = str(source.get("to", ""))
        if from_key not in by_key or to_key not in by_key:
            raise ValueError(f"edge {index} references an unknown semantic node")
        semantic_key = str(
            source.get("semanticKey")
            or f"{from_key}:{source.get('relationType', 'related')}:{to_key}"
        )
        from_side, to_side = _anchors(by_key[from_key], by_key[to_key])
        canvas_edges.append(
            {
                "id": stable_id(title, "edge", semantic_key),
                "fromNode": by_key[from_key]["id"],
                "fromSide": from_side,
                "toNode": by_key[to_key]["id"],
                "toSide": to_side,
                "toEnd": "arrow",
                "label": str(source.get("displayLabel") or "").strip(),
            }
        )

    return {"nodes": canvas_nodes, "edges": canvas_edges}


def build_recall_canvas(
    ir: dict[str, Any], *, density: str = "medium"
) -> dict[str, list[dict[str, Any]]]:
    """Create a deterministic recall variant by hiding high-value relations."""
    normalized_density = str(density).casefold()
    if normalized_density not in RECALL_FRACTIONS:
        raise ValueError("density must be light, low, medium, or high")
    canvas = build_canvas(ir)
    semantic_edges = list(ir.get("edges") or [])
    ranked = sorted(
        enumerate(semantic_edges),
        key=lambda item: (
            -int(item[1].get("recallPriority") or 0),
            str(item[1].get("semanticKey") or item[0]),
        ),
    )
    count = 0
    if ranked:
        count = max(1, math.ceil(len(ranked) * RECALL_FRACTIONS[normalized_density]))
    for index, _source in ranked[:count]:
        canvas["edges"][index]["label"] = "[qual relação?]"
    return canvas


def update_canvas(
    existing: dict[str, Any], generated: dict[str, Any]
) -> dict[str, list[dict[str, Any]]]:
    """Merge a regenerated Canvas while retaining stable layout and manual items."""
    merged = copy.deepcopy(generated)
    existing_nodes = {
        item.get("id"): item
        for item in existing.get("nodes", [])
        if isinstance(item, dict) and isinstance(item.get("id"), str)
    }
    generated_node_ids = {item.get("id") for item in merged.get("nodes", [])}
    for node in merged.get("nodes", []):
        previous = existing_nodes.get(node.get("id"))
        if previous:
            for field in ("x", "y", "width", "height"):
                if field in previous:
                    node[field] = previous[field]
    for node in existing.get("nodes", []):
        if isinstance(node, dict) and node.get("id") not in generated_node_ids:
            merged["nodes"].append(copy.deepcopy(node))

    generated_edge_ids = {item.get("id") for item in merged.get("edges", [])}
    for edge in existing.get("edges", []):
        if isinstance(edge, dict) and edge.get("id") not in generated_edge_ids:
            merged["edges"].append(copy.deepcopy(edge))
    return merged
