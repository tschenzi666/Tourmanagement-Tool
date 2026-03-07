import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"
import { getTourMerchProducts, getMerchSummary } from "@/lib/queries/merch-queries"
import { AddProductDialog } from "@/components/merch/add-product-dialog"
import { ProductList } from "@/components/merch/product-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Package,
  Banknote,
  CreditCard,
} from "lucide-react"

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
}

export default async function MerchPage({
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

  const [products, summary] = await Promise.all([
    getTourMerchProducts(tourId),
    getMerchSummary(tourId),
  ])

  const sym = currencySymbols[tour.currency] || tour.currency

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Merch" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Merch</h1>
            <p className="text-muted-foreground mt-1">
              Products and sales for {tour.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddProductDialog tourId={tourId} />
            <Button asChild variant="default">
              <Link href={`/tours/${tourId}/merch/pos`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Open POS
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sym}{summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sym}{summary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Profit</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Items Sold</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalSales}</p>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Products
                  {products.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {products.length} products
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductList
                  products={products.map((p) => ({
                    ...p,
                    price: Number(p.price),
                    cost: p.cost ? Number(p.cost) : null,
                  }))}
                  tourId={tourId}
                  currencySymbol={sym}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sales Breakdown */}
          <div className="space-y-6">
            {/* Revenue by Product */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.revenueByProduct.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sales yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {summary.revenueByProduct
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((item) => (
                        <div key={item.productId} className="flex items-center gap-2 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                          </div>
                          <span className="font-semibold tabular-nums">
                            {sym}{item.revenue.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue by Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.revenueByPayment.CASH !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">Cash</span>
                      <span className="font-semibold tabular-nums">
                        {sym}{(summary.revenueByPayment.CASH || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {summary.revenueByPayment.CARD !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">Card</span>
                      <span className="font-semibold tabular-nums">
                        {sym}{(summary.revenueByPayment.CARD || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {Object.keys(summary.revenueByPayment).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No sales yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
