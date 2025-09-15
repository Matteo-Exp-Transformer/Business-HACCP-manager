import { z } from "zod";
import { IdSchema, RangeSchema } from "./base";

export const ConservationPointSchema = z.object({
  id: IdSchema,
  label: z.string().min(1, { message: "validation.required_label" }),
  range: RangeSchema,
  alarm: z.object({
    enabled: z.boolean(),
    threshold: z.number().optional()
  }).optional(),
  type: z.string().optional()
});

export const StaffSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, { message: "validation.required_name" }),
  departmentId: IdSchema.optional()
});

export const DepartmentSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, { message: "validation.required_name" })
});
