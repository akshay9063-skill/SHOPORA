import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  useLocation,
  useNavigate
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

import {
  Search,
  ShoppingBag,
  Heart,
  UserRound,
  Menu,
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
  Headphones,
  Plus,
  Minus,
  Trash2,
  X,
  SlidersHorizontal
} from "lucide-react";

import "./App.css";

import {
  getProducts,
  getCategories,
  getProductById
} from "./services/api";

// ==========================================
// CATEGORY ICONS
// ==========================================

const categoryIcons = {
  Electronics: "🎧",
  Fashion: "👟",
  "Home & Living": "🛋️",
  Beauty: "✨",
  Accessories: "⌚",
  Sports: "🏀"
};

// ==========================================
// LOCAL STORAGE
// ==========================================

function loadCart() {
  try {
    const savedCart = JSON.parse(
      localStorage.getItem("shopora_cart")
    );

    if (!Array.isArray(savedCart)) return [];

    return savedCart.filter(
      (item) =>
        item &&
        Number.isInteger(item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(Number(item.price))
    );
  } catch {
    return [];
  }
}

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

// ==========================================
// CART PAGE
// ==========================================

function CartPage({
  cart,
  cartCount,
  subtotal,
  shipping,
  grandTotal,
  updateQuantity,
  removeFromCart,
  clearCart,
  onContinue,
  onCheckout
}) {
  return (
    <div className="standalone-page">
      <header className="page-topbar">
        <button className="brand page-brand" onClick={onContinue}>
          SHOP<span>ORA</span><small>.</small>
        </button>

        <button className="back-link" onClick={onContinue}>
          ← Continue shopping
        </button>
      </header>

      <div className="page-heading">
        <span className="section-kicker">YOUR SHOPPING BAG</span>
        <h1>Shopping <span>Cart</span></h1>
        <p>Review your items before moving to checkout.</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={42} />
          <h2>Your bag is waiting</h2>
          <p>
            Discover something you'll love and add it to your bag.
          </p>

          <button className="primary-button" onClick={onContinue}>
            Explore products <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <ShoppingBag size={28} />
                  )}
                </div>

                <div className="cart-item-info">
                  <span className="product-category">
                    {item.category}
                  </span>

                  <h3>{item.name}</h3>
                  <strong>{formatPrice(item.price)}</strong>

                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                      disabled={
                        item.stock > 0 && item.quantity >= item.stock
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <strong>
                    {formatPrice(Number(item.price) * item.quantity)}
                  </strong>

                  <button
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}

            <button className="clear-cart-button" onClick={clearCart}>
              <Trash2 size={15} /> Clear cart
            </button>
          </div>

          <aside className="cart-summary">
            <span className="section-kicker">ORDER SUMMARY</span>
            <h2>Order details</h2>

            <div className="summary-row">
              <span>Items ({cartCount})</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <strong>
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </strong>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(grandTotal)}</strong>
            </div>

            <button
              className="primary-button full-button"
              onClick={onCheckout}
            >
              Proceed to checkout <ArrowRight size={17} />
            </button>

            <p className="secure-note">
              <ShieldCheck size={15} />
              Secure checkout experience
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

// ==========================================
// CHECKOUT PAGE
// ==========================================

