<?php
// update-status.php
declare(strict_types=1);

ini_set('display_errors', '1');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

require_once '../../includes/DatabaseClass.php';
require_once '../../includes/Response.php';

$response = new Response();

// ----- CORS -----
$allowedOrigin = 'http://localhost:3000';
$allowedMethods = 'PUT, POST, OPTIONS';
$allowedHeaders = 'Content-Type, Authorization';

if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
    header('Vary: Origin'); // help caches
}
header("Access-Control-Allow-Methods: $allowedMethods");
header("Access-Control-Allow-Headers: $allowedHeaders");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Enforce method (choose one: PUT or POST). Here we accept PUT or POST.
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response->error('Method not allowed', 405);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// ----- Input -----
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

file_put_contents(__DIR__ . "/form-debug.log", date('c') . " " . print_r($input, true) . PHP_EOL, FILE_APPEND);

if (!is_array($input)) {
    $response->error('Invalid JSON body', 400);
    exit;
}

if (!isset($input['id'], $input['status'])) {
    $response->error('ID and status are required', 400);
    exit;
}

$id = (int)$input['id'];
$status = strtolower(trim((string)$input['status']));

// ----- Validate status -----
$valid_statuses = ['new', 'interviewing', 'hired', 'rejected'];
if (!in_array($status, $valid_statuses, true)) {
    $response->error('Invalid status', 400);
    exit;
}

// ----- DB creds (move to env in production) -----
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

// ----- Update -----
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $stmt = $pdo->prepare("UPDATE career_applications SET status = :status WHERE id = :id");
    $stmt->bindValue(':status', $status, PDO::PARAM_STR);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $response->success(['id' => $id, 'status' => $status], 'Application status updated successfully', 200);
        exit;
    } else {
        // Could be "not found" or "status already set"
        // Check if row exists:
        $existsStmt = $pdo->prepare("SELECT 1 FROM career_applications WHERE id = :id");
        $existsStmt->execute([':id' => $id]);
        if ($existsStmt->fetchColumn()) {
            $response->success(['id' => $id, 'status' => $status], 'No change: status already set', 200);
            exit;
        } else {
            $response->error('Application not found', 404);
            exit;
        }
    }
} catch (PDOException $e) {
    $response->error('Database error: ' . $e->getMessage(), 500);
    exit;
}
