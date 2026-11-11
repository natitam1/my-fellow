export interface FellowshipLeader {
  id: string;
  name: string;
  role: string;
  category: "executive" | "ministry" | "advisory";
  department: string;
  yearOfStudy?: string;
  bio: string;
  favoriteVerse: string;
  phoneNumber: string;
  telegram: string;
  email: string;
  imageUrl: string;
  isVerified: boolean;
  officeHours?: string;
}

export interface MinistryTeam {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  category: "Spiritual Life" | "Media & Arts" | "Outreach & Care" | "Logistics & Tech";
  membersCount: number;
  meetingDay: string;
  meetingTime: string;
  location: string;
  description: string;
  about: string;
  vision: string;
  responsibilities: string[];
  leader: {
    name: string;
    role: string;
    phone: string;
    telegram: string;
    imageUrl?: string;
  };
  isAcceptingMembers: boolean;
}

export interface RegisteredEvent {
  id: string;
  eventId: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status: "confirmed" | "attended" | "upcoming";
  ticketNumber: string;
  imageUrl?: string;
}

export interface GivingTransaction {
  id: string;
  txRef: string;
  amount: number;
  currency: string;
  reason: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  paymentMethod: string;
  receiptNumber: string;
}

export interface SpiritualStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  weeklyCheckins: { day: string; short: string; completed: boolean }[];
  encouragement: string;
  milestoneTarget: number;
  milestoneTitle: string;
}

