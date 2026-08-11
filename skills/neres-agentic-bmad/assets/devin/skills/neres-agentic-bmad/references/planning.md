# Planning protocol

Classify size, risk, architecture impact and required documentation first.

1. Build the CapabilityMap and read existing product/architecture artifacts.
2. Use BMAD only if it is available. Prefer the smallest installed BMAD workflow
   that covers the change.
3. Without BMAD, map installed equivalent skills to intake, slicing, spec,
   acceptance/BDD, test planning and technical planning. Use the bundled sequence
   only for outcomes no discovered skill covers.
4. Ask the reader for a bounded ContextPack, writer for the chosen artifact,
   critic for omissions and architect only for real boundary/data/API decisions.
5. Produce dependency-ordered TaskPackets with exact file limits and verification.
6. Do not implement until acceptance, RED evidence, technical plan and required
   human approval exist for material features.

Do not inflate tiny bugs into a full PRD. Do not call work ready while material
ambiguity, public-contract change, migration or security risk remains unresolved.
