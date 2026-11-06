
const db = require("../config/db");

// GET ALL ACTIVE PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.promise().execute(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.old_price,
        p.image,
        p.stock,
        p.rating,
        p.category_id,
        c.name AS category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve products."
    });
  }
};


// GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID."
      });
    }

    const [products] = await db.promise().execute(
      `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.old_price,
          p.image,
          p.stock,
          p.rating,
          p.category_id,
          c.name AS category_name,
          p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.status = 'active'
      `,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    res.status(200).json({
      success: true,
      product: products[0]
    });

  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve product."
    });
  }
};


// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.promise().execute(
      `
        SELECT id, name, description, created_at
        FROM categories
        ORDER BY name ASC
      `
    );

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve categories."
    });
  }
};
