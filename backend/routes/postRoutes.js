const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createPost, getFeed, togglePostLike } = require("../controllers/postController");
const { addComment, getComments } = require("../controllers/commentController");

// All post routes require authentication
router.use(protect);

router.get("/", getFeed);

router.post("/", (req, res, next) => {
  const limiter = req.app.get("postCreateLimiter");
  if (limiter) return limiter(req, res, next);
  next();
}, createPost);

router.post("/:id/like", togglePostLike);
router.post("/:id/comments", addComment);
router.get("/:id/comments", getComments);

module.exports = router;