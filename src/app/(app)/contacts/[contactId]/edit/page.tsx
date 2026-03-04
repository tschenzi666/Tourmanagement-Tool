import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { getContact } from "@/lib/queries/contact-queries"
import { ContactForm } from "@/components/contacts/contact-form"
import { updateContact } from "@/lib/actions/contact-actions"

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ contactId: string }>
}) {
  const { contactId } = await params
  const contact = await getContact(contactId)

  if (!contact) notFound()

  const updateContactWithId = async (formData: FormData) => {
    "use server"
    await updateContact(contactId, formData)
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Contacts", href: "/contacts" },
          { label: `${contact.firstName} ${contact.lastName}`, href: `/contacts/${contactId}` },
          { label: "Edit" },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Contact</h1>
        <ContactForm action={updateContactWithId} contact={contact} submitLabel="Save Changes" />
      </div>
    </>
  )
}
