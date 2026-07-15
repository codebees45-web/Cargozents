import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const driverAssignmentRoutes = require(
  "./routes/driverAssignmentRoutes"
);

const app = express();

app.use(helmet());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(
  "/api/driver-assignment",
  driverAssignmentRoutes
);

app.use(express.json({ limit: "20mb" }));

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.use(morgan("dev"));

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "LoadShare Backend Running"
    });

});

export default app;