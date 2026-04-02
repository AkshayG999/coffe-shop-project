-- Coffee Shop Database Schema (SQLite)

-- Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Espresso', 'Brewed', 'Specialty', 'Cold')),
    image_url TEXT,
    is_available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_type TEXT NOT NULL CHECK(order_type IN ('pickup', 'delivery')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('cod', 'upi', 'netbanking', 'card')),
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed')),
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    delivery_fee REAL DEFAULT 0,
    total REAL NOT NULL,
    special_instructions TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Delivery Addresses Table
CREATE TABLE IF NOT EXISTS delivery_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Menu Items
INSERT OR IGNORE INTO menu_items (id, name, description, price, category, image_url) VALUES
(1, 'Classic Espresso', 'A rich, crema-topped double shot of espresso', 149.00, 'Espresso', 'https://images.unsplash.com/photo-1510707577641-ae4c63189e8e?w=400&h=400&fit=crop'),
(2, 'Cappuccino', 'Espresso with steamed milk and velvety foam', 199.00, 'Espresso', 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400&h=400&fit=crop'),
(3, 'Café Latte', 'Smooth espresso with creamy steamed milk', 179.00, 'Espresso', 'https://images.unsplash.com/photo-1542992015-4bd106f778b6?w=400&h=400&fit=crop'),
(4, 'Americano', 'Espresso diluted with hot water for a lighter taste', 159.00, 'Espresso', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop'),
(5, 'Pour Over', 'Hand-crafted single origin coffee', 229.00, 'Brewed', 'https://images.unsplash.com/photo-1599639957043-966dccb16fc5?w=400&h=400&fit=crop'),
(6, 'French Press', 'Full-bodied coffee steeped to perfection', 189.00, 'Brewed', 'https://images.unsplash.com/photo-1564890369879-500dee3b4721?w=400&h=400&fit=crop'),
(7, 'Caramel Macchiato', 'Vanilla, milk, espresso, and caramel drizzle', 249.00, 'Specialty', 'https://images.unsplash.com/photo-1544432415-a9fc17eacb64?w=400&h=400&fit=crop'),
(8, 'Mocha', 'Espresso with chocolate and steamed milk', 229.00, 'Specialty', 'https://images.unsplash.com/photo-1578880218455-da1d0524ef10?w=400&h=400&fit=crop'),
(9, 'Honey Lavender Latte', 'Floral lavender with local honey and espresso', 269.00, 'Specialty', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop'),
(10, 'Cold Brew', 'Smooth, slow-steeped for 20 hours', 189.00, 'Cold', 'https://images.unsplash.com/photo-1517638924702-92b37c16a6a9?w=400&h=400&fit=crop'),
(11, 'Iced Latte', 'Chilled espresso with cold milk over ice', 199.00, 'Cold', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop'),
(12, 'Nitro Cold Brew', 'Creamy, nitrogen-infused cold brew on tap', 259.00, 'Cold', 'https://as1.ftcdn.net/v2/jpg/06/03/07/18/1000_F_603071804_WhBPAku4L5meUBVVGYdwHEV8Z5PIC4N4.jpg');
