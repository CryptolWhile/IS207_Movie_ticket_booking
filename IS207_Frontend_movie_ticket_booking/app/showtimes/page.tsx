"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { ROOM_TYPE_INFO } from "@/lib/seat-map-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, MapPin } from "lucide-react"

// Hàm tạo tuần từ ngày đầu tuần (Thứ 2)
function generateWeekFromMonday(mondayDateStr: string) {
  const monday = new Date(mondayDateStr)
  const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
  const ids = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

  return labels.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      id: ids[i],
      label,
      date: d.toISOString().slice(0, 10)
    }
  })
}


export default function ShowtimesPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>("HCM")
  const [selectedDay, setSelectedDay] = useState("mon")
  const [cinemas, setCinemas] = useState<any[]>([])
  const [movies, setMovies] = useState<any[]>([])
  const [showtimes, setShowtimes] = useState<any[]>([])

  // Nhập ngày Thứ 2 muốn hiển thị tuần
  const inputMonday = "2025-02-10"

  // Tạo tuần từ ngày Thứ 2
  const [weekDays, setWeekDays] = useState(generateWeekFromMonday(inputMonday))

  const selectedDate = weekDays.find((day) => day.id === selectedDay)?.date || weekDays[0].date

  // fetch danh sách rạp
  useEffect(() => {
    fetch("http://localhost:8000/user/showtimes/get_cinema_list.php")
      .then(res => res.json())
      .then(data => setCinemas(data))
  }, [])

  // fetch tất cả phim
  useEffect(() => {
    fetch("http://localhost:8000/user/movies/movies_list.php")
      .then(res => res.json())
      .then(data => setMovies(data))
  }, [])

  // fetch showtimes khi branch hoặc ngày thay đổi
  useEffect(() => {
    fetch(`http://localhost:8000/user/showtimes/get_showtimes.php?branch=${selectedBranch}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => setShowtimes(data))
  }, [selectedBranch, selectedDate])

  // lọc movies theo showtime trong ngày
  const movieIdsForDay = Array.from(new Set(showtimes.map((st) => st.movie_id)))
  const moviesForDay = movies.filter((m) => movieIdsForDay.includes(m.movie_id))

  // // phim sắp chiếu
  // const comingSoonMovies = movies.filter((m) => !m.is_now_showing || m.is_now_showing === "0")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Lịch Chiếu Phim</h1>
            <p className="text-muted-foreground">Chọn chi nhánh, ngày và suất chiếu phù hợp để đặt vé</p>
          </div>

          {/* Branch Selector */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Chọn chi nhánh</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {cinemas.map((cinema) => (
                <Button
                  key={cinema.cinema_id}
                  variant={selectedBranch === cinema.city ? "default" : "outline"}
                  className="flex-1 md:flex-none md:px-8 h-auto py-4"
                  onClick={() => setSelectedBranch(cinema.city)}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-base">
                      {cinema.city === "HCM" ? "TP. Hồ Chí Minh" : "Hà Nội"}
                    </span>
                    <span className="text-xs mt-1 opacity-80">{cinema.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Day Selector */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Chọn ngày</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {weekDays.map((day) => (
                <Button
                  key={day.id}
                  variant={selectedDay === day.id ? "default" : "outline"}
                  className="flex-shrink-0 flex-col h-auto py-3 px-6"
                  onClick={() => setSelectedDay(day.id)}
                >
                  <span className="font-semibold">{day.label}</span>
                  <span className="text-xs mt-1">{day.date.slice(5).replace("-", "/")}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Movies For Day */}
          {moviesForDay.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Không có suất chiếu nào cho chi nhánh và ngày đã chọn</p>
            </div>
          ) : (
            <div className="space-y-6">
              {moviesForDay.map((movie) => {
                const movieShowtimesForDay = showtimes
                  .filter((st) => st.movie_id === movie.movie_id)
                  .sort((a, b) => a.time.localeCompare(b.time))

                return (
                  <div key={movie.movie_id} className="overflow-hidden border rounded-lg bg-card text-card-foreground shadow-sm">
                    <div className="p-0">
                      <div className="flex flex-col md:flex-row gap-6 p-6">

                        {/* Movie Poster */}
                        <div className="flex-shrink-0">
                          <div className="relative w-full md:w-48 h-64 md:h-72 rounded-lg overflow-hidden">
                            <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover"/>
                          </div>
                        </div>

                        {/* Movie Info */}
                        <div className="flex-1">
                          <div className="mb-4">
                            <h3 className="text-2xl font-bold mb-2">{movie.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="font-semibold">{movie.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{movie.duration}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {movie.genre.map((g: string) => <Badge key={g} variant="secondary">{g}</Badge>)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>
                          </div>

                          {/* Showtimes */}
                          <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Clock className="h-4 w-4" /> Suất chiếu
                            </h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {movieShowtimesForDay.map((showtime: any, idx: number) => {
                                // tạo key chắc chắn là duy nhất trong list: movieId + showtimeId (fallback time hoặc index)
                                const showtimeKey = `${movie.movie_id}-${showtime.showtime_id ?? showtime.time ?? idx}`;

                                return (
                                  <Link
                                    key={showtimeKey}
                                    href={`/booking?movie=${movie.movie_id}`}
                                    className="block"
                                  >
                                    <Button variant="outline" className="w-full h-auto p-1.5 bg-transparent">
                                      <div className="flex flex-col items-center">
                                        <span className="font-semibold">{showtime.time}</span>
                                        <span className="text-xs opacity-70">{showtime.room}</span>
                                        <span className="text-xs opacity-70 text-primary font-medium">
                                          {showtime.room_description}
                                        </span>
                                      </div>
                                    </Button>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>


                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Coming Soon Section
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Phim Sắp Chiếu</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {comingSoonMovies.map((movie) => (
                <div key={movie.movie_id} className="overflow-hidden border rounded-lg bg-card text-card-foreground shadow-sm group cursor-pointer">
                  <div className="p-0">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover transition-transform group-hover:scale-105"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold mb-1 line-clamp-2">{movie.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span>{movie.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

        </div>
      </div>
    </div>
  )
}
