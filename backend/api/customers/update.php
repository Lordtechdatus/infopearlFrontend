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

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $response->error('Invalid JSON data', 400);
    }
    
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
    
    // Validate required fields
    $required_fields = ['name', 'email'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $response->error("Field '{$field}' is required", 400);
        }
    }
    
    $name = trim($input['name']);
    $email = trim($input['email']);
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
    $address = isset($input['address']) ? trim($input['address']) : '';
    $company = isset($input['company']) ? trim($input['company']) : '';
    
    // Check if email already exists for other customers
    $check_email_stmt = $conn->prepare("SELECT id FROM customers WHERE email = ? AND id != ?");
    $check_email_stmt->execute([$email, $customer_id]);
    if ($check_email_stmt->rowCount() > 0) {
        $response->error('Email already exists', 400);
    }
    
    // Update customer
    $stmt = $conn->prepare("
        UPDATE customers 
        SET name = ?, email = ?, phone = ?, address = ?, company = ?
        WHERE id = ?
    ");
    
    if ($stmt->execute([$name, $email, $phone, $address, $company, $customer_id])) {
        // Get the updated customer
        $get_stmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
        $get_stmt->execute([$customer_id]);
        $customer = $get_stmt->fetch();
        
        $response->success($customer, 'Customer updated successfully');
    } else {
        $response->error('Failed to update customer', 500);
    }
}

$response->error('Method not allowed', 405);
?> 