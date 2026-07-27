# Relation ontology

Use stable English identifiers and natural labels in the source language. Keep edge
direction aligned with the sentence `source --label--> target`. Prefer an existing
broad type plus a precise display label over inventing a new type.

## Structural

| Type | Meaning | Portuguese label examples |
| --- | --- | --- |
| `is_a`, `type_of`, `instance_of` | Taxonomic specialization | `é espécie de`, `é instância de` |
| `part_of`, `belongs_to` | Membership | `integra`, `pertence a` |
| `contains`, `composed_of`, `subdivides_into` | Container to parts | `contém`, `compõe-se de`, `divide-se em` |

Do not use `part_of` for a prerequisite or mere association.

## Dependency and requirement

| Type | Meaning | Portuguese label examples |
| --- | --- | --- |
| `depends_on`, `requires` | Dependency or mandatory input | `depende de`, `exige` |
| `prerequisite_of`, `condition_for` | Prior condition | `é pré-requisito de`, `condiciona` |
| `enabled_by`, `calculated_from`, `limited_by` | Enablement, derivation, bound | `é viabilizado por`, `é calculado a partir de`, `é limitado por` |

Do not convert chronology alone into a requirement.

## Legal and normative

Use `authorizes`, `prohibits`, `requires_compliance_with`, `applies_to`,
`does_not_apply_to`, `excepts`, `is_exception_to`, `regulated_by`, `revokes`,
`amends`, `has_jurisdiction_over`, `supervised_by`, `controlled_by`, and
`responsible_for`.

Preserve the norm's actor, modality, condition, scope, and negation. Example:
`exceção --afasta a regra somente quando C--> regra`. Do not map an example as an
exception without explicit evidence.

## Temporal and procedural

Use `precedes`, `follows`, `triggers`, `initiates`, `results_in`, `transitions_to`,
`must_occur_before`, `has_deadline`, `suspends`, `interrupts`, and `terminates`.

Attach a deadline to its triggering event, not only to the final stage. Distinguish
`suspends` from `interrupts` when the source does.

## Logical and causal

Use `causes`, `contributes_to`, `implies`, `prevents`, `allows`, `produces`,
`determines`, and `is_evidence_of`.

Use `causes` only for an evidenced causal claim. Prefer `contributes_to` for partial
influence and avoid converting correlation into cause.

## Comparison and confusion

Use `contrasts_with`, `differs_from`, `similar_to`, `commonly_confused_with`,
`alternative_to`, `more_restrictive_than`, `broader_than`, and `narrower_than`.

Include the comparison dimension in the display label, such as `tem prazo menor que`.
Do not create a generic `differs_from` when the differing attribute is known.

## Educational

Use `example_of`, `counterexample_of`, `mnemonic_for`, `tested_with`,
`frequent_trap_about`, and `explains`.

Mark synthetic teaching nodes explicitly in the manifest. Never let a mnemonic or
synthetic example become a factual source.

## Inverses and qualifiers

Use one visual direction when the inverse adds no retrieval value:
`A part_of B` implies `B contains A`. Add both only when the task requires both
reading directions.

Keep conditions and negation in the label or adjacent qualifier node:

- `X --aplica-se somente quando Y--> caso`;
- `regra --não se aplica a--> exceção`;
- `evento --inicia prazo de 10 dias para--> ato`.

Reject unlabeled edges and vague `related_to` when the source supports a precise verb.
