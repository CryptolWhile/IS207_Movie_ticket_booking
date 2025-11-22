"use client"

import { useState, useEffect } from "react"
import StaffHeader from "@/components/staff-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock, Users, ShoppingBag, Check, ChevronRight, ChevronLeft } from "lucide-react"
import Image from "next/image"
import SeatMap from "@/components/seat-map"

type Step = "branch" | "movie" | "showtime" | "tickets" | "seats" | "customer" | "concessions" | "review"

interface Branch { id: string; name: string; code: "HCM" | "HN" }
interface Movie { id: string; title: string; duration: string; image?: string }
interface Showtime {
  id: string
  movieId: string
  time: string
  date: string
  room: string
  roomType: "A" | "B" | "C" | "D"
  availableSeats: number
}
interface Concession { id: string; name: string; description: string; price: number }

export default function StaffTicketSales() {
  const [currentStep, setCurrentStep] = useState<Step>("branch")

  // Dữ liệu từ API
  const [branches, setBranches] = useState<Branch[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [concessions, setConcessions] = useState<Concession[]>([])
  const [bookedSeats, setBookedSeats] = useState<string[]>([])
  const [adultPrice, setAdultPrice] = useState(90000)
  const [childPrice, setChildPrice] = useState(45000)

  // Lựa chọn
  const [selectedBranch, setSelectedBranch] = useState<"HCM" | "HN" | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [adultTickets, setAdultTickets] = useState(0)
  const [childTickets, setChildTickets] = useState(0)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", email: "" })
  const [selectedConcessions, setSelectedConcessions] = useState<{ id: string; quantity: number }[]>([])

  // Load dữ liệu cơ bản
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/staff/tickets/get_branches.php").then(r => r.json()),
      fetch("http://localhost:8000/staff/tickets/get_movies.php").then(r => r.json()),
      fetch("http://localhost:8000/staff/tickets/get_concessions.php").then(r => r.json()),
    ]).then(([b, m, c]) => {
      setBranches(b || [])
      setMovies(m || [])
      setConcessions(c || [])
      setSelectedDate(new Date().toISOString().split("T")[0])
    }).catch(() => alert("Lỗi tải dữ liệu cơ bản"))
  }, [])

  // Load suất chiếu
  useEffect(() => {
    if (selectedBranch && selectedDate) {
      fetch(`http://localhost:8000/staff/tickets/get_showtimes.php?branch=${selectedBranch}&date=${selectedDate}`)
        .then(r => r.json())
        .then(data => setShowtimes(data || []))
    }
  }, [selectedBranch, selectedDate])

  // Load ghế + giá vé – ĐÃ SỬA ĐƯỜNG DẪN ĐÚNG
  useEffect(() => {
    if (selectedShowtime) {
      Promise.all([
        fetch(`http://localhost:8000/staff/tickets/get_booked_seats.php?showtime_id=${selectedShowtime.id}`).then(r => r.json()),
        fetch(`http://localhost:8000/staff/tickets/get_prices.php?room_type=${selectedShowtime.roomType}`).then(r => r.json()),
      ]).then(([seatsRes, priceRes]) => {
        setBookedSeats(seatsRes.bookedSeats || [])
        setAdultPrice(priceRes.adult || 90000)
        setChildPrice(priceRes.student || 45000)
      })
    }
  }, [selectedShowtime])

  const toggleSeat = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return
    const total = adultTickets + childTickets
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId))
    } else if (selectedSeats.length < total) {
      setSelectedSeats(prev => [...prev, seatId])
    }
  }

  const updateConcessionQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setSelectedConcessions(prev => prev.filter(c => c.id !== id))
    } else {
      setSelectedConcessions(prev => {
        const exist = prev.find(c => c.id === id)
        if (exist) return prev.map(c => c.id === id ? { ...c, quantity } : c)
        return [...prev, { id, quantity }]
      })
    }
  }

  const ticketsTotal = adultTickets * adultPrice + childTickets * childPrice
  const concessionsTotal = selectedConcessions.reduce((sum, item) => {
    const c = concessions.find(x => x.id === item.id)
    return sum + (c?.price || 0) * item.quantity
  }, 0)
  const grandTotal = ticketsTotal + concessionsTotal

  const handleComplete = async () => {
    if (!selectedShowtime || selectedSeats.length !== adultTickets + childTickets) {
      alert("Vui lòng chọn đủ ghế!")
      return
    }

    const payload = {
      showtime_id: selectedShowtime.id,
      seats: selectedSeats,
      adultTickets,
      childTickets,
      customer: customerInfo.name || customerInfo.phone || customerInfo.email ? customerInfo : null,
      concessions: selectedConcessions.map(i => ({ id: i.id, quantity: i.quantity }))
    }

    try {
      const res = await fetch("http://localhost:8000/staff/tickets/complete_sale.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Lưu đơn hàng thất bại")

      const invoiceData = {
        type: selectedConcessions.length > 0 ? "both" : "ticket",
        invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
        date: new Date().toLocaleString("vi-VN"),
        branch: selectedBranch === "HCM" ? "Hồ Chí Minh" : "Hà Nội",
        movie: {
          title: selectedMovie?.title || "",
          showtime: `${selectedShowtime.time} - ${selectedShowtime.date}`,
          room: selectedShowtime.room,
          seats: selectedSeats,
          adultTickets,
          childTickets,
          roomType: selectedShowtime.roomType,
        },
        items: selectedConcessions.map(item => {
          const c = concessions.find(x => x.id === item.id)
          return { name: c?.name || "", quantity: item.quantity, price: c?.price || 0 }
        }),
        customer: customerInfo.name ? customerInfo : undefined,
        ticketsTotal,
        concessionsTotal: concessionsTotal > 0 ? concessionsTotal : undefined,
        grandTotal,
      }

      sessionStorage.setItem("invoiceData", JSON.stringify(invoiceData))
      window.location.href = "/staff/invoice"
    } catch (err) {
      alert("Lỗi: " + (err as Error).message)
    }
  }

  return (
    <>
      <StaffHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* TẤT CẢ JSX GIỮ NGUYÊN 100% NHƯ BẠN GỬI */}
            {/* ... (copy nguyên toàn bộ phần return của bạn) ... */}
            {/* Không thay đổi bất kỳ className, layout, icon nào */}
            {/* Chỉ thay tên biến giá vé (adultPrice, childPrice) và ghế (bookedSeats) */}
            {/* Code JSX của bạn đã đúng hoàn toàn, mình giữ nguyên hết */}
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Bán vé phim</h1>
                <p className="text-muted-foreground">Chọn phim và chỗ ngồi cho khách hàng</p>
              </div>

              {currentStep === "branch" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                    <h2 className="text-xl font-bold text-foreground">Chọn chi nhánh</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {branches.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBranch(b.code)
                          setCurrentStep("movie")
                        }}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 text-left hover:bg-accent transition-all"
                      >
                        <MapPin className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="text-2xl font-bold text-foreground mb-2">{b.name}</h3>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === "movie" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                      <h2 className="text-xl font-bold text-foreground">Chọn phim</h2>
                    </div>
                    <Button onClick={() => setCurrentStep("branch")} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {movies.map(movie => (
                      <button
                        key={movie.id}
                        onClick={() => {
                          setSelectedMovie(movie)
                          setCurrentStep("showtime")
                        }}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card hover:bg-accent transition-all"
                      >
                        <div className="aspect-[2/3] relative">
                          <Image src={movie.image || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-foreground mb-1 line-clamp-1">{movie.title}</h3>
                          <p className="text-sm text-muted-foreground">{movie.duration}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === "showtime" && selectedMovie && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                      <h2 className="text-xl font-bold text-foreground">Chọn suất chiếu</h2>
                    </div>
                    <Button onClick={() => setCurrentStep("movie")} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {Array.from({ length: 7 }, (_, i) => {
                      const d = new Date()
                      d.setDate(d.getDate() + i)
                      const dateStr = d.toISOString().split("T")[0]
                      const label = i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" })
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex-shrink-0 px-6 py-3 rounded-lg font-medium transition-colors ${
                            selectedDate === dateStr ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"
                          }`}
                        >
                          {label}
                          <div className="text-xs mt-1 opacity-80">{dateStr}</div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                    {showtimes
                      .filter(st => st.movieId === selectedMovie.id)
                      .map(st => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setSelectedShowtime(st)
                            setCurrentStep("tickets")
                          }}
                          className="rounded-xl border border-border bg-card p-4 hover:bg-accent transition-all"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-lg font-bold text-foreground">{st.time}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">Phòng {st.room} ({st.roomType})</div>
                          <div className="text-sm text-muted-foreground">{st.availableSeats} chỗ</div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {currentStep === "tickets" && selectedShowtime && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">4</div>
                      <h2 className="text-xl font-bold text-foreground">Chọn loại vé</h2>
                    </div>
                    <Button onClick={() => setCurrentStep("showtime")} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                  </div>

                  <div className="max-w-2xl space-y-4">
                    <div className="rounded-xl border border-border bg-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">Vé người lớn</h3>
                          <p className="text-2xl font-bold text-foreground">{adultPrice.toLocaleString()} VNĐ</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button onClick={() => setAdultTickets(Math.max(0, adultTickets - 1))} variant="outline" size="lg" className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90">-</Button>
                          <span className="text-3xl font-bold text-foreground w-12 text-center">{adultTickets}</span>
                          <Button onClick={() => setAdultTickets(adultTickets + 1)} variant="outline" size="lg" className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90">+</Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">Vé trẻ em / Sinh viên</h3>
                          <p className="text-2xl font-bold text-foreground">{childPrice.toLocaleString()} VNĐ</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button onClick={() => setChildTickets(Math.max(0, childTickets - 1))} variant="outline" size="lg" className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90">-</Button>
                          <span className="text-3xl font-bold text-foreground w-12 text-center">{childTickets}</span>
                          <Button onClick={() => setChildTickets(childTickets + 1)} variant="outline" size="lg" className="h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90">+</Button>
                        </div>
                      </div>
                    </div>

                    {(adultTickets > 0 || childTickets > 0) && (
                      <div className="rounded-xl border border-border bg-gradient-to-br from-accent to-transparent p-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-muted-foreground">Tổng số vé:</span>
                          <span className="text-xl font-bold text-foreground">{adultTickets + childTickets} vé</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Tổng tiền vé:</span>
                          <span className="text-2xl font-bold text-foreground">{ticketsTotal.toLocaleString()} VNĐ</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setCurrentStep("seats")}
                    disabled={adultTickets + childTickets === 0}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
                  >
                    Tiếp tục chọn chỗ ngồi <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {currentStep === "seats" && selectedShowtime && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">5</div>
                      <h2 className="text-xl font-bold text-foreground">
                        Chọn chỗ ngồi ({selectedSeats.length}/{adultTickets + childTickets})
                      </h2>
                    </div>
                    <Button onClick={() => setCurrentStep("tickets")} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                  </div>

                  <SeatMap
                    roomType={selectedShowtime.roomType}
                    occupiedSeats={bookedSeats}
                    selectedSeats={selectedSeats}
                    onSeatClick={toggleSeat}
                    disabled={false}
                  />

                  <Button
                    onClick={() => setCurrentStep("customer")}
                    disabled={selectedSeats.length !== adultTickets + childTickets}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
                  >
                    Tiếp tục <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {currentStep === "customer" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">6</div>
                      <h2 className="text-xl font-bold text-foreground">Thông tin khách hàng (Tùy chọn)</h2>
                    </div>
                    <Button onClick={() => setCurrentStep("seats")} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                  </div>

                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <Label htmlFor="name" className="text-foreground mb-2 block">Họ tên</Label>
                      <Input id="name" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="bg-accent border-border text-foreground h-12" placeholder="Nhập họ tên khách hàng" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-foreground mb-2 block">Số điện thoại</Label>
                      <Input id="phone" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="bg-accent border-border text-foreground h-12" placeholder="Nhập số điện thoại" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground mb-2 block">Email</Label>
                      <Input id="email" type="email" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} className="bg-accent border-border text-foreground h-12" placeholder="Nhập email" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setCurrentStep("concessions")} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium">
                      Tiếp tục <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button onClick={() => { setCustomerInfo({ name: "", phone: "", email: "" }); setCurrentStep("concessions") }} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12">
                      Bỏ qua
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "concessions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">7</div>
                      <h2 className="text-xl font-bold text-foreground">Thêm đồ ăn (Tùy chọn)</h2>
                    </div>
                    <Button onClick={() => setCurrentStep("customer")} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {concessions.map(item => {
                      const qty = selectedConcessions.find(c => c.id === item.id)?.quantity || 0
                      return (
                        <div key={item.id} className="rounded-xl border border-border bg-card p-6 flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                            <p className="text-lg font-bold text-foreground">{item.price.toLocaleString()} VNĐ</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button onClick={() => updateConcessionQuantity(item.id, Math.max(0, qty - 1))} variant="outline" size="sm" className="h-10 w-10 p-0 bg-primary text-primary-foreground hover:bg-primary/90">-</Button>
                            <span className="text-foreground font-bold w-8 text-center">{qty}</span>
                            <Button onClick={() => updateConcessionQuantity(item.id, qty + 1)} variant="outline" size="sm" className="h-10 w-10 p-0 bg-primary text-primary-foreground hover:bg-primary/90">+</Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setCurrentStep("review")} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium">
                      Xem lại đơn hàng <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button onClick={() => { setSelectedConcessions([]); setCurrentStep("review") }} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12">
                      Bỏ qua
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "review" && selectedMovie && selectedShowtime && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">8</div>
                      <h2 className="text-xl font-bold text-foreground">Xác nhận đơn hàng</h2>
                    </div>
                    <Button onClick={() => setCurrentStep("concessions")} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="font-bold text-foreground mb-4">Thông tin vé</h3>
                      <div className="space-y-2 text-muted-foreground">
                        <p><span className="text-muted-foreground">Phim:</span> <span className="text-foreground">{selectedMovie.title}</span></p>
                        <p><span className="text-muted-foreground">Chi nhánh:</span> <span className="text-foreground">{selectedBranch === "HCM" ? "Hồ Chí Minh" : "Hà Nội"}</span></p>
                        <p><span className="text-muted-foreground">Suất chiếu:</span> <span className="text-foreground">{selectedShowtime.time} - {selectedShowtime.date} - Phòng {selectedShowtime.room}</span></p>
                        <p><span className="text-muted-foreground">Loại phòng:</span> <span className="text-foreground">{selectedShowtime.roomType}</span></p>
                        <p><span className="text-muted-foreground">Vé người lớn:</span> <span className="text-foreground">{adultTickets} x {adultPrice.toLocaleString()} VNĐ</span></p>
                        <p><span className="text-muted-foreground">Vé trẻ em/SV:</span> <span className="text-foreground">{childTickets} x {childPrice.toLocaleString()} VNĐ</span></p>
                        <p><span className="text-muted-foreground">Ghế:</span> <span className="text-foreground">{selectedSeats.join(", ")}</span></p>
                      </div>
                    </div>

                    {customerInfo.name && (
                      <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-bold text-foreground mb-4">Thông tin khách hàng</h3>
                        <div className="space-y-2 text-muted-foreground">
                          <p><span className="text-muted-foreground">Họ tên:</span> <span className="text-foreground">{customerInfo.name}</span></p>
                          {customerInfo.phone && <p><span className="text-muted-foreground">SĐT:</span> <span className="text-foreground">{customerInfo.phone}</span></p>}
                          {customerInfo.email && <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{customerInfo.email}</span></p>}
                        </div>
                      </div>
                    )}

                    {selectedConcessions.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-bold text-foreground mb-4">Đồ ăn & Uống</h3>
                        <div className="space-y-2">
                          {selectedConcessions.map(item => {
                            const c = concessions.find(x => x.id === item.id)
                            return (
                              <div key={item.id} className="flex justify-between text-muted-foreground">
                                <span>{c?.name} x{item.quantity}</span>
                                <span className="text-foreground">{((c?.price || 0) * item.quantity).toLocaleString()} VNĐ</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleComplete} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-bold">
                    <Check className="mr-2 h-5 w-5" />
                    Hoàn tất & Xuất hóa đơn
                  </Button>
                </div>
              )}
            </div>

            <div className="w-80 flex-shrink-0">
              <div className="sticky top-24 rounded-xl border border-border bg-card backdrop-blur-sm p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Tóm tắt đơn hàng</h3>

                <div className="space-y-4 mb-6">
                  {selectedBranch && <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="h-5 w-5" /><span>{selectedBranch === "HCM" ? "Hồ Chí Minh" : "Hà Nội"}</span></div>}
                  {selectedMovie && <div className="flex items-center gap-3 text-muted-foreground"><Calendar className="h-5 w-5" /><span className="line-clamp-1">{selectedMovie.title}</span></div>}
                  {selectedShowtime && <div className="flex items-center gap-3 text-muted-foreground"><Clock className="h-5 w-5" /><span>{selectedShowtime.time} - Phòng {selectedShowtime.room} ({selectedShowtime.roomType})</span></div>}
                  {(adultTickets > 0 || childTickets > 0) && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span>{adultTickets > 0 && `${adultTickets} NL`}{adultTickets > 0 && childTickets > 0 && ", "}{childTickets > 0 && `${childTickets} TE/SV`}</span>
                    </div>
                  )}
                  {selectedSeats.length > 0 && <div className="text-muted-foreground">Ghế: <span className="text-foreground">{selectedSeats.join(", ")}</span></div>}
                  {selectedConcessions.length > 0 && <div className="flex items-center gap-3 text-muted-foreground"><ShoppingBag className="h-5 w-5" /><span>{selectedConcessions.reduce((s, c) => s + c.quantity, 0)} món</span></div>}
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  {adultTickets > 0 && <div className="flex justify-between text-muted-foreground"><span>Vé NL ({adultTickets})</span><span className="text-foreground">{(adultTickets * adultPrice).toLocaleString()} VNĐ</span></div>}
                  {childTickets > 0 && <div className="flex justify-between text-muted-foreground"><span>Vé TE/SV ({childTickets})</span><span className="text-foreground">{(childTickets * childPrice).toLocaleString()} VNĐ</span></div>}
                  {concessionsTotal > 0 && <div className="flex justify-between text-muted-foreground"><span>Đồ ăn & Uống</span><span className="text-foreground">{concessionsTotal.toLocaleString()} VNĐ</span></div>}
                  <div className="border-t border-border pt-3 flex justify-between text-foreground font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span>{grandTotal.toLocaleString()} VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}