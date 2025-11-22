<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    echo json_encode(["error" => "Kết nối thất bại"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['showtime_id'], $data['selectedSeats'], $data['ticketQuantities'], $data['customerInfo'], $data['concessions'], $data['pointsToUse'])) {
    echo json_encode(['error' => 'Dữ liệu không đầy đủ']);
    exit;
}

$showtime_id = $data['showtime_id'];
$selected_seats = $data['selectedSeats'];
$ticket_quantities = $data['ticketQuantities'];
$customer_info = $data['customerInfo'];
$concessions = $data['concessions'];
$points_to_use = $data['pointsToUse'] ?? 0;
$email = $customer_info['email'];

$conn->autocommit(FALSE);

try {
    // 1. Tìm hoặc tạo user
    $stmt = $conn->prepare("SELECT user_id, point FROM nguoi_dung WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        $hashed = password_hash('temp_pass_123', PASSWORD_BCRYPT);
        $insert = $conn->prepare("INSERT INTO nguoi_dung (role_id, name, phone, email, password, point) VALUES (1, ?, ?, ?, ?, 50)");
        $insert->bind_param("ssss", $customer_info['fullName'], $customer_info['phone'], $email, $hashed);
        $insert->execute();
        $user_id = $conn->insert_id;
        $current_points = 50;
        $insert->close();
    } else {
        $stmt->bind_result($user_id, $current_points);
        $stmt->fetch();
    }
    $stmt->close();

    // 2. Kiểm tra suất chiếu
    $stmt = $conn->prepare("SELECT room_id, available_seats FROM lich_chieu WHERE showtime_id = ? FOR UPDATE");
    $stmt->bind_param("s", $showtime_id);
    $stmt->execute();
    $stmt->bind_result($room_id, $available_seats);
    if (!$stmt->fetch() || count($selected_seats) > $available_seats) {
        throw new Exception("Suất chiếu không khả dụng");
    }
    $stmt->close();

    // 3. Lấy giá vé
    $room_type_stmt = $conn->prepare("SELECT room_type FROM phong_chieu WHERE room_id = ?");
    $room_type_stmt->bind_param("s", $room_id);
    $room_type_stmt->execute();
    $room_type_stmt->bind_result($room_type);
    $room_type_stmt->fetch();
    $room_type_stmt->close();

    $prices = [];
    $price_stmt = $conn->prepare("SELECT ticket_type, price FROM gia_phong WHERE room_type = ?");
    $price_stmt->bind_param("s", $room_type);
    $price_stmt->execute();
    $price_stmt->bind_result($type, $price);
    while ($price_stmt->fetch()) {
        $prices[$type] = $price;
    }
    $price_stmt->close();

    // 4. Tạo vé
    $ticket_types = array_merge(
        array_fill(0, $ticket_quantities['adult'] ?? 0, 'adult'),
        array_fill(0, $ticket_quantities['student'] ?? 0, 'student')
    );

    if (count($ticket_types) !== count($selected_seats)) {
        throw new Exception("Số lượng vé không khớp");
    }

    $ticket_ids = [];
    foreach ($selected_seats as $i => $seat) {
        list($row, $num) = [substr($seat, 0, 1), (int)substr($seat, 1)];

        $seat_stmt = $conn->prepare("SELECT seat_id FROM ghe WHERE room_id = ? AND seat_row = ? AND seat_number = ?");
        $seat_stmt->bind_param("ssi", $room_id, $row, $num);
        $seat_stmt->execute();
        $seat_stmt->bind_result($seat_id);
        if (!$seat_stmt->fetch()) throw new Exception("Ghế $seat không tồn tại");
        $seat_stmt->close();

        $check = $conn->prepare("SELECT 1 FROM ve_dat WHERE showtime_id = ? AND seat_id = ?");
        $check->bind_param("si", $showtime_id, $seat_id);
        $check->execute();
        $check->store_result();
        if ($check->num_rows > 0) throw new Exception("Ghế $seat đã được đặt");
        $check->close();

        $type = $ticket_types[$i];
        $price = $prices[$type] ?? 0;

        $insert = $conn->prepare("INSERT INTO ve_dat (showtime_id, seat_id, user_id, ticket_type, price, payment_status) VALUES (?, ?, ?, ?, ?, 'da_thanh_toan')");
        $insert->bind_param("siisd", $showtime_id, $seat_id, $user_id, $type, $price);
        $insert->execute();
        $ticket_ids[] = $conn->insert_id;
        $insert->close();
    }

    // 5. Tạo hóa đơn đồ ăn
    $order_id = null;
    if (!empty($concessions)) {
        $total = array_sum(array_map(fn($c) => $c['price'] * $c['quantity'], $concessions));
        $order_stmt = $conn->prepare("INSERT INTO hoa_don_do_an (user_id, total_amount, ticket_id) VALUES (?, ?, NULL)");
        $order_stmt->bind_param("id", $user_id, $total);
        $order_stmt->execute();
        $order_id = $conn->insert_id;
        $order_stmt->close();

        $detail_stmt = $conn->prepare("INSERT INTO chi_tiet_hoa_don_do_an (order_id, snack_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
        foreach ($concessions as $c) {
            $detail_stmt->bind_param("isid", $order_id, $c['id'], $c['quantity'], $c['price']);
            $detail_stmt->execute();
        }
        $detail_stmt->close();
    }

    // 6. Cập nhật available_seats
    $new_available = $available_seats - count($selected_seats);
    $update = $conn->prepare("UPDATE lich_chieu SET available_seats = ? WHERE showtime_id = ?");
    $update->bind_param("is", $new_available, $showtime_id);
    $update->execute();
    $update->close();

    // 7. Trừ điểm
    $new_points = $current_points;
    if ($points_to_use > 0) {
        if ($points_to_use > $current_points) throw new Exception("Không đủ điểm");
        $new_points = $current_points - $points_to_use;
        $point_stmt = $conn->prepare("UPDATE nguoi_dung SET point = ? WHERE user_id = ?");
        $point_stmt->bind_param("ii", $new_points, $user_id);
        $point_stmt->execute();
        $point_stmt->close();
    }

    $conn->commit();
    echo json_encode([
        'success' => true,
        'ticket_ids' => $ticket_ids,
        'order_id' => $order_id,
        'new_points' => $new_points
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>