import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"
import { getActiveMerchProducts } from "@/lib/queries/merch-queries"
import { PosClient } from "@/components/merch/pos-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
}

export default async function PosPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true, currency: true },
  })

  if (!tour) notFound()

  const [products, tourDays, recentSales] = await Promise.all([
    getActiveMerchProducts(tourId),
    prisma.tourDay.findMany({
      where: { tourId },
      select: { id: true, date: true, city: true },
      orderBy: { date: "asc" },
    }),
    prisma.merchSale.findMany({
      where: { tourId },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  const sym = currencySymbols[tour.currency] || tour.currency

  // Find today's tour day if any
  const today = new Date().toISOString().split("T")[0]
  const currentDay = tourDays.find(
    (d) => new Date(d.date).toISOString().split("T")[0] === today
  )

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Merch", href: `/tours/${tourId}/merch` },
          { label: "POS" },
        ]}
      />
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/tours/${tourId}/merch`}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Point of Sale</h1>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No active products. Add products first.
            </p>
            <Button asChild>
              <Link href={`/tours/${tourId}/merch`}>Manage Products</Link>
            </Button>
          </div>
        ) : (
          <PosClient
            products={products.map((p) => ({
              ...p,
              price: Number(p.price),
            }))}
            tourId={tourId}
            tourDays={tourDays.map((d) => ({
              ...d,
              date: new Date(d.date).toISOString(),
            }))}
            currentDayId={currentDay?.id}
            currencySymbol={sym}
            recentSales={recentSales.map((s) => ({
              id: s.id,
              productName: s.product.name,
              quantity: s.quantity,
              totalPrice: Number(s.totalPrice),
              size: s.size,
              createdAt: s.createdAt.toISOString(),
            }))}
          />
        )}
      </div>
    </>
  )
}
