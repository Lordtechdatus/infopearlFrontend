<?php
// update-status.php
declare(strict_types=1);

session_start();
if (empty($_SESSION['is_admin'])) {
    http_response_code(403);
    exit('Forbidden');
}

require_once '../../includes/DatabaseClass.php';
require_once '../../includes/Response.php';

$response = new Response();

// Get the incoming PUT data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['id']) || !isset($input['status'])) {
    $response->error('ID and status are required', 400);
}

$id = (int)$input['id'];
$status = trim($input['status']);

// Validate status
$valid_statuses = ['new', 'interviewing', 'hired', 'rejected'];
if (!in_array($status, $valid_statuses)) {
    $response->error('Invalid status', 400);
}

// Connect to the database
$db = new Database();
$conn = $db->getConnection();
if (!$conn) {
    $response->error('Database connection failed', 500);
}

// Update status in the database
try {
    $stmt = $conn->prepare("UPDATE career_applications SET status = ? WHERE id = ?");
    if ($stmt->execute([$status, $id])) {
        $response->success([], 'Application status updated successfully', 200);
    } else {
        $response->error('Failed to update status', 500);
    }
} catch (PDOException $e) {
    $response->error('Database error: ' . $e->getMessage(), 500);
}
?>
