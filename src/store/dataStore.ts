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

type Mutations = {
  addEntity: <K extends keyof Entities>(key: K, entity: Entities[K][ID]) => void;
  updateEntity: <K extends keyof Entities>(key: K, id: ID, patch: Partial<Entities[K][ID]>) => void;
  removeEntity: <K extends keyof Entities>(key: K, id: ID) => void;

  openCreateForm: (entity: string) => void;
  openEditForm: (entity: string, id: ID) => void;
  closeForm: (entity: string) => void;
  updateDraft: (entity: string, draft: unknown) => void;
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
    const f = s.meta.forms[entity];
    if (f && f.mode !== "idle") return s; // blocco
    return { meta: { ...s.meta, forms: { ...s.meta.forms, [entity]: { mode: "create" } } } };
  }),

  openEditForm: (entity, id) => set((s) => {
    const f = s.meta.forms[entity];
    if (f && f.mode !== "idle") return s; // blocco
    return { meta: { ...s.meta, forms: { ...s.meta.forms, [entity]: { mode: "edit", editId: id } } } };
  }),

  closeForm: (entity) => set((s) => ({
    meta: { ...s.meta, forms: { ...s.meta.forms, [entity]: { mode: "idle" } } }
  })),

  updateDraft: (entity, draft) => set((s) => ({
    meta: { ...s.meta, forms: { ...s.meta.forms, [entity]: { ...(s.meta.forms[entity] ?? { mode: "create" }), draft } } }
  }))
}));
