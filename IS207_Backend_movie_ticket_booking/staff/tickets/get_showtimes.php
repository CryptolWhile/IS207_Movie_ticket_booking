<?php
// public/staff/api/get_showtimes.php?branch=HCM&date=2025-02-10
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$branch = $_GET['branch'] ?? 'HCM';
$date   = $_GET['date'] ?? date('Y-m-d');

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) die(json_encode([]));

$city = $branch === 'HCM' ? 'HCM' : 'HN';

$result = $conn->query("
    SELECT 
        lc.showtime_id as id,
        lc.movie_id as movieId,
        p.title,
        lc.start_time as time,
        lc.show_date as date,
        pc.room_id as room,
        pc.room_type as roomType,
        (pc.total_seats - IFNULL(booked.cnt,0)) as availableSeats
    FROM lich_chieu lc
    JOIN phong_chieu pc ON lc.room_id = pc.room_id
    JOIN rap_chieu_phim r ON pc.cinema_id = r.cinema_id
    JOIN phim p ON lc.movie_id = p.movie_id
    LEFT JOIN (
        SELECT showtime_id, COUNT(*) as cnt 
        FROM ve_dat 
        WHERE payment_status = 'da_thanh_toan' 
        GROUP BY showtime_id
    ) booked ON lc.showtime_id = booked.showtime_id
    WHERE r.city = '$city' 
      AND lc.show_date = '$date'
    ORDER BY lc.start_time
");

$showtimes = [];
while ($row = $result->fetch_assoc()) {
    $row['time'] = date('H:i', strtotime($row['time']));
    $showtimes[] = $row;
}
echo json_encode($showtimes);
?>