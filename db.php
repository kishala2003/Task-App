<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$conn = mysqli_connect("localhost", "root", "", "task_app");

if (!$conn) {
    die(json_encode(["status" => "error", "message" => "DB connection failed"]));
}
?>
