import { getPool } from "../db/pool.js";
import { toPublicProduct } from "../utils/productMapper.js";

export async function getCartByUserId(userId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT ci.quantity, p.*
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId]
  );

  return result.rows.map((row) => ({
    ...toPublicProduct(row),
    quantity: row.quantity,
  }));
}

export async function addToCart(userId, productId, quantity = 1) {
  const pool = getPool();

  const product = await pool.query("SELECT id FROM products WHERE id = $1", [productId]);
  if (!product.rows[0]) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()`,
    [userId, productId, quantity]
  );

  return getCartByUserId(userId);
}

export async function updateCartItem(userId, productId, quantity) {
  const pool = getPool();

  if (quantity <= 0) {
    return removeFromCart(userId, productId);
  }

  const result = await pool.query(
    `UPDATE cart_items SET quantity = $1, updated_at = NOW()
     WHERE user_id = $2 AND product_id = $3
     RETURNING id`,
    [quantity, userId, productId]
  );

  if (!result.rows[0]) {
    const error = new Error("Cart item not found");
    error.status = 404;
    throw error;
  }

  return getCartByUserId(userId);
}

export async function removeFromCart(userId, productId) {
  const pool = getPool();
  await pool.query(
    "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
  return getCartByUserId(userId);
}

export async function clearCart(userId) {
  const pool = getPool();
  await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
  return [];
}
