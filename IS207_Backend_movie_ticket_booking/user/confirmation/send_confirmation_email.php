<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$to = $data['email'];
$subject = "Xác nhận đặt vé CineMax - {$data['bookingId']}";

$message = "
<h2>Xác nhận đặt vé thành công!</h2>
<p><strong>Mã đặt vé:</strong> {$data['bookingId']}</p>
<p><strong>Phim:</strong> {$data['movie']}</p>
<p><strong>Suất chiếu:</strong> {$data['showtime']}</p>
<p><strong>Ghế:</strong> {$data['seats']}</p>
<p><strong>Tổng tiền:</strong> " . number_format($data['total']) . "đ</p>
<p>Cảm ơn quý khách!</p>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type:text/html;charset=UTF-8\r\n";
$headers .= "From: no-reply@cinemax.com";

if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Gửi email thất bại']);
}
?>