<?php
// showmessages.php
session_start();

header('Access-Control-Allow-Origin: *');  // Adjust based on your frontend URL
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');  // Cache CORS for 24 hours

declare(strict_types=1);

error_log('is_admin: ' . print_r($_SESSION['is_admin'], true));

if (empty($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
  http_response_code(403);
  exit('Forbidden');
}

require_once 'infopearlFrontend/backend/includes/DatabaseClass.php';

$db = new Database();
$conn = $db->getConnection();
if (!$conn) {
  http_response_code(500);
  exit('DB connection failed');
}

// Pagination + filter params
$page = isset($_GET['page']) && ctype_digit($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) && ctype_digit($_GET['limit']) ? (int)$_GET['limit'] : 10;
$status = isset($_GET['status']) ? $_GET['status'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Build WHERE clause
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

// Total count
$countSql = "SELECT COUNT(*) FROM contact_messages $whereSql";
$stmt = $conn->prepare($countSql);
$stmt->execute($params);
$total = (int)$stmt->fetchColumn();
$pages = ceil($total / $limit);
$offset = ($page - 1) * $limit;

// Fetch the messages
$sql = "SELECT id, name, email, phone, subject, message, status, created_at 
        FROM contact_messages $whereSql
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset";

$stmt = $conn->prepare($sql);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
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
                'subject' => $message['subject'],
                'message' => $message['message'],
                'status' => $message['status'],
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

header('Content-Type: application/json');
echo json_encode($response);
?>
