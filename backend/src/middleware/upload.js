import multer from "multer";
import crypto from "node:crypto";

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP."), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Host gratisan (Render/Netlify) punya filesystem ephemeral, jadi file disimpan di Cloudinary.
export async function uploadToCloudinary(file) {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloud || !key || !secret) {
    throw new Error("Cloudinary belum dikonfigurasi (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET).");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "raikos/payment";
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  form.append("api_key", key);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Gagal mengunggah gambar ke Cloudinary.");
  return data.secure_url;
}
