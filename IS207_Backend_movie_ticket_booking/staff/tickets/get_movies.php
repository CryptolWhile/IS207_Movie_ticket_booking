<?php
// public/staff/api/get_movies.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) die(json_encode([]));

$result = $conn->query("
    SELECT movie_id as id, title, duration, poster, trailer, is_now_showing 
    FROM phim 
    WHERE is_now_showing = 1 
    ORDER BY title
");
$movies = [];
while ($row = $result->fetch_assoc()) {
    $movies[] = $row;
}
echo json_encode($movies);
?>