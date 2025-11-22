<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => $conn->connect_error]));
}

$month = $_GET['month'] ?? date('Y-m');
$sql = "
    SELECT da.snack_id, da.name, SUM(cthd.quantity) as items_sold, SUM(cthd.quantity * cthd.unit_price) as revenue
    FROM chi_tiet_hoa_don_do_an cthd
    JOIN do_an da ON cthd.snack_id = da.snack_id
    JOIN hoa_don_do_an hd ON cthd.order_id = hd.order_id
    WHERE DATE_FORMAT(hd.order_date, '%Y-%m') = ?
    GROUP BY da.snack_id, da.name
    ORDER BY items_sold DESC
    LIMIT 10
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $month);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while($row = $result->fetch_assoc()) {
    $data[] = [
        'id' => $row['snack_id'],
        'name' => $row['name'],
        'items_sold' => (int)$row['items_sold'],
        'revenue' => (float)$row['revenue']
    ];
}

echo json_encode($data);
$conn->close();
?>
