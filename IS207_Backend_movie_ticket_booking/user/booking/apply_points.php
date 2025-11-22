<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Code for apply_points.php
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['pointsToUse'])) {
  echo json_encode(['error' => 'Dữ liệu không đầy đủ']);
  exit;
}

$points_to_use = $data['pointsToUse'];

// Giả định user_id từ session hoặc từ data (thêm nếu cần, ví dụ từ email)
$email = $data['email'] ?? ''; // Nếu frontend gửi email

$stmt = $conn->prepare("SELECT user_id, point FROM nguoi_dung WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->bind_result($user_id, $current_points);
if (!$stmt->fetch()) {
  echo json_encode(['error' => 'Không tìm thấy user']);
  $stmt->close();
  exit;
}
$stmt->close();

if ($points_to_use > $current_points) {
  echo json_encode(['error' => 'Điểm không đủ']);
  exit;
}

// Trừ điểm
$new_points = $current_points - $points_to_use;
$update_points = $conn->prepare("UPDATE nguoi_dung SET point = ? WHERE user_id = ?");
$update_points->bind_param("ii", $new_points, $user_id);
$update_points->execute();
$update_points->close();

echo json_encode(['success' => true, 'new_points' => $new_points]);

$conn->close();
?>