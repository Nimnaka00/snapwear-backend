const express = require("express");
const { body, query } = require("express-validator");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/multer");

const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require("../controllers/productController");

// Public (with query validation)
router.get(
  "/",
  validate([
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
  ]),
  getAllProducts
);

router.get("/search", searchProducts);
router.get("/:id", getProductById);

// Admin-only mutating routes
const productRules = [
  body("name").notEmpty(),
  body("brand").notEmpty(),
  body("category").isIn(["Women", "Men", "Kids"]),
  body("price").isFloat({ min: 0 }),
  body("stockCount").isInt({ min: 0 }),
];

router.post(
  "/",
  auth,
  requireRole("admin"),
  upload.single("image"),
  validate(productRules),
  addProduct
);

router.put(
  "/:id",
  auth,
  requireRole("admin"),
  upload.single("image"),
  validate([]),
  updateProduct
);

router.delete("/:id", auth, requireRole("admin"), deleteProduct);

module.exports = router;
