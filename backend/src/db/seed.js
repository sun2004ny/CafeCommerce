import { getPool } from "./pool.js";

const SAMPLE_PRODUCTS = [
  {
    title: "Premium Coffee Beans",
    description: "Rich arabica blend for the perfect morning brew.",
    price: 24.99,
    discount_percentage: 10,
    rating: 4.8,
    stock: 50,
    stock_status: "in_stock",
    brand: "CaféCommerce",
    category: "groceries",
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp",
  },
  {
    title: "Ceramic Coffee Mug",
    description: "Handcrafted mug with heat-retaining glaze.",
    price: 18.5,
    discount_percentage: 0,
    rating: 4.5,
    stock: 120,
    stock_status: "in_stock",
    brand: "CaféCommerce",
    category: "home-decoration",
    thumbnail: "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/thumbnail.webp",
  },
  {
    title: "Wireless Earbuds",
    description: "Noise-cancelling earbuds with 24h battery life.",
    price: 89.99,
    discount_percentage: 15,
    rating: 4.6,
    stock: 0,
    stock_status: "out_of_stock",
    brand: "SoundPro",
    category: "electronics",
    thumbnail: "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lights/thumbnail.webp",
  },
  {
    title: "Organic Green Tea",
    description: "Calming organic tea leaves from sustainable farms.",
    price: 12.99,
    discount_percentage: 5,
    rating: 4.7,
    stock: 200,
    stock_status: "in_stock",
    brand: "CaféCommerce",
    category: "groceries",
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/green-chili-pepper/thumbnail.webp",
  },
];

export async function seedDatabase() {
  const pool = getPool();

  const productCount = await pool.query("SELECT COUNT(*)::int AS count FROM products");
  if (productCount.rows[0].count > 0) {
    console.log("ℹ️  Products already exist — skipping seed");
    return;
  }

  await pool.query(
    `INSERT INTO coupons (code, discount_percentage, is_active)
     VALUES ('WELCOME10', 10, true), ('SAVE15', 15, true)
     ON CONFLICT (code) DO NOTHING`
  );

  for (const p of SAMPLE_PRODUCTS) {
    await pool.query(
      `INSERT INTO products (
        title, description, price, discount_percentage, rating, stock,
        stock_status, brand, category, thumbnail, images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '[]'::jsonb)`,
      [
        p.title,
        p.description,
        p.price,
        p.discount_percentage,
        p.rating,
        p.stock,
        p.stock_status,
        p.brand,
        p.category,
        p.thumbnail,
      ]
    );
  }

  console.log(`✅ Seeded ${SAMPLE_PRODUCTS.length} sample products`);
}
