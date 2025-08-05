<?php
require_once '../../includes/DatabaseClass.php';
require_once '../../includes/Auth.php';
require_once '../../includes/Response.php';

$response = new Response();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $response->error('Invalid JSON data', 400);
    }
    
    // Validate required fields
    if (!isset($input['username']) || !isset($input['password'])) {
        $response->error('Username and password are required', 400);
    }
    
    $username = trim($input['username']);
    $password = $input['password'];
    
    if (empty($username) || empty($password)) {
        $response->error('Username and password cannot be empty', 400);
    }
    
    $database = new Database();
    $auth = new Auth($database);
    
    $result = $auth->login($username, $password);
    
    if ($result['success']) {
        $response->success($result, 'Login successful');
    } else {
        $response->error($result['message'], 401);
    }
}

$response->error('Method not allowed', 405);
?> 