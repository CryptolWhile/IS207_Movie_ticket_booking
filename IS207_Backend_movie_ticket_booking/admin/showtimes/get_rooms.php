<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "
SELECT 
  pc.room_id,
  pc.name,
  pc.room_type,
  pc.row_count,
  pc.seats_per_row,
  pc.total_seats,
  pc.description,
  rcp.city AS branch
FROM phong_chieu pc
JOIN rap_chieu_phim rcp ON pc.cinema_id = rcp.cinema_id
";

$result = $conn->query($sql);

$rooms = [];
if ($result && $result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $rooms[] = $row;
  }
}

echo json_encode($rooms, JSON_UNESCAPED_UNICODE);
$conn->close();
?>
