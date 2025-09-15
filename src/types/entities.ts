export type ID = string;

export type Range = { min: number; max: number };

export type ConservationPoint = {
  id: ID;
  label: string;
  range: Range;
  alarm?: { enabled: boolean; threshold?: number };
  type?: "fridge" | "freezer" | "cellar" | string;
};

export type Staff = { id: ID; name: string; departmentId?: ID };
export type Department = { id: ID; name: string };

export type Entities = {
  conservationPoints: Record<ID, ConservationPoint>;
  staff: Record<ID, Staff>;
  departments: Record<ID, Department>;
};

export type OnboardingState = unknown;

export type FormsState = {
  [entity: string]: {
    mode: "idle" | "create" | "edit";
    editId?: ID;
    draft?: unknown;
  };
};

export type Meta = {
  schemaVersion: number;
  entityVersions?: Record<string, number>;
  devMode: { mirrorOnboardingChanges: boolean };
  forms: FormsState;
  pending: boolean;
  error?: string | null;
};

export type AppState = {
  onboarding: OnboardingState | null;
  entities: Entities;
  meta: Meta;
};
