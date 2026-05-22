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
      const status = err.response?.status;
      if (status === 409 || status === 400) {
        setFormError(
          err.response?.data?.message ||
          "Registration failed. Please check your details and try again."
        );
      } else if (status === 429) {
        setFormError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setFormError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reusable field helper
  const Field = ({ id, label, name, type = "text", placeholder, autoComplete }) => (
    <div className="_social_registration_form_input _mar_b14">
      <label className="_social_registration_label _mar_b8" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`form-control _social_registration_input${errors[name] ? " is-invalid" : ""}`}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
    </div>
  );

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
                      <Field id="regFirstName" label="First Name" name="firstName"
                        placeholder="First name" autoComplete="given-name" />
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <Field id="regLastName" label="Last Name" name="lastName"
                        placeholder="Last name" autoComplete="family-name" />
                    </div>
                    <div className="col-xl-12">
                      <Field id="regEmail" label="Email" name="email"
                        type="email" placeholder="Enter your email"
                        autoComplete="email" />
                    </div>
                    <div className="col-xl-12">
                      <Field id="regPassword" label="Password" name="password"
                        type="password" placeholder="Create a password (min. 8 chars)"
                        autoComplete="new-password" />
                    </div>
                    <div className="col-xl-12">
                      <Field id="regConfirmPassword" label="Repeat Password"
                        name="confirmPassword" type="password"
                        placeholder="Repeat your password"
                        autoComplete="new-password" />
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