import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
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

    if (!form.firstName.trim() || form.firstName.trim().length < 2)
      errs.firstName = "First name must be at least 2 characters.";

    if (!form.lastName.trim() || form.lastName.trim().length < 2)
      errs.lastName = "Last name must be at least 2 characters.";

    if (!form.email.trim())
      errs.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim()))
      errs.email = "Please enter a valid email address.";

    if (!form.password)
      errs.password = "Password is required.";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";

    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";

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
      const { data } = await api.post("/auth/register", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      login(data.token, data.user);
      navigate("/feed");
    } catch (err) {
      setLoading(false);
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setFormError("An account with this email already exists. Please use a different email or login.");
      } else if (status === 400 && message) {
        setFormError(message);
      } else if (status === 429) {
        setFormError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setFormError("Unable to register. Please try again later.");
      }
    }
  };

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
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

      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">

            {/* Left illustration */}
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src="/images/registration.png" alt="" />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/images/registration1.png" alt="" />
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img src="/images/logo.svg" alt="Logo" className="_right_logo" />
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">
                  Registration
                </h4>

                <button type="button" className="_social_registration_content_btn _mar_b40">
                  <img src="/images/google.svg" alt="" className="_google_img" />
                  <span>Register with google</span>
                </button>

                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                {formError && (
                  <div className="alert alert-danger" role="alert" aria-live="assertive">
                    {formError}
                  </div>
                )}

                <div className="_social_registration_form">
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="regFirstName">
                          First Name
                        </label>
                        <input
                          id="regFirstName"
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.firstName ? " is-invalid" : ""}`}
                          placeholder="First name"
                          autoComplete="given-name"
                        />
                        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="regLastName">
                          Last Name
                        </label>
                        <input
                          id="regLastName"
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.lastName ? " is-invalid" : ""}`}
                          placeholder="Last name"
                          autoComplete="family-name"
                        />
                        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-xl-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="regEmail">
                          Email
                        </label>
                        <input
                          id="regEmail"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.email ? " is-invalid" : ""}`}
                          placeholder="Enter your email"
                          autoComplete="email"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-xl-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="regPassword">
                          Password
                        </label>
                        <input
                          id="regPassword"
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.password ? " is-invalid" : ""}`}
                          placeholder="Create a password (min. 8 chars)"
                          autoComplete="new-password"
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-xl-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="regConfirmPassword">
                          Repeat Password
                        </label>
                        <input
                          id="regConfirmPassword"
                          type="password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.confirmPassword ? " is-invalid" : ""}`}
                          placeholder="Repeat your password"
                          autoComplete="new-password"
                        />
                        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="checkbox"
                          id="agreeTerms"
                        />
                        <label
                          className="form-check-label _social_registration_form_check_label"
                          htmlFor="agreeTerms"
                        >
                          I agree to terms &amp; conditions
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button
                          type="button"
                          className="_social_registration_form_btn_link _btn1"
                          onClick={handleSubmit}
                          disabled={loading}
                        >
                          {loading ? "Registering…" : "Register now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account?{" "}
                        <Link to="/login">Login here</Link>
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