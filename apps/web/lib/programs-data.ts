export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface ProgramLeader {
  id: string;
  name: string;
  role: string;
  department?: string;
  phoneNumber: string;
  telegramHandle?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ProgramLocation {
  name: string;
  room: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapUrl: string;
  campusZone?: string;
}

export interface FellowshipProgram {
  id: string;
  _id: string;
  title: string;
  slug: string;
  category: string;
  day: DayOfWeek;
  dayOrder: number; // For sorting Monday (1) to Sunday (7) or starting at Friday
  time: string;
  durationMinutes: number;
  timeSlot: "morning" | "afternoon" | "evening";
  recurringSchedule: string;
  location: ProgramLocation;
  leader: ProgramLeader;
  description: string;
  highlights: string[];
  targetAudience: string;
  language: string;
  image: string;
  badge?: string;
  isMainGathering?: boolean;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const PROGRAM_CATEGORIES = [
  "All",
  "Worship Night",
  "Bible Study",
  "Prayer & Intercession",
  "Freshman Discipleship",
  "Music & Arts",
  "Evangelism & Outreach",
  "Sisters Fellowship",
];

export const INITIAL_PROGRAMS: FellowshipProgram[] = [
  {
    id: "prog-friday-worship",
    _id: "prog-friday-worship",
    slug: "friday-worship-word-gathering",
    title: "Friday Worship & Word Gathering",
    category: "Worship Night",
    day: "Friday",
    dayOrder: 5,
    time: "5:30 PM – 7:45 PM",
    durationMinutes: 135,
    timeSlot: "evening",
    recurringSchedule: "Every Friday evening during academic semesters",
    location: {
      name: "AAU Arat Kilo Science Faculty Main Amphitheater",
      room: "Amphitheater A (Ground Level)",
      address: "AAU 4-Kilo Campus, King George VI St, Addis Ababa",
      coordinates: { lat: 9.0354, lng: 38.7618 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0354,38.7618",
      campusZone: "Main Science Complex",
    },
    leader: {
      id: "ldr-worship",
      name: "Bro. Yohannes Bekele",
      role: "Worship & Choir Director",
      department: "Statistics - 4th Year",
      phoneNumber: "+251911458890",
      telegramHandle: "@yohannes_worship",
      email: "worship@4kilofellowship.org",
      avatarUrl:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
    },
    description:
      "Our flagship weekly congregational gathering! Over 300 campus students gather every Friday right after afternoon classes for intense corporate praise, unhurried adoration, expository Scripture teaching by university chaplains and senior mentors, and corporate intercession for student dorms.",
    highlights: [
      "Congregational worship led by the 4-Kilo Fellowship Choir & live band",
      "Systematic expository preaching through books of the Bible",
      "Weekly campus fellowship notices and announcements",
      "Personal prayer ministry and altar counseling available after service",
    ],
    targetAudience: "Open to all university students, faculty members, and seekers",
    language: "Amharic (with English summary translation notes)",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    badge: "Main Gathering",
    isMainGathering: true,
  },
  {
    id: "prog-wednesday-biblestudy",
    _id: "prog-wednesday-biblestudy",
    slug: "wednesday-inductive-bible-study",
    title: "Wednesday Midweek Inductive Bible Study",
    category: "Bible Study",
    day: "Wednesday",
    dayOrder: 3,
    time: "5:45 PM – 7:15 PM",
    durationMinutes: 90,
    timeSlot: "evening",
    recurringSchedule: "Every Wednesday evening",
    location: {
      name: "Natural Science Faculty Lecture Block",
      room: "Lecture Hall 204 (Level 2)",
      address: "AAU 4-Kilo Campus",
      coordinates: { lat: 9.036, lng: 38.7625 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0360,38.7625",
      campusZone: "Building 3",
    },
    leader: {
      id: "ldr-bible",
      name: "Sis. Selamawit Hailu",
      role: "Bible Study & Discipleship Coordinator",
      department: "Computer Science - 3rd Year",
      phoneNumber: "+251923341122",
      telegramHandle: "@selam_fellow",
      email: "biblestudy@4kilofellowship.org",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    },
    description:
      "Verse-by-verse inductive study and small group discussion. Students gather in small circles (8-10 students each) divided by year of study to observe, interpret, and apply the Scriptures to real campus temptations, intellectual doubts, and life questions.",
    highlights: [
      "Inductive study method: Observation, Interpretation, Application",
      "Interactive small group breakout tables",
      "Weekly downloadable PDF study question guide",
      "Mentored by senior student facilitators",
    ],
    targetAudience: "All students seeking deeper biblical understanding",
    language: "Amharic & English",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    badge: "Interactive Groups",
    isMainGathering: false,
  },
  {
    id: "prog-saturday-prayer",
    _id: "prog-saturday-prayer",
    slug: "saturday-dawn-prayer-intercession",
    title: "Saturday Dawn Prayer & Fasting Watch",
    category: "Prayer & Intercession",
    day: "Saturday",
    dayOrder: 6,
    time: "6:00 AM – 7:30 AM",
    durationMinutes: 90,
    timeSlot: "morning",
    recurringSchedule: "Every Saturday morning",
    location: {
      name: "Fellowship Chapel Ground / Student Center Hall",
      room: "Chapel Prayer Sanctuary",
      address: "AAU 4-Kilo Campus, East Wing",
      coordinates: { lat: 9.0352, lng: 38.7615 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0352,38.7615",
      campusZone: "Chapel Complex",
    },
    leader: {
      id: "ldr-prayer",
      name: "Bro. Dawit Tadesse",
      role: "Intercession Team Leader",
      department: "Applied Mathematics - 4th Year",
      phoneNumber: "+251944556789",
      telegramHandle: "@dawit_intercessor",
      email: "prayer@4kilofellowship.org",
      avatarUrl:
        "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80",
    },
    description:
      "Start the weekend bathed in the Holy Spirit. Corporate intercession standing on the ramparts for our campus: lifting up university instructors, dean administrations, dormitory floors, academic exams, national revival, and individual student burdens.",
    highlights: [
      "Corporate warfare prayer and quiet contemplative time",
      "Anonymous prayer request box prayed over weekly",
      "Fasting fellowship with light tea/bread at completion",
      "Prophetic scripture reading for the university",
    ],
    targetAudience: "All praying students and intercessors",
    language: "Amharic",
    image:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
    badge: "Dawn Watch",
    isMainGathering: false,
  },
  {
    id: "prog-sunday-freshman",
    _id: "prog-sunday-freshman",
    slug: "sunday-freshman-discipleship-foundations",
    title: "Sunday Freshman Discipleship Class: 'Foundations of Faith'",
    category: "Freshman Discipleship",
    day: "Sunday",
    dayOrder: 7,
    time: "2:00 PM – 4:00 PM",
    durationMinutes: 120,
    timeSlot: "afternoon",
    recurringSchedule: "Every Sunday afternoon during 1st and 2nd semesters",
    location: {
      name: "Department of Chemistry Seminar Hall",
      room: "Room 108 (Ground Floor)",
      address: "AAU 4-Kilo Chemistry Complex",
      coordinates: { lat: 9.0357, lng: 38.762 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0357,38.7620",
      campusZone: "Chemistry Wing",
    },
    leader: {
      id: "ldr-freshman",
      name: "Bro. Natnael Girma",
      role: "Freshman Ministry Lead",
      department: "Physics Senior",
      phoneNumber: "+251912233445",
      telegramHandle: "@nati_freshman_mentor",
      email: "freshman@4kilofellowship.org",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
    description:
      "A tailored 12-week foundational curriculum specifically crafted for first-year undergraduate students. Covers assurance of salvation, daily quiet time discipline, resisting peer pressure in campus dormitories, Christian friendships, and academic stewardship.",
    highlights: [
      "Structured 12-week discipleship syllabus with completion certificate",
      "One-on-one senior student mentor assigned to each freshman",
      "Comfortable safe environment to ask honest university life questions",
      "Snacks and fellowship time after each session",
    ],
    targetAudience: "First-year university students (Freshmen)",
    language: "Amharic & English",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    badge: "Mentorship",
    isMainGathering: false,
  },
  {
    id: "prog-tuesday-choir",
    _id: "prog-tuesday-choir",
    slug: "tuesday-choir-instrumentalists-rehearsal",
    title: "Tuesday Choir & Instrumentalists Rehearsal",
    category: "Music & Arts",
    day: "Tuesday",
    dayOrder: 2,
    time: "5:15 PM – 7:00 PM",
    durationMinutes: 105,
    timeSlot: "evening",
    recurringSchedule: "Every Tuesday evening",
    location: {
      name: "Campus Chapel Basement Music Room",
      room: "Music Ministry Room B-2",
      address: "AAU 4-Kilo Chapel Building",
      coordinates: { lat: 9.0352, lng: 38.7615 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0352,38.7615",
      campusZone: "Chapel Basement",
    },
    leader: {
      id: "ldr-choir",
      name: "Sis. Martha Alemayehu",
      role: "Choir Vocal Lead",
      department: "Environmental Science - 3rd Year",
      phoneNumber: "+251931129900",
      telegramHandle: "@martha_choir",
      email: "choir@4kilofellowship.org",
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    },
    description:
      "Vocal training, multi-part harmony practice, acoustic arrangements, and spiritual consecration for the 4-Kilo Choir singers and instrumentalists serving in Friday worship and conferences.",
    highlights: [
      "4-part harmony vocal drill (Soprano, Alto, Tenor, Bass)",
      "Band soundcheck with keyboards, guitars, and traditional percussion",
      "Spiritual devotion and character study for worship ministers",
    ],
    targetAudience: "Choir members, vocalists, and student musicians",
    language: "Amharic",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    badge: "Rehearsal",
    isMainGathering: false,
  },
  {
    id: "prog-thursday-outreach",
    _id: "prog-thursday-outreach",
    slug: "thursday-dorm-outreach-tract-prep",
    title: "Thursday Campus Outreach & Dorm Evangelism Walk",
    category: "Evangelism & Outreach",
    day: "Thursday",
    dayOrder: 4,
    time: "5:00 PM – 6:30 PM",
    durationMinutes: 90,
    timeSlot: "evening",
    recurringSchedule: "Every Thursday evening",
    location: {
      name: "Student Union Lounge & Campus Courtyard",
      room: "Room 12 / Front Garden",
      address: "AAU 4-Kilo Campus",
      coordinates: { lat: 9.0355, lng: 38.7617 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0355,38.7617",
      campusZone: "Student Union",
    },
    leader: {
      id: "ldr-outreach",
      name: "Bro. Caleb Mengistu",
      role: "Evangelism Lead",
      department: "Biology - 3rd Year",
      phoneNumber: "+251915567788",
      telegramHandle: "@caleb_outreach",
      email: "outreach@4kilofellowship.org",
      avatarUrl:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
    },
    description:
      "Prayerfully going out in pairs across campus pathways, student dorm blocks, and dining hall plazas with gospel tracts and conversational warmth, testifying to Christ's grace on campus.",
    highlights: [
      "15 minutes of unified commissioning prayer before going out",
      "Two-by-two paired evangelism walks",
      "Follow-up contact collection and new believer discipling",
    ],
    targetAudience: "All students with a heart for souls and campus mission",
    language: "Amharic, Afaan Oromoo & English",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    badge: "Campus Outreach",
    isMainGathering: false,
  },
  {
    id: "prog-monday-sisters",
    _id: "prog-monday-sisters",
    slug: "monday-sisters-prayer-mentorship-circle",
    title: "Monday Sisters Prayer & Mentorship Circle",
    category: "Sisters Fellowship",
    day: "Monday",
    dayOrder: 1,
    time: "5:30 PM – 7:00 PM",
    durationMinutes: 90,
    timeSlot: "evening",
    recurringSchedule: "Every Monday evening",
    location: {
      name: "Natural Science Building B Lounge",
      room: "Lounge Hall 14 (Level 1)",
      address: "AAU 4-Kilo Campus",
      coordinates: { lat: 9.0359, lng: 38.7623 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0359,38.7623",
      campusZone: "Building B",
    },
    leader: {
      id: "ldr-sisters",
      name: "Sis. Betelhem Assefa",
      role: "Sisters Ministry Coordinator",
      department: "Biochemistry - 4th Year",
      phoneNumber: "+251911998877",
      telegramHandle: "@betelhem_sisters",
      email: "sisters@4kilofellowship.org",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
    description:
      "A welcoming, confidential circle for female university students. Providing biblical sisterhood, mutual encouragement, guidance through university life pressures, and intimate prayer for women across campus dorms.",
    highlights: [
      "Mentorship from female fellowship alumni and senior students",
      "Safe space for vulnerable sharing and emotional support",
      "Focused prayer for purity, wisdom, and future family/career",
    ],
    targetAudience: "All female university students and sisters",
    language: "Amharic & English",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
    badge: "Sisters Circle",
    isMainGathering: false,
  },
];

export function getPrograms(): FellowshipProgram[] {
  return INITIAL_PROGRAMS;
}

export function getProgramsByDay(day: DayOfWeek): FellowshipProgram[] {
  return INITIAL_PROGRAMS.filter((p) => p.day === day);
}
