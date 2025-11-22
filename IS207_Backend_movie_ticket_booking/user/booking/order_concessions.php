<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");

if ($conn->connect_error) {
  die(json_encode(["error" => "Kết nối thất bại: " . $conn->connect_error]));
}

// Code for order_concessions.php
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['concessions'], $data['ticket_id'])) {
  echo json_encode(['error' => 'Dữ liệu không đầy đủ']);
  exit;
}

$concessions = $data['concessions']; // Mảng [{id: 'POPCORN_M', quantity: 2, price: 45000}, ...]
$ticket_id = $data['ticket_id']; // Có thể NULL

$conn->autocommit(FALSE); // Bắt đầu transaction

// Tính total_amount
$total_amount = 0;
foreach ($concessions as $item) {
  $total_amount += ($item['price'] * $item['quantity']);
}

// Tạo hóa đơn (user_id lấy từ ve_dat dựa trên ticket_id, giả định ticket_id đầu tiên)
$user_stmt = $conn->prepare("SELECT user_id FROM ve_dat WHERE ticket_id = ?");
$user_stmt->bind_param("i", $ticket_id);
$user_stmt->execute();
$user_stmt->bind_result($user_id);
$user_stmt->fetch();
$user_stmt->close();

if (empty($user_id)) {
  $conn->rollback();
  echo json_encode(['error' => 'Không tìm thấy user_id']);
  exit;
}

// Insert hóa đơn
$insert_order = $conn->prepare("INSERT INTO hoa_don_do_an (user_id, ticket_id, total_amount) VALUES (?, ?, ?)");
$insert_order->bind_param("iid", $user_id, $ticket_id, $total_amount);
$insert_order->execute();
$order_id = $conn->insert_id;
$insert_order->close();

// Lưu chi tiết
foreach ($concessions as $item) {
  if ($item['quantity'] > 0) {
    $insert_detail = $conn->prepare("INSERT INTO chi_tiet_hoa_don_do_an (order_id, snack_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
    $insert_detail->bind_param("isid", $order_id, $item['id'], $item['quantity'], $item['price']);
    $insert_detail->execute();
    $insert_detail->close();
  }
}

$conn->commit();
echo json_encode(['success' => true, 'order_id' => $order_id]);

$conn->close();
?>