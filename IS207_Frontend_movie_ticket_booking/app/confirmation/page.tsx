"use client"

import { useEffect, useState, useRef } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Calendar, Clock, MapPin, Ticket, Download, Mail, Popcorn, Award, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getTicketPrices } from "@/lib/pricing-utils"
import QRCode from "qrcode"
import jsPDF from "jspdf"

type BookingData = {
  bookingId: string
  movie: { title: string; genre: string }
  selectedShowtime: { id: string; date: string; time: string; room: string; roomType: string }
  selectedSeats: string[]
  ticketQuantities: { adult: number; student: number }
  concessions: Array<{ id: string; name: string; description: string; price: number; quantity: number }>
  totalPrice: number
  concessionsTotal: number
  pointsDiscount?: number
  grandTotal: number
  customerInfo: { name: string; email: string; phone: string }
  cinema: { name: string; address: string; branch: string }
}

export default function ConfirmationPage() {
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState<BookingData | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const storedData = sessionStorage.getItem("bookingData")
    if (storedData) {
      const data = JSON.parse(storedData)
      setBookingDetails(data)

      // Tạo QR Code
      const qrData = JSON.stringify({
        bookingId: data.bookingId,
        movie: data.movie.title,
        showtime: `${data.selectedShowtime.date} ${data.selectedShowtime.time}`,
        seats: data.selectedSeats.join(", "),
      })
      QRCode.toDataURL(qrData, { width: 256, margin: 2 }, (err, url) => {
        if (!err) setQrCodeUrl(url)
      })
    } else {
      router.push("/")
    }
  }, [router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
    return `${days[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`
  }

  const ticketPrices = bookingDetails ? getTicketPrices(bookingDetails.selectedShowtime.roomType as "A" | "B" | "C" | "D") : { adult: 0, student: 0 }
  const adultPrice = ticketPrices.adult
  const studentPrice = ticketPrices.student
  const pointsDiscount = bookingDetails?.pointsDiscount || 0
  const hasDiscount = pointsDiscount > 0

  // TẢI PDF
  const downloadPDF = async () => {
    if (!bookingDetails || !qrCodeUrl) return
    setIsGeneratingPDF(true)

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15
    let y = 20

    // === Nội dung PDF (giữ nguyên như cũ) ===
    pdf.setFontSize(20)
    pdf.text("CineMax - Vé xem phim", pageWidth / 2, y, { align: "center" })
    y += 10
    pdf.setFontSize(12)
    pdf.text(`Mã đặt vé: ${bookingDetails.bookingId}`, pageWidth / 2, y, { align: "center" })
    y += 15

    pdf.setFontSize(16)
    pdf.text(bookingDetails.movie.title, margin, y)
    y += 8
    pdf.setFontSize(10)
    pdf.text(bookingDetails.movie.genre, margin, y)
    y += 15

    pdf.setFontSize(11)
    pdf.text(`Ngày: ${formatDate(bookingDetails.selectedShowtime.date)}`, margin, y)
    y += 7
    pdf.text(`Giờ: ${bookingDetails.selectedShowtime.time}`, margin, y)
    y += 7
    pdf.text(`Phòng: ${bookingDetails.selectedShowtime.room}`, margin, y)
    y += 7
    pdf.text(`${bookingDetails.cinema.name}`, margin, y)
    y += 5
    pdf.text(`${bookingDetails.cinema.address}`, margin, y)
    y += 15

    pdf.text("Ghế ngồi:", margin, y)
    y += 7
    const seats = bookingDetails.selectedSeats.join(", ")
    const seatLines = pdf.splitTextToSize(seats, pageWidth - margin * 2)
    seatLines.forEach(line => {
      pdf.text(line, margin + 5, y)
      y += 6
    })
    y += 10

    if (bookingDetails.ticketQuantities.adult > 0) {
      pdf.text(`Người lớn x ${bookingDetails.ticketQuantities.adult}: ${(bookingDetails.ticketQuantities.adult * adultPrice).toLocaleString()}đ`, margin, y)
      y += 7
    }
    if (bookingDetails.ticketQuantities.student > 0) {
      pdf.text(`Trẻ em/SV x ${bookingDetails.ticketQuantities.student}: ${(bookingDetails.ticketQuantities.student * studentPrice).toLocaleString()}đ`, margin, y)
      y += 7
    }
    pdf.text(`Tổng vé: ${bookingDetails.totalPrice.toLocaleString()}đ`, margin, y)
    y += 10

    if (bookingDetails.concessions.length > 0) {
      pdf.text("Đồ ăn & nước uống:", margin, y)
      y += 7
      bookingDetails.concessions.forEach(item => {
        pdf.text(`${item.name} x ${item.quantity}: ${(item.price * item.quantity).toLocaleString()}đ`, margin + 5, y)
        y += 6
      })
      pdf.text(`Tổng đồ ăn: ${bookingDetails.concessionsTotal.toLocaleString()}đ`, margin, y)
      y += 10
    }

    if (hasDiscount) {
      pdf.setTextColor(0, 120, 0)
      pdf.text(`Giảm điểm: -${pointsDiscount.toLocaleString()}đ`, margin, y)
      pdf.setTextColor(0)
      y += 10
    }

    pdf.setFontSize(14)
    pdf.text(`TỔNG THANH TOÁN: ${bookingDetails.grandTotal.toLocaleString()}đ`, margin, y)
    y += 20

    // === THÊM QR CODE VÀ CHỜ HOÀN TẤT ===
    const addQRCodeAndSave = () => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous" // Quan trọng nếu QR từ domain khác
        img.src = qrCodeUrl

        img.onload = () => {
          pdf.addImage(qrCodeUrl, "PNG", pageWidth - 60, y - 10, 50, 50)
          pdf.setFontSize(9)
          pdf.text("Quét mã để kiểm tra vé", pageWidth - 60, y + 45)
          pdf.save(`ve-${bookingDetails.bookingId}.pdf`)
          setIsGeneratingPDF(false)
          resolve()
        }

        img.onerror = () => {
          console.warn("Không tải được QR code, lưu PDF không có QR")
          pdf.setFontSize(9)
          pdf.text("QR Code: [Không tải được]", pageWidth - 60, y + 10)
          pdf.save(`ve-${bookingDetails.bookingId}.pdf`)
          setIsGeneratingPDF(false)
          resolve()
        }
      })
    }

    // Chờ QR code tải xong rồi mới lưu
    if (qrCodeUrl) {
      await addQRCodeAndSave()
    } else {
      pdf.save(`ve-${bookingDetails.bookingId}.pdf`)
      setIsGeneratingPDF(false)
    }
  }

  // GỬI EMAIL
  const sendEmail = async () => {
    if (!bookingDetails) return
    setIsSendingEmail(true)

    try {
      await fetch('http://localhost:8000/user/confirmation/send_confirmation_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bookingDetails.customerInfo.email,
          bookingId: bookingDetails.bookingId,
          movie: bookingDetails.movie.title,
          showtime: `${formatDate(bookingDetails.selectedShowtime.date)} ${bookingDetails.selectedShowtime.time}`,
          seats: bookingDetails.selectedSeats.join(", "),
          total: bookingDetails.grandTotal,
        }),
      })
      alert("Email xác nhận đã được gửi lại!")
    } catch (err) {
      alert("Gửi email thất bại. Vui lòng thử lại.")
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 px-6 lg:px-8">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20 px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Đặt vé thành công!</h1>
            <p className="text-lg text-muted-foreground">
              Cảm ơn bạn đã đặt vé tại CineMax. Thông tin đặt vé đã được gửi đến email của bạn.
            </p>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white rounded-xl shadow-md">
                <img src={qrCodeUrl} alt="QR Code vé" className="w-48 h-48" />
                <p className="text-center text-sm text-muted-foreground mt-2">Quét mã để kiểm tra vé</p>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="p-8 border border-border/50 rounded-xl shadow-sm bg-background mb-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mã đặt vé</p>
                <p className="text-2xl font-bold font-mono">{bookingDetails.bookingId}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="space-y-6">
              {/* Movie Info */}
              <div>
                <h2 className="text-2xl font-bold mb-2">{bookingDetails.movie.title}</h2>
                <p className="text-muted-foreground">{bookingDetails.movie.genre}</p>
              </div>

              {/* Showtime Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ngày chiếu</p>
                    <p className="font-semibold">{formatDate(bookingDetails.selectedShowtime.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Giờ chiếu</p>
                    <p className="font-semibold">{bookingDetails.selectedShowtime.time}</p>
                  </div>
                </div>
              </div>

              {/* Cinema Location */}
              <div className="flex items-start gap-3 pt-6 border-t border-border">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rạp chiếu</p>
                  <p className="font-semibold mb-1">{bookingDetails.cinema.name}</p>
                  <p className="text-sm text-muted-foreground">{bookingDetails.cinema.address}</p>
                  <p className="text-sm font-semibold mt-2">Phòng {bookingDetails.selectedShowtime.room}</p>
                </div>
              </div>

              {/* Seats */}
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Ghế ngồi</p>
                <div className="flex flex-wrap gap-2">
                  {bookingDetails.selectedSeats.map((seat) => (
                    <div key={seat} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                      {seat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket Details */}
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Chi tiết vé</p>
                <div className="space-y-2">
                  {bookingDetails.ticketQuantities.adult > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Người lớn x {bookingDetails.ticketQuantities.adult}</span>
                      <span className="font-medium">
                        {(bookingDetails.ticketQuantities.adult * adultPrice).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {bookingDetails.ticketQuantities.student > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Trẻ em/Sinh viên x {bookingDetails.ticketQuantities.student}
                      </span>
                      <span className="font-medium">
                        {(bookingDetails.ticketQuantities.student * studentPrice).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="font-medium">Tổng tiền vé</span>
                    <span className="font-semibold">{bookingDetails.totalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>

              {bookingDetails.concessions && bookingDetails.concessions.length > 0 && (
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Popcorn className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Đồ ăn & nước uống</p>
                  </div>
                  <div className="space-y-2">
                    {bookingDetails.concessions.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-border/50">
                      <span className="font-medium">Tổng tiền đồ ăn</span>
                      <span className="font-semibold">{bookingDetails.concessionsTotal.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                </div>
              )}

              {hasDiscount && (
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Giảm giá điểm tích lũy</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary font-medium">Điểm đã sử dụng</span>
                    <span className="text-primary font-semibold">-{pointsDiscount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Thông tin khách hàng</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Họ và tên</span>
                    <span className="font-medium">{bookingDetails.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{bookingDetails.customerInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số điện thoại</span>
                    <span className="font-medium">{bookingDetails.customerInfo.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-border">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng thanh toán</span>
                  <div className="text-right">
                    {hasDiscount && (
                      <div className="text-sm text-muted-foreground line-through mb-1">
                        {(bookingDetails.totalPrice + bookingDetails.concessionsTotal).toLocaleString("vi-VN")}đ
                      </div>
                    )}
                    <span className="text-2xl font-bold text-primary">
                      {bookingDetails.grandTotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
                {hasDiscount && (
                  <p className="text-sm text-muted-foreground text-right mt-2">
                    Đã tiết kiệm {pointsDiscount.toLocaleString("vi-VN")}đ
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1" onClick={downloadPDF} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Tải vé PDF
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" className="flex-1 bg-transparent" onClick={sendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi lại email
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-6 bg-muted/50 border border-border/50 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-3">Lưu ý quan trọng</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span>Vui lòng đến rạp trước giờ chiếu ít nhất 15 phút</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span>Mang theo mã đặt vé hoặc email xác nhận khi đến rạp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span>Vé đã đặt không thể hoàn trả hoặc đổi suất chiếu</span>
              </li>
            </ul>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Button variant="ghost" asChild>
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}