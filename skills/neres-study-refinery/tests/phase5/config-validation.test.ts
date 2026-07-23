import path from "node:path";
import { expect, test } from "vitest";
import { loadConfig } from "../../src/config.js";
import { createVault } from "../support/vault.js";

test("merges a strict partial configuration", async () => {
  const vault = await createVault();
  const configPath = await vault.writeMarkdown(
    "refinery.yaml",
    "classification:\n  profile: mathematics\nimages:\n  minimum_confidence: 0.9\n"
  );

  const config = await loadConfig(configPath);

  expect(config.classification.profile).toBe("mathematics");
  expect(config.images.minimum_confidence).toBe(0.9);
  expect(config.scope.allow_web).toBe(false);
});

test("rejects invalid enum values and unknown keys", async () => {
  const vault = await createVault();
  const invalidEnum = await vault.writeMarkdown(
    "invalid-enum.yaml",
    "classification:\n  profile: invented\n"
  );
  const unknownKey = await vault.writeMarkdown(
    "unknown-key.yaml",
    "scope:\n  secretly_allow_web: true\n"
  );

  await expect(loadConfig(invalidEnum)).rejects.toMatchObject({
    code: "ERR_CONFIG"
  });
  await expect(loadConfig(unknownKey)).rejects.toMatchObject({
    code: "ERR_CONFIG"
  });
  expect(path.isAbsolute(configPathForAssertion(invalidEnum))).toBe(true);
});

function configPathForAssertion(value: string): string {
  return path.resolve(value);
}