function CheckoutPage({
  cart,
  subtotal,
  shipping,
  grandTotal,
  onBack,
  onPlaceOrder
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "Cash on Delivery"
  });

  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode"
    ];

    const missingField = requiredFields.some(
      (field) => !String(formData[field]).trim()
    );

    if (missingField) {
      setFormError("Please complete all delivery details.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      setFormError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setFormError("");
    onPlaceOrder(formData);
  };

  return (
    <div className="standalone-page">
      <header className="page-topbar">
        <button className="brand page-brand" onClick={onBack}>
          SHOP<span>ORA</span><small>.</small>
        </button>

        <button className="back-link" onClick={onBack}>
          ← Back to cart
        </button>
      </header>

      <div className="page-heading">
        <span className="section-kicker">ALMOST YOURS</span>
        <h1>Secure <span>Checkout</span></h1>
        <p>Enter your delivery details to complete your order.</p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-section">
            <h2>Delivery information</h2>

            <div className="form-grid">
              <label>
                Full name
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Phone number
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                PIN code
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                />
              </label>

              <label className="full-field">
                Full address
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number, street, area..."
                  rows={3}
                  autoComplete="street-address"
                  required
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  autoComplete="address-level2"
                  required
                />
              </label>

              <label>
                State
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  autoComplete="address-level1"
                  required
                />
              </label>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Payment method</h2>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="Cash on Delivery"
                checked={formData.paymentMethod === "Cash on Delivery"}
                onChange={handleChange}
              />

              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when your order arrives.</small>
              </span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="Demo Online Payment"
                checked={formData.paymentMethod === "Demo Online Payment"}
                onChange={handleChange}
              />

              <span>
                <strong>Demo Online Payment</strong>
                <small>
                  Demonstration only. No real payment is processed.
                </small>
              </span>
            </label>
          </section>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button className="primary-button full-button" type="submit">
            Place order <ArrowRight size={17} />
          </button>
        </form>

        <aside className="cart-summary checkout-summary">
          <span className="section-kicker">YOUR ORDER</span>
          <h2>Order summary</h2>

          {cart.map((item) => (
            <div className="checkout-product" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <small>Qty: {item.quantity}</small>
              </div>

              <strong>
                {formatPrice(Number(item.price) * item.quantity)}
              </strong>
            </div>
          ))}

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <strong>
              {shipping === 0 ? "FREE" : formatPrice(shipping)}
            </strong>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(grandTotal)}</strong>
          </div>

          <p className="secure-note">
            <ShieldCheck size={15} />
            Demo checkout — no real payment is taken.
          </p>
        </aside>
      </div>
    </div>
  );
}

// ==========================================
// ORDER SUCCESS PAGE
// ==========================================