// 8 Official Ministry Teams of 4 Kilo Fellowship (AAU ECSF)
export const FELLOWSHIP_TEAMS: MinistryTeam[] = [
  {
    id: "team-worship",
    name: "Worship & Praise Team",
    slug: "worship",
    iconName: "Music",
    category: "Media & Arts",
    membersCount: 48,
    meetingDay: "Wednesdays & Saturdays",
    meetingTime: "5:30 PM - 7:30 PM",
    location: "Main Chapel Hall (Auditorium)",
    description: "Leading corporate worship, vocal harmonization, and instrumental praise during fellowship gatherings.",
    about: "The Worship Team is dedicated to creating an atmosphere where students can experience intimate communion with God through gospel-centered praise, modern anthems, and traditional Ethiopian spiritual hymns.",
    vision: "To cultivate worshippers who worship the Father in spirit and in truth across all campus dormitories and faculties.",
    responsibilities: [
      "Lead worship during Friday Main Fellowships and Sunday celebrations",
      "Vocal coaching, choir practice, and acoustic band rehearsals",
      "Spiritual preparation through prayer and fasting before services",
      "Mentoring freshman musicians and singers in kingdom excellence"
    ],
    leader: {
      name: "Bereket Tadesse",
      role: "Worship Director",
      phone: "+251911445566",
      telegram: "bereket_worship",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
    },
    isAcceptingMembers: true,
  },
  {
    id: "team-media",
    name: "Media & Communications",
    slug: "media",
    iconName: "Video",
    category: "Media & Arts",
    membersCount: 32,
    meetingDay: "Thursdays",
    meetingTime: "6:00 PM - 7:30 PM",
    location: "Technology Lab & Media Booth",
    description: "Visual storytelling, livestream broadcasting, event photography, social media, and digital design.",
    about: "From capturing transformative moments during revival nights to broadcasting our messages to diaspora alumni, the Media Team serves as the digital voice and visual identity of 4 Kilo Fellowship.",
    vision: "To proclaim the Gospel through high-aesthetic digital media, authentic video storytelling, and clean social feeds.",
    responsibilities: [
      "Multi-camera live streaming on YouTube and Telegram channels",
      "Photography and editing for fellowship conferences and fellowships",
      "Poster, banner, and slide projection graphic designs",
      "Maintaining social media channels and podcast audio engineering"
    ],
    leader: {
      name: "Dagmawi Girma",
      role: "Media & Communications Head",
      phone: "+251922334455",
      telegram: "dagm_media",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80"
    },
    isAcceptingMembers: true,
  },
  {
    id: "team-prayer",
    name: "Prayer & Intercession",
    slug: "prayer",
    iconName: "Flame",
    category: "Spiritual Life",
    membersCount: 56,
    meetingDay: "Daily Morning Watch & Fridays",
    meetingTime: "6:00 AM - 7:00 AM (Daily) & 4:30 PM (Fri)",
    location: "Upper Prayer Room (Old Dorm Block)",
    description: "Standing in the gap for students, campus revival, exam periods, and fellowship leaders through fervent prayer.",
    about: "The Prayer Ministry is the spiritual engine of our fellowship. We believe nothing of eternal value happens without intercession, and our members commit to regular prayer watches and fasting for university transformation.",
    vision: "To ignite an unquenchable altar of persistent prayer across Addis Ababa University.",
    responsibilities: [
      "Lead Morning Watch prayers from 6:00 AM across campus halls",
      "Intercede for anonymous student prayer requests submitted via the app",
      "Organize half-night prayer chains and term-start fasting weeks",
      "Provide confidential prayer support for students undergoing crisis"
    ],
    leader: {
      name: "Eden Alemu",
      role: "Prayer & Intercession Coordinator",
      phone: "+251933556677",
      telegram: "eden_prayer",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
    },
    isAcceptingMembers: true,
  },
  {
    id: "team-charity",
    name: "Charity & Benevolence",
    slug: "charity",
    iconName: "Heart",
    category: "Outreach & Care",
    membersCount: 40,
    meetingDay: "Saturdays",
    meetingTime: "2:30 PM - 5:00 PM",
    location: "Social Affairs Room (Behind Library)",
    description: "Extending Christ's hands to economically vulnerable students, hospital patients, and local community outreach.",
    about: "Demonstrating Christ's love through tangible compassion. We support campus students struggling with meal tickets, clothing, and medicine, while visiting nearby hospitals and orphanages throughout Addis Ababa.",
    vision: "To ensure no student on our campus drops out or goes hungry due to financial hardship.",
    responsibilities: [
      "Administer the Student Emergency Meal and Medical Benevolence Fund",
      "Bi-weekly hospital visitation to Tikur Anbessa & Yekatit 12 hospitals",
      "Semester textbook and stationery donation drives for freshmen",
      "Community cleanup and love-in-action service projects"
    ],
    leader: {
      name: "Natnael Shimelis",
      role: "Charity & Outreach Director",
      phone: "+251944667788",
      telegram: "natnael_charity",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80"
    },
    isAcceptingMembers: true,
  },
  {
    id: "team-literature",
    name: "Literature & Devotionals",
    slug: "literature",
    iconName: "BookOpen",
    category: "Spiritual Life",
    membersCount: 26,
    meetingDay: "Tuesdays",
    meetingTime: "5:30 PM - 7:00 PM",
    location: "Fellowship Library Room 102",
    description: "Curating daily devotional readings, publishing theological articles, campus magazines, and managing the Christian library.",
    about: "Dedicated to intellectual and theological depth. The Literature team writes the daily devotions featured in the My Fellow app, distributes gospel tracts, and equips students with sound biblical doctrine.",
    vision: "To foster deep biblical literacy and love for scripture among engineering and science students.",
    responsibilities: [
      "Write, review, and schedule the Daily Bread devotional series in the app",
      "Curate and maintain the fellowship's lending library of 500+ books",
      "Publish the semester fellowship newsletter and apologetics essays",
      "Conduct book reviews and theological discussions on campus"
    ],
    leader: {
      name: "Ruth Hailu",
      role: "Literature & Editorial Head",
      phone: "+251955778899",
      telegram: "ruth_editorial",
      imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"
    },
    isAcceptingMembers: true,
  },
  {
    id: "team-technical",
    name: "Technical & Logistics",
    slug: "technical",
    iconName: "Wrench",
    category: "Logistics & Tech",
    membersCount: 30,
    meetingDay: "Fridays",
    meetingTime: "3:30 PM - 5:00 PM (Setup)",
    location: "Sound Booth & Stage Store",
    description: "Sound reinforcement, lighting, power backup, acoustic management, and hall setup for all fellowship gatherings.",
    about: "Working quietly behind the scenes to make sure God's word is heard clearly without technical hitches. We manage power backups, mic distributions, audio mixers, and venue logistics.",
    vision: "To achieve technical excellence so the Gospel is communicated without distraction.",
    responsibilities: [
      "Manage acoustic mixing consoles, wireless mics, and speakers",
      "Ensure stage cabling, lighting, and power backup readiness",
      "Hall seating arrangement and temperature control before large services",
      "Storage, maintenance, and cataloging of fellowship equipment"
    ],
    leader: {
      name: "Kaleb Yohannes",
      role: "Technical & Operations Lead",
      phone: "+251966889900",
      telegram: "kaleb_tech",
      imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80"
    },
    isAcceptingMembers: true,
  },
  {
    id: "team-discipleship",
    name: "Discipleship & Evangelism",
    slug: "discipleship",
    iconName: "Users",
    category: "Spiritual Life",
    membersCount: 64,
    meetingDay: "Mondays & Thursdays",
    meetingTime: "5:00 PM - 6:30 PM",
    location: "Block 10 Seminar Room",
    description: "Small group Bible studies, freshman orientation and mentorship, dorm evangelism, and foundational spiritual growth.",
    about: "Our mission is to help new believers become established disciples who make other disciples. We coordinate 30+ dorm cell groups, walk alongside first-year students, and share Christ in the university context.",
    vision: "Every student rooted in Christ, fruitful in character, and multiplying the kingdom.",
    responsibilities: [
      "Coordinate dorm Bible study cells across male and female student blocks",
      "Lead Freshman Welcome & Transition Mentorship each semester",
      "Conduct 1-on-1 discipleship meetings using foundational curriculum",
      "Organize semester evangelism walks and apologetics open forums"
    ],
    leader: {
      name: "Samuel Mekonnen",
      role: "Discipleship & Cell Coordinator",
      phone: "+251977990011",
      telegram: "samuel_disciple",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80"
    },
    isAcceptingMembers: true,
  },
  {
    id: "team-counseling",
    name: "Counseling & Student Care",
    slug: "counseling",
    iconName: "HeartHandshake",
    category: "Outreach & Care",
    membersCount: 22,
    meetingDay: "Wednesdays",
    meetingTime: "4:00 PM - 6:00 PM",
    location: "Quiet Counseling Room (Old Clinic Wing)",
    description: "Confidential spiritual guidance, emotional support, exam anxiety management, and peer Christian counseling.",
    about: "University life comes with intense academic, personal, and emotional pressures. The Counseling team provides a safe, confidential sanctuary anchored in biblical truth and empathetic listening.",
    vision: "To offer Christ-centered healing, hope, and clarity for students navigating seasons of distress.",
    responsibilities: [
      "One-on-one confidential counseling sessions for students in distress",
      "Academic pressure, burnout, and mental wellness workshops",
      "Grief, family breakdown, and relationship spiritual guidance",
      "Referral coordination with mature fellowship mentors and pastors"
    ],
    leader: {
      name: "Hanna Daniel",
      role: "Counseling & Care Lead",
      phone: "+251988001122",
      telegram: "hanna_counsel",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
    },
    isAcceptingMembers: true,
  },
];

