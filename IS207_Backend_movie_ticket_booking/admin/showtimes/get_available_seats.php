<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$showtime_id = $_GET['showtime_id'] ?? null;
if (!$showtime_id) {
  echo json_encode(["error" => "Thiếu showtime_id"]);
  exit;
}

// Đếm số vé đã đặt (trừ các vé bị huỷ)
$sql = "
SELECT COUNT(*) AS booked 
FROM ve_dat 
WHERE showtime_id = '$showtime_id' 
  AND payment_status != 'huy'
";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$booked = (int)$row['booked'];

// Lấy tổng số ghế của phòng chiếu
$sql2 = "
SELECT pc.total_seats 
FROM lich_chieu lc
JOIN phong_chieu pc ON lc.room_id = pc.room_id
WHERE lc.showtime_id = '$showtime_id'
";
$res2 = $conn->query($sql2);
$total = ($res2 && $res2->num_rows > 0) ? (int)$res2->fetch_assoc()['total_seats'] : 0;

// Tính số ghế trống
$available = max(0, $total - $booked);

echo json_encode(["available" => $available], JSON_UNESCAPED_UNICODE);
$conn->close();
?>
