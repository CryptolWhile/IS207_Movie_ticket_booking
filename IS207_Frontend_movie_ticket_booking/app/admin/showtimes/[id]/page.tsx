"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Zap, Glasses } from "lucide-react"
import { SeatMap } from "@/components/seat-map"
import { ROOM_TYPE_INFO } from "@/lib/seat-map-utils"
import Link from "next/link"
import { useParams } from "next/navigation"

const API_BASE = "http://localhost:8000/admin/showtimes"

export default function ShowtimeDetailsPage() {
  const params = useParams()
  const { id } = params as { id: string }

  const [showtime, setShowtime] = useState<any>(null)
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [pendingSeats, setPendingSeats] = useState<string[]>([])
  const [revenue, setRevenue] = useState<number>(0)


  // ✅ Lấy dữ liệu xuất chiếu và ghế từ backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy chi tiết xuất chiếu
        const res = await fetch(`${API_BASE}/get_showtime_details.php?showtime_id=${id}`)
        const data = await res.json()
        setShowtime(data)

        // Lấy danh sách ghế đã đặt/đang chờ
        const seatsRes = await fetch(`${API_BASE}/get_seats_by_showtime.php?showtime_id=${id}`)
        const seatsData = await seatsRes.json()

        setOccupiedSeats(seatsData.occupiedSeats ?? [])
        setPendingSeats(seatsData.pendingSeats ?? [])
        setRevenue(seatsData.revenue ?? 0)

        

      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết xuất chiếu:", err)
      }
    }

    fetchData()
  }, [id])

  if (!showtime) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy xuất chiếu</h1>
          <Button asChild>
            <Link href="/admin/showtimes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const roomTypeInfo = ROOM_TYPE_INFO[showtime.room_type] || { name: "Phòng thường", description: "Không có mô tả" }
  const totalSeats = showtime.total_seats ?? 40


  const getRoomTypeIcon = () => {
    switch (showtime.room_type) {
      case "C":
        return <Zap className="h-4 w-4" />
      case "D":
        return <Glasses className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/showtimes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Chi tiết xuất chiếu</h1>
        <p className="text-muted-foreground">Mã xuất chiếu: {showtime.showtime_id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Movie Info */}
        <div className="lg:col-span-1">
          <div className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
            <img
              src={showtime.poster ? showtime.poster : "/placeholder.svg"}
              alt={showtime.movie_title}
              className="w-full aspect-[2/3] object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold mb-2">{showtime.movie_title}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(showtime.show_date).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {showtime.start_time} - {showtime.end_time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                   {showtime.room_name} - {showtime.cinema_name}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                {getRoomTypeIcon()}
                <span className="text-sm font-semibold text-primary">{roomTypeInfo.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{roomTypeInfo.description}</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 space-y-4">
            <div className="border border-border/50 rounded-lg p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tổng số ghế</span>
                <span className="font-semibold">{totalSeats}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Đã đặt</span>
                <span className="font-semibold text-red-500">{occupiedSeats.length}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Chưa thanh toán</span>
                <span className="font-semibold text-yellow-500">{pendingSeats.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Còn trống</span>
                <span className="font-semibold text-green-500">
                  {totalSeats - occupiedSeats.length - pendingSeats.length}
                </span>
              </div>
            </div>

            <div className="border border-border/50 rounded-lg p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Doanh thu ước tính</span>
              </div>
              <p className="text-2xl font-bold">{revenue.toLocaleString("vi-VN")} VNĐ</p>
              <p className="text-xs text-muted-foreground mt-1">
                {occupiedSeats.length} vé đã thanh toán
              </p>

            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">Sơ đồ chỗ ngồi</h3>
            <SeatMap
              roomType={showtime.room_type}
              occupiedSeats={occupiedSeats}
              selectedSeats={pendingSeats}
              disabled={true}
              showLegend={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
