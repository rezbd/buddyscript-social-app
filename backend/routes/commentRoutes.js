const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");
const { toggleCommentLike, addReply, getComments } = require("../controllers/commentController");

// GET comments - needs auth middleware (which checks token validity)
router.get("/:id/comments", protect, getComments);

// These routes require authentication
router.post("/:id/like",  protect, toggleCommentLike);
router.post("/:id/reply", protect, addReply);

module.exports = router;