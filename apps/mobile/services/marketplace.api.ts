import {
  Order,
  OrdersApiResponse,
  Product,
  ProductsApiResponse,
  SingleResponse,
} from "@/types/marketplace.types";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/constants/api";
import api from "./api";

const isFormDataPayload = (data: unknown): data is FormData => {
  return (
    data instanceof FormData ||
    (Boolean(data) &&
      typeof data === "object" &&
      typeof (data as any).append === "function")
  );
};

const uploadMultipart = async <T>(
  method: "POST" | "PUT",
  endpoint: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<T> => {
  const token = await SecureStore.getItemAsync("userToken");
  const baseURL = (api.defaults.baseURL || API_URL).replace(/\/$/, "");
  const url = `${baseURL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.setRequestHeader("Accept", "application/json");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const text = xhr.responseText;
        const res = text ? JSON.parse(text) : {};
        if (xhr.status >= 200 && xhr.status < 300 && res.success !== false) {
          onProgress?.(100);
          resolve(res);
        } else {
          const message =
            res.message ||
            res.error ||
            res.detail ||
            (res.errors && Array.isArray(res.errors) ? res.errors[0]?.message : "") ||
            `Server error (${xhr.status})`;
          const err: any = new Error(message);
          err.response = { status: xhr.status, data: res };
          reject(err);
        }
      } catch {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          resolve({ success: true } as any);
        } else {
          const error: any = new Error(`Request failed with status ${xhr.status}`);
          error.response = { status: xhr.status };
          reject(error);
        }
      }
    };

    xhr.onerror = () => {
      const err: any = new Error("Network connection error. Please check your internet connection.");
      err.code = "ERR_NETWORK";
      reject(err);
    };

    xhr.ontimeout = () => {
      const err: any = new Error("Upload timed out. Please check your internet connection and try again.");
      err.code = "ECONNABORTED";
      reject(err);
    };

    xhr.timeout = 120000; // 2 minutes
    xhr.send(formData as any);
  });
};

export const fetchProductsApi = async (
  page: number = 1,
  limit: number = 20,
  category?: string,
): Promise<ProductsApiResponse> => {
  const params: any = { page, limit };
  if (category && category !== "All") params.category = category;

  const res = await api.get<ProductsApiResponse>("/marketplace/products", {
    params,
  });
  return res.data;
};

export const fetchProductByIdApi = async (
  id: string,
): Promise<SingleResponse<Product>> => {
  const res = await api.get<SingleResponse<Product>>(
    `/marketplace/products/${id}`,
  );
  return res.data;
};

export const createProductApi = async (
  data: FormData | any,
  onProgress?: (percent: number) => void,
): Promise<SingleResponse<Product>> => {
  if (isFormDataPayload(data)) {
    return uploadMultipart<SingleResponse<Product>>(
      "POST",
      "/marketplace/products",
      data,
      onProgress,
    );
  }
  const res = await api.post<SingleResponse<Product>>(
    "/marketplace/products",
    data,
  );
  return res.data;
};

export const updateProductApi = async (
  id: string,
  data: FormData | any,
  onProgress?: (percent: number) => void,
): Promise<SingleResponse<Product>> => {
  if (isFormDataPayload(data)) {
    return uploadMultipart<SingleResponse<Product>>(
      "PUT",
      `/marketplace/products/${id}`,
      data,
      onProgress,
    );
  }
  const res = await api.put<SingleResponse<Product>>(
    `/marketplace/products/${id}`,
    data,
  );
  return res.data;
};

export const deleteProductApi = async (
  id: string,
): Promise<SingleResponse<{ message: string }>> => {
  const res = await api.delete<SingleResponse<{ message: string }>>(
    `/marketplace/products/${id}`,
  );
  return res.data;
};

export const placeOrderApi = async (
  items: { productId: string; quantity: number }[],
): Promise<SingleResponse<Order>> => {
  const res = await api.post<SingleResponse<Order>>("/marketplace/orders", {
    items,
  });
  return res.data;
};

export const fetchMyOrdersApi = async (
  page: number = 1,
  limit: number = 20,
): Promise<OrdersApiResponse> => {
  const res = await api.get<OrdersApiResponse>("/marketplace/orders/my", {
    params: { page, limit },
  });
  return res.data;
};

export const fetchAllOrdersAdminApi = async (
  page: number = 1,
  limit: number = 50,
): Promise<OrdersApiResponse> => {
  const res = await api.get<OrdersApiResponse>("/marketplace/orders", {
    params: { page, limit },
  });
  return res.data;
};

export const updateOrderStatusAdminApi = async (
  id: string,
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
): Promise<SingleResponse<Order>> => {
  const res = await api.patch<SingleResponse<Order>>(
    `/marketplace/orders/${id}/status`,
    { status },
  );
  return res.data;
};

export const fetchOrderByIdApi = async (
  id: string,
): Promise<SingleResponse<Order>> => {
  const res = await api.get<SingleResponse<Order>>(`/marketplace/orders/${id}`);
  return res.data;
};
