<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Kết nối thất bại"]);
    exit;
}

$stmt = $conn->prepare("SELECT snack_id AS id, name, description, price, category FROM do_an");
$stmt->execute();
$result = $stmt->get_result();
$concessions = [];

while ($row = $result->fetch_assoc()) {
    $row['id'] = (string)$row['id']; // ÉP KIỂU STRING
    $concessions[] = $row;
}

echo json_encode($concessions);
$stmt->close();
$conn->close();
?>