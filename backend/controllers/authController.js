const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

  if (!email || typeof email !== "string" || !email.trim())
    errors.push("Email is required.");

  if (email && typeof email === "string" && !EMAIL_RE.test(email.trim()))
    errors.push("Please enter a valid email address.");

  if (!password || typeof password !== "string" || !password.length)
    errors.push("Password is required.");

  if (password && typeof password === "string" && password.length < 8)
    errors.push("Password must be at least 8 characters.");

  if (password && password.length > 128)
    errors.push("Password must be fewer than 128 characters.");

  return errors;
};

const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || typeof email !== "string" || !email.trim())
    errors.push("Email is required.");

  if (email && typeof email === "string" && !EMAIL_RE.test(email.trim()))
    errors.push("Please enter a valid email address.");

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
    lastName = "",
    email = "",
    password = "",
  } = req.body ?? {};

  // Check for missing required fields first
  if (!firstName || !firstName.trim()) {
    return res.status(400).json({
      message: "First name is required.",
      field: "firstName"
    });
  }

  if (!lastName || !lastName.trim()) {
    return res.status(400).json({
      message: "Last name is required.",
      field: "lastName"
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      message: "Email is required.",
      field: "email"
    });
  }

  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({
      message: "Please enter a valid email address.",
      field: "email"
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Password is required.",
      field: "password"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters.",
      field: "password"
    });
  }

  try {
    // Check if email already exists BEFORE attempting to create
    const existingEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: existingEmail });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists. Please use a different email or login.",
      });
    }

    // Hash password with proper error handling
    let hashed;
    try {
      hashed = await bcrypt.hash(password, 12);
    } catch (hashErr) {
      console.error("[register] Password hash error:", hashErr);
      return res.status(500).json({ message: "Unable to process registration. Please try again later." });
    }

    // Create user with proper error handling
    let user;
    try {
      user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: existingEmail,
        password: hashed,
      });
    } catch (createErr) {
      // Handle duplicate key error from MongoDB
      if (createErr.code === 11000) {
        return res.status(409).json({
          message: "An account with this email already exists. Please use a different email or login.",
        });
      }
      console.error("[register] User creation error:", createErr);
      return res.status(500).json({ message: "Unable to create account. Please try again later." });
    }

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("[register] Unexpected error:", err);
    return res.status(500).json({ message: "Unable to register. Please try again later." });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email = "", password = "" } = req.body ?? {};

  // Check for missing fields
  if (!email || !email.trim()) {
    return res.status(400).json({
      message: "Email is required.",
      field: "email"
    });
  }

  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({
      message: "Please enter a valid email address.",
      field: "email"
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Password is required.",
      field: "password"
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password. Please check your credentials and try again."
      });
    }

    // Compare password with proper error handling
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (compareErr) {
      console.error("[login] Password compare error:", compareErr);
      // If compare fails (corrupted hash, etc.), treat as invalid credentials
      return res.status(401).json({
        message: "Invalid email or password. Please check your credentials and try again."
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password. Please check your credentials and try again."
      });
    }

    return res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("[login] Unexpected error:", err);
    return res.status(500).json({ message: "Unable to login. Please try again later." });
  }
};