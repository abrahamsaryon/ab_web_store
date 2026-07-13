CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  image_url VARCHAR(500),
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed categories
INSERT IGNORE INTO categories (id, name, description) VALUES
(1, 'Electronics', 'Electronic devices and accessories'),
(2, 'Clothing', 'Fashion and apparel'),
(3, 'Books', 'Books and educational materials'),
(4, 'Home & Garden', 'Home and garden products');

-- Seed products
INSERT IGNORE INTO products (id, name, description, price, stock, image_url, category_id) VALUES
(1, 'Wireless Headphones', 'High quality wireless headphones with noise cancellation', 45000, 20, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1),
(2, 'Smart Watch', 'Feature-rich smartwatch with health tracking', 85000, 15, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 1),
(3, 'Men T-Shirt', 'Comfortable cotton t-shirt for men', 8000, 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 2),
(4, 'Women Dress', 'Elegant casual dress for women', 15000, 30, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', 2),
(5, 'JavaScript Book', 'Complete guide to modern JavaScript', 12000, 25, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 3),
(6, 'Garden Tools Set', 'Complete set of garden tools', 22000, 10, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 4);

-- Seed admin user (password: admin123)
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Admin User', 'admin@abstore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
