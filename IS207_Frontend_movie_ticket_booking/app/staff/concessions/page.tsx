"use client"

import { useState, useEffect } from "react"
import StaffHeader from "@/components/staff-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingBag, Check, Plus, Minus } from "lucide-react"

export default function StaffConcessionsSales() {
  const [concessions, setConcessions] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<{ snack_id: string; quantity: number }[]>([])
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "" })
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch concessions từ API
  useEffect(() => {
    fetch("http://localhost:8000/staff/concessions/get_concessions.php")
      .then((res) => res.json())
      .then((data) => setConcessions(data?.data ?? []))
      .catch((err) => {
        console.error("Error fetching concessions:", err)
        setConcessions([])
      })
      .finally(() => setLoading(false))
  }, [])

  const updateQuantity = (snack_id: string, quantity: number) => {
    if (quantity === 0) {
      setSelectedItems((prev) => prev.filter((item) => item.snack_id !== snack_id))
    } else {
      setSelectedItems((prev) => {
        const existing = prev.find((item) => item.snack_id === snack_id)
        if (existing) {
          return prev.map((item) => (item.snack_id === snack_id ? { ...item, quantity } : item))
        }
        return [...prev, { snack_id, quantity }]
      })
    }
  }

  const getQuantity = (snack_id: string) => selectedItems.find((item) => item.snack_id === snack_id)?.quantity || 0

  const total = selectedItems.reduce((sum, item) => {
    const concession = concessions.find((c) => c.snack_id === item.snack_id)
    return sum + (concession?.price || 0) * item.quantity
  }, 0)

  const handleComplete = async () => {
    const invoiceData = {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 10000)
      ).padStart(4, "0")}`,
      items: selectedItems.map((item) => {
        const concession = concessions.find((c) => c.snack_id === item.snack_id)
        return {
          snack_id: item.snack_id,
          quantity: item.quantity,
          price: concession?.price ?? 0,
        }
      }),
      customer: customerInfo.name ? customerInfo : null,
      grandTotal: total,
    }

    try {
      const response = await fetch(
        "http://localhost:8000/staff/concessions/create_concession_invoice.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoiceData),
        }
      )
      const result = await response.json()
      if (result.status) {
        sessionStorage.setItem("invoice_id", result.order_id)
        window.location.href = "/staff/invoice"
      } else {
        console.error("Invoice creation failed:", result)
      }
    } catch (err) {
      console.error("Error creating invoice:", err)
    }
  }

  const popcornItems = concessions.filter((c) => c.category === "popcorn")
  const drinkItems = concessions.filter((c) => c.category === "drink")
  const comboItems = concessions.filter((c) => c.category === "combo")

  if (loading)
    return <div className="p-10 text-center text-lg">Đang tải dữ liệu...</div>

  return (
    <>
      <StaffHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Bán đồ ăn & Uống</h1>
                <p className="text-muted-foreground">Chọn bắp rang, nước ngọt và combo cho khách hàng</p>
              </div>

              {/* Popcorn Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="h-8 w-1 bg-yellow-500 rounded-full" />
                  Bắp rang
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popcornItems.map((item) => {
                    const quantity = getQuantity(item.snack_id)
                    return (
                      <div
                        key={`popcorn-${item.snack_id}`}
                        className="rounded-xl border border-border bg-card backdrop-blur-sm p-6 hover:bg-accent transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-1">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            <p className="text-2xl font-bold text-foreground">{item.price.toLocaleString()} VNĐ</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => updateQuantity(item.snack_id, Math.max(0, quantity - 1))}
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-bold text-foreground">{quantity}</span>
                          </div>
                          <Button
                            onClick={() => updateQuantity(item.snack_id, quantity + 1)}
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Drinks Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="h-8 w-1 bg-blue-500 rounded-full" />
                  Nước ngọt
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {drinkItems.map((item) => {
                    const quantity = getQuantity(item.snack_id)
                    return (
                      <div
                        key={`drink-${item.snack_id}`}
                        className="rounded-xl border border-border bg-card backdrop-blur-sm p-6 hover:bg-accent transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-1">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            <p className="text-2xl font-bold text-foreground">{item.price.toLocaleString()} VNĐ</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => updateQuantity(item.snack_id, Math.max(0, quantity - 1))}
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-bold text-foreground">{quantity}</span>
                          </div>
                          <Button
                            onClick={() => updateQuantity(item.snack_id, quantity + 1)}
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Combo Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="h-8 w-1 bg-green-500 rounded-full" />
                  Combo tiết kiệm
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comboItems.map((item) => {
                    const quantity = getQuantity(item.snack_id)
                    return (
                      <div
                        key={`combo-${item.snack_id}`}
                        className="rounded-xl border border-border bg-gradient-to-br from-green-500/10 to-transparent backdrop-blur-sm p-6 hover:from-green-500/20 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="inline-block px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold mb-2">
                              TIẾT KIỆM
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            <p className="text-2xl font-bold text-foreground">{item.price.toLocaleString()} VNĐ</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => updateQuantity(item.snack_id, Math.max(0, quantity - 1))}
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-bold text-foreground">{quantity}</span>
                          </div>
                          <Button
                            onClick={() => updateQuantity(item.snack_id, quantity + 1)}
                            variant="outline"
                            size="lg"
                            className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Customer Info (Optional) */}
              {!showCustomerForm && selectedItems.length > 0 && (
                <Button onClick={() => setShowCustomerForm(true)} variant="outline" className="w-full h-12 mb-4">
                  Thêm thông tin khách hàng (Tùy chọn)
                </Button>
              )}

              {showCustomerForm && (
                <div className="rounded-xl border border-border bg-card backdrop-blur-sm p-6 mb-4">
                  <h3 className="text-lg font-bold text-foreground mb-4">Thông tin khách hàng</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground mb-2 block">
                        Họ tên
                      </Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="bg-accent border-border text-foreground h-12"
                        placeholder="Nhập họ tên khách hàng"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-foreground mb-2 block">
                        Số điện thoại
                      </Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="bg-accent border-border text-foreground h-12"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <Button onClick={() => setShowCustomerForm(false)} variant="outline" className="w-full">
                      Đóng
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="w-96 flex-shrink-0">
              <div className="sticky top-24 rounded-xl border border-border bg-card backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag className="h-6 w-6 text-foreground" />
                  <h3 className="text-xl font-bold text-foreground">Đơn hàng</h3>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">Chưa có sản phẩm nào</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                      {selectedItems.map((item) => {
                        const concession = concessions.find((c) => c.snack_id === item.snack_id)
                        if (!concession) return null
                        return (
                          <div
                            key={`summary-${item.snack_id}`}
                            className="flex justify-between items-start text-muted-foreground pb-3 border-b border-border"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{concession.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {concession.price.toLocaleString()} VNĐ x {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold text-foreground">
                              {(concession.price * item.quantity).toLocaleString()} VNĐ
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg text-muted-foreground">Tổng cộng</span>
                        <span className="text-3xl font-bold text-foreground">{total.toLocaleString()} VNĐ</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleComplete}
                      disabled={selectedItems.length === 0}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-bold"
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Hoàn tất & Xuất hóa đơn
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}