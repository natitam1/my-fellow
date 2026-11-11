"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  BookOpen,
  Shirt,
  Sparkles,
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  Plus,
  Minus,
  ShieldCheck,
  Copy,
  Check,
  MapPin,
  AlertCircle,
  Phone,
  User,
  HeartHandshake,
  Tag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type StoreCategory =
  | "all"
  | "apparel"
  | "notebooks"
  | "bibles"
  | "literature"
  | "accessories";

export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StoreProduct {
  id: string;
  name: string;
  price: number; // In ETB
  category: StoreCategory;
  categoryLabel: string;
  inventoryStatus: InventoryStatus;
  stockCount: number;
  image: string;
  description: string;
  specs?: string[];
  sizes?: string[];
  authorOrMaker?: string;
  isPopular?: boolean;
}

const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "prod-tee-classic",
    name: "4 Kilo Fellowship Classic Cotton Tee",
    price: 650,
    category: "apparel",
    categoryLabel: "Apparel",
    inventoryStatus: "IN_STOCK",
    stockCount: 45,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    description:
      "Signature 100% heavy combed Ethiopian cotton t-shirt. Features the official 4 Kilo Christian Students Fellowship cross emblem on the chest and Colossians 2:6-7 ('Rooted & Built Up in Him') on the upper back.",
    specs: ["100% Organic Ethiopian Cotton", "Reinforced crew neckline", "Pre-shrunk fabric", "Unisex relaxed fit"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    authorOrMaker: "AAU ECSF Publications",
    isPopular: true,
  },
  {
    id: "prod-hoodie-heavy",
    name: "AAU ECSF Heavyweight Campus Hoodie",
    price: 1600,
    category: "apparel",
    categoryLabel: "Apparel",
    inventoryStatus: "IN_STOCK",
    stockCount: 28,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    description:
      "Thick 400 GSM brushed fleece pullover hoodie tailored for chilly Addis Ababa campus mornings and evening prayer meetings. Embroidered fellowship crest and kangaroo front pouch.",
    specs: ["400 GSM brushed fleece", "Double-layered hood with drawstrings", "Embroidered chest crest", "Ribbed cuffs and hem"],
    sizes: ["M", "L", "XL", "XXL"],
    authorOrMaker: "AAU ECSF Merch Dept",
    isPopular: true,
  },
  {
    id: "prod-tee-outreach",
    name: "'Salt & Light' Outreach Edition Tee",
    price: 550,
    category: "apparel",
    categoryLabel: "Apparel",
    inventoryStatus: "LOW_STOCK",
    stockCount: 6,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    description:
      "Special campus mission tee based on Matthew 5:13-14. Produced for our annual university evangelism outreach. Soft heather gray finish.",
    specs: ["Cotton-polyester blend", "Soft screenprint graphics", "Unisex sizing"],
    sizes: ["S", "M", "L"],
    authorOrMaker: "Evangelism & Missions Wing",
  },
  {
    id: "prod-journal-gold",
    name: "Fellowship Discipleship Journal & Pen",
    price: 450,
    category: "notebooks",
    categoryLabel: "Notebooks",
    inventoryStatus: "IN_STOCK",
    stockCount: 85,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    description:
      "Hardcover faux leather journal with gold-foiled 4 Kilo Fellowship emblem, silk ribbon bookmark, and elastic closure band. Includes 240 acid-free lined pages, annual Bible reading chart, and engraved metal ballpoint pen.",
    specs: ["A5 Size (210 x 148 mm)", "240 Off-white lined pages (100 GSM)", "Expandable inner back pocket", "Annual Bible in a Year reading plan"],
    authorOrMaker: "Fellowship Publications",
    isPopular: true,
  },
  {
    id: "prod-prayer-pocket",
    name: "Campus Intercession Pocket Companion",
    price: 280,
    category: "notebooks",
    categoryLabel: "Notebooks",
    inventoryStatus: "IN_STOCK",
    stockCount: 120,
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    description:
      "Slim pocket prayer notebook designed for university students on the move. Contains scriptural prayer templates, campus intercession guides, and space for answered prayers.",
    specs: ["120 Blank dotted pages", "Pocket format (140 x 90 mm)", "Flexible water-resistant cover"],
    authorOrMaker: "ECSF Prayer Department",
  },
  {
    id: "prod-bible-amharic",
    name: "Amharic Standard Bible (1962 Version - መጽሐፍ ቅዱስ)",
    price: 1200,
    category: "bibles",
    categoryLabel: "Bibles",
    inventoryStatus: "IN_STOCK",
    stockCount: 35,
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",
    description:
      "The beloved 1962 Amharic Bible translation. Bound in premium black faux leather with gold edge gilding, dual ribbon markers, cross-references, and full concordances.",
    specs: ["1962 Amharic Text", "Clear readable typeface with sub-headings", "Full concordance and maps", "Gold ribbon page markers"],
    authorOrMaker: "Ethiopian Bible Society",
    isPopular: true,
  },
  {
    id: "prod-bible-esv",
    name: "ESV Student Study Bible (English Edition)",
    price: 1850,
    category: "bibles",
    categoryLabel: "Bibles",
    inventoryStatus: "LOW_STOCK",
    stockCount: 8,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    description:
      "Comprehensive English study Bible with 12,000 clear study notes, character profiles, full-color maps, timelines, and topical articles designed for university students.",
    specs: ["English Standard Version (ESV)", "12,000 verse-by-verse study notes", "Hardcover cloth spine", "80,000 Cross references"],
    authorOrMaker: "Crossway / ECSF Library",
  },
  {
    id: "prod-book-knowing-god",
    name: "Knowing God (የእግዚአብሔርን መንገድ ማወቅ) - J.I. Packer",
    price: 600,
    category: "literature",
    categoryLabel: "Literature",
    inventoryStatus: "IN_STOCK",
    stockCount: 22,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    description:
      "A modern Christian classic exploring the profound character, majesty, and love of God. Faithful Amharic translation published with permission for student fellowship discipleship.",
    specs: ["Amharic translation", "320 Pages, paperback", "Discussion questions after each chapter"],
    authorOrMaker: "J.I. Packer (Amharic Edition)",
    isPopular: true,
  },
  {
    id: "prod-book-cross-christ",
    name: "The Cross of Christ (የክርስቶስ መስቀል) - John Stott",
    price: 680,
    category: "literature",
    categoryLabel: "Literature",
    inventoryStatus: "IN_STOCK",
    stockCount: 18,
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80",
    description:
      "John Stott's seminal masterwork on the atonement, explaining why the cross is the supreme symbol of Christianity and how it transforms student life on campus.",
    specs: ["Amharic Edition", "410 Pages, high quality paper", "University theological standard"],
    authorOrMaker: "John Stott",
  },
  {
    id: "prod-book-mere-cslewis",
    name: "Mere Christianity (ትክክለኛ ክርስትና) - C.S. Lewis",
    price: 520,
    category: "literature",
    categoryLabel: "Literature",
    inventoryStatus: "IN_STOCK",
    stockCount: 40,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    description:
      "C.S. Lewis's foundational apologetic defense of the Christian faith. A cornerstone read for every university student, intellectual seeker, and campus believer.",
    specs: ["Amharic Edition", "220 Pages, paperback", "Clear reasoning for the modern mind"],
    authorOrMaker: "C.S. Lewis",
  },
  {
    id: "prod-soap-handcrafted",
    name: "Fellowship Ministry Olive & Honey Soap (3-Pack)",
    price: 250,
    category: "accessories",
    categoryLabel: "Accessories",
    inventoryStatus: "IN_STOCK",
    stockCount: 60,
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
    description:
      "Handcrafted organic cold-pressed soap bars made by student fellowship volunteers with pure Ethiopian honey, virgin olive oil, and lavender. 100% of proceeds go directly to student cafeteria meal tickets.",
    specs: ["3 x 100g Bar pack", "100% Natural Ethiopian Ingredients", "Cold-process artisan crafted", "Eco-friendly paper packaging"],
    authorOrMaker: "Fellowship Charity Workshop",
  },
  {
    id: "prod-stickers-diecut",
    name: "Fellowship Die-Cut Vinyl Sticker Pack (Set of 6)",
    price: 120,
    category: "accessories",
    categoryLabel: "Accessories",
    inventoryStatus: "IN_STOCK",
    stockCount: 150,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    description:
      "Durable, waterproof vinyl stickers for laptops, water bottles, and notebooks. Includes '4 Kilo ECSF', 'Rooted in Christ', 'Sola Scriptura', and 'Salt & Light' emblem badges.",
    specs: ["6 Unique die-cut designs", "Waterproof and UV resistant vinyl", "Matte finish", "Residue-free removal"],
    authorOrMaker: "ECSF Media & Design",
  },
  {
    id: "prod-canvas-tote",
    name: "Heavy Canvas Fellowship Book Tote",
    price: 400,
    category: "accessories",
    categoryLabel: "Accessories",
    inventoryStatus: "IN_STOCK",
    stockCount: 50,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    description:
      "Sturdy 14 oz unbleached natural cotton canvas bag. Sized specifically to carry your study Bible, fellowship notebooks, and campus textbooks with reinforced straps.",
    specs: ["14 oz Heavyweight natural canvas", "Reinforced shoulder straps", "Internal zippered pocket", "Hand screenprinted"],
    authorOrMaker: "AAU ECSF Merch Dept",
  },
];

