import { NextRequest, NextResponse } from "next/server";

export type GivingCampaign =
  | "campus_ministry"
  | "freshmen_welcome"
  | "charity_fund"
  | "media_equipment"
  | "tithe"
  | "general_offering"
  | "needy_students"
  | "conference_support"
  | string;

export type GivingPaymentMethod = "chapa" | "telebirr" | "cbe_birr" | "bank_transfer";

export interface PaymentInitPayload {
  amount: number;
  category: GivingCampaign;
  categoryTitle?: string;
  paymentMethod: GivingPaymentMethod;
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
        { success: false, message: "A valid Ethiopian phone number is required for transaction auditing." },
        { status: 400 },
      );
    }

    // Clean phone number format
    const cleanPhone = phoneNumber.replace(/\s+/g, "");

    // Generate unique verifiable fellowship transaction reference
    const now = new Date();
    const dateCode = now.toISOString().slice(2, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();

    const categoryPrefixMap: Record<string, string> = {
      campus_ministry: "CMP",
      freshmen_welcome: "FRW",
      charity_fund: "CHR",
      media_equipment: "MED",
      tithe: "TTH",
      general_offering: "OFF",
      needy_students: "NDY",
      conference_support: "CNF",
    };
    const categoryPrefix = categoryPrefixMap[category] || "GIV";
    const methodPrefix = paymentMethod === "chapa" ? "CHP" : paymentMethod === "telebirr" ? "TLB" : paymentMethod === "cbe_birr" ? "CBE" : "BNK";

    const txRef = `MYF-${methodPrefix}-${categoryPrefix}-${dateCode}-${randomHex}`;

    // Campaign display resolution
    const campaignLabels: Record<string, string> = {
      campus_ministry: "Campus Ministry & Discipleship",
      freshmen_welcome: "Freshmen Welcome & Campus Orientation",
      charity_fund: "Charity & Needy Students Welfare Fund",
      media_equipment: "Fellowship Media & Technical Equipment",
      tithe: "Tithe (10% Dedicated Offering)",
      general_offering: "General Fellowship Offering",
      needy_students: "Charity & Needy Students Fund",
      conference_support: "Annual Conference & Retreat Support",
    };

    const resolvedCategoryTitle =
      categoryTitle || campaignLabels[category] || "Fellowship Contribution";

    const giverDisplayName = isAnonymous
      ? "Anonymous Fellowship Member"
      : fullName?.trim() || "Fellowship Member";

    const nameParts = giverDisplayName.split(" ");
    const firstName = nameParts[0] || "Fellowship";
    const lastName = nameParts.slice(1).join(" ") || "Member";

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

    let checkoutUrl: string | null = null;

    // 1. CHAPA PAYMENT INITIATION
    if (paymentMethod === "chapa") {
      const chapaKey = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_KEY;

      if (chapaKey) {
        try {
          const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${chapaKey}`,
            },
            body: JSON.stringify({
              amount: amount.toString(),
              currency: "ETB",
              email: email || "giving@4kilofellowship.org",
              first_name: firstName,
              last_name: lastName,
              phone_number: cleanPhone,
              tx_ref: txRef,
              callback_url: `${req.nextUrl.origin}/api/payments/chapa-callback`,
              return_url: `${req.nextUrl.origin}/givings?payment=success&tx_ref=${txRef}&amount=${amount}`,
              customization: {
                title: "4 Kilo Fellowship Giving",
                description: `Contribution for ${resolvedCategoryTitle}`,
              },
            }),
          });

          if (chapaRes.ok) {
            const chapaData = await chapaRes.json();
            if (chapaData?.data?.checkout_url) {
              checkoutUrl = chapaData.data.checkout_url;
            }
          } else {
            const errBody = await chapaRes.text();
            console.warn("Chapa upstream initialization warning:", errBody);
          }
        } catch (upstreamErr) {
          console.warn("Chapa initialization network error, using local verified receipt:", upstreamErr);
        }
      }

      // If no live Chapa key is configured or offline development, provide simulated checkout URL
      if (!checkoutUrl) {
        checkoutUrl = `${req.nextUrl.origin}/givings?simulated_checkout=chapa&tx_ref=${txRef}&amount=${amount}&campaign=${encodeURIComponent(resolvedCategoryTitle)}`;
      }
    }

    // 2. JAMI / TELEBIRR / CBE BIRR UPSTREAM FALLBACK
    const jamiSecret = process.env.JAMI_SECRET_KEY || process.env.JAMI_API_KEY;
    if (!checkoutUrl && jamiSecret && (paymentMethod === "telebirr" || paymentMethod === "cbe_birr")) {
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
            returnUrl: `${req.nextUrl.origin}/givings?payment=success&reference=${txRef}&amount=${amount}`,
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
