<?php
header('Content-Type: application/json');
require_once __DIR__ . '/auth.php'; // already validates token & gets $user

global $conn;

$user_id = (int)$user['id'];

if (!mysqli_query($conn, "UPDATE users SET token=NULL WHERE id=$user_id")) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
    exit;
}

echo json_encode([
    'status' => 'success',
    'message' => 'Logged out successfully'
]);
exit;
?>