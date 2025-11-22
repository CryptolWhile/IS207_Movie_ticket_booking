<?php
// public/staff/api/complete_sale.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$data = json_decode(file_get_contents("php://input"), true);

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) die(json_encode(["success" => false, "error" => "DB Error"]));

$conn->autocommit(false);
try {
    // Tìm user_id (nếu có thông tin khách)
    $user_id = null;
    if (!empty($data['customer']['email'])) {
        $email = $conn->real_escape_string($data['customer']['email']);
        $res = $conn->query("SELECT user_id FROM nguoi_dung WHERE email = '$email'");
        if ($res->num_rows > 0) {
            $user_id = $res->fetch_assoc()['user_id'];
        }
    }

    // Lưu vé
    $stmt = $conn->prepare("
        INSERT INTO ve_dat 
        (showtime_id, seat_id, user_id, ticket_type, price, payment_status) 
        VALUES (?, ?, ?, ?, ?, 'da_thanh_toan')
    ");

    foreach ($data['seats'] as $seat) {
        $seat_id = $conn->query("SELECT seat_id FROM ghe WHERE room_id = ? AND seat_row = ? AND seat_number = ? LIMIT 1")
            ->fetch_assoc()['seat_id'] ?? null;

        if (!$seat_id) continue;

        $type = ($data['adultTickets']-- > 0) ? 'adult' : 'student';
        $price_res = $conn->query("SELECT price FROM gia_phong WHERE room_type = '{$data['roomType']}' AND ticket_type = '$type'")->fetch_assoc();
        $price = $price_res['price'] ?? 90000;

        $stmt->bind_param("sissd", $data['showtime_id'], $seat_id, $user_id, $type, $price);
        $stmt->execute();
    }

    // Lưu đồ ăn nếu có
    if (!empty($data['concessions'])) {
        $conn->query("INSERT INTO hoa_don_do_an (user_id, total_amount) VALUES ($user_id, 0)");
        $order_id = $conn->insert_id;

        $stmt2 = $conn->prepare("INSERT INTO chi_tiet_hoa_don_do_an (order_id, snack_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
        foreach ($data['concessions'] as $item) {
            $stmt2->bind_param("isid", $order_id, $item['id'], $item['quantity'], $item['price']);
            $stmt2->execute();
        }
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Bán vé thành công!"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>