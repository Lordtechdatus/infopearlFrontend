<?php
require_once 'includes/DatabaseClass.php';

echo "Setting up InfoPearl Database...\n";

// Create database connection
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo "Error: Could not connect to database. Please check your database configuration.\n";
    echo "Make sure PostgreSQL is running and the database 'infopearl_db' exists.\n";
    echo "Update the database credentials in config/database.php\n";
    exit(1);
}

echo "Database connection successful.\n";

// Create tables
if ($database->createTables()) {
    echo "Tables created successfully.\n";
    echo "Default admin user created:\n";
    echo "Username: admin\n";
    echo "Password: infopearl@123\n";
    echo "\nContact messages table created with the following structure:\n";
    echo "- id (SERIAL PRIMARY KEY)\n";
    echo "- name (VARCHAR(100))\n";
    echo "- email (VARCHAR(100))\n";
    echo "- phone (VARCHAR(20))\n";
    echo "- subject (VARCHAR(200))\n";
    echo "- message (TEXT)\n";
    echo "- status (VARCHAR(20) DEFAULT 'new')\n";
    echo "- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)\n";
} else {
    echo "Error creating tables.\n";
    exit(1);
}

echo "\nSetup completed successfully!\n";
echo "You can now:\n";
echo "1. Start your web server\n";
echo "2. Access the contact form at your website\n";
echo "3. Login to admin panel at /admin/login\n";
echo "4. View contact messages at /admin/contact-messages\n";
?> 