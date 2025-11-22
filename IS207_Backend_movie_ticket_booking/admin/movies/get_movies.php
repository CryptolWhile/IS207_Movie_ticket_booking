<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "
  SELECT p.*, 
    GROUP_CONCAT(t.name) AS genres
  FROM phim p
  LEFT JOIN phim_the_loai pt ON p.movie_id = pt.movie_id
  LEFT JOIN the_loai t ON pt.genre_id = t.genre_id
  GROUP BY p.movie_id
";

$result = $conn->query($sql);
$movies = [];

while ($row = $result->fetch_assoc()) {
  $movies[] = [
    "movie_id" => (int)$row["movie_id"],
    "title" => $row["title"],
    "description" => $row["description"],
    "duration" => $row["duration"],
    "release_date" => $row["release_date"],
    "poster" => $row["poster"],
    "trailer" => $row["trailer"],
    "rating" => (float)$row["rating"],
    "is_now_showing" => (bool)$row["is_now_showing"],
    "status" => $row["status"],
    "genres" => $row["genres"] ? explode(",", $row["genres"]) : []
  ];
}

echo json_encode($movies, JSON_UNESCAPED_UNICODE);
$conn->close();
