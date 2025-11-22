<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "Kết nối thất bại"]);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true);

if (!$body) {
    echo json_encode(["status" => false, "message" => "Không nhận được dữ liệu"]);
    exit;
}

$grandTotal = $body["grandTotal"];
$items = $body["items"];

// Lưu order
$stmt = $conn->prepare("INSERT INTO hoa_don_do_an (total_amount) VALUES (?)");
$stmt->bind_param("d", $grandTotal);
$stmt->execute();
$order_id = $stmt->insert_id;

// Lưu item
$stmt2 = $conn->prepare(
    "INSERT INTO chi_tiet_hoa_don_do_an (order_id, snack_id, quantity, unit_price) VALUES (?, ?, ?, ?)"
);

foreach ($items as $item) {
    $stmt2->bind_param("ssid", $order_id, $item["snack_id"], $item["quantity"], $item["price"]);
    $stmt2->execute();
}


echo json_encode([
    "status" => true,
    "message" => "Tạo hóa đơn bán đồ ăn thành công",
    "order_id" => $order_id
]);

$conn->close();
