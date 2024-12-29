import express from "express";
import connectDb from "./config/db.js";
import adminRoute from "./Routes/adminRoute.js";
import userRoute from "./Routes/userRoute.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
dotenv.config();
const app = express();


connectDb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5174";
app.use(cors({ origin: corsOrigin }));
 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);


app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

const PORT= process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("server started on port: ", PORT);
});
