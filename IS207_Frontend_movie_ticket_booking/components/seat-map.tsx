"use client"
import { type RoomType, ROOM_TYPE_INFO, generateSeatMap } from "@/lib/seat-map-utils"

interface SeatMapProps {
  roomType: RoomType
  occupiedSeats?: string[]
  selectedSeats?: string[]
  onSeatClick?: (seat: string) => void
  disabled?: boolean
  showLegend?: boolean
}

export function SeatMap({
  roomType,
  occupiedSeats = [],
  selectedSeats = [],
  onSeatClick,
  disabled = false,
  showLegend = true,
}: SeatMapProps) {
  const seats = generateSeatMap(roomType)
  const roomInfo = ROOM_TYPE_INFO[roomType]

  const handleSeatClick = (seat: string) => {
    if (!disabled && !occupiedSeats.includes(seat) && onSeatClick) {
      onSeatClick(seat)
    }
  }

  return (
    <div className="space-y-6">
      {/* Room Type Info */}
      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-1">{roomInfo.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{roomInfo.description}</p>
        <div className="flex flex-wrap gap-2">
          {roomInfo.features.map((feature) => (
            <span key={feature} className="px-2 py-1 bg-background text-xs rounded border border-border">
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Screen */}
      <div className="text-center">
        <div className="inline-block px-50 py-2 bg-muted rounded-t-full border-t-2 border-x-2 border-border">
          <span className="text-sm font-medium text-muted-foreground">Màn hình</span>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="space-y-2">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((seat) => {
              const isOccupied = occupiedSeats.includes(seat)
              const isSelected = selectedSeats.includes(seat)

              return (
                <button
                  key={seat}
                  onClick={() => handleSeatClick(seat)}
                  disabled={isOccupied || disabled}
                  className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${
                    isOccupied
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border-2 border-border hover:border-primary"
                  }`}
                  title={seat}
                >
                  {seat}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-background border-2 border-border" />
            <span className="text-sm text-muted-foreground">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary" />
            <span className="text-sm text-muted-foreground">Đã chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Đã đặt</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeatMap
