<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  exit; // bắt buộc phải có, Turbopack sẽ ko bị '<br>' nữa
}

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  echo json_encode(["error" => "Kết nối thất bại"]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
  echo json_encode(["error" => "JSON không hợp lệ"]);
  exit;
}

$movie_id = (int)($data["movie_id"] ?? 0);
if ($movie_id <= 0) {
  echo json_encode(["error" => "movie_id không hợp lệ"]);
  exit;
}

$title       = $conn->real_escape_string($data["title"] ?? "");
$description = $conn->real_escape_string($data["description"] ?? "");
$duration    = $conn->real_escape_string($data["duration"] ?? "");
$poster      = $conn->real_escape_string($data["poster"] ?? "");
$trailer     = $conn->real_escape_string($data["trailer"] ?? "");
$status      = $conn->real_escape_string($data["status"] ?? "sắp chiếu");
$rating      = (float)($data["rating"] ?? 0);
$is_now_showing = (int)($data["is_now_showing"] ?? 0);

$release_raw = trim($data["release_date"] ?? "");
$release_date = $release_raw !== "" ? "'" . $conn->real_escape_string($release_raw) . "'" : "NULL";

$genres = $data["genres"] ?? [];

$sql = "
UPDATE phim SET
  title='$title',
  description='$description',
  duration='$duration',
  release_date=$release_date,
  poster='$poster',
  trailer='$trailer',
  rating=$rating,
  is_now_showing=$is_now_showing,
  status='$status'
WHERE movie_id=$movie_id
";

if (!$conn->query($sql)) {
  echo json_encode(["error" => $conn->error]);
  exit;
}

// RESET genre mapping
$conn->query("DELETE FROM phim_the_loai WHERE movie_id=$movie_id");

foreach ($genres as $gname) {
  $g = trim($conn->real_escape_string($gname));
  if ($g === "") continue;

  $res = $conn->query("SELECT genre_id FROM the_loai WHERE name='$g' LIMIT 1");
  if ($res->num_rows > 0) {
    $row = $res->fetch_assoc();
    $gid = (int)$row["genre_id"];
  } else {
    $conn->query("INSERT INTO the_loai (name) VALUES ('$g')");
    $gid = $conn->insert_id;
  }

  $conn->query("INSERT IGNORE INTO phim_the_loai (movie_id, genre_id) VALUES ($movie_id, $gid)");
}



echo json_encode(["message" => "OK"]);
$conn->close();
