<?php
// download-invoice.php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

// Optional CORS (not required for direct navigation, but harmless)
$allowedOrigins = ['https://infopearl.in', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: $origin");
} else {
  header("Access-Control-Allow-Origin: http://localhost:3000");
}
header("Vary: Origin");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Methods: GET, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  http_response_code(204);
  exit;
}

// Validate filename
$filename = $_GET['file'] ?? '';
// only allow simple names like INV2025_...pdf
if (!preg_match('/^[A-Za-z0-9._-]+\.pdf$/', $filename)) {
  http_response_code(400);
  echo "Invalid filename";
  exit;
}

$fullPath = __DIR__ . '/uploads/invoices/' . $filename;
if (!is_file($fullPath) || !is_readable($fullPath)) {
  http_response_code(404);
  echo "File not found";
  exit;
}

// Force download
$filesize = filesize($fullPath);
header('Content-Type: application/pdf');
header('Content-Length: ' . $filesize);
header('Content-Disposition: attachment; filename="' . basename($filename) . '"');
header('X-Content-Type-Options: nosniff');
readfile($fullPath);
exit;
