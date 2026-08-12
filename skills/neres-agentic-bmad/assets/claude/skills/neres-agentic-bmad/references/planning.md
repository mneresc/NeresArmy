# Planning protocol

## Classify first

Record:

```yaml
change_size: tiny | small | medium | large
risk: low | medium | high
architecture_impact: none | local | cross-cutting | major
documentation_needed: minimal | story | spec | full
```

Build the CapabilityMap. Use the smallest installed BMAD workflow that produces
adequate acceptance and handoff. Supporting skills may accelerate a BMAD phase but
do not replace it. Typo, local validation, focused test and small bug do not need a
full PRD.
Authentication, persistence, distributed flow, new bounded context, public API or
cross-cutting change do not qualify as quick fixes.

## Sequence

1. Read repository instructions and existing BMAD/project artifacts.
2. Ask reader for a bounded ContextPack.
3. Select real installed BMAD skills by their discovered names; add supporting
   skills only where they improve the selected BMAD phase.
4. Ask writer to normalize the chosen artifact.
5. Ask critic to find omissions and ambiguity.
6. Ask architect only for real boundary, data, API, concurrency or integration
   decisions.
7. Produce BMAD artifact plus dependency-ordered TaskPackets.
8. Mark ready-for-development only when acceptance and verification are explicit.

Do not duplicate PRD, architecture, spec or story content inside TaskPackets.
TaskPackets translate an approved story into executable units.
