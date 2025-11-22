// Interface cho đồ ăn/uống
export interface Concession {
  id: string
  name: string
  price: number
  category: "popcorn" | "drink" | "combo"
  description: string
  image?: string
}

// Dữ liệu đồ ăn/uống
export const concessions: Concession[] = [
  {
    id: "POPCORN_M",
    name: "Bắp rang bơ (M)",
    price: 45000,
    category: "popcorn",
    description: "Bắp rang bơ size vừa",
  },
  {
    id: "POPCORN_L",
    name: "Bắp rang bơ (L)",
    price: 60000,
    category: "popcorn",
    description: "Bắp rang bơ size lớn",
  },
  {
    id: "DRINK_M",
    name: "Nước ngọt (M)",
    price: 35000,
    category: "drink",
    description: "Nước ngọt size vừa",
  },
  {
    id: "DRINK_L",
    name: "Nước ngọt (L)",
    price: 45000,
    category: "drink",
    description: "Nước ngọt size lớn",
  },
  {
    id: "COMBO_1",
    name: "Combo 1 (Bắp M + Nước M)",
    price: 70000,
    category: "combo",
    description: "1 bắp rang size M + 1 nước ngọt size M",
  },
  {
    id: "COMBO_2",
    name: "Combo 2 (Bắp L + Nước L)",
    price: 95000,
    category: "combo",
    description: "1 bắp rang size L + 1 nước ngọt size L",
  },
]

// Interface cho thống kê bán hàng
export interface ConcessionSales {
  concessionId: string
  quantitySold: number
  revenue: number
  date: string
}

// Mock data cho thống kê
export const concessionSales: ConcessionSales[] = [
  { concessionId: "POPCORN_M", quantitySold: 245, revenue: 11025000, date: "2025-02-10" },
  { concessionId: "POPCORN_L", quantitySold: 189, revenue: 11340000, date: "2025-02-10" },
  { concessionId: "DRINK_M", quantitySold: 312, revenue: 10920000, date: "2025-02-10" },
  { concessionId: "DRINK_L", quantitySold: 156, revenue: 7020000, date: "2025-02-10" },
  { concessionId: "COMBO_1", quantitySold: 423, revenue: 29610000, date: "2025-02-10" },
  { concessionId: "COMBO_2", quantitySold: 298, revenue: 28310000, date: "2025-02-10" },
]

export function getConcessionById(id: string): Concession | undefined {
  return concessions.find((c) => c.id === id)
}

export function getConcessionsByCategory(category: "popcorn" | "drink" | "combo"): Concession[] {
  return concessions.filter((c) => c.category === category)
}