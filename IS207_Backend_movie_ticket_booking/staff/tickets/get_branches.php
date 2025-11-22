<?php
// public/staff/api/get_branches.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) die(json_encode([]));

$result = $conn->query("SELECT cinema_id as id, name, city as branch FROM rap_chieu_phim ORDER BY name");
$branches = [];
while ($row = $result->fetch_assoc()) {
    $row['branch'] = $row['branch'] === 'HCM' ? 'HCM' : 'HN';
    $branches[] = $row;
}
echo json_encode($branches);
?>