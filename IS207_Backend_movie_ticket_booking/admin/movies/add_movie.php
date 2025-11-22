<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);

// ép string
$title       = $conn->real_escape_string((string)($data["title"] ?? ""));
$description = $conn->real_escape_string((string)($data["description"] ?? ""));
$duration    = $conn->real_escape_string((string)($data["duration"] ?? ""));
$poster      = $conn->real_escape_string((string)($data["poster"] ?? ""));
$trailer     = $conn->real_escape_string((string)($data["trailer"] ?? ""));
$status      = $conn->real_escape_string((string)($data["status"] ?? "sắp chiếu"));

$rating = (float)($data["rating"] ?? 0);
$is_now_showing = isset($data["is_now_showing"]) ? (int)$data["is_now_showing"] : 0;

$release_raw = $data["release_date"] ?? null;
$release_date = $release_raw
  ? "'" . $conn->real_escape_string($release_raw) . "'"
  : "NULL";

// genres là array string tên thể loại
$genres = $data["genres"] ?? [];

$sql = "
INSERT INTO phim (title, description, duration, release_date, poster, trailer, rating, is_now_showing, status)
VALUES ('$title', '$description', '$duration', $release_date, '$poster', '$trailer', $rating, $is_now_showing, '$status')
";

if ($conn->query($sql)) {

  $movie_id = $conn->insert_id;

  foreach ($genres as $gname) {
    $g = trim($conn->real_escape_string($gname));
    if ($g === "") continue;

    $res = $conn->query("SELECT genre_id FROM the_loai WHERE name='$g' LIMIT 1");
    if ($res->num_rows > 0) {
      $row = $res->fetch_assoc();
      $gid = $row["genre_id"];
    } else {
      $conn->query("INSERT INTO the_loai (name) VALUES ('$g')");
      $gid = $conn->insert_id;
    }

    $conn->query("INSERT IGNORE INTO phim_the_loai (movie_id, genre_id) VALUES ($movie_id, $gid)");
  }


  echo json_encode(["message" => "Thêm phim thành công"]);
} else {
  echo json_encode(["error" => $conn->error]);
}

$conn->close();
