<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data) || empty(trim($data['username'] ?? '')) || empty($data['password'] ?? '')) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Username and password are required']);
    exit;
}

$username = mysqli_real_escape_string($conn, trim($data['username']));
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$password = mysqli_real_escape_string($conn, $password);

$query = "INSERT INTO users (username, password) VALUES ('$username', '$password')";

if (mysqli_query($conn, $query)) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
}
exit;
?>