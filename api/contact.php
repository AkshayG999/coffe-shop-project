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
if (!isset($input['name'], $input['email'], $input['message'])) {
    sendResponse(false, [], 'Missing required fields');
}

// Sanitize input
$name = htmlspecialchars(strip_tags($input['name']));
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$subject = isset($input['subject']) ? htmlspecialchars(strip_tags($input['subject'])) : '';
$message = htmlspecialchars(strip_tags($input['message']));

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, [], 'Invalid email address');
}

try {
    $conn = getConnection();
    
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $subject, $message]);
    
    sendResponse(true, [
        'messageId' => $conn->lastInsertId()
    ], 'Message sent successfully');
    
} catch (Exception $e) {
    sendResponse(false, [], 'Error saving message: ' . $e->getMessage());
}
?>
