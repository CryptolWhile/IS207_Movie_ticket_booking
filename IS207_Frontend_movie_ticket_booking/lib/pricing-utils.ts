export const TICKET_PRICES_BY_ROOM = {
  A: {
    adult: 90000,
    student: 45000,
  },
  B: {
    adult: 90000,
    student: 45000,
  },
  C: {
    adult: 120000,
    student: 65000,
  },
  D: {
    adult: 135000,
    student: 80000,
  },
}

export function getTicketPrices(roomType: "A" | "B" | "C" | "D") {
  return TICKET_PRICES_BY_ROOM[roomType]
}
