<?php
require_once 'config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, [], 'Invalid request method');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendResponse(false, [], 'Invalid JSON data');
}

// Validate required fields
if (!isset($input['email']) || !isset($input['password']) || empty($input['email']) || empty($input['password'])) {
    sendResponse(false, [], 'Email and password are required');
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$password = $input['password'];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, [], 'Invalid email address');
}

try {
    $conn = getConnection();
    
    // Find user by email
    $stmt = $conn->prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendResponse(false, [], 'Invalid email or password');
        exit;
    }
    
    // Verify password using SHA256
    $passwordHash = hash('sha256', $password);
    
    if ($user['password_hash'] !== $passwordHash) {
        sendResponse(false, [], 'Invalid email or password');
        exit;
    }
    
    // Return user data with token
    sendResponse(true, [
        'user' => [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
        ],
        'token' => bin2hex(random_bytes(32)) // Generate a simple token
    ], 'Login successful');
    
} catch (Exception $e) {
    sendResponse(false, [], 'Error during login: ' . $e->getMessage());
}
?>
