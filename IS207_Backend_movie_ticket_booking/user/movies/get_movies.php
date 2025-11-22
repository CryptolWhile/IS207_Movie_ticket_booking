<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "
    SELECT 
        p.movie_id AS id,
        p.title,
        p.poster AS image,
        p.duration,
        p.rating,
        p.is_now_showing,
        GROUP_CONCAT(tl.name SEPARATOR ', ') AS genre
    FROM phim p
    LEFT JOIN phim_the_loai ptl ON p.movie_id = ptl.movie_id
    LEFT JOIN the_loai tl ON ptl.genre_id = tl.genre_id
    GROUP BY p.movie_id
    ORDER BY p.movie_id DESC
";

$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    // convert string "Action, Drama" thành array ["Action","Drama"]
    $row['genre'] = $row['genre'] ? explode(', ', $row['genre']) : [];
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
