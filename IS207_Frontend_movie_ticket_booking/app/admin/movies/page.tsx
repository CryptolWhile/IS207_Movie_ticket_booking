"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Pencil, Trash2, Eye, Star } from "lucide-react"
import { MovieDialog } from "@/components/admin/movie-dialog"
import Link from "next/link"

type Movie = {
  movie_id: number
  title: string
  description: string
  duration: string
  release_date: string
  poster: string
  trailer: string
  status: string
  genres: string[]
  rating: number
}

export default function MoviesManagementPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)

  // Lấy danh sách phim từ backend PHP
  const fetchMovies = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/movies/get_movies.php")
      const data = await res.json()

      if (Array.isArray(data)) {
        // ✅ Parse JSON trong genres và ép rating về dạng số
        const parsed = data.map((m) => ({
          ...m,
          genres: Array.isArray(m.genres) ? m.genres : [],
          rating: parseFloat(m.rating ?? 0),
        }))
        setMovies(parsed)
      } else {
        console.error("Dữ liệu không hợp lệ:", data)
      }
    } catch (err) {
      console.error("Fetch error:", err)
      alert("Không thể kết nối tới server!")
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  // ✅ Lọc phim theo tên
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ✅ Xóa phim
  const handleDeleteMovie = async (movie_id: number) => {
    if (!confirm("Bạn có chắc muốn xóa phim này?")) return

    try {
      const res = await fetch("http://localhost:8000/admin/movies/delete_movie.php", {
        method: "POST", // dùng POST cho PHP dễ xử lý hơn DELETE
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id }),
      })
      const data = await res.json()
      if (data.message?.includes("thành công")) {
        alert("Đã xóa phim thành công!")
        fetchMovies()
      } else {
        alert("Không thể xóa phim!")
      }
    } catch (err) {
      console.error("Lỗi xóa phim:", err)
    }
  }

  // ✅ Mở dialog thêm/sửa
  const openDialog = (movie: Movie | null) => {
    setEditingMovie(movie)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Quản lý phim</h1>
          <p className="text-muted-foreground">Quản lý danh sách phim trong hệ thống</p>
        </div>
        <Button onClick={() => openDialog(null)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Thêm phim mới
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="p-4 text-left">Phim</th>
                <th className="p-4 text-left">Thể loại</th>
                <th className="p-4 text-left">Thời lượng</th>
                <th className="p-4 text-left">Ngày chiếu</th>
                <th className="p-4 text-left">Đánh giá</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredMovies.map((movie) => (
                <tr key={movie.movie_id} className="hover:bg-muted/30">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={movie.poster || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold">{movie.title}</p>
                      <p className="text-sm text-muted-foreground">ID: {movie.movie_id}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{movie.genres?.join(", ") || "—"}</td>
                  <td className="p-4 text-sm">{movie.duration}</td>
                  <td className="p-4 text-sm">{movie.release_date}</td>
                  <td className="p-4 text-sm text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {movie.rating ? movie.rating.toFixed(1) : "—"}
                    </div>
                  </td>

                  <td className="p-4 text-sm">{movie.status}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/movies/${movie.movie_id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDialog(movie)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteMovie(movie.movie_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMovies.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">Không tìm thấy phim nào</div>
        )}
      </div>

      {/* Dialog */}
      <MovieDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        movie={editingMovie}
        onSave={fetchMovies}
      />
    </div>
  )
}
