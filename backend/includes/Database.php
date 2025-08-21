<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';
require_once 'config/cors.php';
require_once 'includes/DatabaseClass.php';
require_once 'includes/Auth.php';
require_once 'includes/Response.php';

// Get the request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove the base path from the URI
$base_path = '/backend/api/';
$path = str_replace($base_path, '', $request_uri);
$path = parse_url($path, PHP_URL_PATH);

// Split the path into segments
$segments = explode('/', trim($path, '/'));

// Route the request
try {
    if (empty($segments[0])) {
        throw new Exception('API endpoint not found', 404);
    }

    $resource = $segments[0];
    $action = $segments[1] ?? 'index';
    $id = $segments[2] ?? null;

    // Define allowed resources
    $allowed_resources = ['auth', 'customers', 'invoices', 'salary', 'users', 'content', 'contact'];

    if (!in_array($resource, $allowed_resources)) {
        throw new Exception('Resource not found', 404);
    }

    // Include the appropriate API file
    $api_file = "api/{$resource}/{$action}.php";
    
    if (!file_exists($api_file)) {
        throw new Exception('Endpoint not found', 404);
    }

    require_once $api_file;

} catch (Exception $e) {
    $response = new Response();
    $response->error($e->getMessage(), $e->getCode() ?: 500);
}
?> 