import express from "express";
import { register, login } from "./auth.controller.js";

const router = express.Router();

// Dev convenience pages (GET) so you can test from a browser.
// These are intentionally minimal and should be removed for production.
router.get("/register", (req, res) => {
	res.type("html").send(`
		<html>
			<body>
				<h3>Register (dev only)</h3>
				<form method="POST" action="/api/auth/register">
					<label>Email: <input name="email" /></label><br/>
					<label>Password: <input type="password" name="password" /></label><br/>
					<button type="submit">Register</button>
				</form>
			</body>
		</html>
	`);
});

router.get("/login", (req, res) => {
	res.type("html").send(`
		<html>
			<body>
				<h3>Login (dev only)</h3>
				<form method="POST" action="/api/auth/login">
					<label>Email: <input name="email" /></label><br/>
					<label>Password: <input type="password" name="password" /></label><br/>
					<button type="submit">Login</button>
				</form>
			</body>
		</html>
	`);
});

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, (req, res, next) => {
	// logout uses auth.controller's logout which expects req.user
	// we import lazily to avoid circular deps
	import("./auth.controller.js").then(mod => mod.logout(req, res, next)).catch(next);
});

export default router;