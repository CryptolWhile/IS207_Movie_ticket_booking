<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

session_start();

if(!isset($_SESSION['user_id'])){
    echo json_encode(["error"=>"Chưa đăng nhập"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$conn = new mysqli("localhost", "root", "khanhphong312", "cinemax");
if($conn->connect_error){
    die(json_encode(["error"=>"Kết nối thất bại: ".$conn->connect_error]));
}

$movie_id = isset($_POST['movie_id']) ? intval($_POST['movie_id']) : 0;
$rating   = isset($_POST['rating'])   ? intval($_POST['rating'])   : 0;
$comment  = isset($_POST['comment'])  ? $conn->real_escape_string($_POST['comment']) : '';

if($user_id && $movie_id && $rating > 0 && $comment){

    // ---- tạo mã review kiểu REVxxx ----
    $sqlMax = "SELECT LPAD(IFNULL(MAX(SUBSTRING(review_id,4))+1,1),3,'0') AS nextnum FROM danh_gia";
    $rs = $conn->query($sqlMax)->fetch_assoc();
    $newReviewId = "REV".$rs["nextnum"];

    $sql = "
        INSERT INTO danh_gia (review_id, movie_id, user_id, rating, comment, status)
        VALUES ('$newReviewId', $movie_id, $user_id, $rating, '$comment', 'pending')
    ";

    if($conn->query($sql)){
        echo json_encode(["success"=>true,"message"=>"Đánh giá đã được gửi"]);
    }else{
        echo json_encode(["error"=>"Lỗi khi thêm đánh giá: ".$conn->error]);
    }

}else{
    echo json_encode(["error"=>"Dữ liệu không hợp lệ"]);
}

$conn->close();
?>
