export const AAU_FACULTIES = [
  "Software Engineering",
  "Computer Science",
  "Electrical & Computer Engineering",
  "Civil & Environmental Engineering",
  "Mechanical & Industrial Engineering",
  "Chemical & Materials Engineering",
  "Biomedical Engineering",
  "Information Systems & Technology",
  "Architecture & Urban Planning",
  "Physics & Applied Mathematics",
  "Chemistry & Industrial Chemistry",
  "Biology & Biotechnology",
  "School of Medicine & Health Sciences",
  "School of Commerce & Economics",
  "Social Sciences & Humanities",
  "Law & Governance",
] as const;

export type AAUFaculty = (typeof AAU_FACULTIES)[number];

export const ACADEMIC_YEARS = [
  "1st Year (Freshman)",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year (Finalist)",
  "Postgraduate / Masters",
] as const;

export type AcademicYear = (typeof ACADEMIC_YEARS)[number];

export interface FellowshipMinistryTeamOption {
  id: string;
  name: string;
  category: string;
  description: string;
  meetingTime: string;
}

export const MINISTRY_TEAMS_LIST: FellowshipMinistryTeamOption[] = [
  {
    id: "worship",
    name: "Worship & Praise Team",
    category: "Media & Arts",
    description: "Leading corporate worship, vocal harmonization, and instrumental praise during fellowship gatherings.",
    meetingTime: "Wednesdays & Saturdays, 5:30 PM",
  },
  {
    id: "prayer",
    name: "Prayer & Intercession",
    category: "Spiritual Life",
    description: "Standing in the gap for students, campus revival, exam periods, and fellowship leaders through fervent prayer.",
    meetingTime: "Daily Morning Watch 6:00 AM & Fridays 4:30 PM",
  },
  {
    id: "media",
    name: "Media, Sound & Tech Team",
    category: "Media & Arts",
    description: "Audio engineering, livestream broadcasting, mobile app maintenance, social media, and slide projection.",
    meetingTime: "Thursdays 6:00 PM",
  },
  {
    id: "evangelical",
    name: "Evangelical & Freshmen Ministry",
    category: "Outreach & Care",
    description: "Welcoming first-year students to AAU 4 Kilo, organizing dorm Bible studies, and campus personal evangelism.",
    meetingTime: "Tuesdays & Fridays 5:00 PM",
  },
  {
    id: "charity",
    name: "Charity & Social Outreach",
    category: "Outreach & Care",
    description: "Supporting students facing financial hardship with meal coupons, academic stationery, and hospital visits.",
    meetingTime: "Saturdays 10:00 AM",
  },
  {
    id: "discipleship",
    name: "Bible Study & Discipleship",
    category: "Spiritual Life",
    description: "Equipping believers through systematic scripture exposition, discipleship cohorts, and dorm cell groups.",
    meetingTime: "Mondays 5:30 PM",
  },
  {
    id: "ushers",
    name: "Ushers & Hospitality",
    category: "Logistics & Tech",
    description: "Welcoming attendees warmly, hall seating management, guest reception, and after-service tea fellowship.",
    meetingTime: "Fridays 4:00 PM",
  },
  {
    id: "literature",
    name: "Literature & Devotional Writers",
    category: "Media & Arts",
    description: "Authoring daily student devotionals, publishing fellowship magazine, and managing the campus Christian library.",
    meetingTime: "Sundays 3:00 PM",
  },
];

export const PRESET_STUDENT_AVATARS = [
  {
    id: "avatar-1",
    label: "Yohannes (Student)",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-2",
    label: "Selamawit (Student)",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-3",
    label: "Dawit (Student)",
    url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-4",
    label: "Bethlehem (Student)",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-5",
    label: "Natnael (Student)",
    url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-6",
    label: "Hanna (Student)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
  },
];
