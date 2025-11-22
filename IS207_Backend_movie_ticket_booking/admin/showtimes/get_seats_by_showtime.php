<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => $conn->connect_error]));
}

$showtime_id = $_GET['showtime_id'] ?? null;
if (!$showtime_id) {
    echo json_encode(["error" => "Thiếu showtime_id"]);
    exit;
}

// Lấy ghế đã đặt và giá
$sql = "
SELECT v.seat_id, v.payment_status, v.ticket_type, g.seat_row, g.seat_number, gp.price
FROM ve_dat v
JOIN ghe g ON v.seat_id = g.seat_id
JOIN phong_chieu pc ON g.room_id = pc.room_id
JOIN gia_phong gp ON pc.room_type = gp.room_type AND v.ticket_type = gp.ticket_type
WHERE v.showtime_id = '$showtime_id'
";
$result = $conn->query($sql);

$occupiedSeats = [];
$pendingSeats = [];
$revenue = 0;

while ($row = $result->fetch_assoc()) {
    $seatCode = $row['seat_row'] . $row['seat_number']; // VD: "A1"
    if ($row['payment_status'] === 'da_thanh_toan') {
        $occupiedSeats[] = $seatCode;
        $revenue += (float)$row['price'];
    } else if ($row['payment_status'] === 'chua_thanh_toan') {
        $pendingSeats[] = $seatCode;
    }
}

echo json_encode([
    "occupiedSeats" => $occupiedSeats,
    "pendingSeats" => $pendingSeats,
    "revenue" => $revenue
], JSON_UNESCAPED_UNICODE);

$conn->close();
?>
