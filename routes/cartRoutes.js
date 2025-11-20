import express from "express";
import {
  addToCart,
  getCart,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Add item to cart
router.post("/add", addToCart);

// Get user cart
router.get("/:user_id", getCart);

// Remove single item
router.delete("/remove/:id", removeCartItem);

// Clear full cart
router.put("/clear/:user_id", clearCart);

export default router;
