"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, CreditCard, ShoppingCart, Play, AlertCircle, MapPin, Popcorn, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { SeatMap } from "@/components/seat-map"
import Link from "next/link"

const POINTS_TO_VND = 1000 // 1 point = 1,000 VND

type Movie = {
  id: number
  title: string
  genre: string[]
  rating: number
  duration: string
  description: string
  image: string
  trailer: string
  isNowShowing: boolean
}

const ROOM_TYPE_INFO = {
  A: { name: "Phòng A - Tiêu Chuẩn Lớn" },
  B: { name: "Phòng B - Tiêu Chuẩn" },
  C: { name: "Phòng C - HDmax" },
  D: { name: "Phòng D - Phòng chiếu 3D" },
}

export function BookingForm({ movie }: { movie: Movie }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedBranch, setSelectedBranch] = useState<"HCM" | "HN" | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [ticketQuantities, setTicketQuantities] = useState({
    adult: 0,
    student: 0,
  })
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  })
  const [concessionQuantities, setConcessionQuantities] = useState<Record<string, number>>({})
  const [showTrailer, setShowTrailer] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [applyPointsTo, setApplyPointsTo] = useState<"tickets" | "concessions" | null>(null)
  const [userPoints, setUserPoints] = useState(150) // Fetch động sau
  const [movieShowtimes, setMovieShowtimes] = useState<any[]>([]) // Fetch từ API
  const [concessionsData, setConcessionsData] = useState<any[]>([]) // Fetch từ API
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]) // Fetch từ API
  const [currentPrices, setCurrentPrices] = useState({ adult: 90000, student: 45000 }) // Fetch từ API
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Kiểm tra đăng nhập

  const filteredShowtimes = selectedBranch ? movieShowtimes.filter((s) => s.branch === selectedBranch) : movieShowtimes
  const selectedShowtimeData = filteredShowtimes.find((s) => s.id === selectedShowtime)

  const totalPrice = ticketQuantities.adult * currentPrices.adult + ticketQuantities.student * currentPrices.student
  const concessionsTotal = Object.entries(concessionQuantities).reduce((sum, [id, qty]) => {
    const concession = concessionsData.find((c) => c.id === id)
    return sum + (concession ? concession.price * qty : 0)
  }, 0)

  const pointsDiscount = pointsToUse * POINTS_TO_VND
  let ticketsAfterDiscount = totalPrice
  let concessionsAfterDiscount = concessionsTotal

  if (applyPointsTo === "tickets") {
    ticketsAfterDiscount = Math.max(0, totalPrice - pointsDiscount)
  } else if (applyPointsTo === "concessions") {
    concessionsAfterDiscount = Math.max(0, concessionsTotal - pointsDiscount)
  }

  const grandTotal = ticketsAfterDiscount + concessionsAfterDiscount
  const totalTickets = ticketQuantities.adult + ticketQuantities.student

  const maxPointsForTickets = Math.min(userPoints, Math.floor(totalPrice / POINTS_TO_VND))
  const maxPointsForConcessions = Math.min(userPoints, Math.floor(concessionsTotal / POINTS_TO_VND))

  const hasNoShowtimes = !movie.isNowShowing || movieShowtimes.length === 0

  useEffect(() => {
    // Kiểm tra đăng nhập từ localStorage
    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      setIsLoggedIn(true)
      setCustomerInfo({
        fullName: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
      })
    } else {
      setIsLoggedIn(false)
    }

    // Fetch dữ liệu động từ PHP
    const fetchData = async () => {
      // Fetch showtimes
      const showtimesRes = await fetch(`http://localhost:8000/user/booking/get_showtimes.php?movie_id=${movie.id}`)
      const showtimes = await showtimesRes.json()
      setMovieShowtimes(showtimes)

      // Fetch concessions
      const concessionsRes = await fetch('http://localhost:8000/user/booking/get_concessions.php')
      const cons = await concessionsRes.json()
      setConcessionsData(cons)

      // Fetch user points nếu đã đăng nhập
      if (isLoggedIn && customerInfo.email) {
        const pointsRes = await fetch('http://localhost:8000/user/booking/get_user_points.php', { 
          method: 'POST', 
          body: JSON.stringify({ email: customerInfo.email }) 
        })
        const pointsData = await pointsRes.json()
        setUserPoints(pointsData.point || 150)
      }
    }
    fetchData()
  }, [movie.id, isLoggedIn, customerInfo.email]) // Thêm isLoggedIn vào dependency

  useEffect(() => {
    if (!selectedShowtime) return;

    let interval: NodeJS.Timeout;

    const fetchBookedSeats = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/user/booking/get_booked_seats.php?showtime_id=${selectedShowtime}`
        );
        const data = await res.json();
        if (data.bookedSeats) {
          setOccupiedSeats(data.bookedSeats);
        }
      } catch (err) {
        console.error("Lỗi tải ghế đã đặt:", err);
      }
    };

    const fetchPrices = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/user/booking/get_prices.php?room_type=${selectedShowtimeData?.roomType}`
        );
        const data = await res.json();
        if (data && data.adult && data.student) {
          setCurrentPrices(data);
        }
      } catch (err) {
        console.error("Lỗi tải giá vé:", err);
      }
    };

    // Lần đầu: fetch ngay
    fetchBookedSeats();
    fetchPrices();

    // Sau đó: cập nhật ghế mỗi 5 giây
    interval = setInterval(() => {
      fetchBookedSeats();
    }, 5000);

    // Cleanup khi rời khỏi suất chiếu
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedShowtime, selectedShowtimeData?.roomType]);

  const handleSeatClick = (seat: string) => {
    if (occupiedSeats.includes(seat)) return

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat))
    } else if (selectedSeats.length < totalTickets) {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  // Cảnh báo nếu ghế đang chọn bị người khác đặt
  useEffect(() => {
    if (selectedSeats.length === 0 || occupiedSeats.length === 0) return;

    const conflictedSeats = selectedSeats.filter(seat => occupiedSeats.includes(seat));

    if (conflictedSeats.length > 0) {
      alert(
        `Ghế ${conflictedSeats.join(", ")} đã được đặt bởi người khác! Vui lòng chọn ghế khác.`
      );
      setSelectedSeats(prev => prev.filter(s => !conflictedSeats.includes(s)));
    }
  }, [occupiedSeats, selectedSeats]);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để đặt vé!');
      router.push('/login');
      return;
    }

    const concessionsDataToSend = Object.entries(concessionQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        id: id,
        quantity: qty,
        price: concessionsData.find((c) => c.id === id)?.price || 0,
      }));

    const payload = {
      showtime_id: selectedShowtime,
      selectedSeats,
      ticketQuantities,
      customerInfo: {
        fullName: customerInfo.fullName,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      concessions: concessionsDataToSend,
      pointsToUse,
    };

    try {
      const res = await fetch('http://localhost:8000/user/booking/complete_booking.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.error);

      setUserPoints(result.new_points);

      const bookingId = `CM${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

      const fullBookingData = {
        bookingId,
        movie: { title: movie.title, genre: movie.genre.join(', ') },
        selectedShowtime: selectedShowtimeData,
        selectedSeats,
        ticketQuantities,
        concessions: concessionsDataToSend,
        totalPrice,
        concessionsTotal,
        pointsDiscount,
        grandTotal,
        customerInfo: { name: customerInfo.fullName, email: customerInfo.email, phone: customerInfo.phone },
        cinema: {
          name: selectedBranch === 'HCM' ? 'CineMax Nguyễn Huệ' : 'CineMax Hà Nội',
          address: selectedBranch === 'HCM' ? '123 Nguyễn Huệ, Quận 1, TP.HCM' : '456 Hoàn Kiếm, Hà Nội',
          branch: selectedBranch,
        },
      };

      const history = JSON.parse(sessionStorage.getItem('bookingHistory') || '[]');
      history.push(fullBookingData);
      sessionStorage.setItem('bookingHistory', JSON.stringify(history));
      sessionStorage.setItem('bookingData', JSON.stringify(fullBookingData));

      router.push('/confirmation');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Lỗi không xác định';
      alert('Đặt vé thất bại: ' + msg);
    }
  };

  if (hasNoShowtimes) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{movie.title}</h2>
            <Button variant="outline" size="sm" onClick={() => setShowTrailer(!showTrailer)}>
              <Play className="h-4 w-4 mr-2" />
              {showTrailer ? "Ẩn trailer" : "Xem trailer"}
            </Button>
          </div>

          {showTrailer && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted mb-4">
              <iframe
                width="100%"
                height="100%"
                src={movie.trailer}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
          )}

          <p className="text-muted-foreground mb-4">{movie.description}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {movie.genre.map((g) => (
              <span key={g} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                {g}
              </span>
            ))}
          </div>

          <div className="mt-8 p-8 bg-muted/50 rounded-lg text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">Phim không có suất chiếu</h3>
            <p className="text-muted-foreground mb-6">
              Phim này hiện chưa có lịch chiếu. Vui lòng quay lại sau hoặc chọn phim khác.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/movies">Xem phim khác</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/showtimes">Xem lịch chiếu</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[1fr,400px] gap-8">
      {/* Main Form */}
      <div className="space-y-8">
        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{movie.title}</h2>
            <Button variant="outline" size="sm" onClick={() => setShowTrailer(!showTrailer)}>
              <Play className="h-4 w-4 mr-2" />
              {showTrailer ? "Ẩn trailer" : "Xem trailer"}
            </Button>
          </div>

          {showTrailer && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted mb-4">
              <iframe
                width="100%"
                height="100%"
                src={movie.trailer}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
          )}

          <p className="text-muted-foreground mb-4">{movie.description}</p>
          <div className="flex flex-wrap gap-2">
            {movie.genre.map((g) => (
              <span key={g} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <h2 className="text-2xl font-semibold">Chọn chi nhánh</h2>
          </div>

          <RadioGroup
            value={selectedBranch || ""}
            onValueChange={(value) => {
              setSelectedBranch(value as "HCM" | "HN")
              setSelectedShowtime(null) // Reset showtime when branch changes
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedBranch === "HCM" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <MapPin className="h-8 w-8 mb-2" />
                <span className="font-semibold text-lg">TP. Hồ Chí Minh</span>
                <span className="text-sm text-muted-foreground mt-1">CineMax Nguyễn Huệ</span>
                <RadioGroupItem value="HCM" className="absolute top-4 right-4" />
              </label>
              <label
                className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedBranch === "HN" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <MapPin className="h-8 w-8 mb-2" />
                <span className="font-semibold text-lg">Hà Nội</span>
                <span className="text-sm text-muted-foreground mt-1">CineMax Hoàn Kiếm</span>
                <RadioGroupItem value="HN" className="absolute top-4 right-4" />
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                selectedBranch ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <h2 className="text-2xl font-semibold">Chọn suất chiếu</h2>
          </div>

          {!selectedBranch ? (
            <p className="text-muted-foreground text-center py-8">Vui lòng chọn chi nhánh trước</p>
          ) : (
            <div className="space-y-4">
              <RadioGroup value={selectedShowtime ?? ""} onValueChange={(value) => setSelectedShowtime(value)}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredShowtimes.slice(0, 12).map((showtime) => (
                    <label
                      key={showtime.id}
                      className={`relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedShowtime === showtime.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-semibold">{showtime.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(showtime.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                        </p>
                        <p className="text-xs text-muted-foreground">Phòng {showtime.room}</p>
                        <p className="text-xs text-primary font-medium">{ROOM_TYPE_INFO[showtime.roomType].name}</p>
                      </div>
                      <RadioGroupItem value={showtime.id} className="ml-2" />
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                selectedShowtime ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </div>
            <h2 className="text-2xl font-semibold">Chọn loại vé</h2>
          </div>

          {!selectedShowtime ? (
            <p className="text-muted-foreground text-center py-8">Vui lòng chọn suất chiếu trước</p>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Người lớn</h3>
                    <p className="text-sm text-muted-foreground">{currentPrices.adult.toLocaleString("vi-VN")}đ / vé</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTicketQuantities({
                          ...ticketQuantities,
                          adult: Math.max(0, ticketQuantities.adult - 1),
                        })
                      }
                      disabled={ticketQuantities.adult === 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-semibold">{ticketQuantities.adult}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTicketQuantities({
                          ...ticketQuantities,
                          adult: ticketQuantities.adult + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Trẻ em / Sinh viên</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentPrices.student.toLocaleString("vi-VN")}đ / vé
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTicketQuantities({
                          ...ticketQuantities,
                          student: Math.max(0, ticketQuantities.student - 1),
                        })
                      }
                      disabled={ticketQuantities.student === 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-semibold">{ticketQuantities.student}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTicketQuantities({
                          ...ticketQuantities,
                          student: ticketQuantities.student + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tổng số vé</span>
                  <span className="text-lg font-bold">{totalTickets} vé</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                totalTickets > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              4
            </div>
            <h2 className="text-2xl font-semibold">Chọn ghế ngồi</h2>
          </div>

          {totalTickets === 0 ? (
            <p className="text-muted-foreground text-center py-8">Vui lòng chọn loại vé trước</p>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-center">
                  Vui lòng chọn <span className="font-bold">{totalTickets} ghế</span> ({selectedSeats.length}/
                  {totalTickets} đã chọn)
                </p>
              </div>

              <SeatMap
                roomType={selectedShowtimeData?.roomType || "B"}
                occupiedSeats={occupiedSeats}
                selectedSeats={selectedSeats}
                onSeatClick={handleSeatClick}
                disabled={false}
                showLegend={true}
              />
            </div>
          )}
        </div>

        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                selectedSeats.length === totalTickets && totalTickets > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              5
            </div>
            <h2 className="text-2xl font-semibold">Thông tin khách hàng</h2>
          </div>

          {selectedSeats.length !== totalTickets || totalTickets === 0 ? (
            <p className="text-muted-foreground text-center py-8">Vui lòng chọn đủ {totalTickets} ghế ngồi trước</p>
          ) : !isLoggedIn ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Vui lòng đăng nhập để tiếp tục đặt vé.</p>
              <Button onClick={() => router.push('/login')}>Đăng nhập</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName">Họ và Tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nhập tên của bạn"
                  value={customerInfo.fullName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0123456789"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                customerInfo.email && customerInfo.phone
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              6
            </div>
            <h2 className="text-2xl font-semibold">Chọn đồ ăn & nước uống</h2>
          </div>

          {!customerInfo.email || !customerInfo.phone ? (
            <p className="text-muted-foreground text-center py-8">Vui lòng điền thông tin khách hàng trước</p>
          ) : (
            <div className="space-y-4">
              {concessionsData.map((concession) => (
                <div key={concession.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Popcorn className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{concession.name}</h3>
                        <p className="text-sm text-muted-foreground">{concession.description}</p>
                        <p className="text-sm font-medium mt-1">{concession.price.toLocaleString("vi-VN")}đ</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConcessionQuantities({
                            ...concessionQuantities,
                            [concession.id]: Math.max(0, (concessionQuantities[concession.id] || 0) - 1),
                          })
                        }
                        disabled={!concessionQuantities[concession.id]}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-semibold">{concessionQuantities[concession.id] || 0}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConcessionQuantities({
                            ...concessionQuantities,
                            [concession.id]: (concessionQuantities[concession.id] || 0) + 1,
                          })
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                customerInfo.email && customerInfo.phone
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              7
            </div>
            <h2 className="text-2xl font-semibold">Thanh toán</h2>
          </div>

          {!customerInfo.email || !customerInfo.phone ? (
            <p className="text-muted-foreground text-center py-8">Vui lòng điền thông tin khách hàng trước</p>
          ) : (
            <div className="space-y-6">
              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Sử dụng điểm tích lũy</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{userPoints} điểm</div>
                    <div className="text-xs text-muted-foreground">Điểm hiện có</div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  1 điểm = {POINTS_TO_VND.toLocaleString("vi-VN")}đ. Chọn mục bạn muốn áp dụng điểm:
                </p>

                <div className="space-y-3">
                  {/* Apply points to tickets */}
                  {totalPrice > 0 && (
                    <div className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="applyPoints"
                            checked={applyPointsTo === "tickets"}
                            onChange={() => {
                              setApplyPointsTo("tickets")
                              setPointsToUse(0)
                            }}
                            className="w-4 h-4"
                          />
                          <span className="font-medium">Áp dụng cho vé xem phim</span>
                        </label>
                        <span className="text-sm text-muted-foreground">Tối đa {maxPointsForTickets} điểm</span>
                      </div>

                      {applyPointsTo === "tickets" && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPointsToUse(Math.max(0, pointsToUse - 10))}
                              disabled={pointsToUse === 0}
                            >
                              -10
                            </Button>
                            <Input
                              type="number"
                              value={pointsToUse}
                              onChange={(e) => {
                                const value = Number.parseInt(e.target.value) || 0
                                setPointsToUse(Math.min(maxPointsForTickets, Math.max(0, value)))
                              }}
                              className="text-center"
                              min={0}
                              max={maxPointsForTickets}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPointsToUse(Math.min(maxPointsForTickets, pointsToUse + 10))}
                              disabled={pointsToUse >= maxPointsForTickets}
                            >
                              +10
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPointsToUse(maxPointsForTickets)}>
                              Tối đa
                            </Button>
                          </div>
                          {pointsToUse > 0 && (
                            <p className="text-sm text-primary font-medium">
                              Giảm {(pointsToUse * POINTS_TO_VND).toLocaleString("vi-VN")}đ cho vé xem phim
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Apply points to concessions */}
                  {concessionsTotal > 0 && (
                    <div className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="applyPoints"
                            checked={applyPointsTo === "concessions"}
                            onChange={() => {
                              setApplyPointsTo("concessions")
                              setPointsToUse(0)
                            }}
                            className="w-4 h-4"
                          />
                          <span className="font-medium">Áp dụng cho bắp nước</span>
                        </label>
                        <span className="text-sm text-muted-foreground">Tối đa {maxPointsForConcessions} điểm</span>
                      </div>

                      {applyPointsTo === "concessions" && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPointsToUse(Math.max(0, pointsToUse - 10))}
                              disabled={pointsToUse === 0}
                            >
                              -10
                            </Button>
                            <Input
                              type="number"
                              value={pointsToUse}
                              onChange={(e) => {
                                const value = Number.parseInt(e.target.value) || 0
                                setPointsToUse(Math.min(maxPointsForConcessions, Math.max(0, value)))
                              }}
                              className="text-center"
                              min={0}
                              max={maxPointsForConcessions}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPointsToUse(Math.min(maxPointsForConcessions, pointsToUse + 10))}
                              disabled={pointsToUse >= maxPointsForConcessions}
                            >
                              +10
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPointsToUse(maxPointsForConcessions)}>
                              Tối đa
                            </Button>
                          </div>
                          {pointsToUse > 0 && (
                            <p className="text-sm text-primary font-medium">
                              Giảm {(pointsToUse * POINTS_TO_VND).toLocaleString("vi-VN")}đ cho bắp nước
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clear points selection */}
                  {applyPointsTo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setApplyPointsTo(null)
                        setPointsToUse(0)
                      }}
                      className="w-full"
                    >
                      Không sử dụng điểm
                    </Button>
                  )}
                </div>
              </div>

              {/* Payment card details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Thông tin thanh toán</h3>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Số thẻ</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="pl-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Ngày hết hạn</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" maxLength={3} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="p-6 border border-border/50 rounded-xl shadow-sm bg-background">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Tóm tắt đơn hàng</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{movie.title}</h4>
              <p className="text-sm text-muted-foreground">{movie.genre.join(", ")}</p>
            </div>

            {selectedBranch && (
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chi nhánh</span>
                  <span className="font-medium">{selectedBranch === "HCM" ? "TP.HCM" : "Hà Nội"}</span>
                </div>
              </div>
            )}

            {totalTickets > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-3">Chi tiết vé</h4>
                {ticketQuantities.adult > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Người lớn x {ticketQuantities.adult}</span>
                    <span className="font-medium">
                      {(ticketQuantities.adult * currentPrices.adult).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                {ticketQuantities.student > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trẻ em/SV x {ticketQuantities.student}</span>
                    <span className="font-medium">
                      {(ticketQuantities.student * currentPrices.student).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
              </div>
            )}

            {selectedShowtime && selectedShowtimeData && (
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Suất chiếu</span>
                  <span className="font-medium">{selectedShowtimeData.time}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Ngày</span>
                  <span className="font-medium">{new Date(selectedShowtimeData.date).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Phòng</span>
                  <span className="font-medium">{selectedShowtimeData.room}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loại phòng</span>
                  <span className="font-medium text-primary">{ROOM_TYPE_INFO[selectedShowtimeData.roomType].name}</span>
                </div>
              </div>
            )}

            {Object.values(concessionQuantities).some((qty) => qty > 0) && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-3">Đồ ăn & nước uống</h4>
                {Object.entries(concessionQuantities)
                  .filter(([_, qty]) => qty > 0)
                  .map(([id, qty]) => {
                    const concession = concessionsData.find((c) => c.id === id)
                    if (!concession) return null
                    return (
                      <div key={id} className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          {concession.name} x {qty}
                        </span>
                        <span className="font-medium">{(concession.price * qty).toLocaleString("vi-VN")}đ</span>
                      </div>
                    )
                  })}
              </div>
            )}

            <div className="pt-4 border-t border-border space-y-2">
              {totalPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng vé</span>
                  <span className="font-medium">{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              {concessionsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng đồ ăn</span>
                  <span className="font-medium">{concessionsTotal.toLocaleString("vi-VN")}đ</span>
                </div>
              )}

              {pointsToUse > 0 && applyPointsTo && (
                <div className="flex justify-between text-sm text-primary">
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Giảm giá ({pointsToUse} điểm)
                  </span>
                  <span className="font-medium">-{pointsDiscount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold mt-4 pt-2 border-t border-border">
                <span>Tổng cộng</span>
                <span>{grandTotal > 0 ? `${grandTotal.toLocaleString("vi-VN")}đ` : "-"}</span>
              </div>

              {pointsToUse > 0 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Điểm còn lại sau thanh toán: {userPoints - pointsToUse} điểm
                </p>
              )}
            </div>

            <Button
              className="w-full mt-6"
              size="lg"
              disabled={
                totalTickets === 0 ||
                !selectedBranch ||
                !selectedShowtime ||
                selectedSeats.length !== totalTickets ||
                !customerInfo.email ||
                !customerInfo.phone
              }
              onClick={handleSubmit}
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
