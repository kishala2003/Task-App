<?php
header('Content-Type: application/json');
require_once __DIR__ . '/auth.php';

global $conn;

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Task ID is required']);
    exit;
}

$task_id = (int)$data['id'];
$user_id = (int)$user['id'];

// Make sure the task belongs to the logged-in user
$query = "UPDATE tasks SET completed = 1 WHERE id = $task_id AND user_id = $user_id";

if (mysqli_query($conn, $query)) {
    if (mysqli_affected_rows($conn) === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Task not found or not yours']);
    } else {
        echo json_encode(['status' => 'success', 'message' => 'Task marked as completed']);
    }
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
}
exit;
?>
