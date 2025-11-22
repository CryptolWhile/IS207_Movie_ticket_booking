// This file stores all booked seats for each showtime
// Format: { showtimeId: ["A1", "A2", "B5", ...] }

export type SeatBookingData = Record<string, string[]>

// Centralized seat booking data for all showtimes
// Key: showtime ID, Value: array of booked seat IDs
export const seatBookings: SeatBookingData = {
  // Example data - in production, this would come from a database
  ST0001: ["A3","A1","A2", "B5", "C2", "D7", "E4", "G12"],
  ST0002: ["A1", "A2", "B1", "B2", "C1"],
  ST0003: ["D1", "D2", "D3", "E1", "E2", "E5"],
  ST0004: ["A5", "B3", "C4"],
  ST0005: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "B1", "B2"],
  ST0006: ["C3", "C4", "C5", "D4", "D5"],
  ST0007: ["B4", "B5", "B6", "B7"],
  ST0008: ["A2", "A4", "A6", "A8"],
}

/**
 * Get booked seats for a specific showtime
 * @param showtimeId - The ID of the showtime
 * @returns Array of booked seat IDs
 */
export function getBookedSeats(showtimeId: string): string[] {
  return seatBookings[showtimeId] || []
}

/**
 * Add a booked seat to a showtime
 * @param showtimeId - The ID of the showtime
 * @param seatId - The seat ID to book
 */
export function addBookedSeat(showtimeId: string, seatId: string): void {
  if (!seatBookings[showtimeId]) {
    seatBookings[showtimeId] = []
  }
  if (!seatBookings[showtimeId].includes(seatId)) {
    seatBookings[showtimeId].push(seatId)
  }
}

/**
 * Add multiple booked seats to a showtime
 * @param showtimeId - The ID of the showtime
 * @param seatIds - Array of seat IDs to book
 */
export function addBookedSeats(showtimeId: string, seatIds: string[]): void {
  if (!seatBookings[showtimeId]) {
    seatBookings[showtimeId] = []
  }
  seatIds.forEach((seatId) => {
    if (!seatBookings[showtimeId].includes(seatId)) {
      seatBookings[showtimeId].push(seatId)
    }
  })
}

/**
 * Remove a booked seat from a showtime
 * @param showtimeId - The ID of the showtime
 * @param seatId - The seat ID to remove
 */
export function removeBookedSeat(showtimeId: string, seatId: string): void {
  if (seatBookings[showtimeId]) {
    seatBookings[showtimeId] = seatBookings[showtimeId].filter((s) => s !== seatId)
  }
}

/**
 * Get the number of available seats for a showtime
 * @param showtimeId - The ID of the showtime
 * @param totalSeats - Total number of seats in the room (default: 40)
 * @returns Number of available seats
 */
export function getAvailableSeatsCount(showtimeId: string, totalSeats = 40): number {
  const bookedCount = getBookedSeats(showtimeId).length
  return Math.max(0, totalSeats - bookedCount)
}

/**
 * Check if a seat is booked
 * @param showtimeId - The ID of the showtime
 * @param seatId - The seat ID to check
 * @returns True if the seat is booked, false otherwise
 */
export function isSeatBooked(showtimeId: string, seatId: string): boolean {
  return getBookedSeats(showtimeId).includes(seatId)
}

/**
 * Clear all booked seats for a showtime (for testing/admin purposes)
 * @param showtimeId - The ID of the showtime
 */
export function clearBookedSeats(showtimeId: string): void {
  seatBookings[showtimeId] = []
}

/**
 * Get all booked seats data
 * @returns The entire seat bookings object
 */
export function getAllBookedSeats(): SeatBookingData {
  return { ...seatBookings }
}
