import { create } from "zustand";
import type { AppState, Entities, Meta, ID } from "../types/entities";

const initialEntities: Entities = {
  conservationPoints: {},
  staff: {},
  departments: {}
};

const initialMeta: Meta = {
  schemaVersion: 1,
  devMode: { mirrorOnboardingChanges: false },
  forms: {},
  pending: false,
  error: null
};

// Funzione per inizializzare il meta in modo sicuro
const ensureMetaInitialized = (state: any) => {
  if (!state.meta) {
    return { ...state, meta: initialMeta };
  }
  if (!state.meta.forms) {
    return { ...state, meta: { ...state.meta, forms: {} } };
  }
  return state;
};

type Mutations = {
  addEntity: <K extends keyof Entities>(key: K, entity: Entities[K][ID]) => void;
  updateEntity: <K extends keyof Entities>(key: K, id: ID, patch: Partial<Entities[K][ID]>) => void;
  removeEntity: <K extends keyof Entities>(key: K, id: ID) => void;

  openCreateForm: (entity: string) => void;
  openEditForm: (entity: string, id: ID) => void;
  closeForm: (entity: string) => void;
  updateDraft: (entity: string, draft: unknown) => void;
  setFormErrors: (entity: string, errors: Record<string, string>) => void;
};

export const useDataStore = create<AppState & Mutations>((set, get) => ({
  onboarding: null,
  entities: initialEntities,
  meta: initialMeta,

  addEntity: (key, entity) => set((s) => ({
    entities: { ...s.entities, [key]: { ...s.entities[key], [(entity as any).id]: entity } }
  })),

  updateEntity: (key, id, patch) => set((s) => ({
    entities: { ...s.entities, [key]: { ...s.entities[key], [id]: { ...s.entities[key][id], ...patch } } }
  })),

  removeEntity: (key, id) => set((s) => {
    const { [id]: _, ...rest } = s.entities[key];
    return { entities: { ...s.entities, [key]: rest } };
  }),

  openCreateForm: (entity) => set((s) => {
    const safeState = ensureMetaInitialized(s);
    const f = safeState.meta.forms[entity];
    if (f && f.mode !== "idle") return safeState; // blocco
    return { meta: { ...safeState.meta, forms: { ...safeState.meta.forms, [entity]: { mode: "create" } } } };
  }),

  openEditForm: (entity, id) => set((s) => {
    const safeState = ensureMetaInitialized(s);
    const f = safeState.meta.forms[entity];
    if (f && f.mode !== "idle") return safeState; // blocco
    return { meta: { ...safeState.meta, forms: { ...safeState.meta.forms, [entity]: { mode: "edit", editId: id } } } };
  }),

  closeForm: (entity) => set((s) => {
    const safeState = ensureMetaInitialized(s);
    return { meta: { ...safeState.meta, forms: { ...safeState.meta.forms, [entity]: { mode: "idle" } } } };
  }),

  updateDraft: (entity, draft) => set((s) => {
    const safeState = ensureMetaInitialized(s);
    return { meta: { ...safeState.meta, forms: { ...safeState.meta.forms, [entity]: { ...(safeState.meta.forms[entity] ?? { mode: "create" }), draft } } } };
  }),

  setFormErrors: (entity, errors) => set((s) => {
    const safeState = ensureMetaInitialized(s);
    return { meta: { ...safeState.meta, forms: { ...safeState.meta.forms, [entity]: { ...(safeState.meta.forms[entity] ?? { mode: "create" }), errors } } } };
  })
}));
