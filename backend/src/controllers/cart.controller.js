import {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../services/cart.service.js";

export async function getCart(req, res, next) {
  try {
    const items = await getCartByUserId(req.user.userId);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }
    const items = await addToCart(req.user.userId, Number(productId), Number(quantity) || 1);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItemHandler(req, res, next) {
  try {
    const { quantity } = req.body;
    const items = await updateCartItem(
      req.user.userId,
      Number(req.params.productId),
      Number(quantity)
    );
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const items = await removeFromCart(req.user.userId, Number(req.params.productId));
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function clearCartHandler(req, res, next) {
  try {
    const items = await clearCart(req.user.userId);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function syncCart(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items array is required" });
    }

    await clearCart(req.user.userId);

    for (const item of items) {
      if (item.id && item.quantity > 0) {
        await addToCart(req.user.userId, Number(item.id), Number(item.quantity));
      }
    }

    const synced = await getCartByUserId(req.user.userId);
    res.json({ items: synced });
  } catch (err) {
    next(err);
  }
}
