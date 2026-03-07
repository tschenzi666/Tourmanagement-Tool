import { prisma } from "@/lib/prisma"

export async function getTourExpenses(tourId: string) {
  return prisma.expense.findMany({
    where: { tourId },
    orderBy: { date: "desc" },
  })
}

export async function getExpense(expenseId: string) {
  return prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      tour: { select: { id: true, name: true, currency: true } },
    },
  })
}

export async function getTourBudgetItems(tourId: string) {
  return prisma.budgetItem.findMany({
    where: { tourId },
    orderBy: { category: "asc" },
  })
}

export async function getTourShowRevenue(tourId: string) {
  return prisma.showDetails.findMany({
    where: { tourDay: { tourId } },
    include: {
      tourDay: {
        select: {
          id: true,
          date: true,
          city: true,
          country: true,
          venue: { select: { name: true } },
        },
      },
      deductions: true,
    },
    orderBy: { tourDay: { date: "asc" } },
  })
}

export async function getTourFinancialSummary(tourId: string) {
  const [expenses, showDetails, budgetItems, crewMembers, merchSales] = await Promise.all([
    prisma.expense.findMany({ where: { tourId } }),
    prisma.showDetails.findMany({
      where: { tourDay: { tourId } },
      include: { deductions: true },
    }),
    prisma.budgetItem.findMany({ where: { tourId } }),
    prisma.tourCrewMember.findMany({
      where: { tourId, isActive: true },
      select: { dailyRate: true, perDiem: true },
    }),
    prisma.merchSale.findMany({
      where: { tourId },
      select: { totalPrice: true },
    }),
  ])

  // Total expenses by category
  const expenseByCategory = new Map<string, number>()
  let totalExpenses = 0
  for (const exp of expenses) {
    const amount = Number(exp.amount)
    totalExpenses += amount
    const current = expenseByCategory.get(exp.category) || 0
    expenseByCategory.set(exp.category, current + amount)
  }

  // Show revenue
  let totalGuarantees = 0
  let totalGrossRevenue = 0
  let totalMerchSales = 0
  let totalDeductions = 0
  let settledShows = 0

  for (const show of showDetails) {
    if (show.guarantee) totalGuarantees += Number(show.guarantee)
    if (show.grossRevenue) totalGrossRevenue += Number(show.grossRevenue)
    if (show.merchSales) totalMerchSales += Number(show.merchSales)
    if (show.isSettled) settledShows++
    for (const ded of show.deductions) {
      totalDeductions += Number(ded.amount)
    }
  }

  // Budget summary
  let totalBudgetEstimated = 0
  let totalBudgetActual = 0
  for (const item of budgetItems) {
    totalBudgetEstimated += Number(item.estimated)
    if (item.actual) totalBudgetActual += Number(item.actual)
  }

  // Crew costs (estimated)
  let dailyCrewCost = 0
  let dailyPerDiemCost = 0
  for (const member of crewMembers) {
    if (member.dailyRate) dailyCrewCost += Number(member.dailyRate)
    if (member.perDiem) dailyPerDiemCost += Number(member.perDiem)
  }

  // Merch POS revenue
  let totalMerchPosRevenue = 0
  for (const sale of merchSales) {
    totalMerchPosRevenue += Number(sale.totalPrice)
  }

  return {
    totalExpenses,
    expenseByCategory: Object.fromEntries(expenseByCategory),
    expenseCount: expenses.length,
    totalGuarantees,
    totalGrossRevenue,
    totalMerchSales,
    totalMerchPosRevenue,
    totalDeductions,
    settledShows,
    totalShows: showDetails.length,
    totalBudgetEstimated,
    totalBudgetActual,
    budgetItemCount: budgetItems.length,
    dailyCrewCost,
    dailyPerDiemCost,
    activeCrewCount: crewMembers.length,
  }
}
