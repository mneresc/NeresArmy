import { expect, test } from "vitest";
import type { ContentModel, EvidenceClaim } from "../../src/contracts.js";
import {
  compareCodeEvidence,
  compareEntityEvidence,
  compareFormulaEvidence,
  compareModalityEvidence,
  compareNumberEvidence,
  validateGrounding
} from "../../src/validation/evidence.js";

test("detects an invented number", () => {
  expect(
    compareNumberEvidence("O prazo é de 10 dias.", "O prazo é de 12 dias.")
  ).toContain("12");
});

test("detects an invented entity", () => {
  expect(
    compareEntityEvidence("Compete ao TCU fiscalizar.", "Compete ao STF fiscalizar.")
  ).toContain("STF");
});

test("detects normative modality changes", () => {
  expect(
    compareModalityEvidence("A autoridade pode decidir.", "A autoridade deve decidir.")
  ).toContain("pode→deve");
});

test("detects formula and code changes", () => {
  expect(compareFormulaEvidence("$$a+b=c$$", "$$a-b=c$$")).toEqual(["a-b=c"]);
  expect(
    compareCodeEvidence(
      "```ts\nconst limit = 10;\n```",
      "```ts\nconst limit = 11;\n```"
    )
  ).toEqual(["ts:const limit = 11;"]);
});

test("requires exact evidence, a registered source and a claim marker", () => {
  const claim: EvidenceClaim = {
    id: "claim-001",
    type: "rule",
    statement: "O prazo deve ser de 10 dias.",
    sourceId: "source-001",
    sourcePath: "AFO/PPA.md",
    sourceHeading: "Regra",
    sourceExcerpt: "O prazo deve ser de 10 dias.",
    sourceRegion: null,
    confidence: 1,
    status: "supported"
  };
  const model = {
    topic: "PPA",
    profile: "law-afo",
    claims: [claim],
    definitions: [],
    rules: [claim],
    conditions: [],
    exceptions: [],
    prohibitions: [],
    competences: [],
    classifications: [],
    comparisons: [],
    processes: [],
    examples: [],
    counterexamples: [],
    examTraps: [],
    formulas: [],
    variables: [],
    codeBlocks: [],
    questions: [],
    conflicts: [],
    gaps: []
  } satisfies ContentModel;

  expect(
    validateGrounding(
      model,
      "<!-- claimId: claim-001 -->\nO prazo deve ser de 10 dias.",
      new Set(["AFO/PPA.md"])
    )
  ).toEqual([]);
  expect(
    validateGrounding(
      model,
      "O prazo deve ser de 10 dias.",
      new Set(["AFO/PPA.md"])
    )
  ).toContain("claim-001:missing-marker");
  expect(
    validateGrounding(
      model,
      "<!-- claimId: claim-001 -->\nO prazo deve ser de 12 dias.",
      new Set(["AFO/PPA.md"])
    )
  ).toContain("claim-001:missing-excerpt");
});

