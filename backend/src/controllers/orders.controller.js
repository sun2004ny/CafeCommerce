import { createOrder, getOrdersByUserId } from "../services/orders.service.js";

export async function placeOrder(req, res, next) {
  try {
    const { items, paymentMethod, subtotal, tax, shipping, total, address } = req.body;

    if (!items?.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }
    if (total === undefined || subtotal === undefined) {
      return res.status(400).json({ error: "Order totals are required" });
    }

    const order = await createOrder(req.user.userId, {
      items,
      paymentMethod,
      subtotal: Number(subtotal),
      tax: Number(tax),
      shipping: Number(shipping),
      total: Number(total),
      address,
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await getOrdersByUserId(req.user.userId);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}