function OrderSuccessPage({ order, onContinue, onViewOrders }) {
  return (
    <div className="standalone-page success-page">
      <div className="success-card">
        <div className="success-icon">
          <ShieldCheck size={38} />
        </div>

        <span className="section-kicker">ORDER CONFIRMED</span>

        <h1>
          Thank you for <span>shopping!</span>
        </h1>

        <p>
          Your demo order has been placed successfully.
          This confirmation is stored in this browser only.
        </p>

        {order && (
          <div className="success-order-details">
            <div>
              <span>Order reference</span>
              <strong>{order.id}</strong>
            </div>

            <div>
              <span>Order total</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>

            <div>
              <span>Payment method</span>
              <strong>{order.paymentMethod}</strong>
            </div>
          </div>
        )}

        <div className="success-actions">
          <button className="primary-button" onClick={onContinue}>
            Continue shopping <ArrowRight size={17} />
          </button>

          <button className="secondary-button" onClick={onViewOrders}>
            View order history
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PRODUCT DETAILS PAGE
// ==========================================

function ProductDetailsPage({ onAddToCart, onBack }) {
  const location = useLocation();

  // FIX: Read the product ID from the current URL.
  // Example: /products/1 returns "1".
  // Do not use useParams() because this app uses manual pathname routing.
  const id = location.pathname.match(/^\/products\/(\d+)$/)?.[1] || null;

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id || !/^\d+$/.test(id)) {
          throw new Error(
            "Invalid product ID. Please return to the shop and select a product."
          );
        }

        const response = await getProductById(id);

        if (
          !response.data.success ||
          !response.data.product
        ) {
          throw new Error(
            response.data.message || "Product not found."
          );
        }

        const item = response.data.product;

        if (isMounted) {
          setProduct({
            id: Number(item.id),
            name: item.name,
            description:
              item.description ||
              "Discover this SHOPORA favourite.",
            category: item.category_name || "Uncategorized",
            categoryId: Number(item.category_id) || 0,
            price: Number(item.price) || 0,
            oldPrice: Number(item.old_price) || 0,
            rating: Number(item.rating) || 0,
            image: item.image || "",
            stock: Number(item.stock) || 0
          });

          setQuantity(1);
        }
      } catch (err) {
        console.error("Product details error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load product details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="products-message">
        <div className="loading-spinner" />
        <h3>Loading product details...</h3>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="standalone-page">
        <div className="products-message">
          <ShoppingBag size={38} />
          <h3>Product unavailable</h3>
          <p>{error || "This product could not be found."}</p>

          <button className="primary-button" onClick={onBack}>
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  const discount =
    product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  return (
    <div className="standalone-page product-details-page">
      <header className="page-topbar">
        <button className="brand page-brand" onClick={onBack}>
          SHOP<span>ORA</span><small>.</small>
        </button>

        <button className="back-link" onClick={onBack}>
          ← Back to shopping
        </button>
      </header>

      <div className="product-details-breadcrumb">
        <button onClick={onBack}>Home</button>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <strong>{product.name}</strong>
      </div>

      <main className="product-details-container">
        <div className="product-details-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">
              <ShoppingBag size={55} />
            </div>
          )}

          <span className="details-image-badge">
            SHOPORA COLLECTION
          </span>
        </div>

        <div className="product-details-info">
          <span className="section-kicker">{product.category}</span>

          <h1>{product.name}</h1>

          <div className="details-rating">
            <Star size={18} fill="currentColor" />
            <strong>{product.rating.toFixed(1)}</strong>
            <span>SHOPORA rating</span>
          </div>

          <div className="details-price">
            <strong>{formatPrice(product.price)}</strong>

            {discount > 0 && (
              <>
                <del>{formatPrice(product.oldPrice)}</del>
                <span>{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="details-description">
            {product.description}
          </p>

          <div className="details-stock">
            <span
              className={
                product.stock > 0
                  ? "stock-available"
                  : "stock-unavailable"
              }
            >
              {product.stock > 0
                ? `✓ ${product.stock} items available`
                : "Currently out of stock"}
            </span>
          </div>

          <div className="details-divider" />

          <h3>Quantity</h3>

          <div className="details-quantity">
            <button
              disabled={quantity <= 1}
              onClick={() =>
                setQuantity((value) => Math.max(1, value - 1))
              }
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>

            <span>{quantity}</span>

            <button
              disabled={
                product.stock <= 0 || quantity >= product.stock
              }
              onClick={() =>
                setQuantity((value) =>
                  Math.min(product.stock, value + 1)
                )
              }
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            className="primary-button details-add-button"
            onClick={() => onAddToCart(product, quantity)}
            disabled={product.stock <= 0}
          >
            <ShoppingBag size={18} />
            {product.stock > 0 ? "Add to cart" : "Out of stock"}
          </button>

          <div className="details-benefits">
            <div>
              <Truck size={20} />
              <span>
                <strong>Delivery</strong>
                <small>Convenient shipping</small>
              </span>
            </div>

            <div>
              <ShieldCheck size={20} />
              <span>
                <strong>Secure shopping</strong>
                <small>Safe shopping experience</small>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ==========================================
// SHOPORA MAIN APPLICATION
// ==========================================

function ShoporaApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // ========================================
  // PRODUCT AND CATEGORY STATE
  // ========================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // ========================================
  // SEARCH AND FILTER STATE
  // ========================================

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("featured");

  // ========================================
  // CART STATE
  // ========================================

  const [cart, setCart] = useState(loadCart);

  // ========================================
  // WISHLIST STATE
  // ========================================

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("shopora_wishlist")
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // ========================================
  // UI STATE
  // ========================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const [lastOrder, setLastOrder] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("shopora_last_order")
      );
    } catch {
      return null;
    }
  });

  // ========================================
  // LOAD PRODUCTS AND CATEGORIES FROM MYSQL
  // ========================================

  useEffect(() => {
    let isMounted = true;

    const loadShopData = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const [
          productsResponse,
          categoriesResponse
        ] = await Promise.all([
          getProducts(),
          getCategories()
        ]);

        if (!isMounted) return;

        if (
          !productsResponse.data.success ||
          !categoriesResponse.data.success
        ) {
          throw new Error(
            "Unable to load SHOPORA products."
          );
        }

        const formattedProducts =
          productsResponse.data.products.map((product) => ({
            id: Number(product.id),
            name: product.name,
            description:
              product.description ||
              "Discover this SHOPORA favourite.",
            category:
              product.category_name || "Uncategorized",
            categoryId: Number(product.category_id) || 0,
            price: Number(product.price) || 0,
            oldPrice: Number(product.old_price) || 0,
            rating: Number(product.rating) || 0,
            image: product.image || "",
            stock: Number(product.stock) || 0,
            badge:
              Number(product.stock) <= 5
                ? "LOW STOCK"
                : "SHOPORA PICK"
          }));

        const formattedCategories =
          categoriesResponse.data.categories.map((category) => {
            const categoryId = Number(category.id);

            const count = formattedProducts.filter(
              (product) => product.categoryId === categoryId
            ).length;

            return {
              id: categoryId,
              name: category.name,
              icon: categoryIcons[category.name] || "🛍️",
              count: `${count} Products`
            };
          });

        setProducts(formattedProducts);
        setCategories(formattedCategories);
      } catch (error) {
        console.error(
          "SHOPORA data loading error:",
          error
        );

        if (isMounted) {
          setProductsError(
            error.response?.data?.message ||
            error.message ||
            "Unable to connect to SHOPORA server."
          );
        }
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    };

    loadShopData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ========================================
  // SAVE CART AND WISHLIST
  // ========================================

  useEffect(() => {
    localStorage.setItem(
      "shopora_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      "shopora_wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // ========================================
  // CART CALCULATIONS
  // ========================================

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const shipping =
    subtotal === 0 || subtotal >= 999 ? 0 : 79;

  const grandTotal = subtotal + shipping;

  // ========================================
  // FILTER AND SORT PRODUCTS
  // ========================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) =>
          product.category === selectedCategory
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search)
      );
    }

    if (sortOrder === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    sortOrder
  ]);

  // ========================================
  // NOTIFICATION
  // ========================================

  const showMessage = (message) => {
    setCartMessage(message);
  };

  // ========================================
  // ADD TO CART
  // ========================================

  const addToCart = (product, requestedQuantity = 1) => {
    const quantity = Number(requestedQuantity);

    if (product.stock <= 0) {
      showMessage(
        "This product is currently out of stock."
      );
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      showMessage("Please select a valid quantity.");
      return;
    }

    const existingItem = cart.find(
      (item) => item.id === product.id
    );

    const currentQuantity =
      existingItem?.quantity || 0;

    if (
      currentQuantity + quantity > product.stock
    ) {
      showMessage(
        "Requested quantity exceeds available stock."
      );
      return;
    }

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity
              }
            : item
        );
      }

      return [
        ...previous,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity,
          stock: product.stock
        }
      ];
    });

    showMessage(
      `${product.name} added to your bag.`
    );
  };

  // ========================================
  // UPDATE CART QUANTITY
  // ========================================

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(
      (entry) => entry.id === productId
    );

    if (
      item &&
      item.stock !== undefined &&
      quantity > item.stock
    ) {
      showMessage(
        "Only the available stock can be added."
      );
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // ========================================
  // REMOVE FROM CART
  // ========================================

  const removeFromCart = (productId) => {
    setCart((previous) =>
      previous.filter(
        (item) => item.id !== productId
      )
    );

    showMessage(
      "Product removed from your bag."
    );
  };

  // ========================================
  // CLEAR CART
  // ========================================

  const clearCart = () => {
    setCart([]);
    showMessage("Your cart has been cleared.");
  };

  // ========================================
  // WISHLIST
  // ========================================

  const toggleWishlist = (product) => {
    setWishlist((previous) => {
      const exists = previous.includes(product.id);

      if (exists) {
        showMessage("Removed from your wishlist.");

        return previous.filter(
          (id) => id !== product.id
        );
      }

      showMessage("Added to your wishlist.");

      return [...previous, product.id];
    });
  };

  // ========================================
  // NAVIGATION
  // ========================================

  const goHome = () => {
    navigate("/");
    setMobileMenuOpen(false);
  };

  const goToProducts = () => {
    navigate("/");
    setMobileMenuOpen(false);

    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    }, 100);
  };

  const goToCart = () => {
    navigate("/cart");
    setMobileMenuOpen(false);
  };

  const goToCheckout = () => {
    if (cart.length === 0) {
      showMessage("Your cart is empty.");
      return;
    }

    navigate("/checkout");
  };

  const goToAccount = () => {
    const token = sessionStorage.getItem(
      "shopora_token"
    );

    navigate(token ? "/profile" : "/login");
    setMobileMenuOpen(false);
  };

  // ========================================
  // PLACE DEMO ORDER
  // ========================================

  const placeOrder = (customerDetails) => {
    const order = {
      id: `SHOP-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      shipping,
      total: grandTotal,
      customer: customerDetails,
      paymentMethod: customerDetails.paymentMethod,
      status: "Order placed"
    };

    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("shopora_orders") || "[]"
      );

      const orders = Array.isArray(savedOrders)
        ? savedOrders
        : [];

      orders.unshift(order);

      localStorage.setItem(
        "shopora_orders",
        JSON.stringify(orders)
      );

      localStorage.setItem(
        "shopora_last_order",
        JSON.stringify(order)
      );

      setLastOrder(order);
      setCart([]);

      navigate("/order-success");
    } catch (error) {
      console.error(
        "Unable to save demo order:",
        error
      );

      showMessage(
        "Unable to save your order in this browser."
      );
    }
  };

  // ========================================
  // NEWSLETTER
  // ========================================

  const handleNewsletter = (event) => {
    event.preventDefault();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        newsletterEmail
      )
    ) {
      showMessage(
        "Please enter a valid email address."
      );
      return;
    }

    showMessage(
      "Thank you for subscribing!"
    );

    setNewsletterEmail("");
  };

  // ========================================
  // PRODUCT DETAILS ROUTE
  // ========================================

  const productDetailsMatch =
    location.pathname.match(/^\/products\/(\d+)$/);

  if (productDetailsMatch) {
    return (
      <ProductDetailsPage
        onAddToCart={addToCart}
        onBack={goHome}
      />
    );
  }

  // ========================================
  // AUTHENTICATION ROUTES
  // ========================================

  if (location.pathname === "/register") {
    return <Register />;
  }

  if (location.pathname === "/login") {
    return <Login />;
  }

  if (location.pathname === "/profile") {
    return <Profile />;
  }

  // ========================================
  // CART ROUTE
  // ========================================

  if (location.pathname === "/cart") {
    return (
      <CartPage
        cart={cart}
        cartCount={cartCount}
        subtotal={subtotal}
        shipping={shipping}
        grandTotal={grandTotal}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onContinue={goHome}
        onCheckout={goToCheckout}
      />
    );
  }

  // ========================================
  // CHECKOUT ROUTE
  // ========================================

  if (location.pathname === "/checkout") {
    return (
      <CheckoutPage
        cart={cart}
        subtotal={subtotal}
        shipping={shipping}
        grandTotal={grandTotal}
        onBack={goToCart}
        onPlaceOrder={placeOrder}
      />
    );
  }

  // ========================================
  // ORDER SUCCESS ROUTE
  // ========================================

  if (location.pathname === "/order-success") {
    return (
      <OrderSuccessPage
        order={lastOrder}
        onContinue={goHome}
        onViewOrders={() => navigate("/profile")}
      />
    );
  }

  // ========================================
  // MAIN HOMEPAGE
  // ========================================

  return (
    <div className="shopora-app">

      {/* ANNOUNCEMENT BAR */}

      <div className="announcement-bar">
        <p>
          <Truck size={14} />
          Free shipping on orders above ₹999
          <span> | </span>
          Discover something extraordinary.
        </p>
      </div>

      {/* HEADER */}

      <header className="main-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={goHome}
          >
            SHOP<span>ORA</span><small>.</small>
          </button>

          <nav
            className={`main-nav ${
              mobileMenuOpen ? "nav-open" : ""
            }`}
          >
            <button onClick={goHome}>Home</button>
            <button onClick={goToProducts}>Shop</button>

            <button
              onClick={() => {
                setSelectedCategory("Electronics");
                goToProducts();
              }}
            >
              Electronics
            </button>

            <button
              onClick={() => {
                setSelectedCategory("Fashion");
                goToProducts();
              }}
            >
              Fashion
            </button>

            <button onClick={goToAccount}>
              Account
            </button>
          </nav>

          <div className="header-actions">
            <button
              className="icon-button"
              onClick={goToProducts}
              aria-label="Search products"
            >
              <Search size={19} />
            </button>

            <button
              className="icon-button wishlist-header"
              onClick={goToProducts}
              aria-label="Wishlist"
            >
              <Heart size={19} />

              {wishlist.length > 0 && (
                <span className="action-count">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              className="icon-button"
              onClick={goToAccount}
              aria-label="My account"
            >
              <UserRound size={19} />
            </button>

            <button
              className="icon-button cart-header"
              onClick={goToCart}
              aria-label="Shopping cart"
            >
              <ShoppingBag size={19} />

              {cartCount > 0 && (
                <span className="action-count">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={23} />
              ) : (
                <Menu size={23} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-eyebrow">
            THE ART OF EVERYDAY LIVING
          </span>

          <h1>
            Find your
            <br />
            <span>everyday</span> extraordinary.
          </h1>

          <p>
            Thoughtfully selected essentials, modern design,
            and little details that make every day better.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={goToProducts}
            >
              Explore collection <ArrowRight size={17} />
            </button>

            <button
              className="hero-secondary"
              onClick={() => {
                setSelectedCategory("All");
                goToProducts();
              }}
            >
              Discover SHOPORA
            </button>
          </div>

          <div className="hero-trust">
            <div>
              <ShieldCheck size={17} />
              <span>Quality first</span>
            </div>

            <div>
              <Truck size={17} />
              <span>Easy delivery</span>
            </div>

            <div>
              <Headphones size={17} />
              <span>Customer care</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-card">
            <div className="hero-image-overlay">
              <span>CURATED FOR YOU</span>
              <strong>Make room for better.</strong>
            </div>
          </div>

          <div className="hero-floating-card">
            <span className="floating-star">✦</span>

            <div>
              <strong>Everyday essentials</strong>
              <small>Selected with care</small>
            </div>
          </div>
        </div>

        <div className="hero-decoration hero-decoration-one" />
        <div className="hero-decoration hero-decoration-two" />
      </section>

      {/* BENEFITS */}

      <section className="benefits-strip">
        <div>
          <Truck size={21} />
          <span>
            <strong>Free delivery</strong>
            <small>On orders above ₹999</small>
          </span>
        </div>

        <div>
          <ShieldCheck size={21} />
          <span>
            <strong>Secure shopping</strong>
            <small>Safe experience</small>
          </span>
        </div>

        <div>
          <Star size={21} />
          <span>
            <strong>Curated quality</strong>
            <small>Products you'll love</small>
          </span>
        </div>

        <div>
          <Headphones size={21} />
          <span>
            <strong>Customer support</strong>
            <small>We're here to help</small>
          </span>
        </div>
      </section>

      {/* CATEGORY SECTION */}

      <section className="category-section section-container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              EXPLORE BY CATEGORY
            </span>

            <h2>
              Find your <span>kind of thing.</span>
            </h2>

            <p>
              Explore thoughtfully selected collections.
            </p>
          </div>

          <button
            className="text-link"
            onClick={() => {
              setSelectedCategory("All");
              goToProducts();
            }}
          >
            View all products <ArrowRight size={16} />
          </button>
        </div>

        <div className="category-grid">
          <button
            className={`category-card ${
              selectedCategory === "All"
                ? "category-active"
                : ""
            }`}
            onClick={() => {
              setSelectedCategory("All");
              goToProducts();
            }}
          >
            <span className="category-icon">✦</span>
            <strong>All products</strong>
            <small>{products.length} Products</small>
          </button>

          {categories.map((category) => (
            <button
              className={`category-card ${
                selectedCategory === category.name
                  ? "category-active"
                  : ""
              }`}
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.name);
                goToProducts();
              }}
            >
              <span className="category-icon">
                {category.icon}
              </span>

              <strong>{category.name}</strong>
              <small>{category.count}</small>
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}

      <section
        className="products-section section-container"
        id="products"
      >
        <div className="section-heading products-heading">
          <div>
            <span className="section-kicker">
              THE SHOPORA EDIT
            </span>

            <h2>
              Pieces worth <span>discovering.</span>
            </h2>

            <p>
              Explore our collection of everyday favourites.
            </p>
          </div>

          <div className="product-controls">
            <div className="search-box">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="sort-box">
              <SlidersHorizontal size={16} />

              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
                <option value="rating">
                  Top Rated
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER */}

        <div className="category-filter">
          <button
            className={
              selectedCategory === "All"
                ? "filter-active"
                : ""
            }
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              className={
                selectedCategory === category.name
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setSelectedCategory(category.name)
              }
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* PRODUCT LOADING */}

        {productsLoading ? (
          <div className="products-message">
            <div className="loading-spinner" />
            <h3>Loading SHOPORA collection...</h3>
            <p>Discovering products for you.</p>
          </div>
        ) : productsError ? (
          <div className="products-message error-message">
            <ShoppingBag size={35} />

            <h3>We couldn't load the collection.</h3>
            <p>{productsError}</p>

            <button
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              Try again <ArrowRight size={16} />
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article
                className="product-card"
                key={product.id}
              >
                <div className="product-image-wrap">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <ShoppingBag size={36} />
                    </div>
                  )}

                  <span className="product-badge">
                    {product.badge}
                  </span>

                  <button
                    className={`wishlist-button ${
                      wishlist.includes(product.id)
                        ? "wishlisted"
                        : ""
                    }`}
                    onClick={() =>
                      toggleWishlist(product)
                    }
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      size={18}
                      fill={
                        wishlist.includes(product.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  {product.stock <= 0 && (
                    <div className="out-of-stock-overlay">
                      OUT OF STOCK
                    </div>
                  )}

                  <button
                    className="quick-add-button"
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product)}
                  >
                    {product.stock <= 0
                      ? "Unavailable"
                      : "Quick add"}

                    <Plus size={16} />
                  </button>
                </div>

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="product-rating">
                    <Star
                      size={14}
                      fill="currentColor"
                    />

                    <strong>
                      {product.rating.toFixed(1)}
                    </strong>

                    <span>SHOPORA rating</span>
                  </div>

                  <div className="product-price-row">
                    <strong>
                      {formatPrice(product.price)}
                    </strong>

                    {product.oldPrice > product.price && (
                      <del>
                        {formatPrice(product.oldPrice)}
                      </del>
                    )}
                  </div>

                  <p className="stock-label">
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Currently unavailable"}
                  </p>

                  {/* PRODUCT DETAILS BUTTON */}

                  <button
                    className="view-details-button"
                    onClick={() =>
                      navigate(`/products/${product.id}`)
                    }
                  >
                    View product details
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="products-message">
            <Search size={35} />

            <h3>No products found.</h3>

            <p>
              Try another search term or choose a different category.
            </p>

            <button
              className="secondary-button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!productsLoading &&
          !productsError &&
          products.length > 0 && (
            <div className="products-count">
              Showing {filteredProducts.length} of{" "}
              {products.length} products
            </div>
          )}
      </section>

      {/* EDITORIAL PROMO */}

      <section className="editorial-section">
        <div className="editorial-content">
          <span className="section-kicker">
            A BETTER WAY TO SHOP
          </span>

          <h2>
            Thoughtful choices.
            <br />
            <span>Everyday impact.</span>
          </h2>

          <p>
            SHOPORA brings together useful products,
            considered design, and a shopping experience
            built around simplicity.
          </p>

          <button
            className="primary-button"
            onClick={goToProducts}
          >
            Explore the collection
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="editorial-decoration">
          <span>SHOPORA</span>
          <strong>Less ordinary.</strong>
          <small>More you.</small>
        </div>
      </section>

      {/* NEWSLETTER */}

      <section className="newsletter-section section-container">
        <div>
          <span className="section-kicker">
            THE SHOPORA LETTER
          </span>

          <h2>
            A little something <span>in your inbox.</span>
          </h2>

          <p>
            Get collection updates and fresh finds from SHOPORA.
          </p>
        </div>

        <form
          className="newsletter-form"
          onSubmit={handleNewsletter}
        >
          <input
            type="email"
            value={newsletterEmail}
            onChange={(event) =>
              setNewsletterEmail(event.target.value)
            }
            placeholder="Enter your email address"
            aria-label="Email address"
            required
          />

          <button type="submit">
            Subscribe <ArrowRight size={16} />
          </button>
        </form>
      </section>

      {/* FOOTER */}

      <footer className="main-footer">
        <div className="footer-main">
          <div className="footer-brand-column">
            <button
              className="brand footer-brand"
              onClick={goHome}
            >
              SHOP<span>ORA</span><small>.</small>
            </button>

            <p>
              Thoughtfully selected essentials for a
              more extraordinary everyday.
            </p>

            <div className="footer-socials">
              <span>✦</span>
              <span>◎</span>
              <span>in</span>
            </div>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>

            <button onClick={goHome}>Home</button>
            <button onClick={goToProducts}>Shop all</button>

            <button
              onClick={() => {
                setSelectedCategory("Electronics");
                goToProducts();
              }}
            >
              Electronics
            </button>

            <button
              onClick={() => {
                setSelectedCategory("Fashion");
                goToProducts();
              }}
            >
              Fashion
            </button>
          </div>

          <div className="footer-column">
            <h3>Your account</h3>

            <button onClick={() => navigate("/login")}>
              Sign in
            </button>

            <button onClick={() => navigate("/register")}>
              Create account
            </button>

            <button onClick={goToAccount}>
              My profile
            </button>

            <button onClick={goToCart}>
              Shopping cart
            </button>
          </div>

          <div className="footer-column">
            <h3>Customer care</h3>

            <a href="mailto:support@shopora.example">
              Contact us
            </a>

            <span>Shipping information</span>
            <span>Returns and refunds</span>
            <span>Privacy policy</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 SHOPORA. All rights reserved.
          </span>

          <span>
            Designed for a smarter shopping experience.
          </span>
        </div>
      </footer>

      {/* CART NOTIFICATION */}

      {cartMessage && (
        <div className="cart-toast">
          <ShoppingBag size={18} />

          <span>{cartMessage}</span>

          <button
            onClick={() => setCartMessage("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// APP ROUTER
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <ShoporaApp />
    </BrowserRouter>
  );
}

export default App;