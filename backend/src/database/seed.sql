USE raikos_db;

-- Clear tables first (respecting relationships via disabled checks if run directly)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE room_images;
TRUNCATE TABLE payments;
TRUNCATE TABLE bookings;
TRUNCATE TABLE notifications;
TRUNCATE TABLE reports;
TRUNCATE TABLE rooms;
TRUNCATE TABLE users;
TRUNCATE TABLE admins;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed Admins
INSERT INTO admins (id, name, email, password, role) VALUES
('adm-1', 'Rian Hidayat', 'admin@raikos.com', 'admin', 'admin');

-- 2. Seed Users
INSERT INTO users (id, name, email, password, phone, nik, avatar, uploaded_avatar, google_avatar, is_google_login, role) VALUES
('usr-1', 'Budi Santoso', 'penyewa@raikos.com', 'penyewa', '08123456789', '3275010203040005', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', NULL, NULL, FALSE, 'tenant'),
('usr-2', 'Siti Rahma', 'siti@raikos.com', 'penyewa', '08234567890', '3275010203040006', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', NULL, NULL, FALSE, 'tenant');

-- 3. Seed Rooms
INSERT INTO rooms (id, name, type, price_monthly, price_yearly, description, status, wifi, bathroom_inside, electricity_token, water_independent, lrt_nearby, parking_area, security) VALUES
('rm-1', 'Kamar Suite Deluxe #101', 'Kamar Mandi Dalam', 2200000.00, 24000000.00, 'Kamar kos premium berukuran 4x4m dengan desain industrial modern. Sangat cocok bagi profesional maupun mahasiswa yang mendambakan privasi dan lingkungan belajar/kerja yang tenang.', 'terisi', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('rm-2', 'Standard Cozy #102', 'Kamar Mandi Dalam', 1800000.00, 19500000.00, 'Kamar minimalis modern berukuran 3x4m, sudah termasuk kasur springbed berkualitas, lemari pakaian 2 pintu, dan meja kerja kayu yang stylish. Jaringan Wi-Fi super cepat.', 'tersedia', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE),
('rm-3', 'Mezzanine Loft Space #201', 'Kamar Mandi Dalam', 2800000.00, 30000000.00, 'Kamar loteng mewah ala apartemen studio berukuran 4x5m dengan tangga kayu menuju platform kasur mezzanine. Area bawah dapat difungsikan maksimal untuk ruang santai atau kantor pribadi.', 'dipesan', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('rm-4', 'Compact Minimalist #202', 'Kamar Mandi Luar', 1200000.00, 13000000.00, 'Kamar kos ekonomis berukuran 3x3m yang bersih, rapi, dan fungsional. Dilengkapi jendela besar untuk pencahayaan alami yang sehat. Kamar mandi luar premium dibersihkan berkala oleh petugas kos.', 'tersedia', TRUE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE),
('rm-5', 'Executive Suite Balkon #301', 'Kamar Mandi Dalam', 3200000.00, 35000000.00, 'Kamar eksklusif paling luas di lantai teratas dengan balkon pribadi menghadap kota. Dilengkapi smart tv, mini kulkas, kamar mandi dalam dengan water heater, AC, dan sirkulasi udara luar biasa.', 'tersedia', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- 4. Seed Room Images
INSERT INTO room_images (room_id, image_url) VALUES
('rm-1', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'),
('rm-1', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'),
('rm-1', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'),
('rm-2', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'),
('rm-2', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800'),
('rm-3', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800'),
('rm-3', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'),
('rm-3', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'),
('rm-4', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'),
('rm-4', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'),
('rm-5', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'),
('rm-5', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800');

-- 5. Seed Bookings
INSERT INTO bookings (id, user_id, room_id, name, email, phone, nik, entry_date, duration_months, total_price, status, created_at) VALUES
('bkg-1', 'usr-1', 'rm-1', 'Budi Santoso', 'penyewa@raikos.com', '08123456789', '3275010203040005', '2026-06-15', 6, 13200000.00, 'confirmed', '2026-06-01 10:15:30'),
('bkg-2', 'usr-2', 'rm-3', 'Siti Rahma', 'siti@raikos.com', '08234567890', '3275010203040006', '2026-07-01', 3, 8400000.00, 'pending', '2026-06-05 14:22:15');

-- 6. Seed Payments
INSERT INTO payments (id, booking_id, user_id, amount, payment_method, proof_image, status, billing_month, billing_year, created_at) VALUES
('pmt-1', 'bkg-1', 'usr-1', 13200000.00, 'Transfer Bank BCA', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600', 'approved', 'Juni', '2026', '2026-06-01 11:00:00');

-- 7. Seed Notifications
INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES
('notif-1', 'usr-1', 'Booking Dikonfirmasi 🎉', 'Selamat! Booking Anda untuk Kamar Suite Deluxe #101 telah dikonfirmasi oleh admin. Anda sudah dapat menempati kamar mulai tanggal 15 Juni 2026.', FALSE, '2026-06-02 08:00:00'),
('notif-2', 'usr-2', 'Menunggu Verifikasi Pembayaran ⏳', 'Booking Anda untuk Kamar Mezzanine Loft Space #201 sedang menunggu verifikasi pembayaran transfer Anda.', FALSE, '2026-06-05 14:30:00');
