<?php
require_once '../../includes/DatabaseClass.php';
require_once '../../includes/Auth.php';
require_once '../../includes/Response.php';

$response = new Response();

// Verify authentication
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($auth_header) || !preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    $response->error('Authorization token required', 401);
}

$token = $matches[1];
$database = new Database();
$auth = new Auth($database);

$auth_result = $auth->verifyToken($token);
if (!$auth_result['success']) {
    $response->error('Invalid token', 401);
}

$conn = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get query parameters for pagination and filtering
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        
        $offset = ($page - 1) * $limit;
        
        // Build the query
        $where_conditions = [];
        $params = [];
        
        if ($status && $status !== 'all') {
            $where_conditions[] = "status = ?";
            $params[] = $status;
        }
        
        if ($search) {
            $where_conditions[] = "(name ILIKE ? OR email ILIKE ? OR subject ILIKE ? OR message ILIKE ?)";
            $search_param = "%$search%";
            $params[] = $search_param;
            $params[] = $search_param;
            $params[] = $search_param;
            $params[] = $search_param;
        }
        
        $where_clause = '';
        if (!empty($where_conditions)) {
            $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
        }
        
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM contact_messages $where_clause";
        $count_stmt = $conn->prepare($count_query);
        $count_stmt->execute($params);
        $total_count = $count_stmt->fetch()['total'];
        
        // Get messages with pagination
        $query = "
            SELECT * FROM contact_messages 
            $where_clause 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ";
        
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $messages = $stmt->fetchAll();
        
        // Format the response
        $formatted_messages = [];
        foreach ($messages as $message) {
            $formatted_messages[] = [
                'id' => $message['id'],
                'name' => $message['name'],
                'email' => $message['email'],
                'phone' => $message['phone'],
                'subject' => $message['subject'],
                'message' => $message['message'],
                'status' => $message['status'],
                'created_at' => $message['created_at'],
                'formatted_date' => date('d M Y, h:i A', strtotime($message['created_at']))
            ];
        }
        
        $response_data = [
            'messages' => $formatted_messages,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total_count / $limit),
                'total_count' => $total_count,
                'limit' => $limit
            ]
        ];
        
        $response->success($response_data, 'Contact messages retrieved successfully');
        
    } catch (PDOException $e) {
        $response->error('Database error: ' . $e->getMessage(), 500);
    }
}

$response->error('Method not allowed', 405);
?> 