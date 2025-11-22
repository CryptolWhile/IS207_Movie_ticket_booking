<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Lấy tất cả đánh giá và thông tin người dùng
$sql = "SELECT 
          dg.review_id,
          dg.movie_id,
          dg.user_id,
          dg.rating,
          dg.comment,
          dg.created_at,
          dg.status,
          nd.name AS user_name,
          nd.avatar AS user_avatar
        FROM danh_gia dg
        LEFT JOIN nguoi_dung nd ON dg.user_id = nd.user_id
        ORDER BY dg.created_at DESC";

$result = $conn->query($sql);

$reviews = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        // đảm bảo avatar không null
        $row['user_avatar'] = $row['user_avatar'] ?? "/placeholder.svg";
        $reviews[] = $row;
    }
    echo json_encode($reviews);
} else {
    echo json_encode(["error" => "Lỗi truy vấn: " . $conn->error]);
}

$conn->close();
?>
