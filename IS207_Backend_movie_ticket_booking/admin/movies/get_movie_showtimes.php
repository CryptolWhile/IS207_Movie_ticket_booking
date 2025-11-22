<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$movie_id = $_GET['movie_id'] ?? '';
if (!$movie_id) {
  echo json_encode(["error" => "Thiếu movie_id"]);
  exit;
}

$sql = "
  SELECT lc.showtime_id, lc.show_date, lc.start_time, lc.end_time, lc.available_seats,
         pc.name AS room_name, pc.room_type,
         rcp.name AS cinema_name
  FROM lich_chieu lc
  JOIN phong_chieu pc ON lc.room_id = pc.room_id
  JOIN rap_chieu_phim rcp ON pc.cinema_id = rcp.cinema_id
  WHERE lc.movie_id = '$movie_id'
  ORDER BY lc.show_date ASC, lc.start_time ASC
";

$result = $conn->query($sql);
$showtimes = [];

if ($result && $result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $showtimes[] = $row;
  }
}

echo json_encode($showtimes);
$conn->close();
?>
