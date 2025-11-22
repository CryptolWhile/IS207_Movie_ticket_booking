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

// Chỉ yêu cầu ticket_ids, order_id là tùy chọn
if (!isset($data['ticket_ids']) || !is_array($data['ticket_ids']) || empty($data['ticket_ids'])) {
  echo json_encode(['error' => 'Thiếu ticket_ids']);
  exit;
}

$ticket_ids = $data['ticket_ids'];
$order_id = $data['order_id'] ?? null; // Cho phép null

$conn->autocommit(FALSE);

try {
  // Cập nhật tất cả vé
  $stmt = $conn->prepare("UPDATE ve_dat SET payment_status = 'da_thanh_toan' WHERE ticket_id = ?");
  foreach ($ticket_ids as $id) {
    $stmt->bind_param("i", $id);
    $stmt->execute();
  }
  $stmt->close();

  // Nếu có order_id, cập nhật hóa đơn đồ ăn
  if ($order_id !== null) {
    $orderStmt = $conn->prepare("UPDATE hoa_don_do_an SET payment_status = 'da_thanh_toan' WHERE order_id = ?");
    $orderStmt->bind_param("i", $order_id);
    $orderStmt->execute();
    $orderStmt->close();
  }

  $conn->commit();
  echo json_encode(['success' => true, 'message' => 'Thanh toán thành công']);
} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(['error' => 'Lỗi: ' . $e->getMessage()]);
}

$conn->close();
?>