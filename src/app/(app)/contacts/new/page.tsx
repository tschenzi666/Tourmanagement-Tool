import { Header } from "@/components/layout/header"
import { ContactForm } from "@/components/contacts/contact-form"
import { createContact } from "@/lib/actions/contact-actions"

export default function NewContactPage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Contacts", href: "/contacts" },
          { label: "New Contact" },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Add New Contact</h1>
        <ContactForm action={createContact} />
      </div>
    </>
  )
}
