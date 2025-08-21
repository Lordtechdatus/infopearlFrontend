<?php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL);

// Handle preflight request for CORS (Cross-Origin Resource Sharing)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(204); // No content
    exit;
}

// Set CORS headers to allow frontend to access this backend
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json");

// Only allow GET method for this script
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Only GET requests allowed.']);
    exit;
}

// Get query parameters (pagination, filters)
$page = isset($_GET['page']) && ctype_digit($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) && ctype_digit($_GET['limit']) ? (int)$_GET['limit'] : 10;
$status = isset($_GET['status']) ? $_GET['status'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Database credentials
$host = 'localhost';
$dbname = 'infopearl_db';
$user = 'infopearl_user';
$pass = 'infopearl@123';

try {
    // Connect to DB using PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Build WHERE clause for filtering based on status and search term
    $where = [];
    $params = [];

    if ($status !== 'all') {
        $where[] = "status = :status";
        $params[':status'] = $status;
    }

    if ($search) {
        $where[] = "(name LIKE :search OR email LIKE :search OR subject LIKE :search OR message LIKE :search)";
        $params[':search'] = "%$search%";
    }

    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // Query to get the total count of records for pagination
    $countSql = "SELECT COUNT(*) FROM career_applications $whereSql";
    $stmt = $pdo->prepare($countSql);
    $stmt->execute($params);
    $total = (int)$stmt->fetchColumn();
    $pages = ceil($total / $limit);
    $offset = ($page - 1) * $limit;

    // Query to fetch the actual messages from the contact_messages table
    $sql = "SELECT id, name, email, phone, position, cv_filename, status, created_at FROM career_applications $whereSql
            ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    // Bind dynamic parameters for filtering
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->execute();
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format data for response
    $response = [
        'data' => [
            'messages' => array_map(function ($message) {
                return [
                    'id' => $message['id'],
                    'name' => $message['name'],
                    'email' => $message['email'],
                    'phone' => $message['phone'],
                    'position' => $message['position'],
                    'cv_filename'=> $message['cv_filename'],
                    'formatted_date' => date('Y-m-d H:i:s', strtotime($message['created_at'])),
                ];
            }, $messages),
        ],
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $pages,
            'total_count' => $total,
            'limit' => $limit,
        ]
    ];

    // Return the formatted JSON response
    echo json_encode($response);
} catch (PDOException $e) {
    // Handle database connection or query errors
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
