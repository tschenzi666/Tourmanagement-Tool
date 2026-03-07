import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"
import {
  getTourExpenses,
  getTourBudgetItems,
  getTourShowRevenue,
  getTourFinancialSummary,
  getTourTravelTicketCosts,
} from "@/lib/queries/finance-queries"
import { AddExpenseDialog } from "@/components/finances/add-expense-dialog"
import { AddBudgetItemDialog } from "@/components/finances/add-budget-item-dialog"
import { ExpenseList } from "@/components/finances/expense-list"
import { GoogleSheetEmbed } from "@/components/finances/google-sheet-embed"
import { CsvImport } from "@/components/finances/csv-import"
import { deleteBudgetItem } from "@/lib/actions/finance-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Landmark,
  Users,
  Trash2,
  Music,
  CheckCircle2,
  Clock,
} from "lucide-react"

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
}

export default async function FinancesPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true, currency: true, startDate: true, endDate: true },
  })

  if (!tour) notFound()

  const [expenses, budgetItems, showRevenue, summary, travelTickets] = await Promise.all([
    getTourExpenses(tourId),
    getTourBudgetItems(tourId),
    getTourShowRevenue(tourId),
    getTourFinancialSummary(tourId),
    getTourTravelTicketCosts(tourId),
  ])

  const sym = currencySymbols[tour.currency] || tour.currency
  const netIncome = summary.totalGuarantees - summary.totalExpenses

  // Calculate tour duration for crew cost projections
  let tourDays = 11 // default
  if (tour.startDate && tour.endDate) {
    tourDays = Math.ceil(
      (new Date(tour.endDate).getTime() - new Date(tour.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  }
  const projectedCrewCost = summary.dailyCrewCost * tourDays
  const projectedPerDiemCost = summary.dailyPerDiemCost * tourDays

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Finances" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Finances</h1>
            <p className="text-muted-foreground mt-1">
              Financial overview for {tour.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddBudgetItemDialog tourId={tourId} />
            <AddExpenseDialog tourId={tourId} />
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
                    {sym}{summary.totalGuarantees.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Show Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sym}{summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Expenses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${netIncome >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${netIncome >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {netIncome >= 0 ? "+" : ""}{sym}{netIncome.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Net Income</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sym}{summary.dailyCrewCost.toLocaleString(undefined, { minimumFractionDigits: 0 })}<span className="text-sm font-normal text-muted-foreground">/day</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Crew Cost ({summary.activeCrewCount} crew)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Show Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Show Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showRevenue.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No show deals entered yet. Add show details from the day sheet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {showRevenue.map((show) => (
                      <div key={show.id} className="flex items-center gap-4 p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">
                            {show.tourDay.city}{show.tourDay.venue ? ` — ${show.tourDay.venue.name}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(show.tourDay.date), "MMM d, yyyy")}
                            {show.ticketsSold !== null && show.capacity && (
                              <> · {show.ticketsSold}/{show.capacity} tickets</>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          {show.guarantee && (
                            <p className="font-semibold tabular-nums">
                              {sym}{Number(show.guarantee).toLocaleString()}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-0.5">
                            {show.isSettled ? (
                              <Badge className="bg-green-600 text-xs">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Settled
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Expenses
                  {(expenses.length + travelTickets.length) > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {expenses.length + travelTickets.length} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseList
                  expenses={[
                    ...expenses.map((e) => ({
                      ...e,
                      amount: Number(e.amount),
                      date: new Date(e.date),
                      isTravelTicket: false as const,
                    })),
                    ...travelTickets.map((t) => ({
                      id: t.id,
                      description: `${t.ticketType}: ${t.departureCity} → ${t.arrivalCity}${t.crewMember?.user?.name ? ` (${t.crewMember.user.name})` : ""}`,
                      amount: Number(t.cost),
                      currency: t.currency,
                      category: "TRAVEL",
                      date: t.departureTime ? new Date(t.departureTime) : new Date(t.createdAt),
                      vendor: t.carrier,
                      notes: t.bookingReference ? `Ref: ${t.bookingReference}` : null,
                      isReimbursed: false,
                      isTravelTicket: true as const,
                    })),
                  ].sort((a, b) => b.date.getTime() - a.date.getTime())}
                  tourId={tourId}
                />
              </CardContent>
            </Card>

            {/* Google Sheet Embed */}
            <GoogleSheetEmbed />

            {/* CSV Import */}
            <CsvImport tourId={tourId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Crew Cost Projection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Crew Cost Projection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily crew wages</span>
                  <span className="font-medium">{sym}{summary.dailyCrewCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily per diems</span>
                  <span className="font-medium">{sym}{summary.dailyPerDiemCost.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projected wages ({tourDays} days)</span>
                    <span className="font-semibold">{sym}{projectedCrewCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Projected per diems</span>
                    <span className="font-semibold">{sym}{projectedPerDiemCost.toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Total crew projection</span>
                    <span>{sym}{(projectedCrewCost + projectedPerDiemCost).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  Budget
                  {budgetItems.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {budgetItems.length} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {budgetItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No budget items yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {budgetItems.map((item) => {
                      const variance = item.actual
                        ? Number(item.actual) - Number(item.estimated)
                        : null
                      return (
                        <div key={item.id} className="flex items-center gap-2 text-sm py-1.5">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.description}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="tabular-nums">
                              {sym}{Number(item.estimated).toLocaleString()}
                            </p>
                            {item.actual && (
                              <p className={`text-xs tabular-nums ${variance && variance > 0 ? "text-red-600" : "text-green-600"}`}>
                                {variance && variance > 0 ? "+" : ""}{sym}{variance?.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <form action={deleteBudgetItem.bind(null, tourId, item.id)}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" type="submit">
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </form>
                        </div>
                      )
                    })}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>Total Budget</span>
                        <span>{sym}{summary.totalBudgetEstimated.toLocaleString()}</span>
                      </div>
                      {summary.totalBudgetActual > 0 && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Actual</span>
                          <span className="font-medium">{sym}{summary.totalBudgetActual.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Show Settlement Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Settlement Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{
                            width: summary.totalShows > 0
                              ? `${(summary.settledShows / summary.totalShows) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {summary.settledShows}/{summary.totalShows} shows settled
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
