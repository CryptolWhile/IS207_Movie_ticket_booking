<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    echo json_encode(["error" => "Kết nối thất bại"]);
    exit;
}

$conn->set_charset("utf8mb4");

// Lấy 5 hoạt động gần nhất (vé & đồ ăn)
$activityQuery = $conn->query("
    SELECT 'Vé' as type, u.name as customer, v.price as amount, v.booking_time as time
    FROM ve_dat v
    JOIN nguoi_dung u ON v.user_id = u.user_id
    WHERE v.payment_status='da_thanh_toan'
    UNION ALL
    SELECT 'Đồ ăn' as type, u.name as customer, SUM(c.quantity*c.unit_price) as amount, h.order_date as time
    FROM chi_tiet_hoa_don_do_an c
    JOIN hoa_don_do_an h ON c.order_id = h.order_id
    JOIN nguoi_dung u ON h.user_id = u.user_id
    GROUP BY h.order_id
    ORDER BY time DESC
    LIMIT 5
");

$activities = [];
while($row = $activityQuery->fetch_assoc()){
    $row['amount'] = number_format($row['amount'])." VNĐ";
    $row['time'] = date('H:i d/m/Y', strtotime($row['time']));
    $activities[] = $row;
}

echo json_encode($activities);
?>
