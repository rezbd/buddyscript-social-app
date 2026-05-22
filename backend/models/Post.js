const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    author:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content:    { type: String, required: true, trim: true, maxlength: 2000 },
    image:      { type: String, default: null },       // base64 string
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    likes:      [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);