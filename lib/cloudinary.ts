import { v2 as cloudinary } from "cloudinary";

// Se configura una sola vez, usando variables de entorno server-only
// (NO deben tener el prefijo NEXT_PUBLIC_, así nunca llegan al navegador).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
