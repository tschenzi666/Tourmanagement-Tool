"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createContactSchema, updateContactSchema } from "@/lib/validations/contact"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

async function getUserTeamId(userId: string) {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
    orderBy: { createdAt: "asc" },
  })
  if (!membership) throw new Error("No team found")
  return membership.teamId
}

export async function createContact(formData: FormData) {
  const user = await requireAuth()
  const teamId = await getUserTeamId(user.id)

  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    mobile: (formData.get("mobile") as string) || undefined,
    company: (formData.get("company") as string) || undefined,
    jobTitle: (formData.get("jobTitle") as string) || undefined,
    category: (formData.get("category") as string) || "OTHER",
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createContactSchema.parse(raw)

  const contact = await prisma.contact.create({
    data: {
      ...validated,
      email: validated.email || null,
      teamId,
    },
  })

  revalidatePath("/contacts")
  redirect(`/contacts/${contact.id}`)
}

export async function updateContact(contactId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    firstName: (formData.get("firstName") as string) || undefined,
    lastName: (formData.get("lastName") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    mobile: (formData.get("mobile") as string) || undefined,
    company: (formData.get("company") as string) || undefined,
    jobTitle: (formData.get("jobTitle") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = updateContactSchema.parse(raw)

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      ...validated,
      email: validated.email || null,
    },
  })

  revalidatePath(`/contacts/${contactId}`)
  revalidatePath("/contacts")
}

export async function deleteContact(contactId: string) {
  await requireAuth()

  await prisma.contact.delete({ where: { id: contactId } })

  revalidatePath("/contacts")
  redirect("/contacts")
}
