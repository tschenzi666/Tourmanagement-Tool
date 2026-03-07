"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createMerchProductSchema, createMerchSaleSchema } from "@/lib/validations/merch"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

// ============================================================
// MERCH PRODUCTS
// ============================================================

export async function createMerchProduct(tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || "OTHER",
    price: formData.get("price") as string,
    cost: (formData.get("cost") as string) || undefined,
    sizes: (formData.get("sizes") as string) || undefined,
    stock: (formData.get("stock") as string) || undefined,
  }

  const validated = createMerchProductSchema.parse(raw)

  await prisma.merchProduct.create({
    data: {
      name: validated.name,
      category: validated.category,
      price: validated.price,
      cost: typeof validated.cost === "number" ? validated.cost : null,
      sizes: validated.sizes || null,
      stock: typeof validated.stock === "number" ? validated.stock : null,
      tourId,
    },
  })

  revalidatePath(`/tours/${tourId}/merch`)
}

export async function updateMerchProduct(tourId: string, productId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || "OTHER",
    price: formData.get("price") as string,
    cost: (formData.get("cost") as string) || undefined,
    sizes: (formData.get("sizes") as string) || undefined,
    stock: (formData.get("stock") as string) || undefined,
  }

  const validated = createMerchProductSchema.parse(raw)

  await prisma.merchProduct.update({
    where: { id: productId },
    data: {
      name: validated.name,
      category: validated.category,
      price: validated.price,
      cost: typeof validated.cost === "number" ? validated.cost : null,
      sizes: validated.sizes || null,
      stock: typeof validated.stock === "number" ? validated.stock : null,
    },
  })

  revalidatePath(`/tours/${tourId}/merch`)
}

export async function deleteMerchProduct(tourId: string, productId: string) {
  await requireAuth()

  await prisma.merchProduct.delete({ where: { id: productId } })

  revalidatePath(`/tours/${tourId}/merch`)
}

export async function toggleMerchProductActive(tourId: string, productId: string) {
  await requireAuth()

  const product = await prisma.merchProduct.findUnique({
    where: { id: productId },
    select: { isActive: true },
  })
  if (!product) throw new Error("Product not found")

  await prisma.merchProduct.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  })

  revalidatePath(`/tours/${tourId}/merch`)
}

// ============================================================
// MERCH SALES (POS)
// ============================================================

export async function createMerchSale(tourId: string, data: {
  productId: string
  quantity: number
  unitPrice: number
  size?: string
  paymentMethod?: string
  tourDayId?: string
  notes?: string
}) {
  await requireAuth()

  const validated = createMerchSaleSchema.parse(data)
  const totalPrice = validated.quantity * validated.unitPrice

  const result = await prisma.$transaction(async (tx) => {
    // Create the sale
    const sale = await tx.merchSale.create({
      data: {
        quantity: validated.quantity,
        unitPrice: validated.unitPrice,
        totalPrice,
        size: validated.size || null,
        paymentMethod: validated.paymentMethod as "CASH" | "CARD" | "MIXED",
        notes: validated.notes || null,
        productId: validated.productId,
        tourId,
        tourDayId: validated.tourDayId || null,
      },
    })

    // Decrease stock if tracked
    const product = await tx.merchProduct.findUnique({
      where: { id: validated.productId },
      select: { stock: true },
    })
    if (product?.stock !== null && product?.stock !== undefined) {
      await tx.merchProduct.update({
        where: { id: validated.productId },
        data: { stock: Math.max(0, product.stock - validated.quantity) },
      })
    }

    return sale
  })

  revalidatePath(`/tours/${tourId}/merch`)
  revalidatePath(`/tours/${tourId}/finances`)
  return result
}

export async function deleteMerchSale(tourId: string, saleId: string) {
  await requireAuth()

  // Restore stock
  const sale = await prisma.merchSale.findUnique({
    where: { id: saleId },
    select: { productId: true, quantity: true },
  })

  if (sale) {
    await prisma.$transaction(async (tx) => {
      await tx.merchSale.delete({ where: { id: saleId } })

      const product = await tx.merchProduct.findUnique({
        where: { id: sale.productId },
        select: { stock: true },
      })
      if (product?.stock !== null && product?.stock !== undefined) {
        await tx.merchProduct.update({
          where: { id: sale.productId },
          data: { stock: product.stock + sale.quantity },
        })
      }
    })
  }

  revalidatePath(`/tours/${tourId}/merch`)
  revalidatePath(`/tours/${tourId}/finances`)
}
