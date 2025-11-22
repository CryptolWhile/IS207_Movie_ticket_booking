"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, ShoppingBag, Receipt, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StaffHeader() {
  const pathname = usePathname()

  const navItems = [
    { href: "/staff", label: "Tổng quan", icon: Receipt },
    { href: "/staff/tickets", label: "Bán vé", icon: Film },
    { href: "/staff/concessions", label: "Bán đồ ăn", icon: ShoppingBag },
  ]

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/staff" className="text-xl font-bold text-foreground">
              CinemaStaff
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  )
}
