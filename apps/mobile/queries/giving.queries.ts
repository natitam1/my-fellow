import { API_URL } from "@/constants/api";
import api from "@/services/api";
import { GivingRecord } from "@/stores/payment.store";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * Domain-shaped query keys for Giving & Jami Payments.
 */
export const givingKeys = {
  all: ["giving"] as const,
  myGivings: () => [...givingKeys.all, "my"] as const,
  verify: (ref: string) => [...givingKeys.all, "verify", ref] as const,
};

export interface InitJamiPaymentInput {
  amount: number;
  email?: string;
  phone?: string;
  reason: string;
  returnUrl?: string;
}

export interface InitJamiPaymentResult {
  checkoutUrl: string;
  sessionOrRef: string;
}

/**
 * Colocated Query & Mutation Functions for Giving
 */
export const givingQueryFns = {
  fetchMyGivings: async (): Promise<GivingRecord[]> => {
    const response = await api.get("/payments/my-givings");
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  initJamiCheckout: async (
    input: InitJamiPaymentInput,
  ): Promise<InitJamiPaymentResult> => {
    const payload = {
      amount: input.amount,
      email: input.email?.trim() || "206413681+natitam1@users.noreply.github.com",
      phone: input.phone,
      reason: input.reason,
      returnUrl: input.returnUrl || `${API_URL}/payments/success`,
    };
    const response = await api.post("/payments/jami/init", payload);
    const checkoutUrl =
      response.data?.data?.checkout_url ||
      response.data?.data?.checkoutUrl ||
      response.data?.checkout_url;
    const sessionOrRef =
      response.data?.data?.sessionId ||
      response.data?.sessionId ||
      response.data?.data?.tx_ref ||
      response.data?.tx_ref;

    if (!checkoutUrl) {
      throw new Error("Invalid checkout URL received from server");
    }

    let launchUrl: string = checkoutUrl;
    if (launchUrl && input.phone && !launchUrl.includes("phone=")) {
      const rawDigits = input.phone.replace(/\D/g, "");
      const localFormat = rawDigits.startsWith("251")
        ? "0" + rawDigits.slice(3)
        : rawDigits.startsWith("0")
          ? rawDigits
          : "0" + rawDigits;
      const intlFormat = rawDigits.startsWith("0")
        ? "251" + rawDigits.slice(1)
        : rawDigits.startsWith("251")
          ? rawDigits
          : "251" + rawDigits;

      const sep = launchUrl.includes("?") ? "&" : "?";
      launchUrl = `${launchUrl}${sep}phone=${encodeURIComponent(localFormat)}&phoneNumber=${encodeURIComponent(localFormat)}&customer_phone=${encodeURIComponent(intlFormat)}&msisdn=${encodeURIComponent(localFormat)}`;
    }

    return {
      checkoutUrl: launchUrl,
      sessionOrRef: String(sessionOrRef || ""),
    };
  },

  verifyJamiPayment: async (ref: string) => {
    const response = await api.get(`/payments/jami/verify/${ref}`);
    const data = response.data?.data || response.data;
    const status = data?.status || response.data?.status;
    return { data, status };
  },
};

/**
 * Hook for fetching user's giving history and computing total completed givings.
 * Exposes loading, error, empty, background-refetch, and stale-data states.
 */
export function useMyGivingsQuery(enabled = true) {
  const query = useQuery({
    queryKey: givingKeys.myGivings(),
    queryFn: givingQueryFns.fetchMyGivings,
    enabled,
  });

  const myGivings = query.data ?? [];
  const totalGivingsAmount = myGivings
    .filter((g) => g.status === "success" || g.status === "completed")
    .reduce((sum, g) => sum + (g.amount || 0), 0);

  return {
    ...query,
    myGivings,
    totalGivingsAmount,
    isLoadingGivings: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : null,
    isEmpty: !query.isLoading && !query.isError && myGivings.length === 0,
    isBackgroundRefetching: query.isRefetching && !query.isLoading,
    isStale: query.isStale,
  };
}

/**
 * Mutation for initializing a Jami payment checkout session.
 */
export function useInitJamiPaymentMutation() {
  return useMutation({
    mutationFn: givingQueryFns.initJamiCheckout,
  });
}

/**
 * Mutation for verifying a Jami payment session and invalidating giving history on completion.
 */
export function useVerifyJamiPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: givingQueryFns.verifyJamiPayment,
    onSuccess: (result) => {
      if (result.status === "success" || result.status === "completed") {
        queryClient.invalidateQueries({ queryKey: givingKeys.myGivings() });
      }
    },
  });
}
