const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    image: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

PostSchema.index({ visibility: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);