"use client"   // Phải ở dòng đầu tiên của file

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import { User, Mail, Ticket, Star, Edit2, Film, Award, Calendar, MapPin, Clock } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

const POINTS_PER_BOOKING = 10
const POINTS_PER_REVIEW = 5

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews">("bookings")
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [movies, setMovies] = useState<any[]>([])

  const [newReview, setNewReview] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [selectedMovieForReview, setSelectedMovieForReview] = useState("")

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedUser, setEditedUser] = useState<any>(null)

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)

  const [loading, setLoading] = useState(true)

  

  // Fetch user info
  useEffect(() => {
    fetch("http://localhost:8000/user/profile/get_user.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setEditedUser(data)
      })
      .catch(err => console.error(err))
  }, [])

  // Fetch bookings
  useEffect(() => {
    fetch("http://localhost:8000/user/profile/get_bookings.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error(err))
  }, [])

  // Fetch reviews
  useEffect(() => {
    fetch("http://localhost:8000/user/profile/get_reviews.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error(err))
  }, [])

  // Fetch movies
  useEffect(() => {
    fetch("http://localhost:8000/user/profile/get_movies.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error(err))
  }, [])

  const totalPoints = user?.point || 0
    //(user?.total_bookings || 0) * POINTS_PER_BOOKING + (user?.total_reviews || 0) * POINTS_PER_REVIEW

  const handleSubmitReview = () => {
    if (newReview.trim() && newRating > 0 && selectedMovieForReview) {
      fetch("http://localhost:8000/user/profile/add_review.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          movie_id: selectedMovieForReview.toString(),
          rating: newRating.toString(),
          comment: newReview
        })
      })

        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsReviewDialogOpen(false)
            setIsSuccessDialogOpen(true)
            setReviews(prev => [
              {
                movieTitle: movies.find(m => m.id == selectedMovieForReview)?.title,
                poster: movies.find(m => m.id == selectedMovieForReview)?.poster,
                rating: newRating,
                review: newReview,
                date: new Date().toLocaleDateString(),
              },
              ...prev,
            ])
            setNewReview("")
            setNewRating(0)
            setSelectedMovieForReview("")
          } else {
            alert(data.error || "Đã xảy ra lỗi")
          }
        })
    }
  }

  const handleSaveProfile = () => {
    setUser(editedUser)
    setIsEditDialogOpen(false)
  }

  if (!user || !editedUser) return <div>Đang tải...</div>

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* User Info */}
      <div className="relative bg-gradient-to-br from-primary/20 via-background to-background border-b border-border/50">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl pt-32 pb-16">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0 shadow-2xl">
                <User className="h-16 w-16 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Award className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{editedUser.name}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{editedUser.email}</span>
                </div>
              </div>

              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Chỉnh sửa hồ sơ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                    <DialogDescription>Cập nhật thông tin cá nhân của bạn</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Họ và tên</label>
                      <Input
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">{totalPoints}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Điểm tích lũy</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {user.total_bookings || 0} vé • {user.total_reviews || 0} đánh giá
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-4 px-2 text-sm font-medium transition-all relative ${
                activeTab === "bookings" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                <span>Vé đã đặt</span>
              </div>
              {activeTab === "bookings" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-2 text-sm font-medium transition-all relative ${
                activeTab === "reviews" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Đánh giá của tôi</span>
              </div>
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-8 max-w-6xl py-12">
        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.ticket_id}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-border hover:bg-card/50 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  <div className="relative w-full md:w-40 h-56 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={booking.poster || "/placeholder.svg"}
                      alt={booking.movieTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
                        booking.status === "confirmed"
                          ? "bg-green-500/90 text-white"
                          : "bg-blue-500/90 text-white"
                      }`}
                    >
                      {booking.status === "confirmed" ? "Sắp chiếu" : "Đã xem"}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold text-balance">{booking.movieTitle}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Rạp chiếu</div>
                          <div className="font-medium">{booking.cinema}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Ngày chiếu</div>
                          <div className="font-medium">{booking.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Giờ chiếu</div>
                          <div className="font-medium">{booking.time}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Ticket className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Ghế ngồi</div>
                          <div className="font-medium">{booking.seats}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Tổng tiền</div>
                        <div className="text-2xl font-bold text-primary">{booking.total}</div>
                      </div>
                      {booking.status === "completed" && (
                        <Button onClick={() => setIsReviewDialogOpen(true)} size="lg">
                          <Star className="h-4 w-4 mr-2" />
                          Đánh giá phim
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* New Review Section */}
            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Edit2 className="h-5 w-5 text-primary" />
                </div>
                Viết đánh giá mới
              </h3>
              <p className="text-muted-foreground mb-6">
                Chia sẻ trải nghiệm của bạn về những bộ phim đã xem. Mỗi đánh giá bạn nhận được {POINTS_PER_REVIEW} điểm tích lũy!
              </p>
              <Button onClick={() => setIsReviewDialogOpen(true)} size="lg" className="w-full md:w-auto">
                <Star className="h-4 w-4 mr-2" />
                Viết đánh giá
              </Button>
            </div>

            {/* Existing Reviews */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Đánh giá trước đây</h3>
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="group rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-border hover:bg-card/50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      <div className="relative w-full md:w-32 h-44 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                        <Image
                          src={review.poster || "/placeholder.svg"}
                          alt={review.movieTitle}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-xl font-bold text-balance">{review.movieTitle}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{review.date}</span>
                        </div>

                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-muted-foreground leading-relaxed">{review.review}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Viết đánh giá phim</DialogTitle>
            <DialogDescription>Chọn phim và viết đánh giá của bạn.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedMovieForReview} onValueChange={setSelectedMovieForReview}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phim..." />
              </SelectTrigger>
              <SelectContent>
                {movies.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <label className="text-sm font-medium">Đánh giá (1-5)</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nội dung đánh giá</label>
              <Textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitReview}>Gửi đánh giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá thành công!</DialogTitle>
            <DialogDescription>Cảm ơn bạn đã chia sẻ trải nghiệm của mình.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsSuccessDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
