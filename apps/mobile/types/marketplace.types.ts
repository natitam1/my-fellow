export interface Product {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: string | number;
  stock?: number;
  imageUrls?: string[];
  image?: string;
  imageUrl?: string;
  category?: string;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  size?: string;
  price?: number;
  unitPrice?: string | number;
  product?: Product;
}

export const APPAREL_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type ApparelSize = (typeof APPAREL_SIZES)[number];

export const isApparelProduct = (product?: Product | null): boolean => {
  if (!product?.category) return false;
  const cat = product.category.toLowerCase().trim();
  return (
    cat === "t-shirt" ||
    cat === "t-shirts" ||
    cat === "tshirt" ||
    cat === "tshirts" ||
    cat === "shirt" ||
    cat === "hoodie" ||
    cat === "hoodies" ||
    cat === "hoddy" ||
    cat === "sweatshirt" ||
    cat === "apparel"
  );
};

export interface OrderBuyer {
  fullName?: string;
  phoneNumber?: string;
  department?: string;
  yearOfStudy?: string;
  telegramUserName?: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  totalAmount?: string | number;
  status?:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "shipped"
    | "delivered"
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
  buyer?: OrderBuyer;
}

export interface ProductsApiResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface OrdersApiResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80";

export const getProductPrice = (product: Product): number => {
  if (product.price === undefined || product.price === null) return 0;
  return typeof product.price === "string"
    ? parseFloat(product.price) || 0
    : product.price;
};

export const getProductImage = (product: Product): string => {
  return product.imageUrls?.[0] || FALLBACK_PRODUCT_IMAGE;
};

export const getProductImages = (product: Product): string[] => {
  if (product.imageUrls && product.imageUrls.length > 0) {
    return product.imageUrls;
  }
  return [
    product.image || product.imageUrl || FALLBACK_PRODUCT_IMAGE,
  ];
};
