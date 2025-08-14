<?php
// submit.php
declare(strict_types=1);

session_start();
if (empty($_SESSION['is_admin'])) {
    http_response_code(403);
    exit('Forbidden');
}

require_once '../../includes/DatabaseClass.php';
require_once '../../includes/Response.php';

$response = new Response();

// Get the incoming POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'email', 'phone', 'position'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        $response->error("Field '{$field}' is required", 400);
    }
}

$name = trim($input['name']);
$email = trim($input['email']);
$phone = isset($input['phone']) ? trim($input['phone']) : '';
$position = trim($input['position']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response->error('Invalid email format', 400);
}

// Process the CV file upload
$cv_filename = null;
if (isset($_FILES['cv']) && $_FILES['cv']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = '../../uploads/cvs/';
    $cv_filename = uniqid('cv_') . basename($_FILES['cv']['name']);
    $upload_path = $upload_dir . $cv_filename;

    // Move the uploaded file to the destination
    if (!move_uploaded_file($_FILES['cv']['tmp_name'], $upload_path)) {
        $response->error('Failed to upload CV', 500);
    }
} else {
    $response->error('CV file is required', 400);
}

// Connect to the database
$db = new Database();
$conn = $db->getConnection();
if (!$conn) {
    $response->error('Database connection failed', 500);
}

// Insert into the database
try {
    $stmt = $conn->prepare("INSERT INTO career_applications (name, email, phone, position, cv_filename, status) VALUES (?, ?, ?, ?, ?, 'new')");
    if ($stmt->execute([$name, $email, $phone, $position, $cv_filename])) {
        $response->success([], 'Career application submitted successfully', 201);
    } else {
        $response->error('Failed to submit career application', 500);
    }
} catch (PDOException $e) {
    $response->error('Database error: ' . $e->getMessage(), 500);
}
?>
