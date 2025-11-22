import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { connectMongoDB } from "./db/connectMongoDB.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import notesRoutes from "./routes/notesRoutes.js";
import { errors } from "celebrate";
import cookieParser from "cookie-parser";
import { errors as celebrateErrors } from 'celebrate';
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(logger);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);
app.use(notesRoutes);

app.use(notFoundHandler);
app.use(celebrateErrors());
app.use(errors());
app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
