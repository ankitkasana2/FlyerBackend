import express from "express";
import { createOrder, getOrders, getOrderById } from "../controllers/ordersController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Define multiple file fields
// const multipleUpload = upload.fields([
//   { name: "venue_logo", maxCount: 1 },
//   { name: "host", maxCount: 1 },
//   { name: "sponsor_0", maxCount: 1 },
//   { name: "sponsor_1", maxCount: 1 },
//   { name: "sponsor_2", maxCount: 1 },
//   // DJs will be dynamic, handle in controller as dj_0, dj_1...
// ]);
const multipleUpload = upload.fields([
  { name: "venue_logo", maxCount: 1 },
  { name: "host", maxCount: 1 },
  { name: "sponsor_0", maxCount: 1 },
  { name: "sponsor_1", maxCount: 1 },
  { name: "sponsor_2", maxCount: 1 },
  { name: "dj_0", maxCount: 1 },
  { name: "dj_1", maxCount: 1 },
  // Add more if needed
]);


router.post("/", multipleUpload, createOrder);

// GET all orders
router.get("/", getOrders);

// GET single order by ID
router.get("/:id", getOrderById);

export default router;
