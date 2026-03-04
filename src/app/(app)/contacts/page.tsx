import Link from "next/link"
import { Header } from "@/components/layout/header"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getContactsForTeam } from "@/lib/queries/contact-queries"
import { ContactCategoryBadge } from "@/components/contacts/contact-category-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Contact, Phone, Mail } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ContactsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    select: { teamId: true },
  })
  if (!membership) redirect("/dashboard")

  const contacts = await getContactsForTeam(membership.teamId)

  return (
    <>
      <Header breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Contacts" }]} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""} in your database
            </p>
          </div>
          <Button asChild>
            <Link href="/contacts/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Link>
          </Button>
        </div>

        {contacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Contact className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No contacts yet</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Keep track of promoters, venue staff, agents, and anyone you work with on tour.
              </p>
              <Button asChild className="mt-4">
                <Link href="/contacts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Contact
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Venues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/contacts/${contact.id}`} className="hover:underline">
                        <div>
                          <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                          {contact.jobTitle && (
                            <p className="text-xs text-muted-foreground">{contact.jobTitle}</p>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.company ?? "—"}
                    </TableCell>
                    <TableCell>
                      <ContactCategoryBadge category={contact.category} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {contact.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {contact._count.venueContacts || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </>
  )
}
