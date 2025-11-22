"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { getTicketPrices } from "@/lib/pricing-utils"

interface InvoiceData {
  type: "ticket" | "concession" | "both"
  invoiceNumber: string
  date: string
  branch?: string
  movie?: {
    title: string
    showtime: string
    room: string
    seats: string[]
    adultTickets: number
    childTickets: number
    roomType?: string
  }
  items?: {
    name: string
    quantity: number
    price: number
  }[]
  customer?: {
    name: string
    phone: string
    email?: string
  }
  ticketsTotal?: number
  concessionsTotal?: number
  grandTotal: number
}

export default function StaffInvoice() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)

  useEffect(() => {
    // Get invoice data from sessionStorage
    const data = sessionStorage.getItem("invoiceData")
    if (data) {
      setInvoiceData(JSON.parse(data))
    } else {
      // Mock data for preview
      setInvoiceData({
        type: "both",
        invoiceNumber: "INV-2025-0001",
        date: new Date().toLocaleString("vi-VN"),
        branch: "Hồ Chí Minh",
        movie: {
          title: "Godzilla: King of the Monsters",
          showtime: "19:00 - 10/02/2025",
          room: "A1",
          seats: ["A5", "A6"],
          adultTickets: 1,
          childTickets: 1,
          roomType: "C", // ← đổi loại phòng ở đây để test giá
        },
        items: [
          { name: "Combo 1 (Bắp M + Nước M)", quantity: 2, price: 70000 },
          { name: "Nước ngọt (L)", quantity: 1, price: 45000 },
        ],
        customer: {
          name: "Nguyễn Văn A",
          phone: "0901234567",
        },
        ticketsTotal: 0, // sẽ được tính tự động ở dưới
        concessionsTotal: 185000,
        grandTotal: 0, // sẽ cập nhật động
      })
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Đang tải hóa đơn...</p>
      </div>
    )
  }

  // 👉 Lấy giá vé theo loại phòng
  const ticketPrices = invoiceData.movie?.roomType
    ? getTicketPrices(invoiceData.movie.roomType as "A" | "B" | "C" | "D")
    : { adult: 90000, student: 45000 }

  const adultPrice = ticketPrices.adult
  const studentPrice = ticketPrices.student
  const adultTickets = invoiceData.movie?.adultTickets || 0
  const childTickets = invoiceData.movie?.childTickets || 0

  // 👉 Tính lại tổng tiền vé
  const calculatedTicketsTotal = adultTickets * adultPrice + childTickets * studentPrice
  const concessionsTotal = invoiceData.concessionsTotal || 0
  const grandTotal = calculatedTicketsTotal + concessionsTotal

  return (
    <div className="min-h-screen bg-background">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Hóa đơn</h1>
            <div className="flex gap-3">
              <Button onClick={handlePrint} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Printer className="mr-2 h-4 w-4" />
                In hóa đơn
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Tải PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-12 print:rounded-none print:shadow-none">
          {/* Header */}
          <div className="border-b-2 border-black pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">CinemaStaff</h1>
                <p className="text-gray-600">Hệ thống rạp chiếu phim</p>
                {invoiceData.branch && <p className="text-gray-600">Chi nhánh: {invoiceData.branch}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold mb-1">HÓA ĐƠN</p>
                <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
                <p className="text-gray-600">{invoiceData.date}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {invoiceData.customer?.name && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-2">Thông tin khách hàng</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="mb-1">
                  <span className="font-medium">Họ tên:</span> {invoiceData.customer.name}
                </p>
                {invoiceData.customer.phone && (
                  <p className="mb-1">
                    <span className="font-medium">Số điện thoại:</span> {invoiceData.customer.phone}
                  </p>
                )}
                {invoiceData.customer.email && (
                  <p>
                    <span className="font-medium">Email:</span> {invoiceData.customer.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Movie Tickets */}
          {invoiceData.movie && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Thông tin vé phim</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="mb-1">
                  <span className="font-medium">Phim:</span> {invoiceData.movie.title}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Suất chiếu:</span> {invoiceData.movie.showtime}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Phòng:</span> {invoiceData.movie.room}
                </p>
                {invoiceData.movie.roomType && (
                  <p className="mb-1">
                    <span className="font-medium">Loại phòng:</span> {invoiceData.movie.roomType}
                  </p>
                )}
                <p>
                  <span className="font-medium">Ghế:</span> {invoiceData.movie.seats.join(", ")}
                </p>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2">Mô tả</th>
                    <th className="text-center py-2">Số lượng</th>
                    <th className="text-right py-2">Đơn giá</th>
                    <th className="text-right py-2">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {adultTickets > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3">Vé xem phim - Người lớn</td>
                      <td className="text-center py-3">{adultTickets}</td>
                      <td className="text-right py-3">{adultPrice.toLocaleString()} VNĐ</td>
                      <td className="text-right py-3 font-medium">
                        {(adultTickets * adultPrice).toLocaleString()} VNĐ
                      </td>
                    </tr>
                  )}
                  {childTickets > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3">Vé xem phim - Trẻ em / Sinh viên</td>
                      <td className="text-center py-3">{childTickets}</td>
                      <td className="text-right py-3">{studentPrice.toLocaleString()} VNĐ</td>
                      <td className="text-right py-3 font-medium">
                        {(childTickets * studentPrice).toLocaleString()} VNĐ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Concessions */}
          {invoiceData.items && invoiceData.items.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Đồ ăn & Uống</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2">Sản phẩm</th>
                    <th className="text-center py-2">Số lượng</th>
                    <th className="text-right py-2">Đơn giá</th>
                    <th className="text-right py-2">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3">{item.name}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">{item.price.toLocaleString()} VNĐ</td>
                      <td className="text-right py-3 font-medium">
                        {(item.price * item.quantity).toLocaleString()} VNĐ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total */}
          <div className="border-t-2 border-black pt-4">
            {calculatedTicketsTotal > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tổng tiền vé:</span>
                <span className="font-medium">{calculatedTicketsTotal.toLocaleString()} VNĐ</span>
              </div>
            )}
            {concessionsTotal > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tổng tiền đồ ăn:</span>
                <span className="font-medium">{concessionsTotal.toLocaleString()} VNĐ</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold mt-4">
              <span>TỔNG CỘNG:</span>
              <span>{grandTotal.toLocaleString()} VNĐ</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-600">
            <p className="mb-2">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
            <p className="text-sm">Hotline: 1900-xxxx | Email: support@cinemastaff.vn</p>
          </div>
        </div>
      </div>
    </div>
  )
}