<?php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

// ---- CORS preflight ----
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(204);
    exit;
}

// ---- CORS + JSON ----
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json");

// ---- GET only ----
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Only GET requests allowed.']);
    exit;
}

// ---- Query params ----
$page   = isset($_GET['page'])  && ctype_digit($_GET['page'])  ? (int)$_GET['page']  : 1;
$limit  = isset($_GET['limit']) && ctype_digit($_GET['limit']) ? (int)$_GET['limit'] : 10;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$status = isset($_GET['status']) ? strtolower(trim($_GET['status'])) : 'all'; // 'all' | 'open' | 'overdue'

// ---- DB creds ----
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

// Public base URL for invoice PDFs
$publicBaseUrl = 'https://backend.infopearl.in/uploads/invoices';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // ---- Build WHERE ----
    $where = [];
    $params = [];

    if ($search !== '') {
        // search by invoice_no or customer_name
        $where[] = "(invoice_no LIKE :search OR customer_name LIKE :search)";
        $params[':search'] = "%{$search}%";
    }

    // Basic open/overdue filter (paid requires payment tracking; omitted here)
    if ($status === 'overdue') {
        $where[] = "(due_date IS NOT NULL AND due_date < CURDATE())";
    } elseif ($status === 'open') {
        $where[] = "(due_date IS NULL OR due_date >= CURDATE())";
    } // 'all' => no extra clause

    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // ---- Count for pagination ----
    $countSql = "SELECT COUNT(*) FROM invoices $whereSql";
    $stmt = $pdo->prepare($countSql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();
    $total = (int)$stmt->fetchColumn();
    $pages = ($limit > 0) ? (int)ceil($total / $limit) : 1;
    $limit = max(1, $limit);
    $page  = max(1, min($page, max(1, $pages)));
    $offset = ($page - 1) * $limit;

    // ---- Fetch data ----
    $sql = "
        SELECT
          id,
          invoice_no,
          invoice_date,   -- DATE
          due_date,       -- DATE
          customer_name,
          total_amount,
          invoices_pdf,   -- filename stored
          created_at
        FROM invoices
        $whereSql
        ORDER BY COALESCE(invoice_date, created_at) DESC, id DESC
        LIMIT :limit OFFSET :offset
    ";
    $stmt = $pdo->prepare($sql);

    // Bind WHERE params
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);

    // Bind paging params
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $rows = $stmt->fetchAll();

    // ---- Map to response shape ----
    $invoices = array_map(function ($r) use ($publicBaseUrl) {
        $id            = (int)$r['id'];
        $invoice_no    = $r['invoice_no'];
        $invoice_date  = $r['invoice_date']; // 'YYYY-MM-DD' (DATE)
        $due_date      = $r['due_date'];     // 'YYYY-MM-DD' or null
        $customer_name = $r['customer_name'];
        $total_amount  = (float)$r['total_amount'];
        $filename      = $r['invoices_pdf']; // may be null/empty
        $created_at    = $r['created_at'];

        // If you later add a column like received_amount, use it here; default 0 for now
        $received = 0.0;
        $pending  = max(0, $total_amount - $received);

        // Compute basic status (without payments table, we only know overdue/open)
        $today = new DateTimeImmutable('today');
        $status = 'open';
        if (!empty($due_date)) {
            try {
                $due = new DateTimeImmutable($due_date);
                if ($due < $today && $received < $total_amount) {
                    $status = 'overdue';
                }
            } catch (Throwable $e) {
                // If date parse fails, leave as open
            }
        }

        // Build public PDF URL
        $pdf_url = null;
        if (!empty($filename)) {
            $pdf_url = rtrim($publicBaseUrl, '/') . '/' . rawurlencode($filename);
        }

        // Helper: format DD/MM/YYYY for UI (optional)
        $fmt = function ($ymd) {
            if (!$ymd) return null;
            $dt = DateTime::createFromFormat('Y-m-d', $ymd);
            return $dt ? $dt->format('d/m/Y') : $ymd;
        };

        return [
            'id'                    => $id,
            'invoice_no'            => $invoice_no,
            'customer_name'         => $customer_name,
            'invoice_date'          => $invoice_date,
            'invoice_date_formatted'=> $fmt($invoice_date),
            'due_date'              => $due_date,
            'due_date_formatted'    => $fmt($due_date),
            'total_amount'          => number_format($total_amount, 2, '.', ''),
            'received_amount'       => number_format($received, 2, '.', ''),
            'pending_amount'        => number_format($pending, 2, '.', ''),
            'status'                => $status,         // 'open' | 'overdue'
            'pdf_filename'          => $filename,
            'pdf_url'               => $pdf_url,
            'created_at'            => date('Y-m-d H:i:s', strtotime($created_at)),
        ];
    }, $rows);

    echo json_encode([
        'data' => [
            'invoices' => $invoices
        ],
        'pagination' => [
            'current_page' => $page,
            'total_pages'  => $pages,
            'total_count'  => $total,
            'limit'        => $limit,
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
