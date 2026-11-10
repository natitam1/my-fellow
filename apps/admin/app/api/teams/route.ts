import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status },
    );
  }
  const teams = [
    {
      _id: "team-worship",
      name: "Worship & Praise Team",
      category: "Worship & Arts",
      members: 45,
      location: "Main Sanctuary",
    },
    {
      _id: "team-prayer",
      name: "Prayer & Intercession",
      category: "Spiritual Life",
      members: 42,
      location: "Prayer Chapel (Hall B)",
    },
    {
      _id: "team-media",
      name: "Media & Production Team",
      category: "Media & Tech",
      members: 28,
      location: "Media Booth",
    },
    {
      _id: "team-charity",
      name: "Charity & Benevolence Team",
      category: "Community Outreach",
      members: 36,
      location: "Fellowship Hall",
    },
    {
      _id: "team-evangelism",
      name: "Evangelism & Outreach Team",
      category: "Campus Mission",
      members: 52,
      location: "Campus Grounds",
    },
    {
      _id: "team-discipleship",
      name: "Discipleship & Follow-up",
      category: "Spiritual Life",
      members: 38,
      location: "Auditorium Room 3",
    },
    {
      _id: "team-ushers",
      name: "Hospitality & Ushering Team",
      category: "Service",
      members: 30,
      location: "Main Entrance",
    },
    {
      _id: "team-tech",
      name: "Technical & Logistics Team",
      category: "Media & Tech",
      members: 24,
      location: "Sound Control Room",
    },
  ];

  return NextResponse.json({
    success: true,
    data: teams,
  });
}
