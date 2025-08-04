<?php
require_once 'includes/Database.php';

echo "Setting up InfoPearl Backend...\n";

// Create database connection
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo "Error: Could not connect to database. Please check your database configuration.\n";
    exit(1);
}

echo "Database connection successful.\n";

// Create tables
if ($database->createTables()) {
    echo "Tables created successfully.\n";
    echo "Default admin user created:\n";
    echo "Username: admin\n";
    echo "Password: info@123\n";
} else {
    echo "Error creating tables.\n";
    exit(1);
}

echo "\nSetup completed successfully!\n";
echo "You can now start using the API.\n";
?>