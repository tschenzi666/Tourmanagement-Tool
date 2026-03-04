import { z } from "zod"

export const createVenueSchema = z.object({
  name: z.string().min(1, "Venue name is required").max(200),
  city: z.string().min(1, "City is required").max(200),
  country: z.string().max(10).default("US"),
  address: z.string().max(500).optional(),
  postalCode: z.string().max(20).optional(),
  capacity: z.coerce.number().int().positive().optional(),
  venueType: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().max(500).optional(),
  wifiNetwork: z.string().max(100).optional(),
  wifiPassword: z.string().max(100).optional(),
  loadInNotes: z.string().optional(),
  parkingNotes: z.string().optional(),
  notes: z.string().optional(),
})

export const updateVenueSchema = createVenueSchema.partial()

export type CreateVenueInput = z.infer<typeof createVenueSchema>
