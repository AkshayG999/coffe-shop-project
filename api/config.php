<?php
// SQLite Database Configuration
define('DB_PATH', __DIR__ . '/../database/coffee_shop.db');

// Create database connection using PDO (SQLite)
function getConnection() {
    try {
        $conn = new PDO('sqlite:' . DB_PATH);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        return $conn;
    } catch (PDOException $e) {
        die(json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]));
    }
}

// Send JSON response
function sendResponse($success, $data = [], $message = '') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    echo json_encode([
        'success' => $success,
        'message' => $message,
        ...$data
    ]);
    exit;
}

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}
?>
