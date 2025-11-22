<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if ($conn->connect_error) {
    die(json_encode(["error" => $conn->connect_error]));
}

// Lấy POST data
$snackId = $_POST['snack_id'] ?? '';
$newPrice = $_POST['price'] ?? 0;

if(!$snackId || $newPrice <= 0) {
    echo json_encode(['error' => 'Invalid parameters']);
    exit;
}

$sql = "UPDATE do_an SET price = ? WHERE snack_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ds", $newPrice, $snackId);

if($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => $stmt->error]);
}

$conn->close();
?>
