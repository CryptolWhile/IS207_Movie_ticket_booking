<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Lấy đầy đủ thông tin rạp chiếu phim theo đúng cấu trúc CSDL
$result = $conn->query("SELECT cinema_id, name, city, total_rooms FROM rap_chieu_phim");

$cinemas = [];
if ($result && $result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $cinemas[] = $row;
  }
}

echo json_encode($cinemas, JSON_UNESCAPED_UNICODE);
$conn->close();
?>
