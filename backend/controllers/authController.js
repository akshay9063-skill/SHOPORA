
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// CUSTOMER REGISTRATION
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db.promise().execute(
      "SELECT id FROM customers WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.promise().execute(
      `INSERT INTO customers
       (full_name, email, phone, password_hash)
       VALUES (?, ?, ?, ?)`,
      [
        full_name.trim(),
        normalizedEmail,
        phone ? phone.trim() : null,
        passwordHash
      ]
    );

    res.status(201).json({
      success: true,
      message: "SHOPORA account created successfully!",
      customer: {
        id: result.insertId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: phone || null
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
};


// CUSTOMER LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [customers] = await db.promise().execute(
      "SELECT * FROM customers WHERE email = ?",
      [normalizedEmail]
    );

    if (customers.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const customer = customers[0];

    const passwordMatch = await bcrypt.compare(
      password,
      customer.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
};


// CUSTOMER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const [customers] = await db.promise().execute(
      `SELECT id, full_name, email, phone, created_at
       FROM customers
       WHERE id = ?`,
      [req.user.id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    res.json({
      success: true,
      customer: customers[0]
    });

  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve profile."
    });
  }
};
