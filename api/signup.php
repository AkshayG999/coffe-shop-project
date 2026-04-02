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
$required = ['name', 'email', 'password'];
foreach ($required as $field) {
    if (!isset($input[$field]) || empty($input[$field])) {
        sendResponse(false, [], "Missing required field: $field");
    }
}

$name = $input['name'];
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$password = $input['password'];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, [], 'Invalid email address');
}

// Validate password length
if (strlen($password) < 6) {
    sendResponse(false, [], 'Password must be at least 6 characters long');
}

try {
    $conn = getConnection();
    
    // Check if user already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        sendResponse(false, [], 'User already exists with this email');
        exit;
    }
    
    // Hash password using SHA256
    $passwordHash = hash('sha256', $password);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $passwordHash]);
    
    $userId = $conn->lastInsertId();
    
    // Return user data
    sendResponse(true, [
        'user' => [
            'id' => (int) $userId,
            'email' => $email,
            'name' => $name,
        ],
        'token' => bin2hex(random_bytes(32)) // Generate a simple token
    ], 'User registered successfully');
    
} catch (Exception $e) {
    sendResponse(false, [], 'Error during signup: ' . $e->getMessage());
}
?>