const CATEGORY_TABS: { id: StoreCategory; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Items", icon: Package },
  { id: "apparel", label: "T-Shirts & Apparel", icon: Shirt },
  { id: "notebooks", label: "Fellowship Notebooks", icon: BookOpen },
  { id: "bibles", label: "Bibles", icon: Sparkles },
  { id: "literature", label: "Christian Literature", icon: BookOpen },
  { id: "accessories", label: "Accessories & Soap", icon: Tag },
];

export default function StorePage() {
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price_low" | "price_high">("featured");

  // Product Detail / Order Modal State
  const [activeProduct, setActiveProduct] = useState<StoreProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);

  // Order Placement Form State
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{
    orderNumber: string;
    totalAmount: number;
    pickupLocation: string;
    customerName: string;
    phoneNumber: string;
  } | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [campusLocation, setCampusLocation] = useState("4 Kilo Campus (Student Union Bldg - Room 12)");
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<"telebirr" | "cbe_birr" | "cash_on_pickup">("telebirr");
  const [orderNotes, setOrderNotes] = useState("");
  const [copiedOrderRef, setCopiedOrderRef] = useState(false);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return STORE_PRODUCTS.filter((product) => {
      // Category match
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      // Stock filter
      if (stockFilter === "in_stock" && product.inventoryStatus === "OUT_OF_STOCK") {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesAuthor = product.authorOrMaker?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesAuthor) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      // Default: featured (popular items first)
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });
  }, [selectedCategory, searchQuery, stockFilter, sortBy]);

  // Open Product Modal
  const handleOpenProduct = (product: StoreProduct) => {
    setActiveProduct(product);
    setSelectedSize(product.sizes ? product.sizes[0] : "");
    setOrderQuantity(1);
    setOrderPlaced(null);
  };

  // Close Product Modal
  const handleCloseModal = () => {
    setActiveProduct(null);
    setOrderPlaced(null);
    setIsOrdering(false);
  };

  // Handle Order Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;

    if (!customerName || customerName.trim().length < 2) {
      toast.error("Please enter your full name for order pickup verification.");
      return;
    }

    if (!phoneNumber || phoneNumber.trim().length < 9) {
      toast.error("Please enter your Ethiopian phone number (e.g. 0911223344).");
      return;
    }

    setIsOrdering(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productId: activeProduct.id,
              title: activeProduct.name,
              price: activeProduct.price,
              quantity: orderQuantity,
              size: selectedSize || undefined,
              imageUrl: activeProduct.image,
              category: activeProduct.category,
            },
          ],
          customerName: customerName.trim(),
          phoneNumber: phoneNumber.trim(),
          campusLocation: campusLocation.trim(),
          paymentMethod: orderPaymentMethod,
          notes: orderNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create order.");
      }

      setOrderPlaced({
        orderNumber: data.order.orderNumber,
        totalAmount: data.order.totalAmount,
        pickupLocation: data.order.pickupLocation,
        customerName: data.order.customerName,
        phoneNumber: data.order.phoneNumber,
      });

      toast.success("Order confirmed! Your fellowship resources are reserved.");
    } catch (err: any) {
      console.error("Order error:", err);
      toast.error(err.message || "Could not place order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  const handleCopyOrderRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedOrderRef(true);
    toast.success("Order reference copied!");
    setTimeout(() => setCopiedOrderRef(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#FF6719]/20 selection:text-[#FF6719]">
      {/* Header / Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-card to-background pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF6719]/30 bg-[#FF6719]/10 text-xs font-medium text-[#FF6719]">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Official AAU 4 Kilo Fellowship Bookstore & Merchandise</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Fellowship Store & Resource Center
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Equipping university disciples with spiritual literature, Bibles, fellowship notebooks, and authentic apparel. 100% of proceeds support campus evangelism and student cafeteria stipends.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF6719]" />
              <span>Campus Pickup: Student Union Bldg Rm 12</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Non-profit Subsidized Ministry Pricing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
              <span>Funds Needy Student Welfare</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search, Filter Tabs & Sort Controls */}
        <div className="space-y-4">
          {/* Search bar & Quick controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products, books, authors, or gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-border bg-card"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* In-Stock filter */}
              <button
                type="button"
                onClick={() => setStockFilter(stockFilter === "all" ? "in_stock" : "all")}
                className={`h-10 px-3.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  stockFilter === "in_stock"
                    ? "border-[#FF6719] bg-[#FF6719]/10 text-[#FF6719]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock Only</span>
              </button>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
                className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-[#FF6719]"
              >
                <option value="featured">Featured / Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#FF6719] text-white shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Results Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Showing <strong className="text-foreground">{filteredProducts.length}</strong> items in catalog
          </span>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-[#FF6719] hover:underline"
            >
              Reset to all categories
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-3">
            <Package className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-base text-foreground">No merchandise found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn&apos;t find anything matching your search. Try different keywords or reset your filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setStockFilter("all");
              }}
              className="text-xs rounded-xl"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isLowStock = product.inventoryStatus === "LOW_STOCK";
              const isOutOfStock = product.inventoryStatus === "OUT_OF_STOCK";

              return (
                <div
                  key={product.id}
                  className="group bg-card border border-border hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 text-white backdrop-blur-xs">
                      {product.categoryLabel}
                    </span>

                    {/* Stock badge */}
                    <div className="absolute top-3 right-3">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-600/90 text-white">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-600/90 text-white flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Only {product.stockCount} left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-600/90 text-white">
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {product.authorOrMaker && (
                        <p className="text-[11px] font-medium text-muted-foreground truncate">
                          {product.authorOrMaker}
                        </p>
                      )}
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-[#FF6719] transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground block text-[10px] uppercase font-semibold">
                          Price
                        </span>
                        <span className="text-base font-bold text-foreground">
                          {product.price.toLocaleString()}{" "}
                          <span className="text-xs font-normal text-muted-foreground">ETB</span>
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleOpenProduct(product)}
                        disabled={isOutOfStock}
                        className="rounded-xl text-xs font-semibold bg-[#FF6719] hover:bg-[#FF6719]/90 text-white shrink-0"
                      >
                        <span>Order</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fellowship Stewardship Bottom Callout */}
        <section className="mt-12 p-6 sm:p-8 rounded-2xl border border-border bg-card/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF6719]" />
              <span>Campus Book & Ministry Guarantee</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Every book and resource sold is vetted by the 4 Kilo Christian Students Fellowship leadership. We ensure theological soundness, subsidized student affordability, and 100% financial transparency.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/givings">
              <Button variant="outline" className="text-xs rounded-xl gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#FF6719]" />
                <span>Support Needy Students Fund</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Product Detail & Order Modal */}
      <Dialog open={Boolean(activeProduct)} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-2xl bg-card border-border p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
          {activeProduct && (
            <div className="space-y-6">
              {!orderPlaced ? (
                <>
                  <DialogHeader className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
                        {activeProduct.categoryLabel}
                      </span>
                      {activeProduct.inventoryStatus === "LOW_STOCK" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600">
                          Low Stock ({activeProduct.stockCount} left)
                        </span>
                      )}
                    </div>
                    <DialogTitle className="text-xl font-bold text-foreground">
                      {activeProduct.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {activeProduct.authorOrMaker} • AAU 4 Kilo Christian Students Fellowship
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                    {/* Left: Product Image */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted border border-border">
                      <Image
                        src={activeProduct.image}
                        alt={activeProduct.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 300px"
                      />
                    </div>

                    {/* Right: Price & Specs */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-muted-foreground block">Price per Unit</span>
                        <div className="text-2xl font-bold text-foreground">
                          {activeProduct.price.toLocaleString()}{" "}
                          <span className="text-sm font-normal text-muted-foreground">ETB</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activeProduct.description}
                      </p>

                      {/* Specs */}
                      {activeProduct.specs && activeProduct.specs.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-border">
                          <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                            Highlights:
                          </span>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            {activeProduct.specs.map((spec, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6719] shrink-0" />
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Size Selector for Apparel */}
                      {activeProduct.sizes && activeProduct.sizes.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-border">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Select Size:
                          </Label>
                          <div className="flex gap-2">
                            {activeProduct.sizes.map((size) => (
                              <button
                                type="button"
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                                  selectedSize === size
                                    ? "border-[#FF6719] bg-[#FF6719] text-white shadow-xs"
                                    : "border-border bg-background text-foreground hover:bg-muted"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantity Selector */}
                      <div className="space-y-1.5 pt-2 border-t border-border">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Quantity:
                        </Label>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                              className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-foreground">
                              {orderQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setOrderQuantity(Math.min(activeProduct.stockCount, orderQuantity + 1))}
                              className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Total:{" "}
                            <strong className="text-foreground">
                              {(activeProduct.price * orderQuantity).toLocaleString()} ETB
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Placement Form */}
                  <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Order Details & Campus Pickup
                      </span>
                      <span className="text-[11px] text-[#FF6719] font-medium">
                        Pay upon pickup or via Telebirr
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="orderName" className="text-xs font-medium flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="orderName"
                          placeholder="e.g. Bethlehem Girma"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="orderPhone" className="text-xs font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          Ethiopian Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="orderPhone"
                          placeholder="0911 223 344"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="orderPickup" className="text-xs font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          Pickup Location
                        </Label>
                        <select
                          id="orderPickup"
                          value={campusLocation}
                          onChange={(e) => setCampusLocation(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-[#FF6719]"
                        >
                          <option value="4 Kilo Campus (Student Union Bldg - Room 12)">
                            4 Kilo Campus (ECSF Office Rm 12)
                          </option>
                          <option value="4 Kilo Campus Main Gate Pickup">
                            4 Kilo Campus Main Gate Pickup
                          </option>
                          <option value="Sunday Service Fellowship Desk">
                            Sunday Service Fellowship Desk
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="orderPayment" className="text-xs font-medium">
                          Payment Channel
                        </Label>
                        <select
                          id="orderPayment"
                          value={orderPaymentMethod}
                          onChange={(e) => setOrderPaymentMethod(e.target.value as any)}
                          className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-[#FF6719]"
                        >
                          <option value="telebirr">Telebirr (Merchant / Prompt)</option>
                          <option value="cbe_birr">CBE Birr Mobile Transfer</option>
                          <option value="cash_on_pickup">Cash on Campus Pickup</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="orderNotes" className="text-xs font-medium">
                        Special Instructions or Notes (Optional)
                      </Label>
                      <Input
                        id="orderNotes"
                        placeholder="e.g. Please leave at ECSF office with brother Henok"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isOrdering}
                      className="w-full h-11 bg-[#FF6719] hover:bg-[#FF6719]/90 text-white rounded-xl text-sm font-semibold shadow-xs"
                    >
                      {isOrdering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span>Reserving Order...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            Confirm Order • {(activeProduct.price * orderQuantity).toLocaleString()} ETB
                          </span>
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                /* Order Placed Confirmation Card */
                <div className="space-y-5 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-bold text-foreground">
                      Order Confirmed!
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Your fellowship item has been reserved in our bookstore inventory.
                    </DialogDescription>
                  </div>

                  <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                      <span className="text-xs text-muted-foreground">Order Reference</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#FF6719] bg-[#FF6719]/10 px-2 py-0.5 rounded">
                          {orderPlaced.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderRef(orderPlaced.orderNumber)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedOrderRef ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Product</span>
                        <span className="font-semibold text-foreground">
                          {activeProduct.name} {selectedSize ? `(${selectedSize})` : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Quantity</span>
                        <span className="font-semibold text-foreground">
                          {orderQuantity} unit(s)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Total to Pay</span>
                        <span className="font-bold text-foreground text-sm">
                          {orderPlaced.totalAmount.toLocaleString()} ETB
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Customer</span>
                        <span className="font-medium text-foreground">
                          {orderPlaced.customerName}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border/70 pt-2 text-[11px] text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1 text-foreground font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6719]" />
                        <span>Pickup Location:</span>
                      </div>
                      <p className="pl-4.5">{orderPlaced.pickupLocation}</p>
                      <p className="pl-4.5 text-[10px] text-muted-foreground">
                        Pickup Hours: Daily 12:30 PM - 2:00 PM & Sundays 11:30 AM - 1:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                      SMS Notice Dispatched
                    </p>
                    <p>
                      An order tracking SMS with your reference code has been sent to {orderPlaced.phoneNumber}. Show this code at the fellowship office during pickup.
                    </p>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCloseModal}
                      className="w-full rounded-xl text-xs"
                    >
                      Continue Browsing Store
                    </Button>
                    <Link href="/givings" className="w-full">
                      <Button className="w-full bg-[#FF6719] hover:bg-[#FF6719]/90 text-white rounded-xl text-xs font-semibold">
                        Fellowship Giving Portal
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
