<?php
/**
 * SQLite Database Initialization Script
 * Run this once to set up the database
 */

define('DB_PATH', __DIR__ . '/../database/coffee_shop.db');
define('SCHEMA_PATH', __DIR__ . '/../database/schema.sql');

try {
    // Create database connection
    $conn = new PDO('sqlite:' . DB_PATH);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read schema file
    $schema = file_get_contents(SCHEMA_PATH);
    
    if ($schema === false) {
        throw new Exception('Could not read schema.sql file');
    }
    
    // Execute schema
    $conn->exec($schema);
    
    echo json_encode([
        'success' => true,
        'message' => 'Database initialized successfully!',
        'database_path' => DB_PATH
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error initializing database: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
