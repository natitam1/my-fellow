import {
  createProductApi,
  deleteProductApi,
  fetchAllOrdersAdminApi,
  fetchMyOrdersApi,
  fetchProductByIdApi,
  fetchProductsApi,
  placeOrderApi,
  updateOrderStatusAdminApi,
  updateProductApi,
} from "@/services/marketplace.api";
import {
  Order,
  OrdersApiResponse,
  Product,
  ProductsApiResponse,
} from "@/types/marketplace.types";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Normalize & deduplicate products by canonical string ID.
 */
export function normalizeProduct(item: Product): Product {
  const id = String(item.id || (item as any)._id || "");
  return item.id === id ? item : { ...item, id };
}

export function dedupeProducts(items: Product[]): Product[] {
  const seen = new Set<string>();
  const output: Product[] = [];

  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const normalized = normalizeProduct(raw);
    if (!normalized.id || seen.has(normalized.id)) continue;
    seen.add(normalized.id);
    output.push(normalized);
  }

  return output;
}

/**
 * Domain-shaped query keys for the Marketplace domain.
 */
export const marketplaceKeys = {
  all: ["marketplace"] as const,
  products: () => [...marketplaceKeys.all, "products"] as const,
  productInfinite: (category: string = "All", limit: number = 20) =>
    [...marketplaceKeys.products(), "infinite", { category, limit }] as const,
  productDetails: () => [...marketplaceKeys.products(), "detail"] as const,
  productDetail: (id: string) =>
    [...marketplaceKeys.productDetails(), id] as const,
  orders: () => [...marketplaceKeys.all, "orders"] as const,
  myOrders: () => [...marketplaceKeys.orders(), "my"] as const,
  adminOrders: () => [...marketplaceKeys.orders(), "admin"] as const,
  orderDetail: (id: string) =>
    [...marketplaceKeys.orders(), "detail", id] as const,
};

/**
 * Colocated Query Functions
 */
export const marketplaceQueryFns = {
  fetchProductsPage: async ({
    pageParam = 1,
    category = "All",
    limit = 20,
  }: {
    pageParam?: number;
    category?: string;
    limit?: number;
  }): Promise<ProductsApiResponse> => {
    return await fetchProductsApi(pageParam, limit, category);
  },

  fetchProductDetail: async (id: string): Promise<Product> => {
    const res = await fetchProductByIdApi(id);
    if (!res.data) {
      throw new Error(res.message || "Product not found");
    }
    return normalizeProduct(res.data);
  },

  fetchMyOrdersPage: async ({
    pageParam = 1,
    limit = 20,
  }: {
    pageParam?: number;
    limit?: number;
  }): Promise<OrdersApiResponse> => {
    return await fetchMyOrdersApi(pageParam, limit);
  },

  fetchAdminOrdersList: async (): Promise<Order[]> => {
    const res = await fetchAllOrdersAdminApi(1, 100);
    return res.data?.orders || [];
  },
};

/**
 * Infinite Products Query Hook
 * Exposes loading, error, empty, background-refetch, and stale-data states.
 */
