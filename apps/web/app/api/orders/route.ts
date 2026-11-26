import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

export interface OrderItemInput {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  imageUrl?: string;
  category?: string;
}

export interface CreateOrderPayload {
  items: OrderItemInput[];
  customerName: string;
  phoneNumber: string;
  campusLocation: string;
  paymentMethod: "telebirr" | "cbe_birr" | "cash_on_pickup" | "bank_transfer";
  notes?: string;
}

function getAuthHeader(req: NextRequest): string | null {
  return (
    req.headers.get("authorization") || req.headers.get("Authorization") || null
  );
}

export async function GET(req: NextRequest) {
  const authHeader = getAuthHeader(req);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Authentication required to view orders." },
      { status: 401 },
    );
  }

  const apiUrl = getBackendApiUrl();

  try {
    const res = await fetch(`${apiUrl}/marketplace/orders/my`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data: unknown = await res.json().catch(() => null);
    if (data !== null) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(
      {
        success: res.ok,
        message: res.ok
          ? "Orders retrieved."
          : "Failed to retrieve orders from backend.",
      },
      { status: res.status },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach orders service.";
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authHeader = getAuthHeader(req);
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Authentication required to place an order." },
      { status: 401 },
    );
  }

  let body: Partial<CreateOrderPayload>;
  try {
    body = (await req.json()) as Partial<CreateOrderPayload>;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "At least one product item is required to place an order.",
      },
      { status: 400 },
    );
  }

  const apiUrl = getBackendApiUrl();

  try {
    const res = await fetch(`${apiUrl}/marketplace/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data: unknown = await res.json().catch(() => null);
    if (data !== null) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(
      {
        success: res.ok,
        message: res.ok
          ? "Order created."
          : "Failed to create order on backend.",
      },
      { status: res.status },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach orders service.";
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}
