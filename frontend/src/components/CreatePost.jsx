import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content,    setContent]    = useState("");
  const [image,      setImage]      = useState(null);      // base64 string
  const [imagePreview, setImagePreview] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const fileRef = useRef();

  // Convert file → base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return setError("Image must be under 5 MB.");
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);        // full base64 data-URL
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    setError("");
    if (!content.trim()) return setError("Post content cannot be empty.");
    try {
      setLoading(true);
      const { data } = await api.post("/posts", { content, image, visibility });
      onPostCreated(data);           // bubble new post up to Feed
      setContent("");
      setImage(null);
      setImagePreview(null);
      setVisibility("public");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image">
          <img src="/images/txt_img.png" alt="" className="_txt_img" />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form">
          <textarea
            className="form-control _textarea"
            placeholder="Write something..."
            id="createPostTextarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <label className="_feed_textarea_label" htmlFor="createPostTextarea">
            What's on your mind, {user?.firstName}?
          </label>
        </div>
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div style={{ position: "relative", marginTop: "12px", display: "inline-block" }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "8px" }}
          />
          <button
            onClick={handleRemoveImage}
            style={{
              position: "absolute", top: "6px", right: "6px",
              background: "rgba(0,0,0,0.55)", color: "#fff",
              border: "none", borderRadius: "50%",
              width: "26px", height: "26px", cursor: "pointer", fontSize: "14px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-2" role="alert" style={{ padding: "6px 12px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="_feed_inner_text_area_bottom">
        <div className="_feed_inner_text_area_item">

          {/* Photo upload */}
          <div className="_feed_inner_text_area_bottom_photo _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z" />
                </svg>
              </span>
              Photo
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Visibility toggle */}
          <div className="_feed_inner_text_area_bottom_event _feed_common">
            <button
              type="button"
              className="_feed_inner_text_area_bottom_photo_link"
              onClick={() => setVisibility((v) => (v === "public" ? "private" : "public"))}
            >
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                {visibility === "public" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                )}
              </span>
              {visibility === "public" ? "Public" : "Private"}
            </button>
          </div>
        </div>

        {/* Post button */}
        <div className="_feed_inner_text_area_btn">
          <button
            type="button"
            className="_feed_inner_text_area_btn_link"
            onClick={handleSubmit}
            disabled={loading}
          >
            <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
              <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
            </svg>
            <span>{loading ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}