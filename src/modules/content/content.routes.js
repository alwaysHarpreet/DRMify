import express from "express";
import { streamContent } from "./content.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:contentId", authMiddleware, streamContent);

export default router;
