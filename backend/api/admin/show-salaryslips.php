<?php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

/**
 * CORS (reflect allowed origins)
 */
$allowedOrigins = ['https://infopearl.in', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback to primary site (helps when called server-side or direct)
    header("Access-Control-Allow-Origin: http://localhost:3000");
}
header("Vary: Origin");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(204);
    exit;
}

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

// ---- DB creds ----
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

// Public base URL for salary slip PDFs and proxy downloader
$publicBaseUrl = 'https://backend.infopearl.in/uploads/salary_slips';
$downloadProxy = 'https://backend.infopearl.in/download-salaryslip.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // ---- Build WHERE ----
    $where = [];
    $params = [];

    if ($search !== '') {
        // Search by emp_id, emp_name, pay_period, department, designation
        $where[] = "(
            emp_id LIKE :search
            OR emp_name LIKE :search
            OR pay_period LIKE :search
            OR department LIKE :search
            OR designation LIKE :search
        )";
        $params[':search'] = "%{$search}%";
    }

    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // ---- Count for pagination ----
    $countSql = "SELECT COUNT(*) FROM salaryslips $whereSql";
    $stmt = $pdo->prepare($countSql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();
    $total = (int)$stmt->fetchColumn();

    $pages  = ($limit > 0) ? (int)ceil($total / $limit) : 1;
    $limit  = max(1, $limit);
    $page   = max(1, min($page, max(1, $pages))));
    $offset = ($page - 1) * $limit;

    // ---- Fetch data ----
    $sql = "
        SELECT
			id,
			emp_id,
			emp_name,
			designation,
			department,
			joining_date,    -- DATE (nullable)
			pay_period,      -- VARCHAR e.g. 'August 2025'
			paid_days,
			lop_days,
			pay_date,        -- DATE
			net_salary,
			salaryslip_pdf,  -- filename stored
			created_at
        FROM salaryslips
        $whereSql
        ORDER BY COALESCE(pay_date, created_at) DESC, id DESC
        LIMIT :limit OFFSET :offset
    ";
    $stmt = $pdo->prepare($sql);

    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $rows = $stmt->fetchAll();

    // ---- Map to response shape ----
    $salaryslips = array_map(function ($r) use ($publicBaseUrl, $downloadProxy) {
        $id            = (int)$r['id'];
        $emp_id        = $r['emp_id'];
        $emp_name      = $r['emp_name'];
        $designation   = $r['designation'];
        $department    = $r['department'];
        $joining_date  = $r['joining_date']; // 'YYYY-MM-DD' or null
        $pay_period    = $r['pay_period'];
        $paid_days     = is_null($r['paid_days']) ? null : (int)$r['paid_days'];
        $lop_days      = is_null($r['lop_days'])  ? null : (int)$r['lop_days'];
        $pay_date      = $r['pay_date'];     // 'YYYY-MM-DD'
        $net_salary    = (float)$r['net_salary'];
        $filename      = $r['salaryslip_pdf']; // may be null/empty
        $created_at    = $r['created_at'];

        // Public PDF URL and proxy download URL
        $pdf_url          = null;
        $pdf_download_url = null;
        if (!empty($filename)) {
            $pdf_url          = rtrim($publicBaseUrl, '/') . '/' . rawurlencode($filename);
            $pdf_download_url = rtrim($downloadProxy, '/') . '?file=' . rawurlencode($filename);
        }

        // Helper: format DD/MM/YYYY
        $fmt = function ($ymd) {
            if (!$ymd) return null;
            $dt = DateTime::createFromFormat('Y-m-d', $ymd);
            return $dt ? $dt->format('d/m/Y') : $ymd;
        };

        return [
            'id'                        => $id,
            'emp_id'                    => $emp_id,
            'emp_name'                  => $emp_name,
            'designation'               => $designation,
            'department'                => $department,
            'joining_date'              => $joining_date,
            'joining_date_formatted'    => $fmt($joining_date),
            'pay_period'                => $pay_period,
            'paid_days'                 => $paid_days,
            'lop_days'                  => $lop_days,
            'pay_date'                  => $pay_date,
            'pay_date_formatted'        => $fmt($pay_date),
            'net_salary'                => number_format($net_salary, 2, '.', ''),
            // keep both keys for compatibility with your React:
            'salaryslip_pdf'            => $filename,       // stored filename
            'pdf_filename'              => $filename,       // alias
            'pdf_url'                   => $pdf_url,        // for opening/view
            'pdf_download_url'          => $pdf_download_url, // for forced download via proxy
            'created_at'                => date('Y-m-d H:i:s', strtotime($created_at)),
        ];
    }, $rows);

    echo json_encode([
        'data' => [
            'salaryslips' => $salaryslips
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
