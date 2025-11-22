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
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Code for book_ticket.php
// Validation cơ bản
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['showtime_id'], $data['selectedSeats'], $data['ticketQuantities'], $data['customerInfo']) ||
    !is_array($data['selectedSeats']) || empty($data['customerInfo']['email'])) {
  echo json_encode(['error' => 'Dữ liệu không đầy đủ hoặc không hợp lệ']);
  exit;
}

$showtime_id = $data['showtime_id'];
$selected_seats = $data['selectedSeats']; // Mảng ghế, ví dụ ['A1', 'B2']
$ticket_quantities = $data['ticketQuantities']; // {adult: 2, student: 1}
$customer_info = $data['customerInfo'];

// Kiểm tra và tạo/cập nhật user nếu email chưa tồn tại
$stmt = $conn->prepare("SELECT user_id FROM nguoi_dung WHERE email = ?");
$stmt->bind_param("s", $customer_info['email']);
if (!$stmt->execute()) {
  echo json_encode(['error' => 'Lỗi query user: ' . $stmt->error]);
  exit;
}
$stmt->store_result();

if ($stmt->num_rows == 0) {
  // Tạo user mới (role_id=1: Người dùng)
  $hashed_password = password_hash('default_password', PASSWORD_BCRYPT); // Thay bằng password thực
  $insert_stmt = $conn->prepare("INSERT INTO nguoi_dung (role_id, name, phone, email, password, point) VALUES (1, ?, ?, ?, ?, 50)");
  $insert_stmt->bind_param("ssss", $customer_info['fullName'], $customer_info['phone'], $customer_info['email'], $hashed_password);
  if (!$insert_stmt->execute()) {
    echo json_encode(['error' => 'Lỗi insert user: ' . $insert_stmt->error]);
    $insert_stmt->close();
    exit;
  }
  $user_id = $conn->insert_id;
  $insert_stmt->close();
} else {
  $stmt->bind_result($user_id);
  $stmt->fetch();
}
$stmt->close();

// Lấy room_id từ showtime
// Sau khi lấy room_id và available_seats
$stmt = $conn->prepare("SELECT room_id, available_seats FROM lich_chieu WHERE showtime_id = ? FOR UPDATE");
$stmt->bind_param("s", $showtime_id);
if (!$stmt->execute()) {
  echo json_encode(['error' => 'Lỗi query showtime: ' . $stmt->error]);
  exit;
}
$stmt->bind_result($room_id, $available_seats);
if (!$stmt->fetch() || count($selected_seats) > $available_seats) {
  echo json_encode(['error' => 'Suất chiếu không khả dụng hoặc ghế hết']);
  $stmt->close();
  exit;
}
$stmt->close();

// Lấy giá từ gia_phong dựa trên room_type
$room_type_stmt = $conn->prepare("SELECT room_type FROM phong_chieu WHERE room_id = ?");
$room_type_stmt->bind_param("s", $room_id);
if (!$room_type_stmt->execute()) {
  echo json_encode(['error' => 'Lỗi query room_type: ' . $room_type_stmt->error]);
  exit;
}
$room_type_stmt->bind_result($room_type);
if (!$room_type_stmt->fetch()) {
  echo json_encode(['error' => 'Không tìm thấy room_type']);
  $room_type_stmt->close();
  exit;
}
$room_type_stmt->close();

$prices = [];
$price_stmt = $conn->prepare("SELECT ticket_type, price FROM gia_phong WHERE room_type = ?");
$price_stmt->bind_param("s", $room_type);
if (!$price_stmt->execute()) {
  echo json_encode(['error' => 'Lỗi query prices: ' . $price_stmt->error]);
  exit;
}
$price_stmt->bind_result($ticket_type_price, $price_value);
while ($price_stmt->fetch()) {
  $prices[$ticket_type_price] = $price_value;
}
$price_stmt->close();

// Phân bổ loại vé cho ghế (giả định adult trước, student sau)
$ticket_types = array_merge(array_fill(0, $ticket_quantities['adult'] ?? 0, 'adult'), array_fill(0, $ticket_quantities['student'] ?? 0, 'student'));
if (count($ticket_types) != count($selected_seats)) {
  echo json_encode(['error' => 'Số loại vé không khớp số ghế']);
  exit;
}

$conn->autocommit(FALSE); // Bắt đầu transaction

$ticket_ids = [];
foreach ($selected_seats as $index => $seat) {
  // Lấy seat_id từ ghe (dựa trên room_id, seat_row, seat_number - giả định seat là 'A1' -> row='A', number=1)
  list($seat_row, $seat_number) = [substr($seat, 0, 1), (int)substr($seat, 1)];

  $seat_stmt = $conn->prepare("SELECT seat_id FROM ghe WHERE room_id = ? AND seat_row = ? AND seat_number = ?");
  $seat_stmt->bind_param("ssi", $room_id, $seat_row, $seat_number);
  if (!$seat_stmt->execute()) {
    $conn->rollback();
    echo json_encode(['error' => 'Lỗi query seat_id: ' . $seat_stmt->error]);
    $seat_stmt->close();
    exit;
  }
  $seat_stmt->bind_result($seat_id);
  if (!$seat_stmt->fetch()) {
    $conn->rollback();
    echo json_encode(['error' => 'Ghế không tồn tại']);
    $seat_stmt->close();
    exit;
  }
  $seat_stmt->close();

  // Kiểm tra ghế đã đặt
  $check_booked = $conn->prepare("SELECT ticket_id FROM ve_dat WHERE showtime_id = ? AND seat_id = ?");
  $check_booked->bind_param("si", $showtime_id, $seat_id);
  if (!$check_booked->execute()) {
    $conn->rollback();
    echo json_encode(['error' => 'Lỗi check booked: ' . $check_booked->error]);
    $check_booked->close();
    exit;
  }
  $check_booked->store_result();
  if ($check_booked->num_rows > 0) {
    $conn->rollback();
    echo json_encode(['error' => 'Ghế đã được đặt']);
    $check_booked->close();
    exit;
  }
  $check_booked->close();

  $ticket_type = $ticket_types[$index];
  $price = $prices[$ticket_type] ?? 0;

  // Lưu vé
  $insert_ticket = $conn->prepare("INSERT INTO ve_dat (showtime_id, seat_id, user_id, ticket_type, price, payment_status) VALUES (?, ?, ?, ?, ?, 'chua_thanh_toan')");
  $insert_ticket->bind_param("siisd", $showtime_id, $seat_id, $user_id, $ticket_type, $price);
  if (!$insert_ticket->execute()) {
    $conn->rollback();
    echo json_encode(['error' => 'Lỗi insert vé: ' . $insert_ticket->error]);
    $insert_ticket->close();
    exit;
  }
  $ticket_ids[] = $conn->insert_id;
  $insert_ticket->close();
}

// Cập nhật available_seats
$new_available = $available_seats - count($selected_seats);
$update_seats = $conn->prepare("UPDATE lich_chieu SET available_seats = ? WHERE showtime_id = ?");
$update_seats->bind_param("is", $new_available, $showtime_id);
if (!$update_seats->execute()) {
  $conn->rollback();
  echo json_encode(['error' => 'Lỗi update available_seats: ' . $update_seats->error]);
  $update_seats->close();
  exit;
}
$update_seats->close();

$conn->commit();
echo json_encode(['success' => true, 'ticket_ids' => $ticket_ids]);

$conn->close();
?>