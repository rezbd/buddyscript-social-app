const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const AUTHOR_SELECT = "firstName lastName";

const canAccessPost = (post, userId) =>
  post.visibility === "public" ||
  String(post.author._id ?? post.author) === String(userId);

const enrichPost = (post, userId, commentCount = 0) => {
  const p = post.toObject();
  p.likeCount = p.likes ? p.likes.length : 0;
  p.likedByMe = p.likes
    ? p.likes.some((l) => String(l._id ?? l) === String(userId))
    : false;
  p.commentCount = commentCount;
  return p;
};

// POST /api/posts
exports.createPost = async (req, res) => {
  const { content = "", image, visibility = "public" } = req.body ?? {};

  const trimmed = typeof content === "string" ? content.trim() : "";

  if (!trimmed && !image) {
    return res.status(400).json({ message: "Post content or an image is required." });
  }

  if (trimmed.length > 2000) {
    return res.status(400).json({ message: "Post content must be 2 000 characters or fewer." });
  }

  if (!["public", "private"].includes(visibility)) {
    return res.status(400).json({ message: "Visibility must be 'public' or 'private'." });
  }

  if (image && typeof image === "string" && !image.startsWith("data:image/")) {
    return res.status(400).json({ message: "Invalid image format." });
  }

  try {
    const post = await Post.create({
      author: req.user._id,
      content: trimmed,
      image: image ?? null,
      visibility,
    });

    await post.populate("author", AUTHOR_SELECT);
    return res.status(201).json(enrichPost(post, req.user._id, 0));
  } catch (err) {
    console.error("[createPost]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// GET /api/posts
exports.getFeed = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { visibility: "public" },
        { author: req.user._id },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", AUTHOR_SELECT)
        .populate("likes", AUTHOR_SELECT),
      Post.countDocuments(query),
    ]);

    const postIds = posts.map((p) => new mongoose.Types.ObjectId(p._id));

    const commentAgg = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      commentAgg.map((c) => [String(c._id), c.count])
    );

    return res.json({
      posts: posts.map((p) => enrichPost(p, req.user._id, countMap[String(p._id)] ?? 0)),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      total,
    });
  } catch (err) {
    console.error("[getFeed]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// POST /api/posts/:id/like
exports.togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    if (!canAccessPost(post, req.user._id)) {
      return res.status(403).json({ message: "You do not have permission to like this post." });
    }

    const uid = String(req.user._id);
    const idx = post.likes.findIndex((id) => String(id) === uid);
    const isAddingLike = idx === -1;

    if (isAddingLike) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }

    await post.save();
    await post.populate("likes", AUTHOR_SELECT);

    return res.json({
      liked: isAddingLike,
      likeCount: post.likes.length,
      likedBy: post.likes,
    });
  } catch (err) {
    console.error("[togglePostLike]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};