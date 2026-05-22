const Post    = require("../models/Post");
const Comment = require("../models/Comment");

const AUTHOR_SELECT = "firstName lastName";

// ── Helpers ──────────────────────────────────────────────────────────────────

const enrichPost = (post, userId) => {
  const p = post.toObject();
  p.likeCount  = p.likes ? p.likes.length : 0;
  // Check likedByMe against the populated objects or IDs
  p.likedByMe  = p.likes ? p.likes.some(l => String(l._id || l) === String(userId)) : false;
  return p;
};

// ── POST /api/posts ───────────────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  const { content, image, visibility } = req.body;
  try {
    if (!content && !image) // Allow image-only posts if content is missing
      return res.status(400).json({ message: "Content or image is required" });

    const post = await Post.create({
      author: req.user._id,
      content,
      image:      image      || null,
      visibility: visibility || "public",
    });

    await post.populate("author", AUTHOR_SELECT);
    res.status(201).json(enrichPost(post, req.user._id));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/posts (With Pagination & Like Details) ──────────────────────────
exports.getFeed = async (req, res) => {
  try {
    // 1. Handle Pagination for "Millions of reads" requirement
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { visibility: "public" },
        { author: req.user._id }, // Author sees their own (public or private)
      ],
    };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", AUTHOR_SELECT)
      .populate("likes", AUTHOR_SELECT); // 2. "Show who has liked" requirement

    const total = await Post.countDocuments(query);

    res.json({
      posts: posts.map((p) => enrichPost(p, req.user._id)),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/posts/:id/like ──────────────────────────────────────────────────
exports.togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const uid = String(req.user._id);
    const idx = post.likes.findIndex(id => String(id) === uid);
    const isAddingLike = idx === -1;

    if (isAddingLike) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }

    await post.save();
    
    // Populate after save to show updated "who liked" list if needed
    await post.populate("likes", AUTHOR_SELECT);
    
    res.json({ 
      liked: isAddingLike, 
      likeCount: post.likes.length,
      likedBy: post.likes // Returns array of {firstName, lastName}
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};