export function useProductsInfiniteQuery(
  category: string = "All",
  limit: number = 20,
) {
  const query = useInfiniteQuery({
    queryKey: marketplaceKeys.productInfinite(category, limit),
    queryFn: ({ pageParam }) =>
      marketplaceQueryFns.fetchProductsPage({
        pageParam: pageParam as number,
        category,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage.data?.pagination;
      const totalPages = pagination?.totalPages || 1;
      const currentPage = pagination?.page || allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const products = dedupeProducts(
    query.data?.pages.flatMap((page) => page.data?.products || []) ?? [],
  );

  return {
    ...query,
    products,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error
        ? query.error.message
        : query.error
        ? String(query.error)
        : null,
    isEmpty: !query.isLoading && !query.isError && products.length === 0,
    isBackgroundRefetching: query.isRefetching && !query.isLoading,
    isStale: query.isStale,
  };
}

/**
 * Single Product Detail Query Hook
 * Seeds placeholder data from any cached product list for instant 0ms frame-1 display.
 */
export function useProductDetailQuery(id: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: marketplaceKeys.productDetail(id || ""),
    queryFn: () => marketplaceQueryFns.fetchProductDetail(id!),
    enabled: Boolean(id),
    placeholderData: () => {
      if (!id) return undefined;
      const cachedLists = queryClient.getQueriesData<
        InfiniteData<ProductsApiResponse>
      >({
        queryKey: marketplaceKeys.products(),
      });

      for (const [, infiniteData] of cachedLists) {
        if (!infiniteData?.pages) continue;
        for (const page of infiniteData.pages) {
          const found = page.data?.products?.find(
            (p) => p.id === id || (p as any)._id === id,
          );
          if (found) return normalizeProduct(found);
        }
      }
      return undefined;
    },
  });

  return {
    ...query,
    product: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error
        ? query.error.message
        : query.error
        ? String(query.error)
        : null,
    isEmpty: !query.isLoading && !query.isError && !query.data,
    isBackgroundRefetching: query.isRefetching && !query.isLoading,
    isStale: query.isStale,
  };
}

/**
 * My Orders Infinite Query Hook
 */
export function useMyOrdersInfiniteQuery(limit: number = 20, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: marketplaceKeys.myOrders(),
    queryFn: ({ pageParam }) =>
      marketplaceQueryFns.fetchMyOrdersPage({
        pageParam: pageParam as number,
        limit,
      }),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage.data?.pagination;
      const totalPages = pagination?.totalPages || 1;
      const currentPage = pagination?.page || allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const orders =
    query.data?.pages.flatMap((page) => page.data?.orders || []) ?? [];

  return {
    ...query,
    orders,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : null,
    isEmpty: !query.isLoading && !query.isError && orders.length === 0,
    isBackgroundRefetching: query.isRefetching && !query.isLoading,
    isStale: query.isStale,
  };
}

/**
 * Admin Orders Query Hook
 */
export function useAdminOrdersQuery(enabled = true) {
  const query = useQuery({
    queryKey: marketplaceKeys.adminOrders(),
    queryFn: marketplaceQueryFns.fetchAdminOrdersList,
    enabled,
  });

  const adminOrders = query.data ?? [];

  return {
    ...query,
    adminOrders,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : null,
    isEmpty: !query.isLoading && !query.isError && adminOrders.length === 0,
    isBackgroundRefetching: query.isRefetching && !query.isLoading,
    isStale: query.isStale,
  };
}

/**
 * Create Product Mutation with Immediate Cache Priming & Targeted Invalidation
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FormData | Record<string, any>) => {
      const res = await createProductApi(payload);
      if (!res.data) {
        throw new Error(res.message || "Failed to create product");
      }
      return normalizeProduct(res.data);
    },
    onSuccess: (createdProduct) => {
      queryClient.setQueryData(
        marketplaceKeys.productDetail(createdProduct.id),
        createdProduct,
      );

      queryClient.setQueriesData<InfiniteData<ProductsApiResponse>>(
        { queryKey: marketplaceKeys.products() },
        (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return oldData;
          }
          const firstPage = oldData.pages[0];
          const existingProducts = firstPage.data?.products || [];
          const updatedFirstPage: ProductsApiResponse = {
            ...firstPage,
            data: {
              ...firstPage.data,
              products: dedupeProducts([createdProduct, ...existingProducts]),
            },
          };
          return {
            ...oldData,
            pages: [updatedFirstPage, ...oldData.pages.slice(1)],
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: marketplaceKeys.products(),
      });
    },
  });
}

/**
 * Update Product Mutation with Optimistic Cache Update & Targeted Invalidation
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: FormData | Record<string, any>;
    }) => {
      const res = await updateProductApi(id, payload);
      if (!res.data) {
        throw new Error(res.message || "Failed to update product");
      }
      return normalizeProduct(res.data);
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(
        marketplaceKeys.productDetail(updatedProduct.id),
        updatedProduct,
      );

      queryClient.setQueriesData<InfiniteData<ProductsApiResponse>>(
        { queryKey: marketplaceKeys.products() },
        (oldData) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                products: dedupeProducts(
                  (page.data?.products || []).map((p) =>
                    p.id === updatedProduct.id ||
                    (p as any)._id === updatedProduct.id
                      ? updatedProduct
                      : p,
                  ),
                ),
              },
            })),
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: marketplaceKeys.productDetail(updatedProduct.id),
      });
      queryClient.invalidateQueries({
        queryKey: marketplaceKeys.products(),
      });
    },
  });
}

/**
 * Delete Product Mutation with Optimistic Removal & Rollback
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteProductApi(id);
      if (res.success === false) {
        throw new Error(res.message || "Failed to delete product");
      }
      return id;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: marketplaceKeys.products() });

      const previousLists = queryClient.getQueriesData<
        InfiniteData<ProductsApiResponse>
      >({
        queryKey: marketplaceKeys.products(),
      });

      queryClient.setQueriesData<InfiniteData<ProductsApiResponse>>(
        { queryKey: marketplaceKeys.products() },
        (oldData) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                products: (page.data?.products || []).filter(
                  (p) => p.id !== deletedId && (p as any)._id !== deletedId,
                ),
              },
            })),
          };
        },
      );

      return { previousLists };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: (_data, _err, deletedId) => {
      queryClient.removeQueries({
        queryKey: marketplaceKeys.productDetail(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: marketplaceKeys.products(),
      });
    },
  });
}

/**
 * Place Order Mutation with Targeted Invalidation of Orders & Products
 */
export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { productId: string; quantity: number }[]) => {
      const res = await placeOrderApi(items);
      if (!res.data) {
        throw new Error(res.message || "Failed to place order");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.orders() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.products() });
    },
  });
}

/**
 * Admin Order Status Mutation with Optimistic Status Update & Rollback
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    }) => {
      const res = await updateOrderStatusAdminApi(id, status);
      if (!res.data) {
        throw new Error(res.message || "Failed to update order status");
      }
      return res.data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({
        queryKey: marketplaceKeys.adminOrders(),
      });

      const previousAdminOrders = queryClient.getQueryData<Order[]>(
        marketplaceKeys.adminOrders(),
      );

      if (previousAdminOrders) {
        queryClient.setQueryData<Order[]>(
          marketplaceKeys.adminOrders(),
          previousAdminOrders.map((order) =>
            order.id === id ? { ...order, status } : order,
          ),
        );
      }

      return { previousAdminOrders };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousAdminOrders) {
        queryClient.setQueryData(
          marketplaceKeys.adminOrders(),
          context.previousAdminOrders,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.orders() });
    },
  });
}
