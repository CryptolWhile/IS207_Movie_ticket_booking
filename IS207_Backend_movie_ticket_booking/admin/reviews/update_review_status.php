<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$review_id = isset($_POST['review_id']) ? $conn->real_escape_string($_POST['review_id']) : '';
$status    = isset($_POST['status'])    ? $conn->real_escape_string($_POST['status'])    : '';

if (!$review_id || !$status) {
    echo json_encode(["error" => "Thiếu review_id hoặc status"]);
    exit;
}

$sql = "UPDATE danh_gia SET status='$status' WHERE review_id='$review_id'";

if ($conn->query($sql)) {
    echo json_encode(["success" => "Cập nhật trạng thái thành công"]);
} else {
    echo json_encode(["error" => "Lỗi cập nhật: " . $conn->error]);
}

$conn->close();
?>
