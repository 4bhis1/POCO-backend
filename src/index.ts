import mongoose from "mongoose";
import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const PORT: string | undefined = process.env.PORT;
const MONGO_URI: string = process.env.MONGO_URI || "";

app.listen(PORT, () => {
  console.log(`PO-CO is running on port ${PORT}`, new Date());
  mongoose
    .connect(MONGO_URI, { autoIndex: false })
    .then(() => {
      console.log("Connected with PO-CO database");
    })
    .catch((e) => {
      console.log("Erorr while connecting PO-CO database", e);
    });
});

process.on("uncaughtException", (error) => {
  console.log("Uncaught error", error);
});
