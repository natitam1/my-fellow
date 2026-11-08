import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../src/models/product.model.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

const PRODUCTS_DATA = [
  // --- T-SHIRT ---
  {
    title: "4 Kilo Fellowship Classic Tee",
    shortDescription:
      "Signature 100% heavy combed cotton tee featuring the 4 Kilo ECSF emblem and 'Rooted & Built Up in Christ' (Colossians 2:6-7).",
    price: 650,
    category: "t-shirt",
    stock: 50,
    imageUrls: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=800&q=80",
    ],
  },

  // --- HOODIE ---
  {
    title: "4 Kilo Fellowship Heavyweight Hoodie",
    shortDescription:
      "Cozy 400 GSM brushed fleece pullover hoodie with embroidered 4 Kilo Christian Fellowship chest insignia. Built warm for Addis Ababa mornings and campus prayer nights.",
    price: 1500,
    category: "hoodie",
    stock: 35,
    imageUrls: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80",
    ],
  },

  // --- SOAP ---
  {
    title: "Fellowship Ministry Natural Olive & Honey Soap",
    shortDescription:
      "Handcrafted organic cold-processed bar soap made with Ethiopian honey, pure virgin olive oil, and calming lavender essential oil. All proceeds support campus outreach ministries.",
    price: 150,
    category: "soap",
    stock: 100,
    imageUrls: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546552768-9e3a94b38a59?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

async function seed() {
  console.log("🌱 Connecting to MongoDB to seed marketplace products...");
  await mongoose.connect(MONGO_URI!);

  console.log("🧹 Clearing old products...");
  await Product.deleteMany({});

  console.log(`📦 Inserting ${PRODUCTS_DATA.length} curated marketplace products (T-Shirt, Hoodie, Soap)...`);
  const inserted = await Product.insertMany(PRODUCTS_DATA);

  console.log(`✅ Successfully seeded ${inserted.length} curated items into MongoDB!`);
  for (const item of inserted) {
    console.log(`   - [${item.category}] ${item.title} (${item.price} ETB) - Stock: ${item.stock}`);
  }
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
