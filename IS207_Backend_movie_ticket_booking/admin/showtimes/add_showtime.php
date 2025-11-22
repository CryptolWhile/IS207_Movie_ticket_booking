<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Lấy dữ liệu từ $_POST
$showtime_id = $_POST["showtime_id"] ?? null;
$movie_id    = $_POST["movie_id"] ?? null;
$room_id     = $_POST["room_id"] ?? null;
$show_date   = $_POST["show_date"] ?? null;
$start_time  = $_POST["start_time"] ?? null;
$end_time    = $_POST["end_time"] ?? null;

if (!$showtime_id || !$movie_id || !$room_id || !$show_date || !$start_time || !$end_time) {
    echo json_encode(["error" => "Thiếu dữ liệu bắt buộc"]);
    exit;
}

// Lấy tổng số ghế của phòng chiếu
$sqlRoom = "SELECT total_seats FROM phong_chieu WHERE room_id='$room_id'";
$resRoom = $conn->query($sqlRoom);
if ($resRoom && $resRoom->num_rows > 0) {
    $totalSeats = (int)$resRoom->fetch_assoc()['total_seats'];
} else {
    echo json_encode(["error" => "Không tìm thấy phòng chiếu hoặc phòng chưa có số ghế"]);
    exit;
}

// Chèn xuất chiếu mới với available_seats = totalSeats
$sqlInsert = "INSERT INTO lich_chieu 
    (showtime_id, movie_id, room_id, show_date, start_time, end_time, available_seats)
    VALUES 
    ('$showtime_id', $movie_id, '$room_id', '$show_date', '$start_time', '$end_time', $totalSeats)";

if ($conn->query($sqlInsert) === TRUE) {
    echo json_encode([
        "message" => "Thêm lịch chiếu thành công",
        "available_seats" => $totalSeats,
        "total_seats" => $totalSeats
    ]);
} else {
    echo json_encode(["error" => "Lỗi: " . $conn->error]);
}

$conn->close();
?>
