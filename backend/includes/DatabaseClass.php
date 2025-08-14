<?php
class Database {
    private $conn;
    
    public function __construct() {
        try {
            $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
            $this->conn = new PDO($dsn, DB_USER, DB_PASS);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            $this->conn = null;
        }
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    public function createTables() {
        try {
            // Users table
            // $this->conn->exec("
            //     CREATE TABLE IF NOT EXISTS users (
            //         id SERIAL PRIMARY KEY,
            //         username VARCHAR(50) UNIQUE NOT NULL,
            //         password VARCHAR(255) NOT NULL,
            //         name VARCHAR(100) NOT NULL,
            //         email VARCHAR(100),
            //         role VARCHAR(20) DEFAULT 'admin',
            //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            //     )
            // ");
            
            // Customers table
            // $this->conn->exec("
            //     CREATE TABLE IF NOT EXISTS customers (
            //         id SERIAL PRIMARY KEY,
            //         name VARCHAR(100) NOT NULL,
            //         email VARCHAR(100) UNIQUE NOT NULL,
            //         phone VARCHAR(20),
            //         address TEXT,
            //         company VARCHAR(100),
            //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            //     )
            // ");
            
            // Invoices table
            // $this->conn->exec("
            //     CREATE TABLE IF NOT EXISTS invoices (
            //         id SERIAL PRIMARY KEY,
            //         customer_id INTEGER REFERENCES customers(id),
            //         invoice_number VARCHAR(50) UNIQUE NOT NULL,
            //         amount DECIMAL(10,2) NOT NULL,
            //         status VARCHAR(20) DEFAULT 'pending',
            //         due_date DATE,
            //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            //     )
            // ");
            
            // Salary table
            // $this->conn->exec("
            //     CREATE TABLE IF NOT EXISTS salary (
            //         id SERIAL PRIMARY KEY,
            //         employee_name VARCHAR(100) NOT NULL,
            //         basic_salary DECIMAL(10,2) NOT NULL,
            //         allowances DECIMAL(10,2) DEFAULT 0,
            //         deductions DECIMAL(10,2) DEFAULT 0,
            //         net_salary DECIMAL(10,2) NOT NULL,
            //         month VARCHAR(20) NOT NULL,
            //         year INTEGER NOT NULL,
            //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            //     )
            // ");
            
            // Contact messages table
            $this->conn->exec("
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    phone VARCHAR(20),
                    subject VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    status VARCHAR(20) DEFAULT 'new',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");
            
            // Create default admin user if not exists
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE username = 'admin'");
            $stmt->execute();
            
            if ($stmt->rowCount() == 0) {
                $hashed_password = password_hash('infopearl@123', PASSWORD_DEFAULT);
                $admin_stmt = $this->conn->prepare("
                    INSERT INTO users (username, password, name, email, role) 
                    VALUES ('admin', ?, 'Admin User', 'admin@infopearl.in', 'admin')
                ");
                $admin_stmt->execute([$hashed_password]);
            }
            
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}
?> 