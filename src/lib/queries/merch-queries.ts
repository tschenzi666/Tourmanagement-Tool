import { prisma } from "@/lib/prisma"

export async function getTourMerchProducts(tourId: string) {
  return prisma.merchProduct.findMany({
    where: { tourId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })
}

export async function getActiveMerchProducts(tourId: string) {
  return prisma.merchProduct.findMany({
    where: { tourId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })
}

export async function getMerchProduct(productId: string) {
  return prisma.merchProduct.findUnique({
    where: { id: productId },
  })
}

export async function getTourMerchSales(tourId: string) {
  return prisma.merchSale.findMany({
    where: { tourId },
    include: {
      product: { select: { name: true, category: true } },
      tourDay: { select: { id: true, date: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getMerchSalesByDay(tourId: string, tourDayId: string) {
  return prisma.merchSale.findMany({
    where: { tourId, tourDayId },
    include: {
      product: { select: { name: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getMerchSummary(tourId: string) {
  const [sales, products] = await Promise.all([
    prisma.merchSale.findMany({
      where: { tourId },
      include: {
        product: { select: { name: true, category: true, cost: true } },
      },
    }),
    prisma.merchProduct.findMany({
      where: { tourId },
      select: { id: true, name: true, stock: true },
    }),
  ])

  let totalRevenue = 0
  let totalCost = 0
  let totalItems = 0
  const revenueByProduct = new Map<string, { name: string; revenue: number; quantity: number }>()
  const revenueByPayment = new Map<string, number>()

  for (const sale of sales) {
    const revenue = Number(sale.totalPrice)
    totalRevenue += revenue
    totalItems += sale.quantity
    if (sale.product.cost) {
      totalCost += Number(sale.product.cost) * sale.quantity
    }

    const existing = revenueByProduct.get(sale.productId) || {
      name: sale.product.name,
      revenue: 0,
      quantity: 0,
    }
    existing.revenue += revenue
    existing.quantity += sale.quantity
    revenueByProduct.set(sale.productId, existing)

    const paymentTotal = revenueByPayment.get(sale.paymentMethod) || 0
    revenueByPayment.set(sale.paymentMethod, paymentTotal + revenue)
  }

  return {
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    totalItems,
    totalSales: sales.length,
    revenueByProduct: Array.from(revenueByProduct.entries()).map(([id, data]) => ({
      productId: id,
      ...data,
    })),
    revenueByPayment: Object.fromEntries(revenueByPayment),
  }
}
