import express, { Request, Response } from "express";
import { config as configDotenv } from "dotenv";
import AuthRoute from "./Routes/Auth.route.js";
import connectDB from "./db/db.js";
import cors from "cors";
import requireAuth from "./utils/verifyToken.js";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import ProfileRoute from "./Routes/Profile.route.js";
import MessageRoute from "./Routes/message.route.js";
import Message from "./Models/Message.js";

const app = express();
configDotenv();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/images", express.static("public/images"));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

connectDB();

io.on("connection", (socket: any) => {
  socket.on("register", (userId: string) => {
    socket.join(userId.toString());
    socket.userId = userId;
  });

  socket.on("private_message", async ({ to, text }: any) => {
    try {
      const from = socket.userId;

      const msg = await Message.create({
        sender: from,
        receiver: to,
        text,
      });

      io.to(to.toString()).emit("privateMessage", msg);
      io.to(from.toString()).emit("privateMessage", msg);
    } catch (error) {
      console.log(error);
      socket.emit("error_message", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

app.use("/v1/auth", AuthRoute);
app.use("/v1", ProfileRoute);
app.use("/v1/messages", MessageRoute);

app.get("/home", requireAuth, (req: Request, res: Response) => {
  res.json("Hello world");
});

app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Server is running fine");
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
