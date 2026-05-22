const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");
const { toggleCommentLike, addReply } = require("../controllers/commentController");

router.use(protect);

router.post("/:id/like",  toggleCommentLike);
router.post("/:id/reply", addReply);

module.exports = router;