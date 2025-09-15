import type { AppState } from "../types/entities";
import { validateReferentialIntegrity } from "../validation/integrity/validateReferentialIntegrity";

// Esempio: per-entity migration (idempotente)
function migrateConservationPoints_v1_to_v2(state: AppState): AppState {
  // Controllo di sicurezza per entities e conservationPoints
  if (!state || !state.entities || !state.entities.conservationPoints) {
    console.warn('[Migration] conservationPoints non disponibili, saltando migrazione');
    return state;
  }
  
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
  // Controllo di sicurezza per state
  if (!state) {
    console.warn('[Migration] State non disponibile, saltando migrazione');
    return state;
  }
  
  // Assicurati che meta esista
  if (!state.meta) {
    console.warn('[Migration] Meta non disponibile, inizializzando...');
    state.meta = {
      schemaVersion: 1,
      devMode: { mirrorOnboardingChanges: false },
      forms: {},
      pending: false,
      error: null
    };
  }
  
  let v = state.meta?.schemaVersion ?? 1;
  while (releasePlan[v + 1]) {
    try {
      state = releasePlan[v + 1](state);
      v = state.meta.schemaVersion;
    } catch (error) {
      console.error(`[Migration] Errore durante migrazione v${v + 1}:`, error);
      break;
    }
  }
  return state;
}