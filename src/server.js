import dotenv from "dotenv";
import app from "./app.js";
import { connectRedis } from "./config/redis.js";
import { initializeDatabase } from "./config/db.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize SQLite database
    initializeDatabase();
    console.log("SQLite connected");

    await connectRedis();
    console.log("Redis connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

startServer();