<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$showtime_id = $_GET['showtime_id'] ?? '';
if (!$showtime_id) {
  echo json_encode(["error" => "Thiếu showtime_id"]);
  exit;
}

$sql = "
  SELECT lc.*, 
         p.title AS movie_title, p.poster, p.duration,
         pc.name AS room_name, pc.room_type, pc.total_seats,
         rcp.name AS cinema_name
  FROM lich_chieu lc
  JOIN phim p ON lc.movie_id = p.movie_id
  JOIN phong_chieu pc ON lc.room_id = pc.room_id
  JOIN rap_chieu_phim rcp ON pc.cinema_id = rcp.cinema_id
  WHERE lc.showtime_id = '$showtime_id'
  LIMIT 1
";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
  echo json_encode($result->fetch_assoc());
} else {
  echo json_encode(["error" => "Không tìm thấy xuất chiếu"]);
}

$conn->close();
?>
