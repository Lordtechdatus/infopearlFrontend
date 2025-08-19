<?php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

// ---- CORS / Preflight ----
$allowedOrigin = 'http://localhost:3000';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Origin: $allowedOrigin");
  header("Access-Control-Allow-Methods: DELETE, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  http_response_code(204);
  exit;
}

header("Access-Control-Allow-Origin: $allowedOrigin");
header("Content-Type: application/json");

// ---- Method guard (DELETE only) ----
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
  http_response_code(405);
  echo json_encode(['status' => 'error', 'message' => 'Only DELETE requests allowed.']);
  exit;
}

// ---- Read JSON body ----
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

// Log for debug
file_put_contents(__DIR__ . "/delete-debug.log", print_r($input, true));

// ---- Validate ----
if (!isset($input['id']) || !is_numeric($input['id'])) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Missing or invalid "id".']);
  exit;
}

$id = (int)$input['id'];

// ---- DB credentials (same as your contact-save script) ----
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

try {
  // ---- Connect ----
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  // ---- Delete ----
  $stmt = $pdo->prepare("DELETE FROM career_applications WHERE id = :id");
  $stmt->execute([':id' => $id]);

  if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Message not found.']);
    exit;
  }

  echo json_encode(['status' => 'success', 'message' => 'Message deleted successfully.', 'deleted_id' => $id]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
