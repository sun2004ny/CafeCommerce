import {
  listProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listCoupons,
} from "../services/products.service.js";

export async function listProductsHandler(req, res, next) {
  try {
    const { search, category, sortBy, limit, skip } = req.query;
    const data = await listProducts({
      search: search || "",
      category: category || "",
      sortBy: sortBy || "",
      limit: Math.min(Number(limit) || 12, 100),
      skip: Number(skip) || 0,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getCategoriesHandler(req, res, next) {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function getProductHandler(req, res, next) {
  try {
    const product = await getProductById(Number(req.params.id));
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function createProductHandler(req, res, next) {
  try {
    const {
      title,
      description,
      price,
      discountPercentage,
      rating,
      stock,
      stockStatus,
      couponCode,
      brand,
      category,
      thumbnail,
      images,
    } = req.body;

    if (!title?.trim() || price === undefined) {
      return res.status(400).json({ error: "Title and price are required" });
    }

    const product = await createProduct({
      title: title.trim(),
      description,
      price: Number(price),
      discountPercentage: Number(discountPercentage) || 0,
      rating: Number(rating) || 0,
      stock: Number(stock) || 0,
      stockStatus: stockStatus || (Number(stock) > 0 ? "in_stock" : "out_of_stock"),
      couponCode: couponCode?.trim().toUpperCase() || null,
      brand,
      category,
      thumbnail,
      images,
    });

    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateProductHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    const body = req.body;
    const updates = {};

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.discountPercentage !== undefined) updates.discountPercentage = Number(body.discountPercentage);
    if (body.rating !== undefined) updates.rating = Number(body.rating);
    if (body.stock !== undefined) updates.stock = Number(body.stock);
    if (body.stockStatus !== undefined) updates.stockStatus = body.stockStatus;
    if (body.couponCode !== undefined) updates.couponCode = body.couponCode?.trim().toUpperCase() || null;
    if (body.brand !== undefined) updates.brand = body.brand;
    if (body.category !== undefined) updates.category = body.category;
    if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail;
    if (body.images !== undefined) updates.images = body.images;

    const product = await updateProduct(id, updates);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProductHandler(req, res, next) {
  try {
    await deleteProduct(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function listCouponsHandler(req, res, next) {
  try {
    const coupons = await listCoupons();
    res.json({ coupons });
  } catch (err) {
    next(err);
  }
}
