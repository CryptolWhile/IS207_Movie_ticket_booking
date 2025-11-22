<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$showtime_id = $_GET['showtime_id'] ?? '';

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "
SELECT g.seat_id, g.seat_row, g.seat_number, g.seat_type,
       IF(v.ticket_id IS NULL, 'available', 'booked') AS status
FROM ghe g
JOIN phong_chieu pc ON pc.room_id = g.room_id
LEFT JOIN ve_dat v ON v.seat_id = g.seat_id AND v.showtime_id = '$showtime_id'
ORDER BY g.seat_row, g.seat_number
";

$result = $conn->query($sql);
$seats = [];
while($row = $result->fetch_assoc()){
    $seats[] = $row;
}

echo json_encode($seats);
$conn->close();
?>
