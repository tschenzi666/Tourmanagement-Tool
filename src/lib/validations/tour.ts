import { z } from "zod"

export const createTourSchema = z.object({
  name: z.string().min(1, "Tour name is required").max(200),
  artist: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currency: z.string().length(3).default("USD"),
  description: z.string().optional(),
})

export const updateTourSchema = createTourSchema.partial().extend({
  status: z
    .enum(["DRAFT", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
})

export type CreateTourInput = z.infer<typeof createTourSchema>
export type UpdateTourInput = z.infer<typeof updateTourSchema>
