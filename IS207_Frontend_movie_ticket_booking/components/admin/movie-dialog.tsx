"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

type Movie = {
  movie_id?: number
  title: string
  description: string
  duration: string
  release_date?: string
  poster: string
  trailer: string
  status: string
  genres: string[]
  rating: number
}

interface MovieDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movie: Movie | null
  onSave: () => void
}

export function MovieDialog({ open, onOpenChange, movie, onSave }: MovieDialogProps) {
  const emptyMovie: Movie = {
    title: "",
    description: "",
    duration: "",
    release_date: "",
    poster: "",
    trailer: "",
    status: "sap_chieu",
    genres: [],
    rating: 0,
  }

  const [formData, setFormData] = useState<Movie>(emptyMovie)
  const [genreInput, setGenreInput] = useState("")

  useEffect(() => {
    if (movie) {
      setFormData({ ...emptyMovie, ...movie })
    } else {
      setFormData(emptyMovie)
    }
  }, [movie, open])

  // ✅ Gửi dữ liệu lên backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      genres: formData.genres,
      release_date: formData.release_date || new Date().toISOString().split("T")[0],
    }

    const url = movie
      ? "http://localhost:8000/admin/movies/update_movie.php"
      : "http://localhost:8000/admin/movies/add_movie.php"

    try {
      const res = await fetch(url, {
        method: "POST", // dùng POST cho PHP an toàn
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const text = await res.text()

      let data: any
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.log("response từ php:", text) // debug
        alert("PHP trả về HTML -> thường là lỗi PHP")
        return
      }

      if (res.ok) {
        alert(movie ? "Cập nhật phim thành công!" : "Thêm phim thành công!")
        onSave()
        onOpenChange(false)
      } else {
        alert("Lỗi: " + JSON.stringify(data))
      }

     } catch (err) {
      console.error("Lỗi:", err)
      alert("Không thể kết nối tới server!")
    }
  }

  // ✅ Quản lý thể loại
  const addGenre = () => {
    const trimmed = genreInput.trim()
    if (trimmed && !formData.genres.includes(trimmed)) {
      setFormData({ ...formData, genres: [...formData.genres, trimmed] })
      setGenreInput("")
    }
  }

  const removeGenre = (g: string) => {
    setFormData({ ...formData, genres: formData.genres.filter((x) => x !== g) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{movie ? "Chỉnh sửa phim" : "Thêm phim mới"}</DialogTitle>
          <DialogDescription>
            {movie ? "Cập nhật thông tin phim" : "Điền thông tin để thêm phim mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên phim */}
          <div className="space-y-2">
            <Label htmlFor="title">Tên phim *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Thể loại */}
          <div className="space-y-2">
            <Label>Thể loại</Label>
            <div className="flex gap-2">
              <Input
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addGenre()
                  }
                }}
                placeholder="Nhập thể loại và nhấn Enter"
              />
              <Button type="button" onClick={addGenre} variant="secondary">
                Thêm
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.genres.map((g) => (
                <div
                  key={g}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                >
                  <span>{g}</span>
                  <button type="button" onClick={() => removeGenre(g)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Thời lượng */}
          <div className="space-y-2">
            <Label htmlFor="duration">Thời lượng *</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="VD: 2h30m"
              required
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả *</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Poster */}
          <div className="space-y-2">
            <Label htmlFor="poster">Poster *</Label>
            <Input
              id="poster"
              value={formData.poster}
              onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
              placeholder="URL hình ảnh..."
              required
            />
          </div>

          {/* Trailer */}
          <div className="space-y-2">
            <Label htmlFor="trailer">Trailer</Label>
            <Input
              id="trailer"
              value={formData.trailer}
              onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
              placeholder="https://youtube.com/embed/..."
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Đánh giá (0–10)</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.rating ?? 0}
              onChange={(e) =>
                setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })
              }
              placeholder="VD: 8.5"
            />
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border rounded-md p-2"
            >
              <option value="sắp chiếu">Sắp chiếu</option>
              <option value="đang chiếu">Đang chiếu</option>
              <option value="ngừng chiếu">Ngừng chiếu</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">{movie ? "Cập nhật" : "Thêm phim"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
