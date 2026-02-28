import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { getAccessLogs, getUsers } from "./monitoring.controller.js";

const router = express.Router();

// Only allow admins (simple check in controller could be improved)
router.get("/logs", authMiddleware, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  getAccessLogs(req, res, next);
});

router.get("/users", authMiddleware, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  getUsers(req, res, next);
});

export default router;
