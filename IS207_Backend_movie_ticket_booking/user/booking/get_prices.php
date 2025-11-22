<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

if (!isset($_GET['room_type'])) {
  echo json_encode(["error" => "Thiếu room_type"]);
  exit;
}

$room_type = $_GET['room_type'];

$stmt = $conn->prepare("SELECT ticket_type, price FROM gia_phong WHERE room_type = ?");
$stmt->bind_param("s", $room_type);
$stmt->execute();
$result = $stmt->get_result();
$prices = [];
while ($row = $result->fetch_assoc()) {
  $prices[$row['ticket_type']] = (float)$row['price'];
}
echo json_encode($prices);
$stmt->close();
$conn->close();
?>