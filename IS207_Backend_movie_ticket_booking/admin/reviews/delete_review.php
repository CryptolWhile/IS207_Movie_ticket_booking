<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Nhận dữ liệu từ POST
if (!isset($_POST['review_id'])) {
    echo json_encode(["error" => "Thiếu review_id"]);
    exit;
}

$review_id = $conn->real_escape_string($_POST['review_id']);

// Xóa đánh giá
$sql = "DELETE FROM danh_gia WHERE review_id='$review_id'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Xóa đánh giá thành công"]);
} else {
    echo json_encode(["error" => "Lỗi xóa: " . $conn->error]);
}

$conn->close();
?>
