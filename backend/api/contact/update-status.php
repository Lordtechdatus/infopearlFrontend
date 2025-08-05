<?php
require_once '../../includes/DatabaseClass.php';
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
    
    // Validate required fields
    if (!isset($input['id']) || !isset($input['status'])) {
        $response->error('Message ID and status are required', 400);
    }
    
    $message_id = (int)$input['id'];
    $status = trim($input['status']);
    
    // Validate status
    $allowed_statuses = ['new', 'read', 'replied', 'archived'];
    if (!in_array($status, $allowed_statuses)) {
        $response->error('Invalid status. Allowed values: ' . implode(', ', $allowed_statuses), 400);
    }
    
    try {
        // Check if message exists
        $check_stmt = $conn->prepare("SELECT id FROM contact_messages WHERE id = ?");
        $check_stmt->execute([$message_id]);
        
        if ($check_stmt->rowCount() == 0) {
            $response->error('Message not found', 404);
        }
        
        // Update status
        $stmt = $conn->prepare("UPDATE contact_messages SET status = ? WHERE id = ?");
        
        if ($stmt->execute([$status, $message_id])) {
            // Get the updated message
            $get_stmt = $conn->prepare("SELECT * FROM contact_messages WHERE id = ?");
            $get_stmt->execute([$message_id]);
            $message = $get_stmt->fetch();
            
            $response->success($message, 'Message status updated successfully');
        } else {
            $response->error('Failed to update message status', 500);
        }
    } catch (PDOException $e) {
        $response->error('Database error: ' . $e->getMessage(), 500);
    }
}

$response->error('Method not allowed', 405);
?> 