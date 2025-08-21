<?php
require_once '../../includes/DatabaseClass.php';
require_once '../../includes/Auth.php';
require_once '../../includes/Response.php';

$response = new Response();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get the Authorization header
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
        $response->success($result, 'Token is valid');
    } else {
        $response->error($result['message'], 401);
    }
}

$response->error('Method not allowed', 405);
?> 