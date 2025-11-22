import { concessions } from "./concessions-data"

export interface DailySales {
  date: string
  concessionId: string
  quantitySold: number
  revenue: number
}

export const dailySalesData: DailySales[] = [
  // 2025-02-12 - Sample day with Combo A, Combo B sales
  { date: "2025-02-12", concessionId: "COMBO_1", quantitySold: 45, revenue: 3150000 },
  { date: "2025-02-12", concessionId: "COMBO_2", quantitySold: 32, revenue: 3040000 },
  { date: "2025-02-12", concessionId: "POPCORN_M", quantitySold: 28, revenue: 1260000 },
  { date: "2025-02-13", concessionId: "COMBO_1", quantitySold: 52, revenue: 3640000 },
  { date: "2025-02-13", concessionId: "COMBO_2", quantitySold: 38, revenue: 3610000 },
  { date: "2025-02-13", concessionId: "DRINK_M", quantitySold: 35, revenue: 1225000 },
  { date: "2025-02-14", concessionId: "COMBO_1", quantitySold: 48, revenue: 3360000 },
  { date: "2025-02-14", concessionId: "COMBO_2", quantitySold: 41, revenue: 3895000 },
  { date: "2025-02-14", concessionId: "POPCORN_L", quantitySold: 32, revenue: 1920000 },
  { date: "2025-02-15", concessionId: "COMBO_1", quantitySold: 55, revenue: 3850000 },
  { date: "2025-02-15", concessionId: "COMBO_2", quantitySold: 36, revenue: 3420000 },
  { date: "2025-02-15", concessionId: "DRINK_L", quantitySold: 38, revenue: 1710000 },
  { date: "2025-02-16", concessionId: "COMBO_1", quantitySold: 60, revenue: 4200000 },
  { date: "2025-02-16", concessionId: "COMBO_2", quantitySold: 44, revenue: 4180000 },
  { date: "2025-02-16", concessionId: "POPCORN_M", quantitySold: 42, revenue: 1890000 },
  { date: "2025-02-17", concessionId: "COMBO_1", quantitySold: 65, revenue: 4550000 },
  { date: "2025-02-17", concessionId: "COMBO_2", quantitySold: 48, revenue: 4560000 },
  { date: "2025-02-17", concessionId: "DRINK_M", quantitySold: 45, revenue: 1575000 },
  { date: "2025-02-18", concessionId: "COMBO_1", quantitySold: 58, revenue: 4060000 },
  { date: "2025-02-18", concessionId: "COMBO_2", quantitySold: 42, revenue: 3990000 },
  { date: "2025-02-18", concessionId: "POPCORN_L", quantitySold: 40, revenue: 2400000 },
  { date: "2025-02-19", concessionId: "COMBO_1", quantitySold: 70, revenue: 4900000 },
  { date: "2025-02-19", concessionId: "COMBO_2", quantitySold: 52, revenue: 4940000 },
  { date: "2025-02-19", concessionId: "DRINK_L", quantitySold: 48, revenue: 2160000 },
]

// ============================================================================
// CALCULATION FUNCTIONS - Use the static data above
// ============================================================================

export interface DailyChartData {
  date: string
  day: number
  revenue: number
  items: number
}

export function getDailyChartData(viewMonth: Date): DailyChartData[] {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()

  const dailyMap = new Map<string, { revenue: number; items: number }>()

  dailySalesData.forEach((sale) => {
    const saleDate = new Date(sale.date)
    if (saleDate.getMonth() === month && saleDate.getFullYear() === year) {
      const key = sale.date
      if (!dailyMap.has(key)) {
        dailyMap.set(key, { revenue: 0, items: 0 })
      }
      const current = dailyMap.get(key)!
      current.revenue += sale.revenue
      current.items += sale.quantitySold
    }
  })

  return Array.from(dailyMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, data]) => {
      const dateObj = new Date(date)
      const day = dateObj.getDate()
      const monthNum = dateObj.getMonth() + 1

      return {
        date: `${day}/${monthNum}`,
        day,
        revenue: data.revenue,
        items: data.items,
      }
    })
}

export interface CategoryChartData {
  name: string
  value: number
  items: number
  color: string
   [key: string]: any
}

export function getCategoryChartData(viewMonth: Date): CategoryChartData[] {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()

  const categoryRevenue: Record<string, number> = {}
  const categoryItems: Record<string, number> = {}

  concessions.forEach((item) => {
    categoryRevenue[item.category] = 0
    categoryItems[item.category] = 0
  })

  dailySalesData.forEach((sale) => {
    const saleDate = new Date(sale.date)
    if (saleDate.getMonth() === month && saleDate.getFullYear() === year) {
      const concession = concessions.find((c) => c.id === sale.concessionId)
      if (concession) {
        categoryRevenue[concession.category] = (categoryRevenue[concession.category] || 0) + sale.revenue
        categoryItems[concession.category] = (categoryItems[concession.category] || 0) + sale.quantitySold
      }
    }
  })

  const categoryNames: Record<string, string> = {
    popcorn: "Bắp rang",
    drink: "Nước ngọt",
    combo: "Combo",
  }

  const categoryColors: Record<string, string> = {
    popcorn: "#f59e0b",
    drink: "#3b82f6",
    combo: "#10b981",
  }

  return Object.entries(categoryRevenue)
    .filter(([_, revenue]) => revenue > 0)
    .map(([cat, revenue]) => ({
      name: categoryNames[cat],
      value: revenue as number,
      items: (categoryItems[cat] as number) || 0,
      color: categoryColors[cat],
    }))
}

export interface TopProduct {
  id: string
  name: string
  items: number
  revenue: number
  description: string
  price: number
}

export function getTopProducts(viewMonth: Date): TopProduct[] {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()

  const productStats: Record<
    string,
    { id: string; name: string; items: number; revenue: number; description: string; price: number }
  > = {}

  dailySalesData.forEach((sale) => {
    const saleDate = new Date(sale.date)
    if (saleDate.getMonth() === month && saleDate.getFullYear() === year) {
      const concession = concessions.find((c) => c.id === sale.concessionId)
      if (concession) {
        if (!productStats[sale.concessionId]) {
          productStats[sale.concessionId] = {
            id: concession.id,
            name: concession.name,
            items: 0,
            revenue: 0,
            description: concession.description,
            price: concession.price,
          }
        }
        productStats[sale.concessionId].items += sale.quantitySold
        productStats[sale.concessionId].revenue += sale.revenue
      }
    }
  })

  return Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}

export interface RevenueStats {
  totalRevenue: number
  totalItems: number
  avgDaily: number
  daysWithSales: number
}

export function getRevenueStats(viewMonth: Date): RevenueStats {
  const dailyData = getDailyChartData(viewMonth)
  const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0)
  const totalItems = dailyData.reduce((sum, d) => sum + d.items, 0)
  const daysWithSales = dailyData.length
  const avgDaily = daysWithSales > 0 ? totalRevenue / daysWithSales : 0

  return {
    totalRevenue,
    totalItems,
    avgDaily,
    daysWithSales,
  }
}