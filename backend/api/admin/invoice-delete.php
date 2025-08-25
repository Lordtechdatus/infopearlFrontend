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
file_put_contents(__DIR__ . "/delete-debug.log", "[INVOICE DELETE] " . date('c') . "\n" . print_r($input, true) . "\n", FILE_APPEND);

// ---- Validate ----
// Allow delete by numeric id OR by invoice_no (string)
$id = null;
$invoiceNo = null;

if (isset($input['id']) && (is_int($input['id']) || ctype_digit((string)$input['id']))) {
  $id = (int)$input['id'];
}
if (isset($input['invoice_no']) && is_string($input['invoice_no']) && trim($input['invoice_no']) !== '') {
  $invoiceNo = trim($input['invoice_no']);
}

if ($id === null && $invoiceNo === null) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Provide a valid numeric "id" or non-empty "invoice_no".']);
  exit;
}

// ---- DB credentials ----
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

// Files
$uploadsDir = __DIR__ . '/uploads/invoices';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  $pdo->beginTransaction();

  // ---- Find the invoice first (to get filename & id) ----
  if ($id !== null) {
    $sel = $pdo->prepare("SELECT id, invoice_no, invoices_pdf FROM invoices WHERE id = :id LIMIT 1");
    $sel->execute([':id' => $id]);
  } else {
    $sel = $pdo->prepare("SELECT id, invoice_no, invoices_pdf FROM invoices WHERE invoice_no = :inv LIMIT 1");
    $sel->execute([':inv' => $invoiceNo]);
  }

  $row = $sel->fetch();
  if (!$row) {
    $pdo->rollBack();
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Invoice not found.']);
    exit;
  }

  $deleteId  = (int)$row['id'];
  $deleteInv = $row['invoice_no'];
  $filename  = $row['invoices_pdf'] ?? null;

  // ---- Delete DB row ----
  if ($id !== null) {
    $del = $pdo->prepare("DELETE FROM invoices WHERE id = :id");
    $del->execute([':id' => $deleteId]);
  } else {
    // Rely on unique invoice_no; still use the resolved id to be precise
    $del = $pdo->prepare("DELETE FROM invoices WHERE id = :id");
    $del->execute([':id' => $deleteId]);
  }

  if ($del->rowCount() === 0) {
    $pdo->rollBack();
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Invoice not found or already deleted.']);
    exit;
  }

  $pdo->commit();

  // ---- Try removing file (best-effort; success or not doesn’t block the delete response) ----
  $fileDeleted = false;
  if (!empty($filename)) {
    // ensure safe filename
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
    'message'      => 'Invoice deleted successfully.',
    'deleted_id'   => $deleteId,
    'invoice_no'   => $deleteInv,
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
