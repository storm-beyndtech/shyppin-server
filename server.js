import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";

import { verifyTransporter } from "./utils/emailConfig.js";
import usersRoutes from "./routes/users.js";
import shipmentsRoutes from "./routes/shipments.js";
import utilsRoutes from "./routes/utils.js";

const app = express();
const server = http.createServer(app);

// Verify transporter
(async function verifyTP() {
	await verifyTransporter();
})();

// Checking for required ENV variables
if (!process.env.JWT_PRIVATE_KEY) {
	console.error("Fatal Error: jwtPrivateKey is required");
	process.exit(1);
}

// Connecting to MongoDB
mongoose.set("strictQuery", false);
mongoose
	.connect(process.env.MONGODB_URL)
	.then(() => console.log("Connected to MongoDB..."))
	.catch((e) => console.error("Error connecting to MongoDB:", e));

// CORS middleware
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/users", usersRoutes);
app.use("/api/shipments", shipmentsRoutes);
app.use("/api/utils", utilsRoutes);

// Listening to port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.get("/", (req, res) => {
	res.header("Access-Control-Allow-Origin", "*").send("Shyppin API running 🚚");
});
