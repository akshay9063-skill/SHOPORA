// src/pages/Login.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag
} from "lucide-react";

import { loginCustomer } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();

    if (!email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginCustomer({
        email,
        password: formData.password
      });

      if (response?.data?.success !== true) {
        setError(
          response?.data?.message ||
          "Login failed. Please check your details."
        );
        return;
      }

      const token = response.data.token;
      const customer = response.data.customer;

      if (!token || !customer) {
        setError("The server response is incomplete. Please contact support.");
        return;
      }

      sessionStorage.setItem("shopora_token", token);
      sessionStorage.setItem(
        "shopora_customer",
        JSON.stringify(customer)
      );

      navigate("/profile", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/" className="auth-logo">
          <ShoppingBag size={25} />
          <span>SHOPORA</span>
        </Link>
      </div>

      <div className="auth-container">
        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h1>Sign in to SHOPORA</h1>
          <p>
            Access your account, explore your favourites
            and continue your shopping journey.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Email Address *</label>

            <div className="auth-input-wrap">
              <Mail size={18} />

              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password *</label>

            <div className="auth-input-wrap">
              <Lock size={18} />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-message auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </div>

        <p className="auth-terms">
          Your SHOPORA account helps you manage
          your shopping experience securely.
        </p>
      </div>
    </div>
  );
}

export default Login;