<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (isset($_SESSION['user_id'])) {
  // Fetch user info từ DB
  $conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
  $stmt = $conn->prepare("SELECT name, email, phone FROM nguoi_dung WHERE user_id = ?");
  $stmt->bind_param("i", $_SESSION['user_id']);
  $stmt->execute();
  $stmt->bind_result($name, $email, $phone);
  $stmt->fetch();
  echo json_encode(['loggedIn' => true, 'name' => $name, 'email' => $email, 'phone' => $phone]);
} else {
  echo json_encode(['loggedIn' => false]);
}
?>