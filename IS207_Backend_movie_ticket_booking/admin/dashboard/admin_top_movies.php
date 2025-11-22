<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost","root","khanhphong312","cinemax");
if($conn->connect_error){ die(json_encode(["error"=>"DB error"])); }

// Lấy top 4 phim có revenue cao nhất trong 7 ngày gần nhất
$sql = "
SELECT 
    p.title,
    COUNT(lc.showtime_id) AS screenings,
    SUM(v.price) AS revenue,
    ROUND(p.rating,1) AS rating
FROM phim p
JOIN lich_chieu lc ON p.movie_id = lc.movie_id
LEFT JOIN ve_dat v ON lc.showtime_id = v.showtime_id AND v.payment_status='da_thanh_toan'
WHERE lc.show_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY p.movie_id
ORDER BY revenue DESC
LIMIT 4
";

$res = $conn->query($sql);
$data = [];
while($r = $res->fetch_assoc()){
    $data[] = [
        "title"=>$r["title"],
        "screenings"=> (int)$r["screenings"],
        "revenue"=> number_format($r["revenue"] ?: 0,0,",",".") . " VNĐ",
        "rating"=> (float)$r["rating"]
    ];
}

echo json_encode($data, JSON_UNESCAPED_UNICODE);
$conn->close();
