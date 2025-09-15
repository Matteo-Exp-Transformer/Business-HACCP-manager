import type { AppState } from "../../types/entities";

export function validateReferentialIntegrity(state: AppState, entitiesToCheck: string[]): void {
  if (entitiesToCheck.includes("conservationPoints")) {
    for (const [id, cp] of Object.entries(state.entities.conservationPoints)) {
      if (!cp.label) console.warn("[integrity] cp missing label:", id);
      if (!cp.range || cp.range.min >= cp.range.max) console.warn("[integrity] cp invalid range:", id);
    }
  }
  if (entitiesToCheck.includes("staff")) {
    for (const [id, st] of Object.entries(state.entities.staff)) {
      if (st.departmentId && !state.entities.departments[st.departmentId]) {
        console.warn("[integrity] staff with orphan departmentId:", id, st.departmentId);
      }
    }
  }
}
