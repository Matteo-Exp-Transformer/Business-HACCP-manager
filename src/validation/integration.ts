import { validateConservationPoint, validateStaff, validateDepartment } from "./validationService";
import { useDataStore } from "../store/dataStore";

export function commitForm(entity: string, data: unknown) {
  let validation;
  
  switch (entity) {
    case "conservationPoints":
      validation = validateConservationPoint(data);
      break;
    case "staff":
      validation = validateStaff(data);
      break;
    case "departments":
      validation = validateDepartment(data);
      break;
    default:
      return { success: false, error: "Unknown entity type" };
  }

  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  // Add to store
  useDataStore.getState().addEntity(entity as any, validation.data);
  
  return { success: true };
}
