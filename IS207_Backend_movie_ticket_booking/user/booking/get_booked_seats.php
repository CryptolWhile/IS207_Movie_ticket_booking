<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    echo json_encode(["error" => "Kết nối thất bại"]);
    exit;
}

$showtime_id = $_GET['showtime_id'] ?? '';

if (!$showtime_id) {
    echo json_encode(["error" => "Thiếu showtime_id"]);
    exit;
}

// Lấy tất cả seat_id đã đặt (chỉ lấy ghế có payment_status = 'chua_thanh_toan' HOẶC 'da_thanh_toan')
$stmt = $conn->prepare("
    SELECT g.seat_row, g.seat_number 
    FROM ve_dat vd
    JOIN ghe g ON vd.seat_id = g.seat_id
    WHERE vd.showtime_id = ?
    AND vd.payment_status IN ('chua_thanh_toan', 'da_thanh_toan')
");
$stmt->bind_param("s", $showtime_id);
$stmt->execute();
$result = $stmt->get_result();

$bookedSeats = [];
while ($row = $result->fetch_assoc()) {
    $bookedSeats[] = $row['seat_row'] . $row['seat_number']; // A1, B2, ...
}

echo json_encode(["bookedSeats" => $bookedSeats]);
$stmt->close();
$conn->close();
?>