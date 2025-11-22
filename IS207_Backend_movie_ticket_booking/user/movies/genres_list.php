<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "SELECT name FROM the_loai ORDER BY name ASC";
$result = $conn->query($sql);

$genres = [];
while($row = $result->fetch_assoc()) {
    $genres[] = $row['name'];
}

echo json_encode($genres);

$conn->close();
?>
