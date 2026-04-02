<?php
require_once 'config.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, [], 'Invalid request method');
}

try {
    $conn = getConnection();
    
    // Get category filter if provided
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    
    if ($category && $category !== 'all') {
        $stmt = $conn->prepare("SELECT id, name, description, price, category, image_url FROM menu_items WHERE category = ? AND is_available = 1");
        $stmt->execute([$category]);
    } else {
        $stmt = $conn->prepare("SELECT id, name, description, price, category, image_url FROM menu_items WHERE is_available = 1");
        $stmt->execute();
    }
    
    $results = $stmt->fetchAll();
    
    $items = [];
    foreach ($results as $row) {
        $items[] = [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'price' => (float) $row['price'],
            'category' => $row['category'],
            'image' => $row['image_url']
        ];
    }
    
    sendResponse(true, ['items' => $items], 'Menu items retrieved successfully');
    
} catch (Exception $e) {
    sendResponse(false, [], 'Error fetching menu: ' . $e->getMessage());
}
?>
