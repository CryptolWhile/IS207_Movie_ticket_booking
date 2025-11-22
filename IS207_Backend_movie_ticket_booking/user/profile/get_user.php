<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Chưa đăng nhập"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "
SELECT u.user_id, u.name, u.email, u.point, u.avatar, u.bio, r.role_name,
       COUNT(DISTINCT v.ticket_id) AS total_bookings,
       COUNT(DISTINCT d.review_id) AS total_reviews
FROM nguoi_dung u
LEFT JOIN vai_tro r ON u.role_id = r.role_id
LEFT JOIN ve_dat v ON u.user_id = v.user_id
LEFT JOIN danh_gia d ON u.user_id = d.user_id
WHERE u.user_id = $user_id
GROUP BY u.user_id;
";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo json_encode($result->fetch_assoc());
} else {
    echo json_encode(["error" => "Không tìm thấy người dùng"]);
}

$conn->close();
?>
