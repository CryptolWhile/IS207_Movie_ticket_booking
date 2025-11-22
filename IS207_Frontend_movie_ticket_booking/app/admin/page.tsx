"use client"

import { useEffect, useState } from "react"
import { Film, Calendar, Star, Users, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([])
  const [recentMovies, setRecentMovies] = useState<any[]>([])

  useEffect(() => {
    // load stats
    fetch("http://localhost:8000/admin/dashboard/admin_stats.php")
      .then(res => res.json())
      .then(data => setStats(data))

    // load top movies
    fetch("http://localhost:8000/admin/dashboard/admin_top_movies.php")
      .then(res => res.json())
      .then(data => setRecentMovies(data))
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống quản lý rạp chiếu phim</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat: any) => {
          const IconComponent =
            stat.icon === "Film"    ? Film :
            stat.icon === "Calendar"? Calendar :
            stat.icon === "Star"    ? Star :
            Users

          return (
            <div
              key={stat.name}
              className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Movies Performance */}
      <div className="border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold">Phim có doanh thu cao nhất</h2>
          <p className="text-sm text-muted-foreground mt-1">Tuần này</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentMovies.map((movie: any, index: number) => (
              <div
                key={movie.title}
                className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{movie.title}</h3>
                    <p className="text-sm text-muted-foreground">{movie.screenings} xuất chiếu</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-semibold">{movie.revenue}</p>
                    <p className="text-sm text-muted-foreground">Doanh thu</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{movie.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
