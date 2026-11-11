import { NextRequest, NextResponse } from "next/server";

export interface PaymentInitPayload {
  amount: number;
  category: "tithe" | "general_offering" | "needy_students" | "conference_support" | string;
  categoryTitle?: string;
  paymentMethod: "telebirr" | "cbe_birr" | "bank_transfer";
  phoneNumber: string;
  fullName?: string;
  email?: string;
  notes?: string;
  isAnonymous?: boolean;
}

export const BANK_ACCOUNTS = [
  {
    bankName: "Commercial Bank of Ethiopia (CBE)",
    shortName: "CBE",
    accountNumber: "1000 2348 91234",
    accountName: "AAU 4 Kilo Christian Students Fellowship",
    branch: "King George VI (4 Kilo) Branch",
    swiftCode: "CBETETAA",
  },
  {
    bankName: "Awash International Bank",
    shortName: "Awash Bank",
    accountNumber: "0132 0491 0240 00",
    accountName: "AAU 4 Kilo Christian Fellowship",
    branch: "Arat Kilo Branch",
    swiftCode: "AWINETAA",
  },
  {
    bankName: "Telebirr Merchant / Pay Code",
    shortName: "Telebirr Pay",
    accountNumber: "982341",
    accountName: "4 Kilo Fellowship ECSF",
    branch: "Ethio Telecom Merchant Account",
    swiftCode: "TELEBIRR",
  },
  {
    bankName: "Bank of Abyssinia",
    shortName: "Abyssinia",
    accountNumber: "1482 9012 3450 01",
    accountName: "AAU 4 Kilo Christian Students Fellowship",
    branch: "Menelik II Branch",
    swiftCode: "ABYSETAA",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body: PaymentInitPayload = await req.json();

    const {
      amount,
      category,
      categoryTitle,
      paymentMethod,
      phoneNumber,
      fullName,
      email,
      notes,
      isAnonymous,
    } = body;

    if (!amount || typeof amount !== "number" || amount < 1) {
      return NextResponse.json(
        { success: false, message: "A valid giving amount (minimum 1 ETB) is required." },
        { status: 400 },
      );
    }

    if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim().length < 9) {
      return NextResponse.json(
        { success: false, message: "A valid phone number is required for transaction auditing." },
        { status: 400 },
      );
    }

    // Clean phone number format
    const cleanPhone = phoneNumber.replace(/\s+/g, "");

    // Generate unique verifiable fellowship transaction reference
    const now = new Date();
    const dateCode = now.toISOString().slice(2, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const categoryPrefix =
      category === "tithe"
        ? "TTH"
        : category === "needy_students"
          ? "NDY"
          : category === "conference_support"
            ? "CNF"
            : "GIV";

    const txRef = `MYF-${categoryPrefix}-${dateCode}-${randomHex}`;

    // Category display resolution
    const categoryLabels: Record<string, string> = {
      tithe: "Tithe (10% Dedicated Offering)",
      general_offering: "General Fellowship Offering",
      needy_students: "Charity & Needy Students Fund",
      conference_support: "Annual Conference & Retreat Support",
    };

    const resolvedCategoryTitle =
      categoryTitle || categoryLabels[category] || "Fellowship Contribution";

    const giverDisplayName = isAnonymous
      ? "Anonymous Fellowship Member"
      : fullName?.trim() || "Fellowship Member";

    // Build receipt object
    const receipt = {
      reference: txRef,
      receiptNumber: `REC-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      amount,
      currency: "ETB",
      category,
      categoryTitle: resolvedCategoryTitle,
      paymentMethod,
      phoneNumber: cleanPhone,
      giverName: giverDisplayName,
      isAnonymous: Boolean(isAnonymous),
      email: email?.trim() || null,
      notes: notes?.trim() || null,
      timestamp: now.toISOString(),
      status: paymentMethod === "bank_transfer" ? "AWAITING_TRANSFER_RECEIPT" : "INITIATED_PENDING_PAYMENT",
      accountabilityNote:
        "100% of received funds are audited by the AAU 4 Kilo Christian Students Fellowship Executive Body.",
    };

    // If payment method is Telebirr or CBE Birr and upstream Jami or API credentials exist
    let checkoutUrl: string | null = null;
    const jamiSecret = process.env.JAMI_SECRET_KEY || process.env.JAMI_API_KEY;

    if (jamiSecret && (paymentMethod === "telebirr" || paymentMethod === "cbe_birr")) {
      try {
        const jamiRes = await fetch("https://api.jami.bio/v1/checkouts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jamiSecret}`,
          },
          body: JSON.stringify({
            amount,
            currency: "ETB",
            phone: cleanPhone,
            email: email || "giving@4kilofellowship.org",
            reason: `Fellowship Giving: ${resolvedCategoryTitle} (${txRef})`,
            returnUrl: `${req.nextUrl.origin}/payment-success?reference=${txRef}&amount=${amount}`,
            metadata: {
              txRef,
              category,
              giverName: giverDisplayName,
            },
          }),
        });

        if (jamiRes.ok) {
          const jamiData = await jamiRes.json();
          if (jamiData?.checkoutUrl) {
            checkoutUrl = jamiData.checkoutUrl;
          }
        }
      } catch (upstreamErr) {
        console.warn("Direct Jami initialization fallback to local flow:", upstreamErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Giving transaction initialized successfully.",
      reference: txRef,
      checkoutUrl,
      receipt,
      bankAccounts: BANK_ACCOUNTS,
    });
  } catch (error: any) {
    console.error("Error in /api/payments/initialize:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error occurred while initializing giving.",
      },
      { status: 500 },
    );
  }
}
