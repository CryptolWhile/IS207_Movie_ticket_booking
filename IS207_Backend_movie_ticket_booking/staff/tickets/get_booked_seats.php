    <?php
// public/staff/api/get_booked_seats.php?showtime_id=ST0001
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$showtime_id = $_GET['showtime_id'] ?? '';

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error || !$showtime_id) die(json_encode(["bookedSeats" => []]));

$result = $conn->query("
    SELECT g.seat_row, g.seat_number 
    FROM ve_dat v
    JOIN ghe g ON v.seat_id = g.seat_id
    WHERE v.showtime_id = '$showtime_id' 
      AND v.payment_status IN ('chua_thanh_toan', 'da_thanh_toan')
");

$seats = [];
while ($row = $result->fetch_assoc()) {
    $seats[] = $row['seat_row'] . $row['seat_number']; // VD: A1, B12
}
echo json_encode(["bookedSeats" => $seats]);
?>