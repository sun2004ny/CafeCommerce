import { getPool } from "../db/pool.js";

export async function createOrder(userId, { items, paymentMethod, subtotal, tax, shipping, total, address }) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let addressId = null;
    if (address) {
      const addrResult = await client.query(
        `INSERT INTO addresses (user_id, name, street, city, state, zip, phone, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false)
         RETURNING id`,
        [
          userId,
          address.name || "Delivery",
          address.street,
          address.city,
          address.state,
          address.zip,
          address.phone || "",
        ]
      );
      addressId = addrResult.rows[0].id;
    }

    const status = paymentMethod === "cod" ? "pending" : "paid";

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, address_id, payment_method, status, subtotal, tax, shipping, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, addressId, paymentMethod, status, subtotal, tax, shipping, total]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, title, price, quantity, thumbnail)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.productId || item.id, item.title, item.price, item.quantity, item.thumbnail || null]
      );
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    await client.query("COMMIT");

    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.payment_method,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      total: Number(order.total),
      createdAt: order.created_at,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getOrdersByUserId(userId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT o.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'title', oi.title,
            'price', oi.price,
            'quantity', oi.quantity,
            'thumbnail', oi.thumbnail
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId]
  );

  return result.rows.map((o) => ({
    id: o.id,
    status: o.status,
    paymentMethod: o.payment_method,
    subtotal: Number(o.subtotal),
    tax: Number(o.tax),
    shipping: Number(o.shipping),
    total: Number(o.total),
    createdAt: o.created_at,
    items: o.items,
  }));
}
