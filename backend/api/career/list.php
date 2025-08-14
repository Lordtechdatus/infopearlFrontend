<?php
// list.php
declare(strict_types=1);

session_start();
if (empty($_SESSION['is_admin'])) {
    http_response_code(403);
    exit('Forbidden');
}

require_once '../../includes/DatabaseClass.php';

$db = new Database();
$conn = $db->getConnection();
if (!$conn) {
    http_response_code(500);
    exit('DB connection failed');
}

// Pagination and filters
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
    $where[] = "(name LIKE :search OR email LIKE :search OR position LIKE :search)";
    $params[':search'] = "%$search%";
}

$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

// Total count
$countSql = "SELECT COUNT(*) FROM career_applications $whereSql";
$stmt = $conn->prepare($countSql);
$stmt->execute($params);
$total = (int)$stmt->fetchColumn();
$pages = ceil($total / $limit);
$offset = ($page - 1) * $limit;

// Fetch the career applications
$sql = "SELECT id, name, email, phone, position, cv_filename, status, created_at 
        FROM career_applications $whereSql
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset";

$stmt = $conn->prepare($sql);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}
$stmt->execute();

$applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Format data for response
$response = [
    'data' => [
        'applications' => array_map(function ($application) {
            return [
                'id' => $application['id'],
                'name' => $application['name'],
                'email' => $application['email'],
                'phone' => $application['phone'],
                'position' => $application['position'],
                'cv_filename' => $application['cv_filename'],
                'status' => $application['status'],
                'formatted_date' => date('Y-m-d H:i:s', strtotime($application['created_at'])),
            ];
        }, $applications),
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
