import { pool } from "../config/database.js";
import { generateId } from "../utils/generateId.js";
import { normalizeBoolean } from "../utils/helpers.js";

export class RoomService {
  static async getAllRooms() {
    // 1. Get all rooms
    const [rooms] = await pool.query("SELECT * FROM rooms");
    
    // 2. Get all room images
    const [images] = await pool.query("SELECT * FROM room_images");

    // 3. Map images and normalize fields for frontend compatibility
    return rooms.map((room) => {
      const roomImages = images
        .filter((img) => img.room_id === room.id)
        .map((img) => img.image_url);

      return {
        ...room,
        price_monthly: Number(room.price_monthly),
        price_yearly: Number(room.price_yearly),
        wifi: normalizeBoolean(room.wifi),
        bathroom_inside: normalizeBoolean(room.bathroom_inside),
        electricity_token: normalizeBoolean(room.electricity_token),
        water_independent: normalizeBoolean(room.water_independent),
        lrt_nearby: normalizeBoolean(room.lrt_nearby),
        parking_area: normalizeBoolean(room.parking_area),
        security: normalizeBoolean(room.security),
        images: roomImages.length > 0 ? roomImages : [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
        ]
      };
    });
  }

  static async getRoomById(id) {
    const [rooms] = await pool.query("SELECT * FROM rooms WHERE id = ?", [id]);
    if (rooms.length === 0) return null;
    
    const room = rooms[0];
    const [images] = await pool.query("SELECT image_url FROM room_images WHERE room_id = ?", [id]);
    
    return {
      ...room,
      price_monthly: Number(room.price_monthly),
      price_yearly: Number(room.price_yearly),
      wifi: normalizeBoolean(room.wifi),
      bathroom_inside: normalizeBoolean(room.bathroom_inside),
      electricity_token: normalizeBoolean(room.electricity_token),
      water_independent: normalizeBoolean(room.water_independent),
      lrt_nearby: normalizeBoolean(room.lrt_nearby),
      parking_area: normalizeBoolean(room.parking_area),
      security: normalizeBoolean(room.security),
      images: images.map((img) => img.image_url)
    };
  }

