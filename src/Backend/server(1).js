import express from "express";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRouter from "./routes/chat.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api", chatRouter);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");
    } catch (err) {
        console.log("Failed to connect with Db", err);
    }
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});