// Fellowship Executive Committee & Leaders Roster
export const FELLOWSHIP_LEADERS: FellowshipLeader[] = [
  {
    id: "ldr-1",
    name: "Yared Tefera",
    role: "Fellowship President",
    category: "executive",
    department: "Electrical & Computer Engineering",
    yearOfStudy: "Year 5",
    bio: "Passionate about seeing a generation of university students captivated by Jesus Christ and walking in integrity as future leaders of Ethiopia.",
    favoriteVerse: "Whatever you do, work heartily, as for the Lord and not for men. — Colossians 3:23",
    phoneNumber: "+251911122334",
    telegram: "yared_president",
    email: "president@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Tuesdays & Thursdays, 4:00 PM - 6:00 PM (Executive Office)",
  },
  {
    id: "ldr-2",
    name: "Selamawit Kebede",
    role: "Vice President & Internal Affairs",
    category: "executive",
    department: "Chemical & Bio Engineering",
    yearOfStudy: "Year 4",
    bio: "Coordinating internal ministry teams, welfare, and student leadership development with a heart for humble servant stewardship.",
    favoriteVerse: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you. — Zephaniah 3:17",
    phoneNumber: "+251922233445",
    telegram: "selam_vp",
    email: "vp@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Mondays & Wednesdays, 3:30 PM - 5:30 PM",
  },
  {
    id: "ldr-3",
    name: "Binyam Worku",
    role: "General Secretary",
    category: "executive",
    department: "Software Engineering",
    yearOfStudy: "Year 4",
    bio: "Managing institutional communications, administrative records, and university administration liaison with rigor and clarity.",
    favoriteVerse: "Let all things be done decently and in order. — 1 Corinthians 14:40",
    phoneNumber: "+251933344556",
    telegram: "binyam_sec",
    email: "secretary@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Wednesdays & Fridays, 2:00 PM - 4:00 PM",
  },
  {
    id: "ldr-4",
    name: "Eden Alemu",
    role: "Prayer & Intercession Coordinator",
    category: "executive",
    department: "Biomedical Engineering",
    yearOfStudy: "Year 4",
    bio: "Burdened for continuous campus intercession, student revival, and cultivating secret-place communion with God.",
    favoriteVerse: "Pray without ceasing. — 1 Thessalonians 5:17",
    phoneNumber: "+251933556677",
    telegram: "eden_prayer",
    email: "prayer@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Daily after Morning Watch, 7:15 AM - 8:00 AM",
  },
  {
    id: "ldr-5",
    name: "Samuel Mekonnen",
    role: "Discipleship & Evangelism Lead",
    category: "executive",
    department: "Civil Engineering",
    yearOfStudy: "Year 5",
    bio: "Committed to raising faithful student mentors and multiplying cell groups across all student living blocks.",
    favoriteVerse: "And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men. — 2 Timothy 2:2",
    phoneNumber: "+251977990011",
    telegram: "samuel_disciple",
    email: "discipleship@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Thursdays, 4:00 PM - 6:00 PM",
  },
  {
    id: "ldr-6",
    name: "Mahlet Fikadu",
    role: "Finance & Stewardship Treasurer",
    category: "executive",
    department: "Economics & Finance",
    yearOfStudy: "Year 4",
    bio: "Ensuring transparent, godly financial stewardship of all member gifts, tithes, and benevolence funds.",
    favoriteVerse: "Moreover it is required in stewards, that a man be found faithful. — 1 Corinthians 4:2",
    phoneNumber: "+251944556677",
    telegram: "mahlet_finance",
    email: "finance@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Fridays, 4:30 PM - 6:00 PM",
  },
  {
    id: "ldr-7",
    name: "Bereket Tadesse",
    role: "Worship Ministry Leader",
    category: "ministry",
    department: "Mechanical Engineering",
    yearOfStudy: "Year 4",
    bio: "Leading vocalists and musicians to offer acceptable sacrifices of praise in spirit and in truth.",
    favoriteVerse: "Praise him with the sound of the trumpet: praise him with the psaltery and harp. — Psalm 150:3",
    phoneNumber: "+251911445566",
    telegram: "bereket_worship",
    email: "worship@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Saturdays, 4:00 PM - 5:30 PM (Main Auditorium)",
  },
  {
    id: "ldr-8",
    name: "Dagmawi Girma",
    role: "Media & Tech Director",
    category: "ministry",
    department: "Computer Science",
    yearOfStudy: "Year 3",
    bio: "Harnessing media technologies, design, and live broadcasts to proclaim Christ without borders.",
    favoriteVerse: "Write the vision, and make it plain upon tables, that he may run that readeth it. — Habakkuk 2:2",
    phoneNumber: "+251922334455",
    telegram: "dagm_media",
    email: "media@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Thursdays, 5:00 PM - 6:00 PM",
  },
  {
    id: "ldr-9",
    name: "Hanna Daniel",
    role: "Counseling & Member Care Head",
    category: "ministry",
    department: "Psychology & Social Sciences",
    yearOfStudy: "Year 4",
    bio: "Walking alongside students carrying silent burdens with grace, confidential empathy, and Scripture.",
    favoriteVerse: "Bear ye one another's burdens, and so fulfil the law of Christ. — Galatians 6:2",
    phoneNumber: "+251988001122",
    telegram: "hanna_counsel",
    email: "care@4kilofellowship.org",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "Wednesdays & Fridays, 3:00 PM - 5:00 PM",
  },
  {
    id: "ldr-10",
    name: "Dr. Eyob Assefa",
    role: "Senior Faculty Advisor & Mentor",
    category: "advisory",
    department: "Associate Professor, School of Electrical Engineering",
    bio: "Serving 4 Kilo Fellowship for over 12 years as spiritual mentor, faculty liaison, and graduation advisor for Christian engineers.",
    favoriteVerse: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. — Proverbs 3:5",
    phoneNumber: "+251911998877",
    telegram: "dr_eyob_advisory",
    email: "eyob.assefa@aau.edu.et",
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
    isVerified: true,
    officeHours: "By appointment via Email / Office 314",
  },
];

