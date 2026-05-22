const Comment = require("../models/Comment");
const Post    = require("../models/Post");

const AUTHOR_SELECT = "firstName lastName";

// ── POST /api/posts/:id/comments ─────────────────────────────────────────────
exports.addComment = async (req, res) => {
  const { content } = req.body;
  try {
    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post:    post._id,
      author:  req.user._id,
      content,
    });

    await comment.populate("author", AUTHOR_SELECT);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/posts/:id/comments ──────────────────────────────────────────────
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: -1 })
      .populate("author", AUTHOR_SELECT)
      .populate("replies.author", AUTHOR_SELECT);

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/comments/:id/like ───────────────────────────────────────────────
exports.toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const uid   = String(req.user._id);
    const idx   = comment.likes.map(String).indexOf(uid);
    const liked = idx === -1;

    if (liked) comment.likes.push(req.user._id);
    else        comment.likes.splice(idx, 1);

    await comment.save();
    res.json({ liked, likeCount: comment.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/comments/:id/reply ─────────────────────────────────────────────
exports.addReply = async (req, res) => {
  const { content } = req.body;
  try {
    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ author: req.user._id, content });
    await comment.save();

    // Re-fetch to get populated reply author
    const updated = await Comment.findById(comment._id)
      .populate("author", AUTHOR_SELECT)
      .populate("replies.author", AUTHOR_SELECT);

    res.status(201).json(updated.replies.at(-1));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};