<?php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

/**
 * CORS
 */
$allowedOrigins = ['https://infopearl.in', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: $origin");
} else {
  // If request is same-origin or server-to-server, allow the primary domain
  header("Access-Control-Allow-Origin: $allowedOrigins");
}
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Methods: POST, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  http_response_code(204);
  exit;
}

header("Content-Type: application/json");

/**
 * Method check
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['status' => 'error', 'message' => 'Only POST requests allowed.']);
  exit;
}

/**
 * If both POST and FILES are empty, likely wrong content-type
 */
if (empty($_POST) && empty($_FILES)) {
  http_response_code(400);
  echo json_encode([
    'status'  => 'error',
    'message' => 'No form data received. Send multipart/form-data with "pdf" file and "meta" JSON.'
  ]);
  exit;
}

/**
 * Debug logging (safe summary)
 */
$filesSummary = [];
if (is_array($_FILES)) {
  foreach ($_FILES as $field => $f) {
    $filesSummary[$field] = [
      'name'  => isset($f['name'])  ? $f['name']  : null,
      'size'  => isset($f['size'])  ? (int)$f['size'] : null,
      'error' => isset($f['error']) ? $f['error'] : null,
    ];
  }
}
file_put_contents(
  __DIR__ . "/form-debug.log",
  print_r([
    'TIME'  => date('c'),
    'POST'  => $_POST,
    'FILES' => $filesSummary,
  ], true),
  FILE_APPEND
);

/**
 * Parse meta JSON
 */
$meta = [];
if (isset($_POST['meta'])) {
  $decoded = json_decode($_POST['meta'], true);
  if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
    $meta = $decoded;
  }
}
/* Fallback: if individual fields are posted instead of meta JSON */
$invoiceNumber = trim($meta['invoiceNumber'] ?? ($_POST['invoiceNumber'] ?? ''));
$invoiceDate   = trim($meta['invoiceDate']   ?? ($_POST['invoiceDate']   ?? '')); // expects DD/MM/YYYY or YYYY-MM-DD
$dueDate       = trim($meta['dueDate']       ?? ($_POST['dueDate']       ?? '')); // optional
$customerName  = trim($meta['customerName']  ?? ($_POST['customerName']  ?? ''));
$totalAmount   = trim($meta['totalAmount']   ?? ($_POST['totalAmount']   ?? ''));

/**
 * Basic validations
 */
if ($invoiceNumber === '' || $invoiceDate === '' || $customerName === '' || $totalAmount === '') {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Missing required fields (invoiceNumber, invoiceDate, customerName, totalAmount).']);
  exit;
}
if (!is_numeric($totalAmount) || (float)$totalAmount < 0) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'totalAmount must be a non-negative number.']);
  exit;
}

/**
 * File validation
 */
if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
  $err = $_FILES['pdf']['error'] ?? 'missing';
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'PDF is required (error code: ' . $err . ').']);
  exit;
}

$uploadDir     = __DIR__ . '/uploads/invoices';                   // filesystem path
$publicBaseUrl = 'https://backend.infopearl.in/uploads/invoices';    // public URL base (adjust if needed)
$maxBytes      = 12* 1024 * 1024;                                    // 12 MB
$allowedExts   = ['pdf'];
$allowedMimes  = ['application/pdf'];

/* Ensure dir exists & writable */
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Failed to create upload directory.']);
  exit;
}
if (!is_writable($uploadDir)) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Upload directory is not writable.']);
  exit;
}

/* File checks */
$pdf      = $_FILES['pdf'];
$tmpPath  = $pdf['tmp_name'];
$size     = (int)$pdf['size'];
$origName = $pdf['name'];

if (!is_uploaded_file($tmpPath)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Upload failed (temporary file not found).']);
  exit;
}
$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExts, true)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Only PDF files are allowed.']);
  exit;
}
if ($size <= 0 || $size > $maxBytes) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'File too large (max 5 MB).']);
  exit;
}
/* MIME check (best-effort) */
$mime = null;
if (class_exists('finfo')) {
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  if ($finfo) {
    $mime = $finfo->file($tmpPath);
  }
}
if ($mime && !in_array($mime, $allowedMimes, true)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Invalid file type.']);
  exit;
}

/**
 * Safe filename: include sanitized invoice no + timestamp
 */
$sanInv = preg_replace('/[^A-Za-z0-9_-]/', '_', $invoiceNumber);
try {
  $suffix = bin2hex(random_bytes(3));
} catch (Exception $e) {
  $suffix = uniqid();
}
$filename = $sanInv . '_' . date('Ymd_His') . '_' . $suffix . '.pdf';
$destPath = $uploadDir . '/' . $filename;

/* Move file */
if (!move_uploaded_file($tmpPath, $destPath) || !file_exists($destPath)) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Failed to save uploaded file.']);
  exit;
}
$fileUrl = rtrim($publicBaseUrl, '/') . '/' . rawurlencode($filename);

/**
 * Helper: parse DD/MM/YYYY or YYYY-MM-DD to Y-m-d (DATE)
 */
function parse_date_to_sql($s) {
  $s = trim($s);
  if ($s === '') return null;

  // Try DD/MM/YYYY
  $dt = DateTime::createFromFormat('d/m/Y', $s);
  if ($dt && $dt->format('d/m/Y') === $s) {
    return $dt->format('Y-m-d');
  }
  // Try YYYY-MM-DD
  $dt = DateTime::createFromFormat('Y-m-d', $s);
  if ($dt && $dt->format('Y-m-d') === $s) {
    return $dt->format('Y-m-d');
  }
  // Last resort: strtotime
  $ts = strtotime($s);
  if ($ts !== false) {
    return date('Y-m-d', $ts);
  }
  return null;
}

$sqlInvoiceDate = parse_date_to_sql($invoiceDate);
$sqlDueDate     = parse_date_to_sql($dueDate);

/**
 * DB insert
 */
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  // Ensure minimal table structure (reference):
  // CREATE TABLE invoices (
  //   id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  //   invoice_no VARCHAR(32) NOT NULL UNIQUE,
  //   invoice_date DATE NOT NULL,
  //   due_date DATE NULL,
  //   customer_name VARCHAR(255) NOT NULL,
  //   total_amount DECIMAL(12,2) NOT NULL,
  //   invoices_pdf TEXT NULL,
  //   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  // ) ENGINE=InnoDB;

  $stmt = $pdo->prepare("
    INSERT INTO invoices (invoice_no, invoice_date, due_date, customer_name, total_amount, invoices_pdf)
    VALUES (:invoice_no, :invoice_date, :due_date, :customer_name, :total_amount, :invoices_pdf)
  ");
  $stmt->execute([
    ':invoice_no'   => $invoiceNumber,
    ':invoice_date' => $sqlInvoiceDate,
    ':due_date'     => $sqlDueDate,
    ':customer_name'=> $customerName,
    ':total_amount' => (float)$totalAmount,
    ':invoices_pdf' => $filename,
  ]);

  $insertId = $pdo->lastInsertId();

  echo json_encode([
    'status'       => 'success',
    'message'      => 'Invoice saved successfully.',
    'id'           => $insertId,
    'invoice_no'   => $invoiceNumber,
    'fileUrl'      => $fileUrl,
    'filename'     => $filename
  ]);
} catch (PDOException $e) {
  // Duplicate invoice_no?
  if ((int)$e->getCode() === 23000) { // integrity constraint
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'Invoice number already exists.']);
  } else {
    file_put_contents(__DIR__ . "/form-debug.log", "[DB ERROR] " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
  }
  exit;
}
