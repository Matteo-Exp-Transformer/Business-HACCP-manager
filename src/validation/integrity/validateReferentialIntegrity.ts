import type { AppState } from "../../types/entities";

export function validateReferentialIntegrity(state: AppState, entitiesToCheck: string[]): void {
  // Controllo di sicurezza per lo stato
  if (!state || !state.entities) {
    // Non loggare come warning se è normale durante l'inizializzazione
    if (state && !state.entities) {
      console.debug("[integrity] Entities non ancora inizializzate, skipping validation");
    }
    return;
  }

  if (entitiesToCheck.includes("conservationPoints") && state.entities.conservationPoints) {
    for (const [id, cp] of Object.entries(state.entities.conservationPoints)) {
      if (!cp.label) console.warn("[integrity] cp missing label:", id);
      if (!cp.range || cp.range.min >= cp.range.max) console.warn("[integrity] cp invalid range:", id);
    }
  }
  if (entitiesToCheck.includes("staff") && state.entities.staff) {
    for (const [id, st] of Object.entries(state.entities.staff)) {
      if (st.departmentId && state.entities.departments && !state.entities.departments[st.departmentId]) {
        console.warn("[integrity] staff with orphan departmentId:", id, st.departmentId);
      }
    }
  }
}
