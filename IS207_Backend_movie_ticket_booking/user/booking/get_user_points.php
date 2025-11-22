<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email'])) {
  echo json_encode(["error" => "Thiếu email"]);
  exit;
}

$email = $data['email'];

$stmt = $conn->prepare("SELECT point FROM nguoi_dung WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->bind_result($point);
if ($stmt->fetch()) {
  echo json_encode(["point" => (int)$point]);
} else {
  echo json_encode(["point" => 0]);
}
$stmt->close();
$conn->close();
?>