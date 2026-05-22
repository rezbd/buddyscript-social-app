require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" })); // 10 MB cap for base64 image uploads

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many requests. Please slow down and try again later." },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many authentication attempts. Please try again in 15 minutes." },
});

const postCreateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "You are posting too quickly. Please wait and try again." },
});

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

app.set("postCreateLimiter", postCreateLimiter);

// Health check
app.get("/", (req, res) => res.json({ message: "API is running" }));

app.use((err, req, res, _next) => {
    console.error("[UnhandledError]", err);
    res.status(500).json({ message: "An unexpected server error occurred." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));