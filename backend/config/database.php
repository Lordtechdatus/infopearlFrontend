<?php
// PostgreSQL Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'infopearl_db');
define('DB_USER', 'postgres');
define('DB_PASS', 'your_password');
define('DB_PORT', '5432');

// JWT Secret for authentication
define('JWT_SECRET', 'your-secret-key-here-change-in-production');

// API Configuration
define('API_VERSION', 'v1');
define('UPLOAD_PATH', '../uploads/');
?> 