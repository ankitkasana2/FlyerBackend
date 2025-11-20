import { db } from "../config/db.js";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/banners";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(6).toString("hex");
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed!"), false);
  },
});

// ---------------- Controller Functions ----------------

// Create Banner
export const createBanner = async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const [result] = await db.execute(
      "INSERT INTO banners (title, description, image) VALUES (?, ?, ?)",
      [title, description, image]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Banner
export const updateBanner = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    let query = "UPDATE banners SET title=?, description=?, status=?";
    const params = [title, description, status || 1];

    if (image) {
      query += ", image=?";
      params.push(image);
    }

    query += " WHERE id=?";
    params.push(id);

    await db.execute(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete Banner
export const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute("DELETE FROM banners WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Change Banner Status
export const changeBannerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.execute("UPDATE banners SET status=? WHERE id=?", [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get All Banners
export const getBanners = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM banners ORDER BY created_at DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
