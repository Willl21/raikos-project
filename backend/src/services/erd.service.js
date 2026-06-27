export class ErdService {
  static getErd() {
    const erdText = `
-- -----------------------------------------------------
-- DATABASE SCHEMA: RAIKOS (MySQL RELATIONAL TABLES)
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  nik VARCHAR(20) NOT NULL,
  avatar VARCHAR(255),
  uploaded_avatar VARCHAR(255),
  google_avatar VARCHAR(255),
  is_google_login BOOLEAN DEFAULT FALSE,
  role VARCHAR(15) DEFAULT 'tenant'
);

CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(15) DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  price_monthly DECIMAL(12,2) NOT NULL,
  price_yearly DECIMAL(12,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'tersedia', -- 'tersedia', 'dipesan', 'terisi'
  wifi BOOLEAN DEFAULT TRUE,
  bathroom_inside BOOLEAN DEFAULT TRUE,
  electricity_token BOOLEAN DEFAULT TRUE,
  water_independent BOOLEAN DEFAULT FALSE,
  lrt_nearby BOOLEAN DEFAULT TRUE,
  parking_area BOOLEAN DEFAULT TRUE,
  security BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS room_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(50) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room_id (room_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  room_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  nik VARCHAR(20) NOT NULL,
  entry_date DATE NOT NULL,
  duration_months INT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_room_id (room_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(50) PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  proof_image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  billing_month VARCHAR(20) NOT NULL,
  billing_year VARCHAR(4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

    return {
      success: true,
      sql: erdText,
      relationships: [
        { from: "room_images", to: "rooms", keys: "room_id -> id", type: "Many-to-One" },
        { from: "bookings", to: "users", keys: "user_id -> id", type: "Many-to-One" },
        { from: "bookings", to: "rooms", keys: "room_id -> id", type: "Many-to-One" },
        { from: "payments", to: "bookings", keys: "booking_id -> id", type: "Many-to-One" },
        { from: "payments", to: "users", keys: "user_id -> id", type: "Many-to-One" },
        { from: "notifications", to: "users", keys: "user_id -> id", type: "Many-to-One" }
      ]
    };
  }
}
