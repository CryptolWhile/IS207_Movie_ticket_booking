<?php
// public/staff/api/get_concessions.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) die(json_encode([]));

$result = $conn->query("SELECT snack_id as id, name, description, price, category FROM do_an ORDER BY name");
$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}
echo json_encode($items);
?>