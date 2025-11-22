<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    echo json_encode(["error" => "Kết nối thất bại"]);
    exit;
}

$sql = "SELECT snack_id, name, description, price, category FROM do_an ORDER BY category ASC";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $row['price'] = floatval($row['price']);
    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "message" => "Lấy danh sách đồ ăn thành công",
    "data" => $data
]);

$conn->close();