// Mock Registered Events for Member Profile
export const MOCK_USER_EVENTS: RegisteredEvent[] = [
  {
    id: "reg-1",
    eventId: "ev-annual-conf-2026",
    title: "Annual Campus Revival & Leadership Conference 2026",
    category: "Conference",
    date: "Dec 04 - Dec 06, 2026",
    time: "9:00 AM - 6:00 PM",
    location: "AAU 4 Kilo Main Auditorium & Lawn",
    status: "confirmed",
    ticketNumber: "TK-4K-2026-8842",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "reg-2",
    eventId: "ev-worship-night",
    title: "Acoustic Praise & Adoration Night: 'Deep Calls Unto Deep'",
    category: "Worship Night",
    date: "Nov 21, 2026",
    time: "6:00 PM - 9:30 PM",
    location: "Fellowship Chapel (Block B)",
    status: "upcoming",
    ticketNumber: "TK-4K-2026-5129",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "reg-3",
    eventId: "ev-freshman-mentorship",
    title: "Freshman Academic & Spiritual Transition Summit",
    category: "Mentorship",
    date: "Oct 18, 2026",
    time: "2:00 PM - 5:30 PM",
    location: "Civil Building Room 204",
    status: "attended",
    ticketNumber: "TK-4K-2026-1044",
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80",
  },
];

