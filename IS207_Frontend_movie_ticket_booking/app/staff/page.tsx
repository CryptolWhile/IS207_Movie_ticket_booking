"use client"
import StaffHeader from "@/components/staff-header"
import { Film, ShoppingBag, Receipt, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function StaffDashboard() {
  const [stats, setStats] = useState([
    { label: "Vé bán hôm nay", value: "-", icon: Film, color: "from-blue-500 to-cyan-500" },
    { label: "Đồ ăn bán hôm nay", value: "-", icon: ShoppingBag, color: "from-purple-500 to-pink-500" },
    { label: "Tổng doanh thu", value: "-", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
    { label: "Hóa đơn", value: "-", icon: Receipt, color: "from-orange-500 to-red-500" },
  ])

  const [activities, setActivities] = useState<{ customer: string; type: string; amount: string; time: string }[]>([])

  const quickActions = [
    {
      title: "Bán vé phim",
      description: "Chọn phim, suất chiếu và chỗ ngồi cho khách hàng",
      href: "/staff/tickets",
      icon: Film,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Bán đồ ăn",
      description: "Bán bắp rang, nước ngọt và combo",
      href: "/staff/concessions",
      icon: ShoppingBag,
      color: "from-purple-500 to-pink-500",
    },
  ]

  useEffect(() => {
    // Lấy số liệu thống kê
    fetch("http://localhost:8000/staff/dashboard/get_dashboard_stats.php")
      .then(res => res.json())
      .then(data => {
        setStats([
          { label: "Vé bán hôm nay", value: data.tickets_sold, icon: Film, color: "from-blue-500 to-cyan-500" },
          { label: "Đồ ăn bán hôm nay", value: data.food_sold, icon: ShoppingBag, color: "from-purple-500 to-pink-500" },
          { label: "Tổng doanh thu", value: data.total_revenue, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
          { label: "Hóa đơn", value: data.invoices_today, icon: Receipt, color: "from-orange-500 to-red-500" },
        ])
      })
      .catch(err => console.error(err))

    // Lấy hoạt động gần đây
    fetch("http://localhost:8000/staff/dashboard/get_recent_activity.php")
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <>
      <StaffHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Chào mừng trở lại</h1>
          <p className="text-muted-foreground">Quản lý bán vé và đồ ăn tại quầy</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm p-8 hover:bg-accent transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{action.title}</h3>
                      <p className="text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Hoạt động gần đây</h2>
          <div className="rounded-xl border border-border bg-card backdrop-blur-sm overflow-hidden">
            <div className="divide-y divide-border">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{activity.customer}</p>
                      <p className="text-sm text-muted-foreground">{activity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-medium">{activity.amount}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}