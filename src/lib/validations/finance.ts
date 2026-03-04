import { z } from "zod"

export const expenseCategories = [
  "TRAVEL",
  "ACCOMMODATION",
  "CATERING",
  "EQUIPMENT",
  "VEHICLE",
  "FUEL",
  "TOLLS",
  "PARKING",
  "COMMUNICATION",
  "PER_DIEM",
  "PRODUCTION",
  "MERCH",
  "INSURANCE",
  "VISA",
  "MISCELLANEOUS",
  "OTHER",
] as const

export const createExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().default("EUR"),
  category: z.enum(expenseCategories).default("OTHER"),
  date: z.string().min(1, "Date is required"),
  vendor: z.string().optional(),
  notes: z.string().optional(),
})

export const createBudgetItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  estimated: z.coerce.number().positive("Estimated amount must be positive"),
  actual: z.union([z.coerce.number().positive(), z.literal(""), z.undefined()]).optional(),
  notes: z.string().optional(),
})

export function formatExpenseCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    TRAVEL: "✈️",
    ACCOMMODATION: "🏨",
    CATERING: "🍽️",
    EQUIPMENT: "🔧",
    VEHICLE: "🚌",
    FUEL: "⛽",
    TOLLS: "🛣️",
    PARKING: "🅿️",
    COMMUNICATION: "📱",
    PER_DIEM: "💰",
    PRODUCTION: "🎭",
    MERCH: "👕",
    INSURANCE: "🛡️",
    VISA: "🛂",
    MISCELLANEOUS: "📦",
    OTHER: "📋",
  }
  return emojiMap[category] || "📋"
}
