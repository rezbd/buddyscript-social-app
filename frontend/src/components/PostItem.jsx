import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── CommentItem ───────────────────────────────────────────────────────────────
// Handles like + reply for a single comment

function CommentItem({ comment: initialComment }) {
  const { user } = useAuth();
  const [comment,      setComment]      = useState(initialComment);
  const [replyOpen,    setReplyOpen]    = useState(false);
  const [replyText,    setReplyText]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [likePending,  setLikePending]  = useState(false);
  const replyRef = useRef(null);

  const likedByMe  = comment.likes?.map(String).includes(String(user?.id));
  const likeCount  = comment.likes?.length || 0;

  // Focus reply input when opened
  useEffect(() => {
    if (replyOpen && replyRef.current) replyRef.current.focus();
  }, [replyOpen]);

  // ── Like comment ─────────────────────────────────────────────────────────
  const handleLikeComment = async () => {
    if (likePending) return;
    // Optimistic update
    setComment((prev) => {
      const alreadyLiked = prev.likes?.map(String).includes(String(user?.id));
      return {
        ...prev,
        likes: alreadyLiked
          ? prev.likes.filter((id) => String(id) !== String(user?.id))
          : [...(prev.likes || []), user?.id],
      };
    });
    try {
      setLikePending(true);
      await api.post(`/comments/${comment._id}/like`);
    } catch (err) {
      // Revert on error
      setComment(initialComment);
      console.error(err);
    } finally {
      setLikePending(false);
    }
  };

  // ── Submit reply ─────────────────────────────────────────────────────────
  const handleReply = async () => {
    if (!replyText.trim() || submitting) return;
    try {
      setSubmitting(true);
      const { data } = await api.post(`/comments/${comment._id}/reply`, {
        content: replyText,
      });
      setComment((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), data],
      }));
      setReplyText("");
      setReplyOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="_comment_main" style={{ marginTop: "16px" }}>
      <div className="_comment_image">
        <img src="/images/txt_img.png" alt="" className="_comment_img1" />
      </div>
      <div className="_comment_area" style={{ flex: 1 }}>
        <div className="_comment_details">

          {/* Author + content */}
          <div className="_comment_details_top">
            <h4 className="_comment_name_title">
              {comment.author?.firstName} {comment.author?.lastName}
            </h4>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{comment.content}</span>
            </p>
          </div>

          {/* Like count badge */}
          {likeCount > 0 && (
            <div className="_total_reactions" style={{ marginBottom: "4px" }}>
              <div className="_total_react">
                <span className="_reaction_like">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill={likedByMe ? "#377DFF" : "none"} stroke={likedByMe ? "#377DFF" : "currentColor"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </span>
              </div>
              <span className="_total" style={{ fontSize: "12px" }}>{likeCount}</span>
            </div>
          )}

          {/* Action row: Like · Reply · time */}
          <div className="_comment_reply">
            <ul className="_comment_reply_list">
              <li>
                <button
                  onClick={handleLikeComment}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    color: likedByMe ? "#377DFF" : "inherit",
                    fontWeight: likedByMe ? "600" : "normal",
                    fontSize: "13px",
                  }}
                >
                  {likedByMe ? "Liked." : "Like."}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setReplyOpen((v) => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "13px" }}
                >
                  Reply.
                </button>
              </li>
              <li>
                <span className="_time_link">{timeAgo(comment.createdAt)}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Reply input */}
        {replyOpen && (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "flex-start" }}>
            <img src="/images/comment_img.png" alt="" className="_comment_img"
              style={{ width: "30px", height: "30px", borderRadius: "50%", marginTop: "4px" }} />
            <div style={{ flex: 1, position: "relative" }}>
              <textarea
                ref={replyRef}
                className="form-control _comment_textarea"
                placeholder={`Reply to ${comment.author?.firstName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                  if (e.key === "Escape") setReplyOpen(false);
                }}
                rows={1}
                style={{ resize: "none", paddingRight: "36px" }}
              />
              <button
                onClick={handleReply}
                disabled={submitting}
                style={{
                  position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                  <path fill="#377DFF" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies?.length > 0 && (
          <div style={{ marginTop: "10px", paddingLeft: "16px", borderLeft: "2px solid #eee" }}>
            {comment.replies.map((reply, i) => (
              <div key={reply._id || i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <img src="/images/txt_img.png" alt="" className="_comment_img1"
                    style={{ width: "26px", height: "26px", borderRadius: "50%" }} />
                  <div>
                    <h4 className="_comment_name_title" style={{ fontSize: "13px", marginBottom: "2px" }}>
                      {reply.author?.firstName} {reply.author?.lastName}
                    </h4>
                    <p className="_comment_status_text" style={{ fontSize: "13px", margin: 0 }}>
                      {reply.content}
                    </p>
                    <span className="_time_link" style={{ fontSize: "11px" }}>
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── LikesPopover ──────────────────────────────────────────────────────────────
// Tooltip listing names of users who liked the post

function LikesPopover({ likerNames, visible }) {
  if (!visible || likerNames.length === 0) return null;
  return (
    <div style={{
      position: "absolute",
      bottom: "calc(100% + 8px)",
      left: "0",
      background: "#222",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      whiteSpace: "nowrap",
      zIndex: 100,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      maxWidth: "220px",
    }}>
      {likerNames.slice(0, 8).join(", ")}
      {likerNames.length > 8 && ` +${likerNames.length - 8} more`}
      {/* Arrow */}
      <div style={{
        position: "absolute", bottom: "-6px", left: "14px",
        width: 0, height: 0,
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
        borderTop: "6px solid #222",
      }} />
    </div>
  );
}

// ── PostItem ──────────────────────────────────────────────────────────────────

export default function PostItem({ post }) {
  const { user } = useAuth();

  // ── Like state (optimistic) ───────────────────────────────────────────────
  const [likes,       setLikes]       = useState(post.likes || []);
  const [likePending, setLikePending] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);

  // ── Comment state ─────────────────────────────────────────────────────────
  const [comments,     setComments]     = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsFetched, setCommentsFetched] = useState(false);
  const [commentText,  setCommentText]  = useState("");
  const [cmtPending,   setCmtPending]   = useState(false);
  const [loadingCmts,  setLoadingCmts]  = useState(false);

  const likedByMe = likes.map(String).includes(String(user?.id));
  const likeCount = likes.length;

  // Build liker names from the likes array.
  // The API returns likes as an array of user-id strings (after toggle),
  // so we can only show "You" for self; for a richer list you'd populate
  // likes on the backend GET feed endpoint (already done via enrichPost).
  const likerNames = post.likes?.map
    ? post.likes.map((l) =>
        typeof l === "object"
          ? `${l.firstName} ${l.lastName}`
          : String(l) === String(user?.id)
          ? `${user.firstName} ${user.lastName}`
          : "Someone"
      )
    : [];

  // Sync like names after optimistic update by tracking local like ids
  const [likeIds, setLikeIds] = useState(
    (post.likes || []).map((l) => (typeof l === "object" ? l._id || l : l))
  );

  // ── Like post (optimistic) ────────────────────────────────────────────────
  const handleLike = async () => {
    if (likePending) return;

    const alreadyLiked = likeIds.map(String).includes(String(user?.id));

    // Optimistic
    if (alreadyLiked) {
      setLikeIds((prev) => prev.filter((id) => String(id) !== String(user?.id)));
      setLikes((prev) => prev.filter((id) => String(id) !== String(user?.id)));
    } else {
      setLikeIds((prev) => [...prev, user?.id]);
      setLikes((prev) => [...prev, user?.id]);
    }

    try {
      setLikePending(true);
      await api.post(`/posts/${post._id}/like`);
      // Server confirms — we already updated optimistically, nothing more needed
    } catch (err) {
      // Revert
      setLikeIds((post.likes || []).map((l) => (typeof l === "object" ? l._id || l : l)));
      setLikes(post.likes || []);
      console.error(err);
    } finally {
      setLikePending(false);
    }
  };

  // ── Load comments ─────────────────────────────────────────────────────────
  const fetchComments = async () => {
    if (commentsFetched) return;
    try {
      setLoadingCmts(true);
      const { data } = await api.get(`/posts/${post._id}/comments`);
      setComments(data);
      setCommentsFetched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCmts(false);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments) await fetchComments();
    setShowComments((v) => !v);
  };

  // ── Submit new comment ────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!commentText.trim() || cmtPending) return;
    try {
      setCmtPending(true);
      const { data } = await api.post(`/posts/${post._id}/comments`, {
        content: commentText,
      });
      setComments((prev) => [data, ...prev]);
      setCommentText("");
      if (!showComments) setShowComments(true);
      if (!commentsFetched) setCommentsFetched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCmtPending(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const likedByMeCurrent = likeIds.map(String).includes(String(user?.id));

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">

      {/* ── Post header ──────────────────────────────────────────────────── */}
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/images/post_img.png" alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author?.firstName} {post.author?.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.createdAt)} &middot;{" "}
                <span>{post.visibility === "public" ? "Public" : "Private"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <p style={{ margin: "12px 0", lineHeight: "1.7" }}>{post.content}</p>

        {/* Image */}
        {post.image && (
          <div className="_feed_inner_timeline_image">
            <img
              src={post.image}
              alt="Post"
              className="_time_img"
              style={{ width: "100%", borderRadius: "8px", objectFit: "cover", maxHeight: "400px" }}
            />
          </div>
        )}
      </div>

      {/* ── Counts row ────────────────────────────────────────────────────── */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">

        {/* Like count with hover popover */}
        <div
          style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
          onMouseEnter={() => setPopoverVisible(true)}
          onMouseLeave={() => setPopoverVisible(false)}
        >
          <LikesPopover
            likerNames={
              likeIds.map((id) =>
                String(id) === String(user?.id)
                  ? `${user.firstName} ${user.lastName}`
                  : "Someone"
              )
            }
            visible={popoverVisible}
          />
          <span style={{ fontSize: "13px", color: "#555" }}>
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
        </div>

        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <button
              onClick={handleToggleComments}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "13px" }}
            >
              <span>{comments.length}</span> Comment{comments.length !== 1 ? "s" : ""}
            </button>
          </p>
        </div>
      </div>

      {/* ── Reaction bar ─────────────────────────────────────────────────── */}
      <div className="_feed_inner_timeline_reaction">

        {/* Like button */}
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction${likedByMeCurrent ? " _feed_reaction_active" : ""}`}
          onClick={handleLike}
          disabled={likePending}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill={likedByMeCurrent ? "#377DFF" : "none"}
                stroke={likedByMeCurrent ? "#377DFF" : "currentColor"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              {likedByMeCurrent ? "Liked" : "Like"}
            </span>
          </span>
        </button>

        {/* Comment toggle */}
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={handleToggleComments}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              Comment
            </span>
          </span>
        </button>

        {/* Share (static UI only) */}
        <button className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
              </svg>
              Share
            </span>
          </span>
        </button>
      </div>

      {/* ── Comment input ─────────────────────────────────────────────────── */}
      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <div className="_feed_inner_comment_box_form">
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img src="/images/comment_img.png" alt="" className="_comment_img" />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea
                  className="form-control _comment_textarea"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
              </div>
            </div>
            <div className="_feed_inner_comment_box_icon">
              <button
                className="_feed_inner_comment_box_icon_btn"
                onClick={handleComment}
                disabled={cmtPending}
                title="Send comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 14 13">
                  <path
                    fill={cmtPending ? "#ccc" : "#377DFF"}
                    fillRule="evenodd"
                    d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Comments list ─────────────────────────────────────────────────── */}
      {showComments && (
        <div style={{ paddingLeft: "24px", paddingRight: "24px", marginTop: "8px" }}>
          {loadingCmts && (
            <p style={{ color: "#888", fontSize: "13px" }}>Loading comments...</p>
          )}
          {!loadingCmts && comments.length === 0 && (
            <p style={{ color: "#aaa", fontSize: "13px" }}>
              No comments yet. Be the first!
            </p>
          )}
          {!loadingCmts && comments.map((c) => (
            <CommentItem key={c._id} comment={c} />
          ))}
        </div>
      )}
    </div>
  );
}