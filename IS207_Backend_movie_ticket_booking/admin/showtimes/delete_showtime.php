<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data["showtime_id"])) {
  echo json_encode(["error" => "Thiếu mã lịch chiếu"]);
  exit;
}

$showtime_id = $data["showtime_id"];
$sql = "DELETE FROM lich_chieu WHERE showtime_id='$showtime_id'";

if ($conn->query($sql) === TRUE) {
  echo json_encode(["message" => "Xóa lịch chiếu thành công"]);
} else {
  echo json_encode(["error" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>
