"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2, Eye, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShowtimeDialog } from "@/components/admin/showtime-dialog"

const API_BASE = "http://localhost:8000/admin/showtimes"

export default function ShowtimesManagementPage() {
  const router = useRouter()
  const [showtimes, setShowtimes] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBranch, setFilterBranch] = useState<"ALL" | "HCM" | "HN">("ALL")
  const [filterDate, setFilterDate] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShowtime, setEditingShowtime] = useState<any | null>(null)

  useEffect(() => {
    loadShowtimes()
  }, [])

  const loadShowtimes = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_showtimes.php`)
      const data = await res.json()
      // sắp xếp theo ngày và giờ tăng dần
      const sorted = data.sort((a: any, b: any) => {
        const d1 = new Date(`${a.show_date} ${a.start_time}`)
        const d2 = new Date(`${b.show_date} ${b.start_time}`)
        return d1.getTime() - d2.getTime()
      })
      setShowtimes(sorted)
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch chiếu:", err)
    }
  }

  // ✅ Filter showtimes
  const filteredShowtimes = showtimes.filter((s) => {
    const matchesSearch = s.movie_title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBranch = filterBranch === "ALL" || s.city === filterBranch
    const matchesDate = !filterDate || s.show_date === filterDate
    return matchesSearch && matchesBranch && matchesDate
  })


  const handleAddShowtime = async (showtime: any) => {
  try {
    // Sử dụng FormData để gửi dữ liệu theo POST
    const formData = new FormData()
    formData.append("showtime_id", showtime.showtime_id)
    formData.append("movie_id", String(showtime.movie_id))
    formData.append("room_id", showtime.room_id)
    formData.append("show_date", showtime.show_date)
    formData.append("start_time", showtime.start_time)
    formData.append("end_time", showtime.end_time)

    const res = await fetch(`${API_BASE}/add_showtime.php`, {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (data.message) {
      alert("✅ Thêm thành công! Ghế trống: " + data.available_seats)
      await loadShowtimes()
    } else {
      alert("❌ " + data.error)
    }
  } catch (e) {
    console.error(e)
    alert("❌ Lỗi khi thêm lịch chiếu")
  }
  setIsDialogOpen(false)
}


  const handleEditShowtime = async (updatedShowtime: any) => {
    try {
      const res = await fetch(`${API_BASE}/update_showtime.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedShowtime),
      })
      const data = await res.json()
      if (data.message) {
        alert("✅ Cập nhật thành công")
        await loadShowtimes()
      } else alert("❌ " + data.error)
    } catch (e) {
      console.error(e)
    }
    setEditingShowtime(null)
    setIsDialogOpen(false)
  }

  const handleDeleteShowtime = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa xuất chiếu này?")) return
    try {
      const res = await fetch(`${API_BASE}/delete_showtime.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showtime_id: id }),
      })
      const data = await res.json()
      if (data.message) {
        alert("🗑️ " + data.message)
        setShowtimes(showtimes.filter((s) => s.showtime_id !== id))
      } else alert("❌ " + data.error)
    } catch (e) {
      console.error(e)
    }
  }

  const openEditDialog = (s: any) => {
    setEditingShowtime({
      id: s.showtime_id,
      movieId: Number(s.movie_id),
      date: s.show_date,
      time: s.start_time,
      room: s.room_id,
      availableSeats: s.available_seats,
      branch: s.city, // nếu có branch từ city
    })
    setIsDialogOpen(true)
  }


  const openAddDialog = () => {
    setEditingShowtime(null)
    setIsDialogOpen(true)
  }

  const handleRowDoubleClick = (showtimeId: string) => {
    router.push(`/admin/showtimes/${showtimeId}`)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Quản lý xuất chiếu</h1>
          <p className="text-muted-foreground">Quản lý lịch chiếu phim tại các rạp</p>
        </div>
        <Button onClick={openAddDialog} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Thêm xuất chiếu
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên phim hoặc phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={filterBranch === "ALL" ? "default" : "outline"} onClick={() => setFilterBranch("ALL")}>
            Tất cả
          </Button>
          <Button variant={filterBranch === "HCM" ? "default" : "outline"} onClick={() => setFilterBranch("HCM")}>
            <MapPin className="h-4 w-4 mr-1" />
            HCM
          </Button>
          <Button variant={filterBranch === "HN" ? "default" : "outline"} onClick={() => setFilterBranch("HN")}>
            <MapPin className="h-4 w-4 mr-1" />
            HN
          </Button>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="pl-10 w-full md:w-auto"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">Mã xuất chiếu</th>
                <th className="text-left p-4 font-semibold text-sm">Phim</th>
                <th className="text-left p-4 font-semibold text-sm">Ngày chiếu</th>
                <th className="text-left p-4 font-semibold text-sm">Giờ bắt đầu</th>
                <th className="text-left p-4 font-semibold text-sm">Phòng</th>
                <th className="text-left p-4 font-semibold text-sm">Rạp</th>
                <th className="text-left p-4 font-semibold text-sm">Ghế trống</th>
                <th className="text-right p-4 font-semibold text-sm">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/30">
              {filteredShowtimes.map((s) => {
                const totalSeats = s.total_seats ?? 0
                const availableSeats = s.available_seats ?? 0
                return (
                  <tr
                    key={s.showtime_id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onDoubleClick={() => handleRowDoubleClick(s.showtime_id)}
                  >
                    <td className="p-4 font-mono text-sm">{s.showtime_id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.poster || "/placeholder.svg"}
                          alt={s.movie_title}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold">{s.movie_title}</p>
                          <p className="text-sm text-muted-foreground">{s.duration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{s.show_date}</td>
                    <td className="p-4">{s.start_time}</td>
                    <td className="p-4">
                      <Badge variant="outline">{s.room_name}</Badge>
                    </td>
                    <td className="p-4">{s.cinema_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            availableSeats > 20 ? "bg-green-500" : availableSeats > 10 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                        />
                        <div className="w-14 text-right tabular-nums">
                          <span className="font-semibold">{availableSeats}</span>
                          <span className="text-muted-foreground text-sm">/{totalSeats}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/showtimes/${s.showtime_id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(s)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteShowtime(s.showtime_id)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredShowtimes.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p>Không tìm thấy xuất chiếu nào</p>
          </div>
        )}
      </div>

      <ShowtimeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        showtime={editingShowtime}
        onSave={editingShowtime ? handleEditShowtime : handleAddShowtime}
      />
    </div>
  )
}
