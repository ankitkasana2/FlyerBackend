

import { db } from "../config/db.js";

// ---------------------------
// GET Flyers
// ---------------------------
export const getFlyers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM flyers ORDER BY created_at DESC");

    const formatted = rows.map((f) => ({
      ...f,
      categories: f.categories ? JSON.parse(f.categories) : [],
      recentlyAdded: !!f.recently_added,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching flyers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------------------
// BULK UPLOAD Flyers
// ---------------------------
export const createFlyers = async (req, res) => {
  try {
    const flyers = req.body.flyers;

    if (!Array.isArray(flyers) || flyers.length === 0) {
      return res.status(400).json({ message: "No flyers provided" });
    }

    const results = [];

    for (const flyer of flyers) {
      const {
        title,
        price,
        formType,
        recentlyAdded,
        categories,
        image_url,
        fileNameOriginal,
      } = flyer;

      if (!title || !price) {
        results.push({
          flyer,
          status: "skipped",
          reason: "Missing title or price",
        });
        continue;
      }

      try {
        await db.query(
          `INSERT INTO flyers 
           (title, price, form_type, recently_added, categories, image_url, file_name_original)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            price,
            formType,
            recentlyAdded ? 1 : 0,
            JSON.stringify(categories),
            image_url,
            fileNameOriginal,
          ]
        );

        results.push({ flyer, status: "saved" });
      } catch (err) {
        results.push({
          flyer,
          status: "error",
          reason: err.message,
        });
      }
    }

    res.json({ message: "Flyers uploaded successfully", results });
  } catch (err) {
    console.error("Error uploading flyers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const updateFlyer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      price,
      formType,
      category,
      recentlyAdded,
    } = req.body;

    const [result] = await db.query(
      `UPDATE flyers 
       SET title=?, price=?, form_type=?, categories=?, recently_added=? 
       WHERE id=?`,
      [
        title,
        price,
        formType,
        JSON.stringify([category]),
        recentlyAdded ? 1 : 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Flyer not found" });
    }

    res.json({ message: "Flyer updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


export const deleteFlyer = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM flyers WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Flyer not found" });
    }

    res.json({ message: "Flyer deleted successfully" });
  } catch (err) {
    console.error("Error deleting flyer:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ---------------------------
// GET Flyer by ID
// ---------------------------
export const getFlyerById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM flyers WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Flyer not found" });
    }

    const flyer = rows[0];

    const formatted = {
      ...flyer,
      categories: flyer.categories ? JSON.parse(flyer.categories) : [],
      recentlyAdded: !!flyer.recently_added,
    };

    res.json(formatted);

  } catch (err) {
    console.error("Error fetching flyer by ID:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};





