export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  movieId: number
  rating: number
  comment: string
  date: string
  status: "pending" | "approved" | "rejected"
}

export const reviews: Review[] = [
  {
    id: "REV001",
    userId: "U001",
    userName: "Nguyễn Văn A",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 1,
    rating: 5,
    comment: "Phim rất hay, kỹ xảo đỉnh cao! Godzilla thật sự ấn tượng và hoành tráng.",
    date: "2025-02-08",
    status: "approved",
  },
  {
    id: "REV002",
    userId: "U002",
    userName: "Trần Thị B",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 1,
    rating: 4,
    comment: "Phim hay nhưng hơi dài, một số cảnh có thể cắt bớt.",
    date: "2025-02-07",
    status: "approved",
  },
  {
    id: "REV003",
    userId: "U003",
    userName: "Lê Văn C",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 2,
    rating: 5,
    comment: "Doraemon luôn là tuổi thơ của mình. Phim này rất cảm động và vui nhộn!",
    date: "2025-02-08",
    status: "approved",
  },
  {
    id: "REV004",
    userId: "U004",
    userName: "Phạm Thị D",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 3,
    rating: 5,
    comment: "Phim phiêu lưu tuyệt vời cho cả gia đình. Con mình rất thích!",
    date: "2025-02-06",
    status: "approved",
  },
  {
    id: "REV005",
    userId: "U005",
    userName: "Hoàng Văn E",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 5,
    rating: 5,
    comment: "Phim kinh dị đỉnh cao! Tôi đã sợ đến mức không dám ngủ.",
    date: "2025-02-08",
    status: "pending",
  },
  {
    id: "REV006",
    userId: "U006",
    userName: "Vũ Thị F",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 5,
    rating: 4,
    comment: "Phim hay nhưng hơi đáng sợ, không phù hợp với người yếu tim.",
    date: "2025-02-07",
    status: "approved",
  },
  {
    id: "REV007",
    userId: "U007",
    userName: "Đỗ Văn G",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 6,
    rating: 5,
    comment: "Phim Việt Nam xuất sắc! Rất cảm động và chân thực.",
    date: "2025-02-05",
    status: "approved",
  },
  {
    id: "REV008",
    userId: "U008",
    userName: "Bùi Thị H",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 7,
    rating: 5,
    comment: "Phim chiến tranh hay nhất mà tôi từng xem. Rất xúc động!",
    date: "2025-02-04",
    status: "approved",
  },
  {
    id: "REV009",
    userId: "U009",
    userName: "Đinh Văn I",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 8,
    rating: 5,
    comment: "La La Land là kiệt tác! Âm nhạc và hình ảnh đều tuyệt vời.",
    date: "2025-02-08",
    status: "pending",
  },
  {
    id: "REV010",
    userId: "U010",
    userName: "Cao Thị K",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 8,
    rating: 4,
    comment: "Phim lãng mạn và đẹp, nhưng kết thúc hơi buồn.",
    date: "2025-02-07",
    status: "approved",
  },
  {
    id: "REV011",
    userId: "U011",
    userName: "Mai Văn L",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 1,
    rating: 3,
    comment: "Phim ổn nhưng không xuất sắc như mong đợi.",
    date: "2025-02-06",
    status: "pending",
  },
  {
    id: "REV012",
    userId: "U012",
    userName: "Lý Thị M",
    userAvatar: "/placeholder.svg?height=40&width=40",
    movieId: 4,
    rating: 5,
    comment: "Phim Doraemon này rất hay! Cảm động và vui nhộn.",
    date: "2025-02-05",
    status: "approved",
  },
]

export function getReviewsByMovieId(movieId: number): Review[] {
  return reviews.filter((review) => review.movieId === movieId)
}

export function getReviewsByStatus(status: "pending" | "approved" | "rejected"): Review[] {
  return reviews.filter((review) => review.status === status)
}

export function getAverageRatingByMovieId(movieId: number): number {
  const movieReviews = getReviewsByMovieId(movieId)
  if (movieReviews.length === 0) return 0
  const sum = movieReviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / movieReviews.length
}
