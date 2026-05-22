const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema(
  {
    author:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const CommentSchema = new mongoose.Schema(
  {
    post:    { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [ReplySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);