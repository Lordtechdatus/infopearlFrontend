<?php
require_once 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }

    public function login($username, $password) {
        $conn = $this->db->getConnection();
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Generate JWT token
            $payload = [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'iat' => time(),
                'exp' => time() + (60 * 60 * 24) // 24 hours
            ];

            $token = JWT::encode($payload, JWT_SECRET, 'HS256');
            
            return [
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'name' => $user['name'],
                    'role' => $user['role']
                ]
            ];
        }

        return [
            'success' => false,
            'message' => 'Invalid username or password'
        ];
    }

    public function verifyToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
            return [
                'success' => true,
                'user' => (array) $decoded
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Invalid token'
            ];
        }
    }

    public function getCurrentUser($token) {
        $auth_result = $this->verifyToken($token);
        
        if (!$auth_result['success']) {
            return null;
        }

        $conn = $this->db->getConnection();
        $stmt = $conn->prepare("SELECT id, username, name, email, role FROM users WHERE id = ?");
        $stmt->execute([$auth_result['user']['user_id']]);
        
        return $stmt->fetch();
    }
}
?> 