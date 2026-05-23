const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { toggleCommentLike, addReply } = require("../controllers/commentController");

// These routes require authentication
router.post("/:id/like", protect, toggleCommentLike);
router.post("/:id/reply", protect, addReply);

module.exports = router;