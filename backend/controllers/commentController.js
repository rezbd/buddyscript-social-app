const Comment = require("../models/Comment");
const Post = require("../models/Post");

const AUTHOR_SELECT = "firstName lastName";

const resolveAccessiblePost = async (postId, userId, res) => {
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404).json({ message: "Post not found." });
    return null;
  }
  const isAuthor = String(post.author) === String(userId);
  if (post.visibility === "private" && !isAuthor) {
    res.status(403).json({ message: "You do not have permission to access this post." });
    return null;
  }
  return post;
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content) {
    return res.status(400).json({ message: "Comment content is required." });
  }
  if (content.length > 1000) {
    return res.status(400).json({ message: "Comment must be 1 000 characters or fewer." });
  }

  try {
    const post = await resolveAccessiblePost(req.params.id, req.user._id, res);
    if (!post) return;

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      content,
    });

    await comment.populate("author", AUTHOR_SELECT);
    return res.status(201).json(comment);
  } catch (err) {
    console.error("[addComment]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// GET /api/posts/:id/comments
exports.getComments = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await resolveAccessiblePost(postId, req.user._id, res);
    if (!post) return;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 5));
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ post: postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", AUTHOR_SELECT)
        .populate("replies.author", AUTHOR_SELECT)
        .populate("likes", AUTHOR_SELECT),
      Comment.countDocuments({ post: postId }),
    ]);

    return res.json({
      comments: comments.map(c => c.toObject()),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      total,
    });
  } catch (err) {
    console.error("[getComments]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// POST /api/comments/:id/like
exports.toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found." });

    const post = await resolveAccessiblePost(comment.post, req.user._id, res);
    if (!post) return;

    const uid = String(req.user._id);
    const idx = comment.likes.map(String).indexOf(uid);
    const liked = idx === -1;

    if (liked) comment.likes.push(req.user._id);
    else comment.likes.splice(idx, 1);

    await comment.save();
    return res.json({ liked, likeCount: comment.likes.length });
  } catch (err) {
    console.error("[toggleCommentLike]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// POST /api/comments/:id/reply
exports.addReply = async (req, res) => {
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content) {
    return res.status(400).json({ message: "Reply content is required." });
  }
  if (content.length > 1000) {
    return res.status(400).json({ message: "Reply must be 1 000 characters or fewer." });
  }

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found." });

    const post = await resolveAccessiblePost(comment.post, req.user._id, res);
    if (!post) return;

    comment.replies.push({ author: req.user._id, content });
    await comment.save();

    const updated = await Comment.findById(comment._id)
      .populate("author", AUTHOR_SELECT)
      .populate("replies.author", AUTHOR_SELECT);

    return res.status(201).json(updated.replies.at(-1));
  } catch (err) {
    console.error("[addReply]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};