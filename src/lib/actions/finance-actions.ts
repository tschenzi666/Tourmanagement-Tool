"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createExpenseSchema, createBudgetItemSchema } from "@/lib/validations/finance"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

// ============================================================
// EXPENSES
// ============================================================

export async function createExpense(tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    currency: (formData.get("currency") as string) || "EUR",
    category: (formData.get("category") as string) || "OTHER",
    date: formData.get("date") as string,
    vendor: (formData.get("vendor") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createExpenseSchema.parse(raw)

  await prisma.expense.create({
    data: {
      description: validated.description,
      amount: validated.amount,
      currency: validated.currency,
      category: validated.category as "TRAVEL" | "ACCOMMODATION" | "CATERING" | "EQUIPMENT" | "VEHICLE" | "FUEL" | "TOLLS" | "PARKING" | "COMMUNICATION" | "PER_DIEM" | "PRODUCTION" | "MERCH" | "INSURANCE" | "VISA" | "MISCELLANEOUS" | "OTHER",
      date: new Date(validated.date),
      vendor: validated.vendor || null,
      notes: validated.notes || null,
      tourId,
    },
  })

  revalidatePath(`/tours/${tourId}/finances`)
  redirect(`/tours/${tourId}/finances`)
}

export async function updateExpense(tourId: string, expenseId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    currency: (formData.get("currency") as string) || "EUR",
    category: (formData.get("category") as string) || "OTHER",
    date: formData.get("date") as string,
    vendor: (formData.get("vendor") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createExpenseSchema.parse(raw)

  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      description: validated.description,
      amount: validated.amount,
      currency: validated.currency,
      category: validated.category as "TRAVEL" | "ACCOMMODATION" | "CATERING" | "EQUIPMENT" | "VEHICLE" | "FUEL" | "TOLLS" | "PARKING" | "COMMUNICATION" | "PER_DIEM" | "PRODUCTION" | "MERCH" | "INSURANCE" | "VISA" | "MISCELLANEOUS" | "OTHER",
      date: new Date(validated.date),
      vendor: validated.vendor || null,
      notes: validated.notes || null,
    },
  })

  revalidatePath(`/tours/${tourId}/finances`)
}

export async function deleteExpense(tourId: string, expenseId: string) {
  await requireAuth()

  await prisma.expense.delete({ where: { id: expenseId } })

  revalidatePath(`/tours/${tourId}/finances`)
}

export async function toggleExpenseReimbursed(tourId: string, expenseId: string) {
  await requireAuth()

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { isReimbursed: true },
  })
  if (!expense) throw new Error("Expense not found")

  await prisma.expense.update({
    where: { id: expenseId },
    data: { isReimbursed: !expense.isReimbursed },
  })

  revalidatePath(`/tours/${tourId}/finances`)
}

// ============================================================
// BUDGET ITEMS
// ============================================================

export async function createBudgetItem(tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    estimated: formData.get("estimated") as string,
    actual: (formData.get("actual") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createBudgetItemSchema.parse(raw)

  await prisma.budgetItem.create({
    data: {
      category: validated.category,
      description: validated.description,
      estimated: validated.estimated,
      actual: typeof validated.actual === "number" ? validated.actual : null,
      notes: validated.notes || null,
      tourId,
    },
  })

  revalidatePath(`/tours/${tourId}/finances`)
}

export async function updateBudgetItem(tourId: string, budgetItemId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    estimated: formData.get("estimated") as string,
    actual: (formData.get("actual") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createBudgetItemSchema.parse(raw)

  await prisma.budgetItem.update({
    where: { id: budgetItemId },
    data: {
      category: validated.category,
      description: validated.description,
      estimated: validated.estimated,
      actual: typeof validated.actual === "number" ? validated.actual : null,
      notes: validated.notes || null,
    },
  })

  revalidatePath(`/tours/${tourId}/finances`)
}

export async function deleteBudgetItem(tourId: string, budgetItemId: string) {
  await requireAuth()

  await prisma.budgetItem.delete({ where: { id: budgetItemId } })

  revalidatePath(`/tours/${tourId}/finances`)
}
