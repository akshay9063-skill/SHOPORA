
const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  getCategories
} = require("../controllers/productController");

// GET categories
router.get("/categories", getCategories);

// GET all products
router.get("/products", getAllProducts);

// GET product by ID
router.get("/products/:id", getProductById);

module.exports = router;
