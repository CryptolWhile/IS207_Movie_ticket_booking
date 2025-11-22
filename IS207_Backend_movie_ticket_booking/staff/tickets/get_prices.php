<?php
// public/staff/api/get_prices.php?room_type=B
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$room_type = $_GET['room_type'] ?? 'B';

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) die(json_encode(["adult" => 90000, "student" => 45000]));

$result = $conn->query("SELECT ticket_type, price FROM gia_phong WHERE room_type = '$room_type'");
$prices = ["adult" => 90000, "student" => 45000];

while ($row = $result->fetch_assoc()) {
    if ($row['ticket_type'] === 'adult') $prices['adult'] = (int)$row['price'];
    if ($row['ticket_type'] === 'student') $prices['student'] = (int)$row['price'];
}

echo json_encode($prices);
?>