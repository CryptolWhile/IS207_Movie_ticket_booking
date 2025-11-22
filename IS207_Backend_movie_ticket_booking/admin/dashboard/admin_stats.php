<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost","root","khanhphong312","cinemax");
if($conn->connect_error){ die(json_encode(["error"=>"DB error"])); }

// Tổng số phim
$movie = $conn->query("SELECT COUNT(*) AS total FROM phim")->fetch_assoc()['total'];

// Xuất chiếu hôm nay
$show = $conn->query("SELECT COUNT(*) AS total FROM lich_chieu WHERE show_date = CURDATE()")->fetch_assoc()['total'];

// Đánh giá mới 7 ngày qua
$review = $conn->query("
    SELECT COUNT(*) AS total 
    FROM danh_gia 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
")->fetch_assoc()['total'];

// Vé đã bán (đã thanh toán)
$ticket = $conn->query("
    SELECT COUNT(*) AS total 
    FROM ve_dat 
    WHERE payment_status='da_thanh_toan'
")->fetch_assoc()['total'];

echo json_encode([
    ["name"=>"Tổng số phim","value"=>$movie,"change"=>"+3 tuần này","icon"=>"Film","trend"=>"up"],
    ["name"=>"Xuất chiếu hôm nay","value"=>$show,"change"=>"12 rạp","icon"=>"Calendar","trend"=>"neutral"],
    ["name"=>"Đánh giá mới","value"=>$review,"change"=>"+12% so với tuần trước","icon"=>"Star","trend"=>"up"],
    ["name"=>"Vé đã bán","value"=>$ticket,"change"=>"+18% so với tuần trước","icon"=>"Users","trend"=>"up"]
], JSON_UNESCAPED_UNICODE);
$conn->close();
