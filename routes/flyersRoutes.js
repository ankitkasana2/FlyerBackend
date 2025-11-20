

import express from "express";
import { 
  getFlyers, 
  createFlyers, 
  updateFlyer,
  deleteFlyer,
  getFlyerById  
} from "../controllers/flyersController.js";

const router = express.Router();

// GET all flyers
router.get("/", getFlyers);

// POST create flyers
router.post("/", createFlyers);

// PUT Update flyer
router.put("/:id", updateFlyer);

// Delete Delete flyer
router.delete("/:id", deleteFlyer);

// GET Flyer by ID
router.get("/flyers/:id", getFlyerById);

export default router;
