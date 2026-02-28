import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes.js";
import contentRoutes from "./modules/content/content.routes.js";
// import streamRoutes from "./modules/streaming/stream.routes.js";
import monitoringRoutes from "./modules/monitoring/monitoring.routes.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors());
// Accept JSON and urlencoded bodies (forms) for dev-friendly testing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
// app.use("/api/stream", streamRoutes);
app.use("/api/monitor", monitoringRoutes);

app.use(errorHandler);

export default app;