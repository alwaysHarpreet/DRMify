import { registerUser, loginUser } from "./auth.service.js";
import { generateFingerprint } from "../../utils/fingerprint.js";

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await registerUser(email, password);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const fingerprint = generateFingerprint(req);

    const token = await loginUser(
      email,
      password,
      fingerprint,
      req.ip
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
};