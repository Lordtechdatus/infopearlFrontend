<?php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

// ---- CORS / Preflight ----
$allowedOrigins = ['https://infopearl.in', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: $origin");
} else {
  // Fallback for direct/server calls
  header("Access-Control-Allow-Origin: http://localhost:3000");
}
header("Vary: Origin");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Methods: DELETE, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  http_response_code(204);
  exit;
}

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

// Debug log
file_put_contents(
  __DIR__ . "/delete-debug.log",
  "[SALARY DELETE] " . date('c') . "\n" . print_r($input, true) . "\n",
  FILE_APPEND
);

// ---- Validate ----
// Allow delete by numeric id OR by (emp_id + pay_period) OR by filename
$id = null;
$empId = null;
$payPeriod = null;
$filenameParam = null;

if (isset($input['id']) && (is_int($input['id']) || ctype_digit((string)$input['id']))) {
  $id = (int)$input['id'];
}
if (isset($input['emp_id']) && is_string($input['emp_id']) && trim($input['emp_id']) !== '') {
  $empId = trim($input['emp_id']);
}
if (isset($input['pay_period']) && is_string($input['pay_period']) && trim($input['pay_period']) !== '') {
  $payPeriod = trim($input['pay_period']);
}
if (isset($input['filename']) && is_string($input['filename']) && trim($input['filename']) !== '') {
  $filenameParam = trim($input['filename']);
  // basic safety check if they pass a filename
  if (!preg_match('/^[A-Za-z0-9._-]+\.pdf$/', $filenameParam)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid filename format.']);
    exit;
  }
}

if ($id === null && !($empId && $payPeriod) && $filenameParam === null) {
  http_response_code(400);
  echo json_encode([
    'status' => 'error',
    'message' => 'Provide a valid numeric "id", or both "emp_id" & "pay_period", or a "filename".'
  ]);
  exit;
}

// ---- DB credentials ----
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

// Files
$uploadsDir = __DIR__ . '/uploads/salary_slips';

$pdo = null;

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  $pdo->beginTransaction();

  // ---- Find the salary slip first (to get filename & id) ----
  if ($id !== null) {
    $sel = $pdo->prepare("SELECT id, emp_id, pay_period, salaryslip_pdf FROM salaryslips WHERE id = :id LIMIT 1");
    $sel->execute([':id' => $id]);
  } elseif ($empId && $payPeriod) {
    $sel = $pdo->prepare("SELECT id, emp_id, pay_period, salaryslip_pdf FROM salaryslips WHERE emp_id = :emp AND pay_period = :pp LIMIT 1");
    $sel->execute([':emp' => $empId, ':pp' => $payPeriod]);
  } else { // filename lookup
    $sel = $pdo->prepare("SELECT id, emp_id, pay_period, salaryslip_pdf FROM salaryslips WHERE salaryslip_pdf = :fn LIMIT 1");
    $sel->execute([':fn' => $filenameParam]);
  }

  $row = $sel->fetch();
  if (!$row) {
    $pdo->rollBack();
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Salary slip not found.']);
    exit;
  }

  $deleteId   = (int)$row['id'];
  $deleteEmp  = $row['emp_id'] ?? null;
  $deletePP   = $row['pay_period'] ?? null;
  $filename   = $row['salaryslip_pdf'] ?? null;

  // ---- Delete DB row ----
  $del = $pdo->prepare("DELETE FROM salaryslips WHERE id = :id");
  $del->execute([':id' => $deleteId]);

  if ($del->rowCount() === 0) {
    $pdo->rollBack();
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Salary slip not found or already deleted.']);
    exit;
  }

  $pdo->commit();

  // ---- Try removing file (best-effort) ----
  $fileDeleted = false;
  if (!empty($filename)) {
    $base = basename($filename);
    if ($base === $filename) {
      $fullPath = $uploadsDir . '/' . $base;
      if (is_file($fullPath) && is_writable($fullPath)) {
        $fileDeleted = @unlink($fullPath) ? true : false;
      }
    }
  }

  echo json_encode([
    'status'       => 'success',
    'message'      => 'Salary slip deleted successfully.',
    'deleted_id'   => $deleteId,
    'emp_id'       => $deleteEmp,
    'pay_period'   => $deletePP,
    'file_deleted' => $fileDeleted,
  ]);
} catch (PDOException $e) {
  if ($pdo && $pdo->inTransaction()) {
    $pdo->rollBack();
  }
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Throwable $t) {
  if ($pdo && $pdo->inTransaction()) {
    $pdo->rollBack();
  }
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $t->getMessage()]);
}
