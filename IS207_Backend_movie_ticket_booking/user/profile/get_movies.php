<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Trả cả id, title và poster
$sql = "SELECT movie_id AS id, title, poster FROM phim WHERE status != 'ngừng chiếu'";
$result = $conn->query($sql);

$movies = [];
while($row = $result->fetch_assoc()) {
    $movies[] = $row;
}

echo json_encode($movies);

$conn->close();
?>
