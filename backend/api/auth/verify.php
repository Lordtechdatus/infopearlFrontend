<?php
require_once '../../includes/Auth.php';
require_once '../../includes/Response.php';

$response = new Response();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $response->error('Method not allowed', 405);
}

// Get Authorization header
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($auth_header) || !preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    $response->error('Authorization token required', 401);
}

$token = $matches[1];

$database = new Database();
$auth = new Auth($database);

$result = $auth->verifyToken($token);

if ($result['success']) {
    $user = $auth->getCurrentUser($token);
    $response->success($user, 'Token verified');
} else {
    $response->error($result['message'], 401);
}
?> 