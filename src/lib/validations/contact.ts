import { z } from "zod"

export const createContactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  mobile: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  category: z.enum([
    "PROMOTER", "AGENT", "VENUE_STAFF", "PRODUCTION", "CATERING",
    "SECURITY", "TRANSPORT", "ACCOMMODATION", "MANAGEMENT", "LABEL",
    "PR", "MERCH", "OTHER",
  ]).default("OTHER"),
  notes: z.string().optional(),
})

export const updateContactSchema = createContactSchema.partial()

export type CreateContactInput = z.infer<typeof createContactSchema>
