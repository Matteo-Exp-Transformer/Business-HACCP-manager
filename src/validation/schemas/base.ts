import { z } from "zod";

export const IdSchema = z.string().min(1);
export const RangeSchema = z.object({
  min: z.number(),
  max: z.number()
}).refine(r => r.min < r.max, { message: "validation.range_min_lt_max" });
