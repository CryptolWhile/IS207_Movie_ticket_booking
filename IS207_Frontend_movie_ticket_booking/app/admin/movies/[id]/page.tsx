"use client"

import { use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const API_BASE = "http://localhost:8000/admin"

export default function MovieRevenueDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [movie, setMovie] = useState<any>(null)
  const [showtimes, setShowtimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load movie info + showtimes from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showtimeRes] = await Promise.all([
          fetch(`${API_BASE}/movies/get_movie_details.php?movie_id=${id}`),
          fetch(`${API_BASE}/movies/get_movie_showtimes.php?movie_id=${id}`),
        ])

        const movieData = await movieRes.json()
        const showtimeData = await showtimeRes.json()
        setMovie(movieData)
        setShowtimes(showtimeData || [])
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (!movie || movie.error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy phim</h1>
        <Button asChild>
          <Link href="/admin/movies">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>
      </div>
    )
  }

  // ✅ Tính toán doanh thu an toàn (không bao giờ ra NaN)
  const revenueData = showtimes.map((st) => {
    const totalSeats = Number(st.total_seats) || 0
    const availableSeats = Number(st.available_seats) || 0
    const bookedSeats = Math.max(totalSeats - availableSeats, 0)
    const revenue = bookedSeats * 100000 // 100,000 VNĐ / vé
    const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0
    return { ...st, bookedSeats, revenue, occupancyRate }
  })

  const totalTickets =
    showtimes?.reduce((sum, s) => sum + (Number(s.total_tickets) || 0), 0) || 0
  const totalRevenue =
    showtimes?.reduce((sum, s) => sum + (Number(s.total_revenue) || 0), 0) || 0

  const avgOccupancy =
    revenueData.length > 0
      ? Math.round(
          revenueData.reduce((sum, i) => sum + (Number(i.occupancyRate) || 0), 0) /
            revenueData.length
        )
      : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/movies">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Chi tiết doanh thu - {movie.title}
        </h1>
        <p className="text-muted-foreground">Tổng quan doanh thu bán vé của phim</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Tổng doanh thu */}
        <div className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Tổng doanh thu</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">
            {Number(totalRevenue || 0).toLocaleString("vi-VN")} VNĐ
          </p>
        </div>

        {/* Tổng vé bán */}
        <div className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Tổng vé bán</span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{Number(totalTickets || 0)}</p>
        </div>

        {/* Tổng suất chiếu */}
        <div className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">Tổng suất chiếu</span>
          <p className="text-2xl font-bold">{showtimes.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">lần</p>
        </div>

        {/* Tỷ lệ bán trung bình */}
        <div className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">Tỷ lệ bán trung bình</span>
          <p className="text-2xl font-bold">{avgOccupancy || 0}%</p>
          <p className="text-xs text-muted-foreground mt-1">ghế/suất</p>
        </div>
      </div>

      {/* Movie Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
            <img
              src={movie?.poster ? movie.poster : "/placeholder.svg"}
              alt={movie?.title || "Poster"}
              className="w-full aspect-[2/3] object-cover rounded-lg mb-4"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Thời lượng: {movie.duration || "Không rõ"}
              </p>
              <p className="text-muted-foreground">
                Đánh giá: {movie.rating ?? 0}/10
              </p>
              <p className="text-muted-foreground">
                Trạng thái: {movie.status || "Không rõ"}
              </p>
            </div>
          </div>
        </div>

        {/* Showtimes List */}
        <div className="lg:col-span-2">
          <div className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">Chi tiết suất chiếu</h3>

            <div className="space-y-4">
              {revenueData.length > 0 ? (
                revenueData.map((st) => (
                  <div
                    key={st.showtime_id}
                    className="border border-border/20 rounded-lg p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/showtimes/${st.showtime_id}`)}
                    title="Nhấp để xem chi tiết suất chiếu"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {new Date(st.show_date).toLocaleDateString("vi-VN")} -{" "}
                          {st.start_time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phòng {st.room_name} ({st.room_type}) - {st.cinema_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {Number(st.revenue || 0).toLocaleString("vi-VN")} VNĐ
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Number(st.bookedSeats || 0)}/{Number(st.total_seats || 0)} ghế
                        </p>
                      </div>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            st.occupancyRate >= 80
                              ? "bg-green-500"
                              : st.occupancyRate >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Number(st.occupancyRate || 0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground w-10 text-right">
                        {Number(st.occupancyRate || 0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Không có suất chiếu nào cho phim này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
