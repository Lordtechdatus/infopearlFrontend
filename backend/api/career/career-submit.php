<?php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

// ---- CORS ----
$allowedOrigins = ['http://localhost:3000', 'https://infopearl.in'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: $origin");
} else {
  // Fallback for direct/server calls
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

// ---- POST only ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['status' => 'error', 'message' => 'Only POST requests allowed.']);
  exit;
}

// Quick sanity check: if both are empty, likely wrong Content-Type (JSON instead of multipart)
if (empty($_POST) && empty($_FILES)) {
  http_response_code(400);
  echo json_encode([
    'status' => 'error',
    'message' => 'No form data received. Be sure to send multipart/form-data with a "cv" file field.'
  ]);
  exit;
}

// ---- Input ----
$input = $_POST;

// Debug log (safe summary) — PHP < 7.4 compatible
$filesSummary = array();
if (is_array($_FILES)) {
  foreach ($_FILES as $field => $f) {
    $filesSummary[$field] = array(
      'name'  => isset($f['name'])  ? $f['name']  : null,
      'size'  => isset($f['size'])  ? (int)$f['size'] : null,
      'error' => isset($f['error']) ? $f['error'] : null,
    );
  }
}

file_put_contents(
  __DIR__ . "/form-debug.log",
  print_r(array(
    'TIME'  => date('c'),
    'POST'  => $_POST,
    'FILES' => $filesSummary,
  ), true),
  FILE_APPEND
);


// ---- Validate fields ----
if (empty($input['name']) || empty($input['email']) || empty($input['position'])) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Missing required fields (name, email, position).']);
  exit;
}
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
  exit;
}

// ---- Validate file ----
if (!isset($_FILES['cv']) || $_FILES['cv']['error'] !== UPLOAD_ERR_OK) {
  $err = $_FILES['cv']['error'] ?? 'missing';
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'CV file is required (error code: '.$err.').']);
  exit;
}

// ---- Upload config ----
$uploadDir     = __DIR__ . '/uploads/cv';                       // server path
$publicBaseUrl = 'https://backend.infopearl.in/uploads/cv';     // public URL
$maxBytes      = 1 * 1024 * 1024;                               // 1 MB
$allowedExts   = ['pdf'];                                        // only PDF
$allowedMimes  = ['application/pdf'];

// Ensure upload dir exists & is writable
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

// Basic file checks
$cv           = $_FILES['cv'];
$originalName = $cv['name'];
$tmpPath      = $cv['tmp_name'];
$size         = (int)$cv['size'];

if (!is_uploaded_file($tmpPath)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Upload failed (temporary file not found).']);
  exit;
}

$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExts, true)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'Only PDF files are allowed.']);
  exit;
}

if ($size <= 0 || $size > $maxBytes) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'File too large (max 1 MB).']);
  exit;
}

// MIME check (if fileinfo not enabled, skip gracefully)
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

// Safe unique name
try {
  $safeName = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
} catch (Exception $e) {
  $safeName = date('Ymd_His') . '_' . uniqid('', true) . '.' . $ext;
}
$destPath = $uploadDir . '/' . $safeName;

// Move upload
if (!move_uploaded_file($tmpPath, $destPath) || !file_exists($destPath)) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Failed to save uploaded file.']);
  exit;
}

// DB fields
$name        = trim($input['name']);
$email       = trim($input['email']);
$phone       = isset($input['phone']) ? trim($input['phone']) : '';
$position    = trim($input['position']);
$cv_filename = $safeName;
$cv_url      = rtrim($publicBaseUrl, '/') . '/' . rawurlencode($cv_filename);

// ---- DB ----
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  $stmt = $pdo->prepare("
    INSERT INTO career_applications (name, email, phone, position, cv_filename)
    VALUES (:name, :email, :phone, :position, :cv_filename)
  ");
  $stmt->execute([
    ':name'        => $name,
    ':email'       => $email,
    ':phone'       => $phone,
    ':position'    => $position,
    ':cv_filename' => $cv_filename,
  ]);

  $insertId = $pdo->lastInsertId();

  // Email notification (non-fatal if it fails)
  $email_sent = sendCareerEmail($name, $email, $phone, $position, $cv_filename, $cv_url);

  echo json_encode([
    'status'      => 'success',
    'message'     => 'Application submitted successfully.',
    'id'          => $insertId,
    'cv_filename' => $cv_filename,
    'cv_url'      => $cv_url,
    'email_sent'  => (bool)$email_sent
  ]);
} catch (Throwable $e) {
  // If DB insert failed after file moved, keep the file for auditing or remove it; here we keep it
  file_put_contents(__DIR__ . "/form-debug.log", "[DB ERROR] " . $e->getMessage() . "\n", FILE_APPEND);
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
  exit;
}

function sendCareerEmail($name, $email, $phone, $position, $cv_filename, $cv_url) {
  $to = 'infopearl396@gmail.com';
  $cc = 'mayankratmele12abh@gmail.com';
  $email_subject = "New Career Application - $position";

  $email_body = "
  <html><head><title>New Career Application</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f8f9fa; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: bold; color: #007bff; }
    .field-value { margin-top: 5px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    a.button { display:inline-block; padding:8px 12px; background:#007bff; color:#fff; text-decoration:none; border-radius:6px; }
  </style></head><body>
    <div class='container'>
      <div class='header'>
        <h1>New Career Application</h1>
        <p>InfoPearl Website Career Application</p>
      </div>
      <div class='content'>
        <div class='field'><div class='field-label'>Name:</div><div class='field-value'>".htmlspecialchars($name)."</div></div>
        <div class='field'><div class='field-label'>Email:</div><div class='field-value'>".htmlspecialchars($email)."</div></div>
        <div class='field'><div class='field-label'>Phone:</div><div class='field-value'>".($phone ? htmlspecialchars($phone) : 'Not provided')."</div></div>
        <div class='field'><div class='field-label'>Position:</div><div class='field-value'>".htmlspecialchars($position)."</div></div>
        <div class='field'><div class='field-label'>CV Filename:</div><div class='field-value'>".htmlspecialchars($cv_filename)."</div></div>
        <div class='field'><div class='field-label'>Download CV:</div><div class='field-value'><a class='button' href='".htmlspecialchars($cv_url)."' target='_blank' rel='noopener'>Open CV</a></div></div>
      </div>
      <div class='footer'>
        <p>This message was sent from the InfoPearl website career application form.</p>
        <p>Please respond to the sender at: ".htmlspecialchars($email)."</p>
      </div>
    </div>
  </body></html>";

  $headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: InfoPearl Website <noreply@infopearl.in>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
  ];
  if ($cc) $headers[] = 'Cc: ' . $cc;

  return @mail($to, $email_subject, $email_body, implode("\r\n", $headers));
}
