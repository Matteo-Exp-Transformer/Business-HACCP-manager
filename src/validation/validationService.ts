import { ConservationPointSchema, StaffSchema, DepartmentSchema } from "./schemas/entities";

export function validateConservationPoint(data: unknown) {
  return ConservationPointSchema.safeParse(data);
}

export function validateStaff(data: unknown) {
  return StaffSchema.safeParse(data);
}

export function validateDepartment(data: unknown) {
  return DepartmentSchema.safeParse(data);
}

// Validation service object for form validation
export const validationService = {
  validateForm: (entityType: string, data: unknown, mode: 'create' | 'update') => {
    switch (entityType) {
      case 'refrigerators':
      case 'conservationPoints':
        return validateConservationPoint(data);
      case 'staff':
        return validateStaff(data);
      case 'departments':
        return validateDepartment(data);
      default:
        return { success: false, error: new Error(`Unknown entity type: ${entityType}`) };
    }
  }
};