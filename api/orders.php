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
$required = ['customer', 'orderType', 'paymentMethod', 'items', 'subtotal', 'tax', 'total'];
foreach ($required as $field) {
    if (!isset($input[$field])) {
        sendResponse(false, [], "Missing required field: $field");
    }
}

// Validate customer data
$customer = $input['customer'];
if (!isset($customer['firstName'], $customer['lastName'], $customer['email'], $customer['phone'])) {
    sendResponse(false, [], 'Missing customer information');
}

// Validate items
if (empty($input['items'])) {
    sendResponse(false, [], 'Cart is empty');
}

try {
    $conn = getConnection();
    $conn->beginTransaction();
    
    // Insert or get customer
    $stmt = $conn->prepare("SELECT id FROM customers WHERE email = ?");
    $stmt->execute([$customer['email']]);
    $result = $stmt->fetch();
    
    if ($result) {
        $customerId = $result['id'];
        
        // Update customer info
        $stmt = $conn->prepare("UPDATE customers SET first_name = ?, last_name = ?, phone = ? WHERE id = ?");
        $stmt->execute([$customer['firstName'], $customer['lastName'], $customer['phone'], $customerId]);
    } else {
        // Insert new customer
        $stmt = $conn->prepare("INSERT INTO customers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)");
        $stmt->execute([$customer['firstName'], $customer['lastName'], $customer['email'], $customer['phone']]);
        $customerId = $conn->lastInsertId();
    }
    
    // Generate order ID
    $orderId = 'BRW' . strtoupper(substr(md5(uniqid()), 0, 6));
    
    // Insert order
    $deliveryFee = isset($input['deliveryFee']) ? $input['deliveryFee'] : 0;
    $specialInstructions = isset($input['specialInstructions']) ? $input['specialInstructions'] : '';
    
    $stmt = $conn->prepare("INSERT INTO orders (customer_id, order_type, payment_method, subtotal, tax, delivery_fee, total, special_instructions, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->execute([$customerId, $input['orderType'], $input['paymentMethod'], $input['subtotal'], $input['tax'], $deliveryFee, $input['total'], $specialInstructions]);
    $orderDbId = $conn->lastInsertId();
    
    // Insert order items
    $stmt = $conn->prepare("INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)");
    
    foreach ($input['items'] as $item) {
        $stmt->execute([$orderDbId, $item['id'], $item['quantity'], $item['price']]);
    }
    
    // Insert delivery address if delivery order
    if ($input['orderType'] === 'delivery' && isset($input['deliveryAddress'])) {
        $addr = $input['deliveryAddress'];
        $stmt = $conn->prepare("INSERT INTO delivery_addresses (order_id, address, city, state, pin_code) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$orderDbId, $addr['address'], $addr['city'], $addr['state'], $addr['pinCode']]);
    }
    
    $conn->commit();
    
    sendResponse(true, [
        'orderId' => $orderId,
        'orderDbId' => $orderDbId
    ], 'Order placed successfully');
    
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    sendResponse(false, [], 'Error processing order: ' . $e->getMessage());
}
?>
?>
