import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import userRoutes from "./routes/user.routes";
import profileRoutes from "./routes/profile.routes";
import progressRoutes from "./routes/progress.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import dailyChallengeRoutes from "./routes/daily-challenge.routes";
import lessonsRoutes from "./routes/lessons.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "TypeMaster backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/daily-challenge", dailyChallengeRoutes);
app.use("/api/lessons", lessonsRoutes);

app.listen(PORT, () => {
  console.log(
    `TypeMaster backend running on http://localhost:${PORT}`
  );
});