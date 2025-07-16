import express from "express";
import { handleContactForm } from "../controllers/contactController.js";

const router = express.Router();

// URL: POST /api/contact
router.post("/contact", handleContactForm);

export default router;
