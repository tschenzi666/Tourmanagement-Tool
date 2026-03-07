import { z } from "zod"

export const merchProductCategories = [
  "TSHIRT",
  "HOODIE",
  "HAT",
  "POSTER",
  "VINYL",
  "CD",
  "STICKER",
  "BAG",
  "ACCESSORY",
  "OTHER",
] as const

export const paymentMethods = ["CASH", "CARD", "MIXED"] as const

export const createMerchProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(merchProductCategories).default("OTHER"),
  price: z.coerce.number().positive("Price must be positive"),
  cost: z.union([z.coerce.number().positive(), z.literal(""), z.undefined()]).optional(),
  sizes: z.string().optional(),
  stock: z.union([z.coerce.number().int().min(0), z.literal(""), z.undefined()]).optional(),
})

export const createMerchSaleSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.coerce.number().positive(),
  size: z.string().optional(),
  paymentMethod: z.enum(paymentMethods).default("CASH"),
  tourDayId: z.string().optional(),
  notes: z.string().optional(),
})

export function formatMerchCategory(category: string): string {
  const map: Record<string, string> = {
    TSHIRT: "T-Shirt",
    HOODIE: "Hoodie",
    HAT: "Hat/Cap",
    POSTER: "Poster",
    VINYL: "Vinyl",
    CD: "CD",
    STICKER: "Sticker",
    BAG: "Bag/Tote",
    ACCESSORY: "Accessory",
    OTHER: "Other",
  }
  return map[category] || category
}

export function getMerchCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    TSHIRT: "👕",
    HOODIE: "🧥",
    HAT: "🧢",
    POSTER: "🖼️",
    VINYL: "💿",
    CD: "📀",
    STICKER: "🏷️",
    BAG: "👜",
    ACCESSORY: "📿",
    OTHER: "📦",
  }
  return map[category] || "📦"
}
