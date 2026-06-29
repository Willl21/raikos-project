export type RoomStatus = "tersedia" | "dipesan" | "terisi" | "BOOKED";
export type BookingStatus = "pending" | "confirmed" | "rejected";
export type PaymentStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  nik: string;
  avatar?: string;
  uploadedAvatar?: string;
  googleAvatar?: string;
  isGoogleLogin?: boolean;
  role: "tenant";
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

export interface Room {
  id: string;
  name: string;
  type: string; // e.g. "Kamar Mandi Dalam", "Kamar Mandi Luar"
  price_monthly: number;
  price_yearly: number;
  description: string;
  status: RoomStatus;
  wifi: boolean;
  bathroom_inside: boolean;
  electricity_token: boolean;
  water_independent: boolean;
  lrt_nearby: boolean;
  parking_area: boolean;
  security: boolean;
  images: string[]; // First image will be main_image, others are room_images
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  name: string;
  email: string;
  phone: string;
  nik: string;
  entry_date: string;
  duration_months: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  proof_image?: string;
  meetup_date?: string;
  status: PaymentStatus;
  billing_month: string;
  billing_year: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  type: "penyewa" | "kamar" | "pembayaran" | "pendapatan";
  title: string;
  generated_by: string;
  data: any; // Dynamic records suitable for reporting table
  created_at: string;
}
