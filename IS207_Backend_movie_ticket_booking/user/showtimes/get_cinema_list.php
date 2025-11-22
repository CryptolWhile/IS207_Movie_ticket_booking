<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$sql = "SELECT cinema_id, name, city, total_rooms FROM rap_chieu_phim ORDER BY name ASC";
$result = $conn->query($sql);

$cinemas = [];
while($row = $result->fetch_assoc()){
    $cinemas[] = $row;
}

echo json_encode($cinemas);
$conn->close();
?>
