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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $response->error('Invalid JSON data', 400);
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
    
    // Check if email already exists
    $check_stmt = $conn->prepare("SELECT id FROM customers WHERE email = ?");
    $check_stmt->execute([$email]);
    if ($check_stmt->rowCount() > 0) {
        $response->error('Email already exists', 400);
    }
    
    // Insert customer
    $stmt = $conn->prepare("
        INSERT INTO customers (name, email, phone, address, company) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    if ($stmt->execute([$name, $email, $phone, $address, $company])) {
        $customer_id = $conn->lastInsertId();
        
        // Get the created customer
        $get_stmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
        $get_stmt->execute([$customer_id]);
        $customer = $get_stmt->fetch();
        
        $response->success($customer, 'Customer created successfully', 201);
    } else {
        $response->error('Failed to create customer', 500);
    }
}

$response->error('Method not allowed', 405);
?> 