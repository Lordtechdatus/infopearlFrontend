<?php
require_once '../../includes/Response.php';

$response = new Response();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response->error('Method not allowed', 405);
}

// Get Authorization header
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($auth_header) || !preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    $response->error('Authorization token required', 401);
}

// In a real application, you might want to blacklist the token
// For now, we'll just return success as the client will remove the token
$response->success(null, 'Logout successful');
?> 