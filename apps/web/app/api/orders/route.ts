import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderPayload = await req.json();

    const { items, customerName, phoneNumber, campusLocation, paymentMethod, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one product item is required to place an order." },
        { status: 400 },
      );
    }

    if (!customerName || customerName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Please provide your full name for order pickup verification." },
        { status: 400 },
      );
    }

    if (!phoneNumber || phoneNumber.trim().length < 9) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid Ethiopian phone number for order updates." },
        { status: 400 },
      );
    }

    if (!campusLocation || campusLocation.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Please specify your pickup location on AAU 4 Kilo Campus or city." },
        { status: 400 },
      );
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    );

    const now = new Date();
    const dateCode = now.toISOString().slice(2, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `MYF-ORD-${dateCode}-${randomHex}`;

    const orderRecord = {
      orderNumber,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      campusLocation: campusLocation.trim(),
      paymentMethod,
      items,
      totalAmount,
      currency: "ETB",
      status: "CONFIRMED_PENDING_PICKUP",
      createdAt: now.toISOString(),
      pickupLocation: "AAU 4 Kilo Campus, Student Union Building (ECSF Fellowship Office Room 12)",
      pickupHours: "Daily 12:30 PM - 2:00 PM & Sundays 11:30 AM - 1:00 PM",
      notes: notes?.trim() || null,
    };

    return NextResponse.json({
      success: true,
      message: "Order placed successfully! We will prepare your fellowship resources.",
      order: orderRecord,
    });
  } catch (error: any) {
    console.error("Error creating store order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error occurred while processing your order.",
      },
      { status: 500 },
    );
  }
}
