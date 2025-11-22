<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Chưa đăng nhập"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB Error"]);
    exit;
}

// Query giữ nguyên – bạn viết rất chuẩn rồi!
$sql = "
SELECT t.ticket_id, m.title AS movieTitle, m.poster, c.name AS cinema, 
       s.show_date AS date, s.start_time AS time, 
       GROUP_CONCAT(CONCAT(g.seat_row, g.seat_number) SEPARATOR ', ') AS seats,
       t.price AS total,
       CASE WHEN t.payment_status = 'da_thanh_toan' THEN 'confirmed' ELSE 'pending' END AS status
FROM ve_dat t
JOIN lich_chieu s ON t.showtime_id = s.showtime_id
JOIN phim m ON s.movie_id = m.movie_id
JOIN ghe g ON t.seat_id = g.seat_id
JOIN phong_chieu r ON s.room_id = r.room_id
JOIN rap_chieu_phim c ON r.cinema_id = c.cinema_id
WHERE t.user_id = ?
GROUP BY t.ticket_id
ORDER BY s.show_date DESC, s.start_time DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode($bookings); // ← luôn là mảng, kể cả rỗng []
$conn->close();
?>