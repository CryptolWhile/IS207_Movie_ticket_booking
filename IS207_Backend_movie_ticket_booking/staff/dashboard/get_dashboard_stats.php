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

$today = date('Y-m-d');

// Vé bán hôm nay
$ticketQuery = $conn->query("SELECT COUNT(*) as total_tickets FROM ve_dat WHERE DATE(booking_time) = '$today' AND payment_status='da_thanh_toan'");
$tickets = $ticketQuery->fetch_assoc();

// Hóa đơn hôm nay
$invoiceQuery = $conn->query("SELECT COUNT(*) as total_invoices FROM hoa_don_do_an WHERE DATE(order_date) = '$today'");
$invoices = $invoiceQuery->fetch_assoc();

// Đồ ăn bán hôm nay
$foodQuery = $conn->query("SELECT SUM(c.quantity) as total_food
    FROM chi_tiet_hoa_don_do_an c
    JOIN hoa_don_do_an h ON c.order_id = h.order_id
    WHERE DATE(h.order_date) = '$today'");
$food = $foodQuery->fetch_assoc();

// Tổng doanh thu
$revenueQuery = $conn->query("
    SELECT 
    IFNULL((SELECT SUM(price) FROM ve_dat WHERE payment_status='da_thanh_toan' AND DATE(booking_time)='$today'),0) +
    IFNULL((SELECT SUM(c.quantity*c.unit_price) FROM chi_tiet_hoa_don_do_an c 
        JOIN hoa_don_do_an h ON c.order_id = h.order_id
        WHERE DATE(h.order_date)='$today'),0) as total_revenue
");
$revenue = $revenueQuery->fetch_assoc();

echo json_encode([
    'tickets_sold' => intval($tickets['total_tickets']),
    'food_sold' => intval($food['total_food']),
    'total_revenue' => number_format($revenue['total_revenue'])." VNĐ",
    'invoices_today' => intval($invoices['total_invoices']),
]);
?>
