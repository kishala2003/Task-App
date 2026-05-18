<?php
header('Content-Type: application/json');
require_once __DIR__ . '/auth.php';

global $conn;

$user_id = (int)$user['id'];

// Optional ?completed=1 filter
$filter = '';
if (isset($_GET['completed'])) {
    $completed = (int)$_GET['completed'] === 1 ? 1 : 0;
    $filter = "AND completed = $completed";
}

$result = mysqli_query($conn, "SELECT * FROM tasks WHERE user_id=$user_id $filter ORDER BY id DESC");

if (!$result) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
    exit;
}

$tasks = [];
while ($row = mysqli_fetch_assoc($result)) {
    $tasks[] = $row;
}

echo json_encode($tasks);
exit;
?>