<?php
header('Content-Type: application/json');

require_once __DIR__ . '/auth.php';

global $conn;

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data) || empty(trim($data['task'] ?? ''))) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Task cannot be empty']);
    exit;
}

$task = mysqli_real_escape_string($conn, trim($data['task']));
$user_id = (int)$user['id'];

$query = "INSERT INTO tasks (user_id, task) VALUES ($user_id, '$task')";

if (mysqli_query($conn, $query)) {
    echo json_encode(['status' => 'task added', 'message' => 'Task added successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
}
exit;