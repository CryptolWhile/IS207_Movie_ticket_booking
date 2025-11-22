<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// ===== Kết nối MySQL =====
$servername = "localhost";
$username = "root";
$password = "khanhphong312";
$dbname = "cinemax";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);
$movie_id = (int)($data["movie_id"] ?? 0);

$sql = "DELETE FROM phim WHERE movie_id=$movie_id";

if ($conn->query($sql) === TRUE) {
  echo json_encode(["message" => "Xóa phim thành công"]);
} else {
  echo json_encode(["error" => $conn->error]);
}

$conn->close();
