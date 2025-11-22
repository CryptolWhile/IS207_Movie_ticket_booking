"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Calendar, Star, LayoutDashboard, ChevronRight, Popcorn } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Quản lý phim",
    href: "/admin/movies",
    icon: Film,
  },
  {
    name: "Quản lý xuất chiếu",
    href: "/admin/showtimes",
    icon: Calendar,
  },
  {
    name: "Quản lý đánh giá",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    name: "Quản lý đồ ăn",
    href: "/admin/concessions",
    icon: Popcorn,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-sm">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Film className="h-6 w-6" />
          <div>
            <h1 className="font-semibold text-lg">CineMax Admin</h1>
            <p className="text-xs text-muted-foreground">Quản trị hệ thống</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
