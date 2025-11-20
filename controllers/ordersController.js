import { db } from "../config/db.js";
import fs from "fs";
import path from "path";

// Helper to rename files after order created
const renameFile = (oldPath, newPath) => {
  fs.renameSync(oldPath, newPath);
};

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      presenting,
      event_title,
      event_date,
      flyer_info,
      address_phone,
      djs: djsData,
      host: hostData,
      sponsors: sponsorsData,
      story_size_version,
      custom_flyer,
      animated_flyer,
      instagram_post_size,
      delivery_time,
      custom_notes,
      flyer_is,
    } = req.body;

    if (!presenting || !event_title || !event_date || !address_phone)
      return res.status(400).json({ message: "Required fields missing" });

    // Insert initial order to get ID
    const [result] = await db.query(
      `INSERT INTO flyer_orders
      (presenting, event_title, event_date, flyer_info, address_phone,
       story_size_version, custom_flyer, animated_flyer, instagram_post_size,
       delivery_time, custom_notes, flyer_is)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        presenting,
        event_title,
        event_date,
        flyer_info || null,
        address_phone,
        story_size_version ? 1 : 0,
        custom_flyer ? 1 : 0,
        animated_flyer ? 1 : 0,
        instagram_post_size ? 1 : 0,
        delivery_time || null,
        custom_notes || null,
        flyer_is || null,
      ]
    );

    const orderId = result.insertId;

    // -------------------------
    // Handle venue_logo
    // -------------------------
    let venueLogoPath = null;
    if (req.files?.venue_logo && req.files.venue_logo[0]) {
      const oldPath = req.files.venue_logo[0].path;
      const ext = path.extname(oldPath);
      const newName = `order_${orderId}_venue_logo${ext}`;
      const newPath = path.join("./uploads/venue_logo", newName);
      renameFile(oldPath, newPath);
      venueLogoPath = newPath;
    }

    // -------------------------
    // Handle DJs
    // -------------------------
    // let djs = [];
    // if (djsData) {
    //   const parsedDJs = JSON.parse(djsData); // Expect array of { name }
    //   parsedDJs.forEach((dj, idx) => {
    //     const file = req.files[`dj_${idx}`] ? req.files[`dj_${idx}`][0] : null;
    //     let imagePath = null;
    //     if (file) {
    //       const ext = path.extname(file.path);
    //       const newName = `order_${orderId}_dj_${idx + 1}${ext}`;
    //       const newPath = path.join("./uploads/djs", newName);
    //       renameFile(file.path, newPath);
    //       imagePath = newPath;
    //     }
    //     djs.push({ name: dj.name, image: imagePath });
    //   });
    // }

    // -------------------------
    // Handle Host
    // -------------------------
    // let host = null;
    // if (hostData) {
    //   const parsedHost = JSON.parse(hostData); // Expect { name }
    //   const file = req.files.host ? req.files.host[0] : null;
    //   let imagePath = null;
    //   if (file) {
    //     const ext = path.extname(file.path);
    //     const newName = `order_${orderId}_host${ext}`;
    //     const newPath = path.join("./uploads/host", newName);
    //     renameFile(file.path, newPath);
    //     imagePath = newPath;
    //   }
    //   host = { name: parsedHost.name, image: imagePath };
    // }

    // -------------------------
    // Handle Sponsors
    // -------------------------
    // let sponsors = [];
    // if (sponsorsData) {
    //   const parsedSponsors = JSON.parse(sponsorsData); // Expect array of length 3
    //   parsedSponsors.forEach((sp, idx) => {
    //     const file = req.files[`sponsor_${idx}`]
    //       ? req.files[`sponsor_${idx}`][0]
    //       : null;
    //     let imagePath = null;
    //     if (file) {
    //       const ext = path.extname(file.path);
    //       const newName = `order_${orderId}_sponsor_${idx + 1}${ext}`;
    //       const newPath = path.join("./uploads/sponsors", newName);
    //       renameFile(file.path, newPath);
    //       imagePath = newPath;
    //     }
    //     sponsors.push({ image: imagePath });
    //   });
    // }

    // -------------------------
    // Update order with file paths JSON
    // -------------------------
    // await db.query(
    //   "UPDATE flyer_orders SET venue_logo=?, djs=?, host=?, sponsors=? WHERE id=?",
    //   [
    //     venueLogoPath,
    //     JSON.stringify(djs),
    //     JSON.stringify(host),
    //     JSON.stringify(sponsors),
    //     orderId,
    //   ]
    // );

    // Return order data
    const [orderRows] = await db.query(
      "SELECT * FROM flyer_orders WHERE id=?",
      [orderId]
    );
    res
      .status(201)
      .json({ message: "Order created successfully", order: orderRows[0] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
};




// ---------------------------
// GET All Orders
// ---------------------------
export const getOrders = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM flyer_orders ORDER BY created_at DESC");

    // Parse JSON fields for DJs, host, sponsors
    const formatted = rows.map(order => ({
      ...order,
      djs: order.djs ? JSON.parse(order.djs) : [],
      host: order.host ? JSON.parse(order.host) : {},
      sponsors: order.sponsors ? JSON.parse(order.sponsors) : [],
    }));

    res.status(200).json({ orders: formatted });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------------------
// GET Single Order by ID
// ---------------------------
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM flyer_orders WHERE id = ?", [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Order not found" });

    const order = rows[0];
    order.djs = order.djs ? JSON.parse(order.djs) : [];
    order.host = order.host ? JSON.parse(order.host) : {};
    order.sponsors = order.sponsors ? JSON.parse(order.sponsors) : [];

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};