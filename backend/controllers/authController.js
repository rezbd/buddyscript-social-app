const User    = require("../models/User");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns an array of human-readable validation error strings.
 * Empty array means the input is valid.
 */
const validateRegisterInput = ({ firstName, lastName, email, password }) => {
  const errors = [];

  if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2)
    errors.push("First name must be at least 2 characters.");

  if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2)
    errors.push("Last name must be at least 2 characters.");

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    errors.push("A valid email address is required.");

  if (!password || typeof password !== "string" || password.length < 8)
    errors.push("Password must be at least 8 characters.");

  if (password && password.length > 128)
    errors.push("Password must be fewer than 128 characters.");

  return errors;
};

const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    errors.push("A valid email address is required.");

  if (!password || typeof password !== "string" || !password.length)
    errors.push("Password is required.");

  return errors;
};


const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
exports.register = async (req, res) => {
  const {
    firstName = "",
    lastName  = "",
    email     = "",
    password  = "",
  } = req.body ?? {};

  const errors = validateRegisterInput({ firstName, lastName, email, password });
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
      return res.status(409).json({
        message: "Registration failed. Please check your details and try again.",
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashed,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
      },
    });
  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email = "", password = "" } = req.body ?? {};

  const errors = validateLoginInput({ email, password });
  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.json({
      token: generateToken(user._id),
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
      },
    });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};