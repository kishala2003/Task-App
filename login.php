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
$password = $data['password'];

$result = mysqli_query($conn, "SELECT * FROM users WHERE username='$username'");
if (!$result) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
    exit;
}

$user = mysqli_fetch_assoc($result);

if ($user && password_verify($password, $user['password'])) {

    $token = bin2hex(random_bytes(16));
    $token_escaped = mysqli_real_escape_string($conn, $token);
    $user_id = (int)$user['id'];

    mysqli_query($conn, "UPDATE users SET token='$token_escaped' WHERE id=$user_id");

    echo json_encode([
        'status' => 'success',
        'token' => $token
    ]);

} else {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid username or password']);
}
exit;
?>