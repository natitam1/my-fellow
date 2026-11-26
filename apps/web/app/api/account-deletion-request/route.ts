import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server/backendUrl";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      phoneNumber?: string;
      fullName?: string;
      reason?: string;
      confirmation?: boolean | string;
    };
    const { phoneNumber, fullName, reason, confirmation } = body;

    if (!phoneNumber || !confirmation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Registered phone number and deletion confirmation are required.",
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
    const apiBaseUrl = getBackendApiUrl();
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    let backendRes: Response;
    try {
      backendRes = await fetch(`${apiBaseUrl}/support/tickets`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          subject: `Account Deletion Request: ${cleanedPhone}`,
          description: `User ${fullName || "Fellowship Member"} (${cleanedPhone}) has submitted a permanent account deletion request via the web portal.\nReference ID: ${referenceId}\nReason: ${reason || "No reason provided."}`,
          category: "account_deletion",
          priority: "high",
          contactPhone: cleanedPhone,
        }),
        cache: "no-store",
      });
    } catch (apiErr) {
      console.error(
        "Failed forwarding deletion request to backend support:",
        apiErr,
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to submit account deletion request to the support service. Please try again later.",
        },
        { status: 502 },
      );
    }

    if (!backendRes.ok) {
      const errBody = (await backendRes.json().catch(() => null)) as {
        message?: string;
      } | null;
      return NextResponse.json(
        {
          success: false,
          message:
            errBody?.message ||
            "Support service rejected the account deletion request. Please try again later.",
        },
        { status: 502 },
      );
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
