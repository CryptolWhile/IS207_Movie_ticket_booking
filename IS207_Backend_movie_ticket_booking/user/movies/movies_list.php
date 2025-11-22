<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// fetch movies + genre
$sql = "
SELECT p.movie_id, p.title, p.description, p.duration, p.poster, p.rating,
GROUP_CONCAT(tl.name SEPARATOR ', ') AS genre
FROM phim p
LEFT JOIN phim_the_loai pt ON p.movie_id = pt.movie_id
LEFT JOIN the_loai tl ON pt.genre_id = tl.genre_id
GROUP BY p.movie_id
";

$result = $conn->query($sql);

$movies = [];
while ($row = $result->fetch_assoc()) {
    $row['genre'] = $row['genre'] ? explode(", ", $row['genre']) : [];
    $movies[] = $row;
}

echo json_encode($movies);

$conn->close();
?>
