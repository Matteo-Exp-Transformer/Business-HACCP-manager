import type { AppState } from "../types/entities";
import { migrateIfNeeded } from "./migrations";

const LS_KEY = "bhm-app-state";

export function loadState(): AppState | null {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as AppState;
  return migrateIfNeeded(parsed);
}

export function saveState(partial: Partial<AppState>): void {
  const raw = localStorage.getItem(LS_KEY);
  const current = raw ? (JSON.parse(raw) as AppState) : null;
  const next = { ...current, ...partial } as AppState;
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

export function loadLegacyAndCompose(): Partial<AppState> {
  // TODO: importa vecchie chiavi "haccp-*" se presenti e componi il partial
  return {};
}