<?php
require_once '../../includes/Auth.php';
require_once '../../includes/Response.php';

$response = new Response();

// Verify authentication
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($auth_header) || !preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    $response->error('Authorization token required', 401);
}

$token = $matches[1];
$database = new Database();
$auth = new Auth($database);

$auth_result = $auth->verifyToken($token);
if (!$auth_result['success']) {
    $response->error('Invalid token', 401);
}

$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Get customer ID from URL
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $segments = explode('/', trim($path, '/'));
    $customer_id = end($segments);
    
    if (!is_numeric($customer_id)) {
        $response->error('Invalid customer ID', 400);
    }
    
    // Check if customer exists
    $check_stmt = $conn->prepare("SELECT id FROM customers WHERE id = ?");
    $check_stmt->execute([$customer_id]);
    if ($check_stmt->rowCount() == 0) {
        $response->error('Customer not found', 404);
    }
    
    // Delete customer
    $stmt = $conn->prepare("DELETE FROM customers WHERE id = ?");
    
    if ($stmt->execute([$customer_id])) {
        $response->success(null, 'Customer deleted successfully');
    } else {
        $response->error('Failed to delete customer', 500);
    }
}

$response->error('Method not allowed', 405);
?> 