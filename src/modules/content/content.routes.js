import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { streamContent, uploadContent } from "./content.controller.js";

const router = express.Router();

router.post("/upload", authMiddleware, uploadContent);
router.get("/:contentId", authMiddleware, streamContent);

export default router;
