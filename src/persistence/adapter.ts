import type { AppState } from "../types/entities";
import { migrateIfNeeded } from "./migrations";

const LS_KEY = "bhm-app-state";

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw) as AppState;
    
    // Controllo di sicurezza per parsed
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[Adapter] Dati non validi in localStorage, pulizia...');
      localStorage.removeItem(LS_KEY);
      return null;
    }
    
    return migrateIfNeeded(parsed);
  } catch (error) {
    console.error('[Adapter] Errore nel caricamento stato:', error);
    // Pulisci i dati corrotti
    localStorage.removeItem(LS_KEY);
    return null;
  }
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