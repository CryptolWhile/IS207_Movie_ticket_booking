<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "
  SELECT 
    lc.showtime_id,
    lc.movie_id,
    lc.room_id,
    lc.show_date,
    lc.start_time,
    lc.end_time,
    lc.available_seats,
    p.title AS movie_title,
    p.poster,
    p.duration,
    pc.name AS room_name,
    pc.total_seats,
    rcp.name AS cinema_name,
    rcp.city AS city         
  FROM lich_chieu lc
  JOIN phim p ON lc.movie_id = p.movie_id
  JOIN phong_chieu pc ON lc.room_id = pc.room_id
  JOIN rap_chieu_phim rcp ON pc.cinema_id = rcp.cinema_id
  ORDER BY lc.show_date DESC, lc.start_time ASC
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
