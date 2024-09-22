import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { MongoClient } from "./database/MongoClient";
import { router } from "./routes";

const main = async () => {
  config();
  const app = express();
  await MongoClient.connect();
  const port = process.env.PORT || 8000;

  app.use(express.json());
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  app.use(router);

  app.listen(port, () => {
    console.log(`Running at http://localhost:${port}`);
  });
};

main();
