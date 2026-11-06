
import axios from "axios";

// ==========================================
// AXIOS API CONFIGURATION
// ==========================================

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

// ==========================================
// JWT AUTHENTICATION INTERCEPTOR
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("shopora_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// CUSTOMER AUTHENTICATION APIs
// ==========================================

// Customer registration
export const registerCustomer = (customerData) => {
  return api.post("/auth/register", customerData);
};

// Customer login
export const loginCustomer = (loginData) => {
  return api.post("/auth/login", loginData);
};

// Get authenticated customer profile
export const getCustomerProfile = () => {
  return api.get("/auth/profile");
};

// Customer logout (local session cleanup)
export const logoutCustomer = () => {
  sessionStorage.removeItem("shopora_token");
  sessionStorage.removeItem("shopora_customer");
};

// ==========================================
// PRODUCT APIs
// ==========================================

// Get all active products
export const getProducts = () => {
  return api.get("/products");
};

// Get a single product by ID
export const getProductById = (productId) => {
  return api.get(`/products/${productId}`);
};

// ==========================================
// CATEGORY APIs
// ==========================================

// Get all categories
export const getCategories = () => {
  return api.get("/categories");
};

// ==========================================
// EXPORT AXIOS INSTANCE
// ==========================================

export default api;
