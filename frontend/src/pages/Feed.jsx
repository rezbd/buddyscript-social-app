import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostItem from "../components/PostItem";

export default function Feed() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchPosts = useCallback(async (pageNum = 1, signal) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const { data } = await api.get("/posts", {
        params: { page: pageNum, limit: 10 },
        signal,
      });

      const incoming = Array.isArray(data.posts) ? data.posts : [];

      setPosts((prev) =>
        pageNum === 1 ? incoming : [...prev, ...incoming]
      );
      setHasMore(data.hasMore ?? false);
      setTotal(data.total ?? 0);
      setPage(pageNum);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;

      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      } else {
        setError("Failed to load posts. Please refresh the page.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPosts(1, controller.signal);
    return () => controller.abort();
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setTotal((n) => n + 1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) fetchPosts(page + 1);
  };

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">

        <Navbar />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">

              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">
                        Explore
                      </h4>
                      <ul className="_left_inner_area_explore_list">
                        {[
                          { label: "Learning", badge: "New" },
                          { label: "Insights" },
                          { label: "Find friends" },
                          { label: "Bookmarks" },
                          { label: "Groups" },
                          { label: "Gaming", badge: "New" },
                          { label: "Settings" },
                        ].map(({ label, badge }) => (
                          <li key={label} className="_left_inner_area_explore_item">
                            <a href="#0" className="_left_inner_area_explore_link">{label}</a>
                            {badge && (
                              <span className="_left_inner_area_explore_link_txt">{badge}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">

                    <CreatePost onPostCreated={handlePostCreated} />


                    {error && (
                      <div className="alert alert-danger" role="alert">{error}</div>
                    )}

                    {loading && (
                      <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                        Loading posts…
                      </div>
                    )}

                    {!loading && !error && posts.length === 0 && (
                      <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                        No posts yet. Be the first to post something!
                      </div>
                    )}

                    {posts.map((post) => (
                      <PostItem key={post._id} post={post} />
                    ))}

                    {hasMore && (
                      <div style={{ textAlign: "center", padding: "16px 0 32px" }}>
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          style={{
                            background: "#377DFF", color: "#fff",
                            border: "none", borderRadius: "6px",
                            padding: "10px 28px", cursor: "pointer",
                            fontSize: "14px", fontWeight: 500,
                            opacity: loadingMore ? 0.7 : 1,
                          }}
                        >
                          {loadingMore ? "Loading…" : `Load more  (${posts.length} of ${total})`}
                        </button>
                      </div>
                    )}

                    {!hasMore && posts.length > 0 && (
                      <div style={{ textAlign: "center", padding: "8px 0 24px", color: "#aaa", fontSize: "13px" }}>
                        You've reached the end.
                      </div>
                    )}

                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_right_inner_area_info_content _mar_b24">
                        <h4 className="_right_inner_area_info_content_title _title5">
                          You Might Like
                        </h4>
                        <span className="_right_inner_area_info_content_txt">
                          <a className="_right_inner_area_info_content_txt_link" href="#0">
                            See All
                          </a>
                        </span>
                      </div>
                      <hr className="_underline" />
                      <div className="_right_inner_area_info_ppl">
                        <div className="_right_inner_area_info_box">
                          <div className="_right_inner_area_info_box_image">
                            <img src="/images/Avatar.png" alt="" className="_ppl_img" />
                          </div>
                          <div className="_right_inner_area_info_box_txt">
                            <h4 className="_right_inner_area_info_box_title">Suggested User</h4>
                            <p className="_right_inner_area_info_box_para">Member</p>
                          </div>
                        </div>
                        <div className="_right_info_btn_grp">
                          <button type="button" className="_right_info_btn_link">Ignore</button>
                          <button type="button" className="_right_info_btn_link _right_info_btn_link_active">
                            Follow
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}