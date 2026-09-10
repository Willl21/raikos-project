// Cek koneksi Cloudinary: node backend/src/middleware/upload.check.js
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import dotenv from "dotenv";
import { uploadToCloudinary } from "./upload.js";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

const file = path.resolve(import.meta.dirname, "../../public/kosan1/depan.jpg");
const url = await uploadToCloudinary({
  buffer: fs.readFileSync(file),
  mimetype: "image/jpeg",
  originalname: "cek-koneksi.jpg",
});

assert.match(url, /^https:\/\/res\.cloudinary\.com\/.+\/raikos\/payment\//, `URL tak terduga: ${url}`);
assert.ok(url.length <= 255, "URL melebihi VARCHAR(255) kolom proof_image");
console.log("OK, Cloudinary tersambung:", url);
