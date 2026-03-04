import { z } from "zod"

export const updateTeamBrandingSchema = z.object({
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .nullable(),
  brandFont: z.string().max(100).nullable(),
  showLogoInSidebar: z.boolean(),
  showLogoInPrint: z.boolean(),
})

export type UpdateTeamBrandingInput = z.infer<typeof updateTeamBrandingSchema>

export const createInviteSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "MEMBER", "VIEWER"]),
  email: z.string().email().optional().or(z.literal("")),
})

export type CreateInviteInput = z.infer<typeof createInviteSchema>
