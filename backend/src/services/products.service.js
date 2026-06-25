import { getPool } from "../db/pool.js";
import { toPublicProduct } from "../utils/productMapper.js";

export async function listProducts({
  search = "",
  category = "",
  sortBy = "",
  limit = 12,
  skip = 0,
} = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(
      `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR brand ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  let orderClause = "ORDER BY created_at DESC";
  if (sortBy) {
    const [field, order] = sortBy.split("-");
    const allowed = {
      price: "price",
      title: "title",
      rating: "rating",
    };
    if (allowed[field]) {
      orderClause = `ORDER BY ${allowed[field]} ${order === "desc" ? "DESC" : "ASC"}`;
    }
  }

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM products ${whereClause}`,
    params
  );

  params.push(limit, skip);
  const result = await pool.query(
    `SELECT * FROM products ${whereClause} ${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return {
    products: result.rows.map(toPublicProduct),
    total: countResult.rows[0].total,
    limit,
    skip,
  };
}

export async function getCategories() {
  const pool = getPool();
  const result = await pool.query(
    `SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category`
  );
  return result.rows.map((r) => r.category);
}

export async function getProductById(id) {
  const pool = getPool();
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  if (!result.rows[0]) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return toPublicProduct(result.rows[0]);
}

export async function createProduct(data) {
  const pool = getPool();

  if (data.couponCode) {
    await ensureCouponExists(pool, data.couponCode, data.discountPercentage);
  }

  const result = await pool.query(
    `INSERT INTO products (
      title, description, price, discount_percentage, rating, stock,
      stock_status, coupon_code, brand, category, thumbnail, images
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      data.title,
      data.description || "",
      data.price,
      data.discountPercentage || 0,
      data.rating || 0,
      data.stock || 0,
      data.stockStatus || "in_stock",
      data.couponCode || null,
      data.brand || "",
      data.category || "general",
      data.thumbnail || "",
      JSON.stringify(data.images || []),
    ]
  );

  return toPublicProduct(result.rows[0]);
}

export async function updateProduct(id, data) {
  const pool = getPool();
  const existing = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  if (!existing.rows[0]) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  if (data.couponCode) {
    await ensureCouponExists(pool, data.couponCode, data.discountPercentage);
  }

  const result = await pool.query(
    `UPDATE products SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      price = COALESCE($3, price),
      discount_percentage = COALESCE($4, discount_percentage),
      rating = COALESCE($5, rating),
      stock = COALESCE($6, stock),
      stock_status = COALESCE($7, stock_status),
      coupon_code = $8,
      brand = COALESCE($9, brand),
      category = COALESCE($10, category),
      thumbnail = COALESCE($11, thumbnail),
      images = COALESCE($12, images)
    WHERE id = $13
    RETURNING *`,
    [
      data.title,
      data.description,
      data.price,
      data.discountPercentage,
      data.rating,
      data.stock,
      data.stockStatus,
      data.couponCode ?? existing.rows[0].coupon_code,
      data.brand,
      data.category,
      data.thumbnail,
      data.images ? JSON.stringify(data.images) : null,
      id,
    ]
  );

  return toPublicProduct(result.rows[0]);
}

export async function deleteProduct(id) {
  const pool = getPool();
  const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
  if (!result.rows[0]) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return { success: true };
}

export async function countProducts() {
  const pool = getPool();
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM products");
  return result.rows[0].count;
}

async function ensureCouponExists(pool, code, discountPercentage = 0) {
  await pool.query(
    `INSERT INTO coupons (code, discount_percentage, is_active)
     VALUES ($1, $2, true)
     ON CONFLICT (code) DO UPDATE SET discount_percentage = EXCLUDED.discount_percentage`,
    [code.toUpperCase(), discountPercentage || 0]
  );
}

export async function listCoupons() {
  const pool = getPool();
  const result = await pool.query(
    "SELECT code, discount_percentage, is_active, created_at FROM coupons ORDER BY created_at DESC"
  );
  return result.rows.map((r) => ({
    code: r.code,
    discountPercentage: Number(r.discount_percentage),
    isActive: r.is_active,
    createdAt: r.created_at,
  }));
}
