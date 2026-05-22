import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim())
      errs.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim()))
      errs.email = "Please enter a valid email address.";
    if (!form.password)
      errs.password = "Password is required.";
    return errs;
  };

  const handleSubmit = async () => {
    setFormError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      login(data.token, data.user);
      navigate("/feed");
    } catch (err) {
      setLoading(false);
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setFormError(message || "Invalid email or password. Please check your credentials and try again.");
      } else if (status === 400) {
        setFormError(message || "Please check your email and password.");
      } else if (status === 429) {
        setFormError("Too many login attempts. Please wait a few minutes and try again.");
      } else {
        setFormError(message || "Unable to login. Please try again later.");
      }
    }
  };

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <img src="/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/images/shape2.svg" alt="" className="_shape_img" />
        <img src="/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src="/images/shape3.svg" alt="" className="_shape_img" />
        <img src="/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>

      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">

            {/* Left illustration */}
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <img src="/images/login.png" alt="" className="_left_img" />
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  <img src="/images/logo.svg" alt="Logo" className="_left_logo" />
                </div>
                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">
                  Login to your account
                </h4>

                <button type="button" className="_social_login_content_btn _mar_b40">
                  <img src="/images/google.svg" alt="" className="_google_img" />
                  <span>Or sign-in with google</span>
                </button>

                <div className="_social_login_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                {formError && (
                  <div className="alert alert-danger" role="alert" aria-live="assertive">
                    {formError}
                  </div>
                )}

                <div className="_social_login_form">
                  <div className="row">
                    <div className="col-xl-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8" htmlFor="loginEmail">
                          Email
                        </label>
                        <input
                          id="loginEmail"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={`form-control _social_login_input${errors.email ? " is-invalid" : ""}`}
                          placeholder="Enter your email"
                          autoComplete="email"
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-xl-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8" htmlFor="loginPassword">
                          Password
                        </label>
                        <input
                          id="loginPassword"
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className={`form-control _social_login_input${errors.password ? " is-invalid" : ""}`}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12">
                      <div className="_social_login_form_left">
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12">
                      <div className="_social_login_form_btn _mar_t40 _mar_b60">
                        <button
                          type="button"
                          className="_social_login_form_btn_link _btn1"
                          onClick={handleSubmit}
                          disabled={loading}
                        >
                          {loading ? "Logging in…" : "Login now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-12">
                    <div className="_social_login_bottom_txt">
                      <p className="_social_login_bottom_txt_para">
                        Don't have an account?{" "}
                        <Link to="/register">Create New Account</Link>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}