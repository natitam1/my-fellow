import { NextRequest, NextResponse } from "next/server";
import {
  getEventById,
  IN_MEMORY_REGISTRATIONS,
  RegistrationTicket,
} from "@/lib/events-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { eventId, fullName, phoneNumber, team, department, notes } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: "Full Name is required" },
        { status: 400 }
      );
    }

    if (!phoneNumber || typeof phoneNumber !== "string" || !phoneNumber.trim()) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Capacity verification
    if (
      event.registrationLimit &&
      event.registrationsCount >= event.registrationLimit
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Registration is closed. All seats for this event are fully booked.",
        },
        { status: 400 }
      );
    }

    const regId = `reg-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substring(2, 6)}`;
    const ticketCode = `ECSF-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    const newTicket: RegistrationTicket = {
      ticketNumber: ticketCode,
      registrationId: regId,
      eventId: event.id,
      eventTitle: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      locationName: event.location.name,
      room: event.location.room,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      teamOrDepartment: team || department || "General Fellowship Member",
      registeredAt: new Date().toISOString(),
      status: "confirmed",
      qrCodeValue: `ECSF-REG:${event.id}:${ticketCode}:${encodeURIComponent(
        fullName.trim()
      )}`,
      checkInCode: ticketCode,
    };

    event.registrationsCount += 1;
    IN_MEMORY_REGISTRATIONS.unshift(newTicket);

    return NextResponse.json(
      {
        success: true,
        message: "Registration confirmed successfully!",
        data: newTicket,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process registration",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  let list = IN_MEMORY_REGISTRATIONS;
  if (eventId) {
    list = list.filter((r) => r.eventId === eventId);
  }

  return NextResponse.json({
    success: true,
    total: list.length,
    data: list,
  });
}
