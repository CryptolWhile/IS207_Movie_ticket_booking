"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Showtime } from "@/lib/showtimes-data"
import { movies } from "@/lib/movies-data"

interface ShowtimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  showtime: Showtime | null
  onSave: (showtime: Showtime) => void
}

export function ShowtimeDialog({ open, onOpenChange, showtime, onSave }: ShowtimeDialogProps) {
  const [formData, setFormData] = useState<Partial<Showtime>>({
    id: "",
    movieId: 1,
    date: "",
    time: "",
    room: "A1",
    availableSeats: 40, // Changed default from 50 to 40 to match booking form
    branch: "HCM",
  })

  useEffect(() => {
    if (showtime) {
      setFormData(showtime)
    } else {
      // Generate new ID
      const newId = `ST${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
      setFormData({
        id: newId,
        movieId: 1,
        date: "",
        time: "",
        room: "A1",
        branch: "HCM",
      })
    }
  }, [showtime, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      showtime_id: formData.id,
      movie_id: formData.movieId,
      room_id: formData.room,
      show_date: formData.date,
      start_time: formData.time,
      end_time: formData.time,
    }

    onSave(payload as any)
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{showtime ? "Chỉnh sửa xuất chiếu" : "Thêm xuất chiếu mới"}</DialogTitle>
          <DialogDescription>
            {showtime ? "Cập nhật thông tin xuất chiếu" : "Điền thông tin để thêm xuất chiếu mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movieId">Phim *</Label>
            <Select
              value={String(formData.movieId)}
              onValueChange={(value) => setFormData({ ...formData, movieId: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phim" />
              </SelectTrigger>
              <SelectContent>
                {movies.map((movie) => (
                  <SelectItem key={movie.id} value={String(movie.id)}>
                    {movie.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày chiếu *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date ?? ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Giờ chiếu *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time ?? ""}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Phòng chiếu *</Label>
              <Select value={formData.room} onValueChange={(value) => setFormData({ ...formData, room: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">Phòng A1</SelectItem>
                  <SelectItem value="A2">Phòng A2</SelectItem>
                  <SelectItem value="B1">Phòng B1</SelectItem>
                  <SelectItem value="B2">Phòng B2</SelectItem>
                  <SelectItem value="C1">Phòng C1</SelectItem>
                  <SelectItem value="D1">Phòng D1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Chi nhánh *</Label>
              <Select
                value={formData.branch}
                onValueChange={(value: "HCM" | "HN") => setFormData({ ...formData, branch: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HCM">Hồ Chí Minh</SelectItem>
                  <SelectItem value="HN">Hà Nội</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">{showtime ? "Cập nhật" : "Thêm xuất chiếu"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
