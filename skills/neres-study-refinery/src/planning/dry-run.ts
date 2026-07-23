import type { BuildRequest, DryRunPlan } from "../contracts.ts";
import type { RefineryConfig } from "../config.ts";
import { collectScopeEntries } from "../scope/walk-scope.ts";
import { resolveScope } from "../scope/resolve-scope.ts";

export async function buildDryRunPlan(
  request: BuildRequest,
  config: RefineryConfig
): Promise<DryRunPlan> {
  const scope = await resolveScope(
    request,
    config.scope.excluded_directories
  );
  const { entries, rejected } = await collectScopeEntries(scope);
  return {
    scope,
    entries,
    rejectedEntries: rejected,
    requestedProfile: request.profile,
    compression: request.compression,
    diagrams: request.diagrams,
    sourceStateStatus: "pending",
    diagramCandidateStatus: "pending",
    conflictStatus: "pending",
    writesPerformed: false
  };
}
