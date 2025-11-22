<?php
// CORS cho fetch với credentials
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

session_start();

// Kết nối DB
$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Kết nối thất bại: " . $conn->connect_error
    ]));
}

// Xử lý preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Lấy dữ liệu từ form POST
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode([
        "status" => "error",
        "message" => "Thiếu email hoặc mật khẩu"
    ]);
    exit;
}

// Lấy user từ DB (join role)
$stmt = $conn->prepare("
    SELECT u.user_id, u.name, u.email, u.password, u.role_id, u.bio, u.created_at, r.role_name
    FROM nguoi_dung u
    LEFT JOIN vai_tro r ON u.role_id = r.role_id
    WHERE u.email = ?
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Email không tồn tại"
    ]);
    exit;
}

$user = $result->fetch_assoc();

// So sánh mật khẩu hash
if (password_verify($password, $user['password'])) {
    // Lưu session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['role_id'] = $user['role_id'];

    // Trả về thông tin user (không trả password)
    echo json_encode([
        "status" => "success",
        "message" => "Đăng nhập thành công!",
        "user" => [
            "user_id" => $user['user_id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role_id" => $user['role_id'],
            "role_name" => $user['role_name'],
            "bio" => $user['bio'],
            "created_at" => $user['created_at']
        ]
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Sai mật khẩu"
    ]);
}
