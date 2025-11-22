"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, DollarSign, Package, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type Concession = {
  id: string
  name: string
  description: string
  price: number
}

export default function ConcessionsPage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({})
  const [viewType, setViewType] = useState<"daily" | "category">("daily")
  const [viewMonth, setViewMonth] = useState(new Date(2025, 1))
  const [dailyChartData, setDailyChartData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [concessions, setConcessions] = useState<Concession[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [avgDaily, setAvgDaily] = useState(0)

  const monthParam = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`

  // Lấy dữ liệu khi tháng hoặc viewType thay đổi
  useEffect(() => {
    fetch(`http://localhost:8000/admin/concessions/daily.php?month=${monthParam}`)
      .then(res => res.json())
      .then(data => {
        setDailyChartData(data)
        const revenueSum = data.reduce((sum: number, d: any) => sum + d.revenue, 0)
        const itemsSum = data.reduce((sum: number, d: any) => sum + d.items, 0)
        setTotalRevenue(revenueSum)
        setTotalItems(itemsSum)
        setAvgDaily(data.length ? revenueSum / data.length : 0)
      })

    fetch(`http://localhost:8000/admin/concessions/category.php?month=${monthParam}`)
      .then(res => res.json())
      .then(data => setCategoryData(data))

    fetch(`http://localhost:8000/admin/concessions/top_products.php?month=${monthParam}`)
      .then(res => res.json())
      .then(data => {
        // Chuyển top products thành danh sách concessions để quản lý giá
        setConcessions(data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          description: "",
          price: p.revenue / p.items_sold // tạm tính giá trung bình
        })))
      })
  }, [viewMonth])

  const handlePrevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))
  const handleNextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))

  const handleEdit = (concession: Concession) => {
    setEditingId(concession.id)
    setEditedPrices({ ...editedPrices, [concession.id]: concession.price })
  }

  const handleSave = async (id: string) => {
    const price = editedPrices[id]
    const formData = new FormData()
    formData.append("snack_id", id)
    formData.append("price", String(price))

    const res = await fetch("http://localhost:8000/admin/concessions/update_price.php", { method: "POST", body: formData })
    const json = await res.json()
    if (json.success) {
      alert("Đã cập nhật giá")
      setConcessions(prev => prev.map(c => c.id === id ? { ...c, price } : c))
      setEditingId(null)
    } else {
      alert("Lỗi: " + (json.error || "Không thể cập nhật"))
    }
  }

  const handleCancel = () => setEditingId(null)

  const monthStr = viewMonth.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Doanh thu đồ ăn & nước uống</h1>
        <p className="text-muted-foreground">Phân tích chi tiết doanh số bán hàng theo tháng</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 border border-border/50 rounded-xl bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600/20" />
          </div>
        </div>

        <div className="p-6 border border-border/50 rounded-xl bg-gradient-to-br from-green-50 to-green-50 dark:from-green-950/20 dark:to-green-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sản phẩm đã bán</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalItems.toLocaleString("vi-VN")}
              </p>
            </div>
            <Package className="h-10 w-10 text-green-600/20" />
          </div>
        </div>

        <div className="p-6 border border-border/50 rounded-xl bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Trung bình/ngày</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(avgDaily / 1000000).toFixed(1)}M
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600/20" />
          </div>
        </div>

        <div className="p-6 border border-border/50 rounded-xl bg-gradient-to-br from-orange-50 to-orange-50 dark:from-orange-950/20 dark:to-orange-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tháng hiện tại</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{monthStr}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="border border-border/50 rounded-xl bg-background overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Biểu đồ doanh thu</h2>
            <div className="flex gap-2">
              <Button
                variant={viewType === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("daily")}
              >
                Theo ngày
              </Button>
              <Button
                variant={viewType === "category" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("category")}
              >
                Theo loại
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {viewType === "daily" ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${(Number(value) / 1000000).toFixed(1)} triệu đồng`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu (đ)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <ResponsiveContainer width={450} height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${(Number(entry.value) / 1000000).toFixed(1)}tr`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${(Number(value) / 1000000).toFixed(1)} triệu đồng`} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 space-y-3">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="p-4 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <p className="font-semibold">{cat.name}</p>
                      </div>
                      <p className="text-right">
                        <span className="font-bold">{(cat.value / 1000000).toFixed(1)} triệu đồng</span>
                        <span className="text-xs text-muted-foreground ml-2">({cat.items} sp)</span>
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="rounded-full h-2 transition-all"
                        style={{
                          width: `${(cat.value / (totalRevenue || 1)) * 100}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Management */}
      <div className="border border-border/50 rounded-xl bg-background overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Quản lý giá sản phẩm</h2>
          <p className="text-sm text-muted-foreground mt-1">Chỉnh sửa giá bán của các sản phẩm</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concessions.map((concession) => (
              <div
                key={concession.id}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{concession.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{concession.description}</p>
                  </div>
                  {editingId !== concession.id && (
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(concession)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {editingId === concession.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Giá mới (VNĐ)</Label>
                      <Input
                        type="number"
                        value={editedPrices[concession.id] || concession.price}
                        onChange={(e) =>
                          setEditedPrices({
                            ...editedPrices,
                            [concession.id]: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        className="text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSave(concession.id)} className="flex-1">
                        Lưu
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-primary">{concession.price.toLocaleString("vi-VN")}đ</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
