<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Chưa đăng nhập"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "
SELECT d.review_id, m.title AS movieTitle, m.poster, d.rating, d.comment AS review, d.created_at AS date
FROM danh_gia d
JOIN phim m ON d.movie_id = m.movie_id
WHERE d.user_id = $user_id
ORDER BY d.created_at DESC;
";

$result = $conn->query($sql);

$reviews = [];
while($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode($reviews);

$conn->close();
?>
