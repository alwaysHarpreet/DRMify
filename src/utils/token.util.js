import jwt from "jsonwebtoken";
import { securityConfig } from "../config/security.js";

export const generateToken = (payload) => {
  return jwt.sign(payload, securityConfig.jwtSecret, {
    expiresIn: securityConfig.jwtExpiry
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, securityConfig.jwtSecret);
};