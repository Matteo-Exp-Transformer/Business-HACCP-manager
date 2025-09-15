import type { AppState } from "../types/entities";
import { validateReferentialIntegrity } from "../validation/integrity/validateReferentialIntegrity";

// Esempio: per-entity migration (idempotente)
function migrateConservationPoints_v1_to_v2(state: AppState): AppState {
  const cps = state.entities.conservationPoints as Record<string, any>;
  for (const id in cps) {
    const f = cps[id];
    if (f && f.tempMin !== undefined && f.tempMax !== undefined && !f.range) {
      cps[id] = { ...f, range: { min: f.tempMin, max: f.tempMax } };
      delete cps[id].tempMin;
      delete cps[id].tempMax;
    }
  }
  return state;
}

// Orchestratrice di release
const releasePlan: Record<number, (s: AppState) => AppState> = {
  2: (s) => {
    s = migrateConservationPoints_v1_to_v2(s);
    validateReferentialIntegrity(s, ["conservationPoints", "staff", "departments"]);
    s.meta.schemaVersion = 2;
    return s;
  }
  // future: 3: (s) => { ...; s.meta.schemaVersion = 3; return s; }
};

export function migrateIfNeeded(state: AppState): AppState {
  let v = state.meta?.schemaVersion ?? 1;
  while (releasePlan[v + 1]) {
    state = releasePlan[v + 1](state);
    v = state.meta.schemaVersion;
  }
  return state;
}