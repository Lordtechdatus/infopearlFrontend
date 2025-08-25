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
  header("Access-Control-Allow-Origin: http://localhost:3000");
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
 * Parse meta JSON (expected keys):
 * empId, empName, designation, department, joiningDate, payPeriod, paidDays, lopDays, payDate, netSalary
 */
$meta = [];
if (isset($_POST['meta'])) {
  $decoded = json_decode($_POST['meta'], true);
  if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
    $meta = $decoded;
  }
}

/* Fallbacks if individual fields are posted */
$empId         = trim($meta['empId']        ?? ($_POST['empId']        ?? ''));
$empName       = trim($meta['empName']      ?? ($_POST['empName']      ?? ''));
$designation   = trim($meta['designation']  ?? ($_POST['designation']  ?? ''));
$department    = trim($meta['department']   ?? ($_POST['department']   ?? ''));
$joiningDate   = trim($meta['joiningDate']  ?? ($_POST['joiningDate']  ?? '')); // DD/MM/YYYY or YYYY-MM-DD or empty
$payPeriod     = trim($meta['payPeriod']    ?? ($_POST['payPeriod']    ?? '')); // e.g. "August 2025"
$paidDays      = trim($meta['paidDays']     ?? ($_POST['paidDays']     ?? ''));
$lopDays       = trim($meta['lopDays']      ?? ($_POST['lopDays']      ?? '0'));
$payDate       = trim($meta['payDate']      ?? ($_POST['payDate']      ?? '')); // DD/MM/YYYY or YYYY-MM-DD
$netSalary     = trim($meta['netSalary']    ?? ($_POST['netSalary']    ?? ''));

/**
 * Basic validations
 */
if ($empId === '' || $empName === '' || $payPeriod === '' || $paidDays === '' || $payDate === '' || $netSalary === '') {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Missing required fields (empId, empName, payPeriod, paidDays, payDate, netSalary).']);
  exit;
}
if (!ctype_digit((string)$paidDays)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'paidDays must be an integer.']);
  exit;
}
if ($lopDays !== '' && !ctype_digit((string)$lopDays)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'lopDays must be an integer.']);
  exit;
}
if (!is_numeric($netSalary) || (float)$netSalary < 0) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'netSalary must be a non-negative number.']);
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

$uploadDir     = __DIR__ . '/uploads/salary_slips';                 // filesystem path
$publicBaseUrl = 'https://backend.infopearl.in/uploads/salary_slips'; // public URL base
$maxBytes      = 12 * 1024 * 1024;                                   // 12 MB
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
  echo json_encode(['status' => 'error', 'message' => 'File too large (max 12 MB).']);
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

$sqlJoiningDate = parse_date_to_sql($joiningDate);
$sqlPayDate     = parse_date_to_sql($payDate);

/**
 * Safe filename: include sanitized empId + payPeriod + timestamp
 */
$sanEmp  = preg_replace('/[^A-Za-z0-9_-]/', '_', $empId);
$sanPer  = preg_replace('/[^A-Za-z0-9_-]/', '_', $payPeriod);
try {
  $suffix = bin2hex(random_bytes(3));
} catch (Exception $e) {
  $suffix = uniqid();
}
$filename = $sanEmp . '_' . $sanPer . '_' . date('Ymd_His') . '_' . $suffix . '.pdf';
$destPath = $uploadDir . '/' . $filename;

/* Move file */
if (!move_uploaded_file($tmpPath, $destPath) || !file_exists($destPath)) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Failed to save uploaded file.']);
  exit;
}
$fileUrl = rtrim($publicBaseUrl, '/') . '/' . rawurlencode($filename);

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

  // Reference table:
  // CREATE TABLE salaryslips (
  //   id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  //   emp_id         VARCHAR(16)   NOT NULL,
  //   emp_name       VARCHAR(255)  NOT NULL,
  //   designation    VARCHAR(255)  NULL,
  //   department     VARCHAR(255)  NULL,
  //   joining_date   DATE          NULL,
  //   pay_period     VARCHAR(32)   NOT NULL,
  //   paid_days      INT           NOT NULL,
  //   lop_days       INT           NOT NULL DEFAULT 0,
  //   pay_date       DATE          NOT NULL,
  //   net_salary     DECIMAL(12,2) NOT NULL,
  //   salaryslip_pdf VARCHAR(255)  NOT NULL,
  //   created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  //   PRIMARY KEY (id),
  //   UNIQUE KEY uniq_emp_period (emp_id, pay_period)
  // ) ENGINE=InnoDB;

  $stmt = $pdo->prepare("
    INSERT INTO salaryslips
      (emp_id, emp_name, designation, department, joining_date, pay_period, paid_days, lop_days, pay_date, net_salary, salaryslip_pdf)
    VALUES
      (:emp_id, :emp_name, :designation, :department, :joining_date, :pay_period, :paid_days, :lop_days, :pay_date, :net_salary, :salaryslip_pdf)
    ON DUPLICATE KEY UPDATE
      emp_name       = VALUES(emp_name),
      designation    = VALUES(designation),
      department     = VALUES(department),
      joining_date   = VALUES(joining_date),
      paid_days      = VALUES(paid_days),
      lop_days       = VALUES(lop_days),
      pay_date       = VALUES(pay_date),
      net_salary     = VALUES(net_salary),
      salaryslip_pdf = VALUES(salaryslip_pdf),
  ");

  $stmt->execute([
    ':emp_id'         => $empId,
    ':emp_name'       => $empName,
    ':designation'    => ($designation !== '' ? $designation : null),
    ':department'     => ($department  !== '' ? $department  : null),
    ':joining_date'   => $sqlJoiningDate,
    ':pay_period'     => $payPeriod,
    ':paid_days'      => (int)$paidDays,
    ':lop_days'       => (int)$lopDays,
    ':pay_date'       => $sqlPayDate,
    ':net_salary'     => (float)$netSalary,
    ':salaryslip_pdf' => $filename,
  ]);

  $insertId = $pdo->lastInsertId();

  echo json_encode([
    'status'        => 'success',
    'message'       => 'Salary slip saved successfully.',
    'id'            => $insertId,
    'emp_id'        => $empId,
    'pay_period'    => $payPeriod,
    'fileUrl'       => $fileUrl,
    'filename'      => $filename
  ]);
} catch (PDOException $e) {
  if ((int)$e->getCode() === 23000) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'Duplicate entry for this employee and pay period.']);
  } else {
    file_put_contents(__DIR__ . "/form-debug.log", "[DB ERROR] " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
  }
  exit;
}
