<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

function getBearerToken() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authorization = '';

    if (!empty($headers['Authorization'])) {
        $authorization = $headers['Authorization'];
    } elseif (!empty($headers['authorization'])) {
        $authorization = $headers['authorization'];
    } elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $authorization = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authorization = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (stripos($authorization, 'Bearer ') === 0) {
        return trim(substr($authorization, 7));
    }

    return trim($authorization);
}

$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'No token provided']);
    exit;
}

$token = mysqli_real_escape_string($conn, $token);
$query = mysqli_query($conn, "SELECT * FROM users WHERE token='$token'");

if (!$query) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
    exit;
}

$user = mysqli_fetch_assoc($query);

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
    exit;
}
?>