  static async createRoom(roomData) {
    const roomId = generateId("rm");
    const name = roomData.name || "Kamar Kos Baru";
    const type = roomData.type || "Kamar Mandi Dalam";
    const priceMonthly = Number(roomData.price_monthly) || 1500000;
    const priceYearly = Number(roomData.price_yearly) || 16500000;
    const description = roomData.description || "Hubungi admin untuk ketersediaan dan fasilitas tambahan.";
    const status = roomData.status || "tersedia";

    const wifi = normalizeBoolean(roomData.wifi) ? 1 : 0;
    const bathroomInside = normalizeBoolean(roomData.bathroom_inside) ? 1 : 0;
    const electricityToken = normalizeBoolean(roomData.electricity_token) ? 1 : 0;
    const waterIndependent = normalizeBoolean(roomData.water_independent) ? 1 : 0;
    const lrtNearby = normalizeBoolean(roomData.lrt_nearby) ? 1 : 0;
    const parkingArea = normalizeBoolean(roomData.parking_area) ? 1 : 0;
    const security = normalizeBoolean(roomData.security) ? 1 : 0;

    const images = roomData.images && roomData.images.length > 0 ? roomData.images : [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
    ];

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert room
      await conn.query(
        `INSERT INTO rooms (
          id, name, type, price_monthly, price_yearly, description, status,
          wifi, bathroom_inside, electricity_token, water_independent,
          lrt_nearby, parking_area, security
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          roomId, name, type, priceMonthly, priceYearly, description, status,
          wifi, bathroomInside, electricityToken, waterIndependent,
          lrtNearby, parkingArea, security
        ]
      );

      // Insert images
      for (const imgUrl of images) {
        await conn.query(
          "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)",
          [roomId, imgUrl]
        );
      }

      await conn.commit();
      
      return {
        id: roomId,
        name,
        type,
        price_monthly: priceMonthly,
        price_yearly: priceYearly,
        description,
        status,
        wifi: wifi === 1,
        bathroom_inside: bathroomInside === 1,
        electricity_token: electricityToken === 1,
        water_independent: waterIndependent === 1,
        lrt_nearby: lrtNearby === 1,
        parking_area: parkingArea === 1,
        security: security === 1,
        images
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updateRoom(id, roomData) {
    const existingRoom = await this.getRoomById(id);
    if (!existingRoom) return null;

    const name = roomData.name !== undefined ? roomData.name : existingRoom.name;
    const type = roomData.type !== undefined ? roomData.type : existingRoom.type;
    const priceMonthly = roomData.price_monthly !== undefined ? Number(roomData.price_monthly) : existingRoom.price_monthly;
    const priceYearly = roomData.price_yearly !== undefined ? Number(roomData.price_yearly) : existingRoom.price_yearly;
    const description = roomData.description !== undefined ? roomData.description : existingRoom.description;
    const status = roomData.status !== undefined ? roomData.status : existingRoom.status;

    const wifi = roomData.wifi !== undefined ? (normalizeBoolean(roomData.wifi) ? 1 : 0) : (existingRoom.wifi ? 1 : 0);
    const bathroomInside = roomData.bathroom_inside !== undefined ? (normalizeBoolean(roomData.bathroom_inside) ? 1 : 0) : (existingRoom.bathroom_inside ? 1 : 0);
    const electricityToken = roomData.electricity_token !== undefined ? (normalizeBoolean(roomData.electricity_token) ? 1 : 0) : (existingRoom.electricity_token ? 1 : 0);
    const waterIndependent = roomData.water_independent !== undefined ? (normalizeBoolean(roomData.water_independent) ? 1 : 0) : (existingRoom.water_independent ? 1 : 0);
    const lrtNearby = roomData.lrt_nearby !== undefined ? (normalizeBoolean(roomData.lrt_nearby) ? 1 : 0) : (existingRoom.lrt_nearby ? 1 : 0);
    const parkingArea = roomData.parking_area !== undefined ? (normalizeBoolean(roomData.parking_area) ? 1 : 0) : (existingRoom.parking_area ? 1 : 0);
    const security = roomData.security !== undefined ? (normalizeBoolean(roomData.security) ? 1 : 0) : (existingRoom.security ? 1 : 0);

    const images = roomData.images || existingRoom.images;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update rooms table
      await conn.query(
        `UPDATE rooms SET 
          name = ?, type = ?, price_monthly = ?, price_yearly = ?, description = ?, status = ?,
          wifi = ?, bathroom_inside = ?, electricity_token = ?, water_independent = ?,
          lrt_nearby = ?, parking_area = ?, security = ?
        WHERE id = ?`,
        [
          name, type, priceMonthly, priceYearly, description, status,
          wifi, bathroomInside, electricityToken, waterIndependent,
          lrtNearby, parkingArea, security, id
        ]
      );

      // If images were updated, sync them in room_images
      if (roomData.images) {
        await conn.query("DELETE FROM room_images WHERE room_id = ?", [id]);
        for (const imgUrl of images) {
          await conn.query(
            "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)",
            [id, imgUrl]
          );
        }
      }

      await conn.commit();

      return {
        id,
        name,
        type,
        price_monthly: priceMonthly,
        price_yearly: priceYearly,
        description,
        status,
        wifi: wifi === 1,
        bathroom_inside: bathroomInside === 1,
        electricity_token: electricityToken === 1,
        water_independent: waterIndependent === 1,
        lrt_nearby: lrtNearby === 1,
        parking_area: parkingArea === 1,
        security: security === 1,
        images
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async deleteRoom(id) {
    const [result] = await pool.query("DELETE FROM rooms WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
