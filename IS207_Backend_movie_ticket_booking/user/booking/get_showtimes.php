<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

if (!isset($_GET['movie_id'])) {
  echo json_encode(["error" => "Thiếu movie_id"]);
  exit;
}

$movie_id = $_GET['movie_id'];

$stmt = $conn->prepare("
  SELECT l.showtime_id AS id, r.city AS branch, l.start_time AS time, l.show_date AS date, p.room_id AS room, p.room_type AS roomType
  FROM lich_chieu l
  JOIN phong_chieu p ON l.room_id = p.room_id
  JOIN rap_chieu_phim r ON p.cinema_id = r.cinema_id
  WHERE l.movie_id = ?
");
$stmt->bind_param("i", $movie_id);
$stmt->execute();
$result = $stmt->get_result();
$showtimes = [];
while ($row = $result->fetch_assoc()) {
  $showtimes[] = $row;
}
echo json_encode($showtimes);
$stmt->close();
$conn->close();
?>