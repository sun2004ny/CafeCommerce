export function toPublicProduct(row) {
  if (!row) return null;

  const images = Array.isArray(row.images)
    ? row.images
    : typeof row.images === "string"
      ? JSON.parse(row.images || "[]")
      : [];

  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    price: Number(row.price),
    discountPercentage: Number(row.discount_percentage || 0),
    rating: Number(row.rating || 0),
    stock: Number(row.stock || 0),
    stockStatus: row.stock_status || "in_stock",
    couponCode: row.coupon_code || null,
    brand: row.brand || "",
    category: row.category || "general",
    thumbnail: row.thumbnail || "",
    images,
    createdAt: row.created_at,
  };
}
