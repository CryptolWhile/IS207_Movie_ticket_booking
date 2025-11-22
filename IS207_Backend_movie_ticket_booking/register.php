<?php
// Cho phép CORS (nếu frontend Next.js chạy ở localhost:3000)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit();
}

// --- Kết nối MySQL ---
$servername = "localhost"; // dùng IP thay localhost cho macOS
$username = "root";
$password = "khanhphong312"; // nếu MySQL của bạn không có password
$dbname = "cinemax";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die(json_encode(["status" => "error", "message" => "Kết nối database thất bại: " . $conn->connect_error]));
}

// --- Nhận dữ liệu JSON từ frontend ---
$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"] ?? "";
$email = $data["email"] ?? "";
$password_raw = $data["password"] ?? "";
$hashed_password = password_hash($password_raw, PASSWORD_BCRYPT);

// --- Gán mặc định vai trò (VD: 1 = user) ---
$role_id = 1;

// --- Chèn dữ liệu ---
$sql = "INSERT INTO nguoi_dung (name, email, password, role_id) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssi", $name, $email, $hashed_password, $role_id);

if ($stmt->execute()) {
  echo json_encode(["status" => "success", "message" => "Đăng ký thành công!"]);
} else {
  echo json_encode(["status" => "error", "message" => "Email đã tồn tại hoặc lỗi khác: " . $stmt->error]);
}

$stmt->close();

?>
