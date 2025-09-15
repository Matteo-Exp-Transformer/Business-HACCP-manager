import { z } from "zod";

export const IdSchema = z.string().min(1);

export const RangeSchema = z.object({
  min: z.number(),
  max: z.number()
}).refine(r => r.min < r.max, { message: "validation.range_min_lt_max" });

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
