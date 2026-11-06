
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Calendar,
  LogOut,
  ShoppingBag,
  ArrowLeft,
  RefreshCw
} from "lucide-react";

import { getCustomerProfile } from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const token = sessionStorage.getItem("shopora_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getCustomerProfile();

        if (!active) return;

        if (response?.data?.success && response.data.customer) {
          setCustomer(response.data.customer);

          sessionStorage.setItem(
            "shopora_customer",
            JSON.stringify(response.data.customer)
          );
        } else {
          setError("Unable to retrieve your customer profile.");
        }

      } catch (err) {
        if (!active) return;

        const status = err.response?.status;

        if (status === 401 || status === 403) {
          sessionStorage.removeItem("shopora_token");
          sessionStorage.removeItem("shopora_customer");

          navigate("/login", { replace: true });
        } else {
          setError(
            err.response?.data?.message ||
            "Unable to connect to the server. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate, retryCount]);

  const handleLogout = () => {
    sessionStorage.removeItem("shopora_token");
    sessionStorage.removeItem("shopora_customer");

    setCustomer(null);

    navigate("/login", { replace: true });
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="profile-top">
            <ShoppingBag size={35} />
            <h2>Loading your profile...</h2>
            <p>Please wait while we retrieve your account details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="profile-top">
            <User size={40} />

            <h1>Profile unavailable</h1>

            <p>{error}</p>
          </div>

          <button
            type="button"
            className="auth-submit"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            <RefreshCw size={17} />
            Try Again
          </button>

          <div className="auth-switch">
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <p>Please sign in to view your profile.</p>

          <Link to="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">

      {/* BRAND */}
      <div className="auth-brand">
        <Link to="/" className="auth-logo">
          <ShoppingBag size={25} />
          <span>SHOPORA</span>
        </Link>
      </div>

      {/* PROFILE CONTAINER */}
      <div className="auth-container profile-container">

        {/* PROFILE HEADER */}
        <div className="profile-top">

          <div className="profile-avatar">
            <User size={34} />
          </div>

          <span className="auth-eyebrow">
            MY ACCOUNT
          </span>

          <h1>{customer.full_name}</h1>

          <p>Welcome to your SHOPORA account.</p>

        </div>

        {/* CUSTOMER INFORMATION */}
        <div className="profile-details">

          <div className="profile-detail-row">

            <div className="profile-detail-icon">
              <User size={19} />
            </div>

            <div>
              <span>Full Name</span>
              <strong>{customer.full_name}</strong>
            </div>

          </div>

          <div className="profile-detail-row">

            <div className="profile-detail-icon">
              <Mail size={19} />
            </div>

            <div>
              <span>Email Address</span>
              <strong>{customer.email}</strong>
            </div>

          </div>

          <div className="profile-detail-row">

            <div className="profile-detail-icon">
              <Phone size={19} />
            </div>

            <div>
              <span>Phone Number</span>
              <strong>
                {customer.phone || "Not provided"}
              </strong>
            </div>

          </div>

          <div className="profile-detail-row">

            <div className="profile-detail-icon">
              <Calendar size={19} />
            </div>

            <div>
              <span>Account Created</span>

              <strong>
                {formatDate(customer.created_at)}
              </strong>
            </div>

          </div>

        </div>

        {/* PROFILE ACTIONS */}
        <div className="profile-actions">

          <Link to="/" className="profile-home-btn">
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>

          <button
            type="button"
            className="profile-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;
