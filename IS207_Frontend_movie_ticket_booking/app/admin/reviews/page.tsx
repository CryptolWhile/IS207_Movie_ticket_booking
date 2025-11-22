"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Check, X, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Kiểu dữ liệu Review
interface Review {
  review_id: string
  movie_id: number
  user_id: number
  rating: number
  comment: string
  created_at: string
  status: "pending" | "approved" | "rejected"
  user_name?: string
  user_avatar?: string
}

// Kiểu dữ liệu Movie
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

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "pending" | "approved" | "rejected">("ALL")
  const [filterMovie, setFilterMovie] = useState<string>("ALL")
  const [filterRating, setFilterRating] = useState<string>("ALL")

  // Load movies
  const fetchMovies = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/movies/get_movies.php")
      const data = await res.json()
      if (Array.isArray(data)) {
        const parsed: Movie[] = data.map((m: any) => ({
          ...m,
          genres: Array.isArray(m.genres) ? m.genres : [],
          rating: parseFloat(m.rating ?? 0)
        }))
        setMovies(parsed)
      }
    } catch (err) {
      console.error("Fetch movies error:", err)
    }
  }

  // Load reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/reviews/get_reviews.php")
      const data = await res.json()
      if (Array.isArray(data)) setReviews(data)
    } catch (err) {
      console.error("Fetch reviews error:", err)
    }
  }

  useEffect(() => {
    fetchMovies()
    fetchReviews()
  }, [])

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      (review.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.comment || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || review.status === filterStatus
    const matchesMovie = filterMovie === "ALL" || review.movie_id.toString() === filterMovie
    const matchesRating = filterRating === "ALL" || review.rating.toString() === filterRating
    return matchesSearch && matchesStatus && matchesMovie && matchesRating
  })

  // Handle actions
  const handleApprove = async (review_id: string) => {
    const formData = new FormData()
    formData.append("review_id", review_id)
    formData.append("status", "approved")

    const res = await fetch("http://localhost:8000/admin/reviews/update_review_status.php", {
      method: "POST",
      body: formData
    })

    const data = await res.json()
    if (data.success) {
      setReviews(reviews.map(r => r.review_id === review_id ? { ...r, status: "approved" } : r))
    }
  }

  const handleReject = async (review_id: string) => {
    const formData = new FormData()
    formData.append("review_id", review_id)
    formData.append("status", "rejected")

    const res = await fetch("http://localhost:8000/admin/reviews/update_review_status.php", {
      method: "POST",
      body: formData
    })

    const data = await res.json()
    if (data.success) {
      setReviews(reviews.map(r => r.review_id === review_id ? { ...r, status: "rejected" } : r))
    }
  }


  const handleDelete = async (review_id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return

    const formData = new FormData()
    formData.append("review_id", review_id)

    const res = await fetch("http://localhost:8000/admin/reviews/delete_review.php", {
      method: "POST",
      body: formData
    })

    const data = await res.json()
    if (data.success) setReviews(reviews.filter(r => r.review_id !== review_id))
  }


  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Quản lý đánh giá</h1>
        <p className="text-muted-foreground">Kiểm duyệt và quản lý đánh giá của người dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-border/50 rounded-lg p-4 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Tổng đánh giá</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border border-border/50 rounded-lg p-4 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className="border border-border/50 rounded-lg p-4 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Đã duyệt</p>
          <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
        </div>
        <div className="border border-border/50 rounded-lg p-4 bg-card/50 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1">Đã từ chối</p>
          <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên người dùng hoặc nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Đã từ chối</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterMovie} onValueChange={(v) => setFilterMovie(v)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Phim" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả phim</SelectItem>
            {movies.map(movie => (
              <SelectItem key={`movie-${movie.movie_id}`} value={movie.movie_id.toString()}>
                {movie.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={(v) => setFilterRating(v)}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Đánh giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả sao</SelectItem>
            {[5,4,3,2,1].map(star => (
              <SelectItem key={`rating-${star}`} value={star.toString()}>{star} sao</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const movie = movies.find(m => m.movie_id === review.movie_id)
          return (
            <div key={review.review_id} className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm hover:border-border transition-colors">
              <div className="flex items-start gap-4">
                <img
                  src={review.user_avatar || "/placeholder.svg"}
                  alt={review.user_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{review.user_name}</h3>
                        <Badge variant={review.status === "approved" ? "default" : review.status === "pending" ? "secondary" : "destructive"}>
                          {review.status === "approved" ? "Đã duyệt" : review.status === "pending" ? "Chờ duyệt" : "Đã từ chối"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{movie?.title}</span>
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mb-4 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center gap-2">
                    {review.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(review.review_id)} className="bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4 mr-1" />Duyệt
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(review.review_id)} className="text-red-500 hover:text-red-600">
                          <X className="h-4 w-4 mr-1" />Từ chối
                        </Button>
                      </>
                    )}
                    {review.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => handleReject(review.review_id)} className="text-red-500 hover:text-red-600">
                        <X className="h-4 w-4 mr-1" />Gỡ duyệt
                      </Button>
                    )}
                    {review.status === "rejected" && (
                      <Button size="sm" onClick={() => handleApprove(review.review_id)} className="bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4 mr-1" />Duyệt lại
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(review.review_id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" />Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {filteredReviews.length === 0 && (
          <div className="border border-border/50 rounded-lg p-12 bg-card/50 backdrop-blur-sm text-center text-muted-foreground">
            <p>Không tìm thấy đánh giá nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
