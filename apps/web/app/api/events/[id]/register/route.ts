import { NextRequest, NextResponse } from "next/server";
import {
  getEventById,
  IN_MEMORY_REGISTRATIONS,
  RegistrationTicket,
} from "@/lib/events-data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = getEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { fullName, phoneNumber, team, department, notes } = body;

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

    // Generate ticket
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

    // Update in-memory counts
    event.registrationsCount += 1;
    IN_MEMORY_REGISTRATIONS.unshift(newTicket);

    return NextResponse.json(
      {
        success: true,
        message: "Registration confirmed successfully! Please save your ticket.",
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event not found" },
      { status: 404 }
    );
  }

  const registrationsForEvent = IN_MEMORY_REGISTRATIONS.filter(
    (r) => r.eventId === event.id || r.eventId === event._id
  );

  return NextResponse.json({
    success: true,
    data: {
      eventId: event.id,
      title: event.title,
      registrationLimit: event.registrationLimit,
      registrationsCount: event.registrationsCount,
      seatsRemaining: Math.max(
        0,
        (event.registrationLimit || 0) - event.registrationsCount
      ),
      isFull:
        event.registrationLimit > 0 &&
        event.registrationsCount >= event.registrationLimit,
      registrations: registrationsForEvent,
    },
  });
}
