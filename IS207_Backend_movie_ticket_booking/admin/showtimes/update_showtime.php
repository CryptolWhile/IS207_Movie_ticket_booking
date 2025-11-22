<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data["showtime_id"])) {
  echo json_encode(["error" => "Thiếu mã lịch chiếu"]);
  exit;
}

$showtime_id = $data["showtime_id"];
$movie_id = $data["movie_id"];
$room_id = $data["room_id"];
$show_date = $data["show_date"];
$start_time = $data["start_time"];
$end_time = $data["end_time"];
$available_seats = $data["available_seats"];

$sql = "
  UPDATE lich_chieu
  SET movie_id='$movie_id',
      room_id='$room_id',
      show_date='$show_date',
      start_time='$start_time',
      end_time='$end_time',
      available_seats='$available_seats'
  WHERE showtime_id='$showtime_id'
";

if ($conn->query($sql) === TRUE) {
  echo json_encode(["message" => "Cập nhật lịch chiếu thành công"]);
} else {
  echo json_encode(["error" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>
