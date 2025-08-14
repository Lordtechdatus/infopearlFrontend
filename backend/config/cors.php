<?php
// CORS headers for cross-origin requests
// header('Access-Control-Allow-Origin: http://localhost:3000');
// header('Access-Control-Allow-Credentials: true');
// header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     http_response_code(200);
//     exit();
// }
?> 

<?php
// CORS headers for cross-origin requests
$allowedOrigins = ['http://localhost:3000', 'https://infopearl.in']; // Add your allowed origins here

if (in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
} else {
    header('Access-Control-Allow-Origin: *');  // Optional: wildcard for any origin
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // Cache for 1 day

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
