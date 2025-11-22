<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Kết nối CSDL
$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Lấy movie_id từ query
$movie_id = $_GET['movie_id'] ?? '';
if (!$movie_id) {
    echo json_encode(["error" => "Thiếu movie_id"]);
    exit;
}

// Truy vấn thông tin phim
$sql = "
    SELECT 
        movie_id,
        title,
        description,
        duration,
        release_date,
        poster,
        trailer,
        rating,
        is_now_showing,
        status
    FROM phim
    WHERE movie_id = '$movie_id'
    LIMIT 1
";

$result = $conn->query($sql);

// Trả kết quả JSON
if ($result && $result->num_rows > 0) {
    echo json_encode($result->fetch_assoc(), JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["error" => "Không tìm thấy phim"]);
}

$conn->close();
?>
