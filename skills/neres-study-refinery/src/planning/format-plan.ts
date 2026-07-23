import type { DryRunPlan } from "../contracts.ts";
import { toVaultRelative } from "../scope/boundary.ts";

export function formatDryRunPlan(plan: DryRunPlan): string {
  const scopePath = toVaultRelative(
    plan.scope.vaultRoot,
    plan.scope.inputPath
  );
  const outputPath = toVaultRelative(
    plan.scope.vaultRoot,
    plan.scope.outputPath
  );
  const lines = [
    "Dry run: no files written",
    `Scope: ${plan.scope.inputType} ${scopePath}`,
    `Profile: ${plan.requestedProfile}`,
    `Compression: ${plan.compression}`,
    `Diagrams: ${plan.diagrams}`
  ];

  for (const entry of plan.entries) {
    lines.push(`${entry.kind === "markdown" ? "Markdown" : "Image"}: ${entry.path}`);
  }
  for (const rejected of plan.rejectedEntries) {
    const label =
      rejected.reason === "excluded-directory" ? "Excluded" : "Rejected";
    lines.push(`${label}: ${rejected.path} (${rejected.reason})`);
  }

  lines.push(
    `Output: ${outputPath}`,
    `Source state: ${plan.sourceStateStatus}`,
    `Diagram candidates: ${plan.diagramCandidateStatus}`,
    `Conflicts: ${plan.conflictStatus}`,
    `Writes performed: ${String(plan.writesPerformed)}`
  );
  return `${lines.join("\n")}\n`;
}
