const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");
const { createPost, getFeed, togglePostLike } = require("../controllers/postController");
const { addComment, getComments }             = require("../controllers/commentController");

router.use(protect);                              // all post routes are protected

router.route("/")
  .post(createPost)
  .get(getFeed);

router.post("/:id/like",     togglePostLike);
router.post("/:id/comments", addComment);
router.get( "/:id/comments", getComments);

module.exports = router;