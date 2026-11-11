import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, fullName, reason, confirmation } = body;

    if (!phoneNumber || !confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "Registered phone number and deletion confirmation are required.",
        },
        { status: 400 },
      );
    }

    // Clean and validate Ethiopian phone format
    const cleanedPhone = String(phoneNumber).trim();
    if (!/^(?:\+251|0)?[79]\d{8}$/.test(cleanedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a valid registered Ethiopian mobile phone number (09... / 07... / +251...).",
        },
        { status: 400 },
      );
    }

    const referenceId = `DEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Forward deletion request to backend API if configured
    const apiBaseUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://my-fellow-api.onrender.com/api";

    try {
      await fetch(`${apiBaseUrl}/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Account Deletion Request: ${cleanedPhone}`,
          description: `User ${fullName || "Fellowship Member"} (${cleanedPhone}) has submitted a permanent account deletion request via the web portal.\nReference ID: ${referenceId}\nReason: ${reason || "No reason provided."}`,
          category: "account_deletion",
          priority: "high",
          contactPhone: cleanedPhone,
        }),
      });
    } catch (apiErr) {
      // Log forwarding error, proceed with user confirmation
      console.warn("Failed forwarding deletion request to backend support:", apiErr);
    }

    return NextResponse.json({
      success: true,
      message:
        "Your account deletion request has been registered. Our security team will process the permanent deletion within 14 to 30 days.",
      referenceId,
      estimatedProcessingDays: 14,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process deletion request.";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
