/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import cors from "cors";
import { createConnection } from "./database/MongoClient";
import { router } from "./routes";
import { AppError } from "./errors/AppError";
import "express-async-errors";

config();
const app = express();
createConnection();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (err: Error, request: Request, response: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      return response.status(err.statusCode).json({
        status: "error",
        message: err.message,
      });
    }

    return response.status(500).json({
      status: "error",
      message: `Internal server error: ${err.message}`,
    });
  }
);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // process.exit(1);
});

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
