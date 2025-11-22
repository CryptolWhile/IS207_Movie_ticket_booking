<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$branch = $_GET['branch'] ?? 'HCM';
$date = $_GET['date'] ?? date('Y-m-d');

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "
SELECT lc.showtime_id AS id, lc.movie_id, lc.start_time AS time, pc.name AS room, pc.room_type, pc.description AS room_description
FROM lich_chieu lc
JOIN phong_chieu pc ON pc.room_id = lc.room_id
JOIN rap_chieu_phim rcp ON rcp.cinema_id = pc.cinema_id
WHERE rcp.city = '$branch' AND lc.show_date = '$date'
ORDER BY lc.start_time
";

$result = $conn->query($sql);
$showtimes = [];
while($row = $result->fetch_assoc()){
    $showtimes[] = $row;
}

echo json_encode($showtimes);
$conn->close();
?>
