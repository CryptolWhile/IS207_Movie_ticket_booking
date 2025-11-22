export type RoomType = "A" | "B" | "C" | "D";

export interface RoomTypeInfo {
  type: RoomType;
  name: string;
  description: string;
  rows: number;
  seatsPerRow: number;
  totalSeats: number;
  features: string[];
}

export const ROOM_TYPE_INFO: Record<RoomType, RoomTypeInfo> = {
  A: {
    type: "A",
    name: "Phòng Tiêu Chuẩn Lớn",
    description:
      "Phòng chiếu lớn với công suất cao, phù hợp cho các bộ phim bom tấn",
    rows: 7,
    seatsPerRow: 12,
    totalSeats: 84,
    features: ["Màn hình lớn", "Âm thanh Dolby Atmos", "Ghế thoải mái"],
  },
  B: {
    type: "B",
    name: "Phòng Tiêu Chuẩn",
    description: "Phòng chiếu tiêu chuẩn với công suất vừa phải",
    rows: 5,
    seatsPerRow: 8,
    totalSeats: 40,
    features: ["Màn hình chuẩn", "Âm thanh Dolby Digital", "Ghế thoải mái"],
  },
  C: {
    type: "C",
    name: "Phòng HDmax",
    description: "Phòng chiếu HDmax với công nghệ hình ảnh tiên tiến",
    rows: 6,
    seatsPerRow: 10,
    totalSeats: 60,
    features: [
      "Màn hình HDmax",
      "Độ phân giải cao",
      "Âm thanh Dolby Atmos",
      "Ghế VIP",
    ],
  },
  D: {
    type: "D",
    name: "Phòng 3D",
    description: "Phòng chiếu 3D chuyên biệt với công nghệ 3D hiện đại",
    rows: 6,
    seatsPerRow: 10,
    totalSeats: 60,
    features: [
      "Công nghệ 3D",
      "Kính 3D chất lượng cao",
      "Âm thanh Dolby Atmos",
      "Ghế thoải mái",
    ],
  },
};

export function generateSeatMap(roomType: RoomType): string[][] {
  const info = ROOM_TYPE_INFO[roomType];
  const seats: string[][] = [];

  const rowLabels = ["A", "B", "C", "D", "E", "F", "G"];

  for (let i = 0; i < info.rows; i++) {
    const row: string[] = [];
    for (let j = 1; j <= info.seatsPerRow; j++) {
      row.push(`${rowLabels[i]}${j}`);
    }
    seats.push(row);
  }

  return seats;
}

export function getRoomTypeDescription(roomType: RoomType): string {
  return ROOM_TYPE_INFO[roomType].description;
}

export function getRoomTypeFeatures(roomType: RoomType): string[] {
  return ROOM_TYPE_INFO[roomType].features;
}