// Mock Givings for Member Profile
export const MOCK_USER_GIVINGS: GivingTransaction[] = [
  {
    id: "giv-1",
    txRef: "fellow-jami-1731201928-a3f",
    amount: 500,
    currency: "ETB",
    reason: "Monthly Student Tithe",
    status: "completed",
    createdAt: "2026-11-01T14:22:10Z",
    paymentMethod: "Telebirr via Jami",
    receiptNumber: "RCP-4K-99014",
  },
  {
    id: "giv-2",
    txRef: "fellow-jami-1729801234-bc2",
    amount: 300,
    currency: "ETB",
    reason: "Hospital Care & Benevolence Gift",
    status: "completed",
    createdAt: "2026-10-15T09:12:45Z",
    paymentMethod: "CBE Birr via Jami",
    receiptNumber: "RCP-4K-98442",
  },
  {
    id: "giv-3",
    txRef: "fellow-jami-1727918239-ee7",
    amount: 1000,
    currency: "ETB",
    reason: "Annual Conference Love Offering",
    status: "completed",
    createdAt: "2026-09-28T18:45:00Z",
    paymentMethod: "Telebirr via Jami",
    receiptNumber: "RCP-4K-97120",
  },
];

// Initial Devotional Streak Data
export const INITIAL_SPIRITUAL_STREAK: SpiritualStreak = {
  currentStreak: 14,
  longestStreak: 28,
  lastReadDate: new Date().toISOString(),
  weeklyCheckins: [
    { day: "Monday", short: "M", completed: true },
    { day: "Tuesday", short: "T", completed: true },
    { day: "Wednesday", short: "W", completed: true },
    { day: "Thursday", short: "T", completed: true },
    { day: "Friday", short: "F", completed: true },
    { day: "Saturday", short: "S", completed: true },
    { day: "Sunday", short: "S", completed: true },
  ],
  encouragement: "You're walking in spiritual consistency! 'Your word is a lamp to my feet and a light to my path.' — Psalm 119:105",
  milestoneTarget: 30,
  milestoneTitle: "30-Day Devotion Warrior Badge",
};
