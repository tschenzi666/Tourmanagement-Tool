import { z } from "zod"

export const crewRoles = [
  "TOUR_MANAGER",
  "PRODUCTION_MANAGER",
  "STAGE_MANAGER",
  "FOH_ENGINEER",
  "MONITOR_ENGINEER",
  "LIGHTING_DESIGNER",
  "LIGHTING_TECH",
  "BACKLINE_TECH",
  "DRUM_TECH",
  "GUITAR_TECH",
  "BASS_TECH",
  "KEYS_TECH",
  "RIGGER",
  "CARPENTER",
  "VIDEO_DIRECTOR",
  "VIDEO_TECH",
  "MERCH_MANAGER",
  "TOUR_ACCOUNTANT",
  "SECURITY",
  "WARDROBE",
  "HAIR_MAKEUP",
  "CATERING",
  "BUS_DRIVER",
  "TRUCK_DRIVER",
  "ARTIST",
  "MUSICIAN",
  "DANCER",
  "PHOTOGRAPHER",
  "OTHER",
] as const

export const crewDepartments = [
  "Management",
  "Audio",
  "Lighting",
  "Video",
  "Backline",
  "Stage",
  "Rigging",
  "Wardrobe & Styling",
  "Catering",
  "Transport",
  "Merchandise",
  "Security",
  "Artist / Talent",
  "Other",
] as const

export const tShirtSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const

export const createCrewMemberSchema = z.object({
  roleTitle: z.string().min(1, "Role/title is required"),
  role: z.enum(crewRoles).default("OTHER"),
  department: z.string().optional(),
  dailyRate: z.union([z.coerce.number().positive(), z.literal(""), z.undefined()]).optional(),
  perDiem: z.union([z.coerce.number().positive(), z.literal(""), z.undefined()]).optional(),
  currency: z.string().default("USD"),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  dietaryNeeds: z.string().optional(),
  tShirtSize: z.string().optional(),
  allergies: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string().optional(),
})

export const updateCrewMemberSchema = createCrewMemberSchema.partial()

// Friendly labels for crew roles
export function formatCrewRole(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

// Suggest a department based on role
export function suggestDepartment(role: string): string {
  const roleMap: Record<string, string> = {
    TOUR_MANAGER: "Management",
    PRODUCTION_MANAGER: "Management",
    STAGE_MANAGER: "Stage",
    FOH_ENGINEER: "Audio",
    MONITOR_ENGINEER: "Audio",
    LIGHTING_DESIGNER: "Lighting",
    LIGHTING_TECH: "Lighting",
    BACKLINE_TECH: "Backline",
    DRUM_TECH: "Backline",
    GUITAR_TECH: "Backline",
    BASS_TECH: "Backline",
    KEYS_TECH: "Backline",
    RIGGER: "Rigging",
    CARPENTER: "Stage",
    VIDEO_DIRECTOR: "Video",
    VIDEO_TECH: "Video",
    MERCH_MANAGER: "Merchandise",
    TOUR_ACCOUNTANT: "Management",
    SECURITY: "Security",
    WARDROBE: "Wardrobe & Styling",
    HAIR_MAKEUP: "Wardrobe & Styling",
    CATERING: "Catering",
    BUS_DRIVER: "Transport",
    TRUCK_DRIVER: "Transport",
    ARTIST: "Artist / Talent",
    MUSICIAN: "Artist / Talent",
    DANCER: "Artist / Talent",
    PHOTOGRAPHER: "Other",
    OTHER: "Other",
  }
  return roleMap[role] || "Other"
}
