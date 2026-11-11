export type EventCategory =
  | "conference"
  | "assembly"
  | "retreat"
  | "seminar"
  | "worship";

export type MinistryTeam =
  | "All Fellowship"
  | "Worship & Arts"
  | "Discipleship & Bible Study"
  | "Prayer & Intercession"
  | "Evangelism & Outreach"
  | "Media & Technology"
  | "Sisters Fellowship"
  | "Freshman Ministry";

export interface EventSpeaker {
  id: string;
  name: string;
  role: string;
  affiliation?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface EventScheduleItem {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  description?: string;
  room?: string;
}

export interface EventLocation {
  name: string;
  address: string;
  room?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapUrl: string;
  directions?: string;
}

export interface FellowshipEvent {
  id: string;
  _id: string;
  title: string;
  slug: string;
  category: EventCategory;
  categoryLabel: string;
  team: MinistryTeam;
  shortDescription: string;
  fullDescription: string;
  themeVerse?: string;
  themeVerseReference?: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location: EventLocation;
  registrationLimit: number;
  registrationsCount: number;
  isPublished: boolean;
  isRegistrationOpen: boolean;
  buttonText?: string;
  imageUrl: string;
  badge?: string;
  admissionFee: string;
  speakers: EventSpeaker[];
  schedule: EventScheduleItem[];
  tags: string[];
  requirements?: string[];
  highlights?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationTicket {
  ticketNumber: string;
  registrationId: string;
  eventId: string;
  eventTitle: string;
  startDate: string;
  endDate: string;
  locationName: string;
  room?: string;
  fullName: string;
  phoneNumber: string;
  teamOrDepartment: string;
  registeredAt: string;
  status: "confirmed" | "waitlist" | "cancelled";
  qrCodeValue: string;
  checkInCode: string;
}

export const MINISTRY_TEAMS: MinistryTeam[] = [
  "All Fellowship",
  "Worship & Arts",
  "Discipleship & Bible Study",
  "Prayer & Intercession",
  "Evangelism & Outreach",
  "Media & Technology",
  "Sisters Fellowship",
  "Freshman Ministry",
];

export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "conference", label: "Fellowship Conferences" },
  { value: "assembly", label: "General Assemblies" },
  { value: "retreat", label: "Spiritual Retreats" },
  { value: "seminar", label: "Seminars & Workshops" },
  { value: "worship", label: "Praise & Worship" },
];

export const INITIAL_EVENTS: FellowshipEvent[] = [
  {
    id: "conf-annual-2026",
    _id: "conf-annual-2026",
    slug: "annual-fellowship-conference-2026",
    title: "Annual Fellowship General Conference 2026: 'Rooted and Built Up'",
    category: "conference",
    categoryLabel: "Annual Conference",
    team: "All Fellowship",
    shortDescription:
      "The flagship annual gathering of the AAU 4-Kilo Christian Students Fellowship, uniting students across all science and technology faculties for three days of revival, word, and vision.",
    fullDescription:
      "Join over 350 university students, fellowship alumni, and university ministers for the AAU 4-Kilo ECSF Annual Conference. Under the biblical theme 'Rooted and Built Up in Him' (Colossians 2:6-7), this 3-day experience will feature deep expository preaching, unhurried corporate worship, interactive leadership workshops, and dedicated prayer sessions for spiritual transformation across campus dormitories.",
    themeVerse:
      "Therefore, as you received Christ Jesus the Lord, so walk in him, rooted and built up in him and established in the faith, just as you were taught, abounding in thanksgiving.",
    themeVerseReference: "Colossians 2:6-7 (ESV)",
    startDate: "2026-11-27T08:30:00.000Z",
    endDate: "2026-11-29T18:00:00.000Z",
    location: {
      name: "AAU Arat Kilo Campus - Main Science Grand Amphitheater",
      address: "King George VI Street, Arat Kilo, Addis Ababa",
      room: "Amphitheater A (Ground Level)",
      coordinates: { lat: 9.0354, lng: 38.7618 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0354,38.7618",
      directions:
        "Enter through the main 4-Kilo campus gate. Walk straight past the clock tower toward the Science Faculty block; Amphitheater A is on the right.",
    },
    registrationLimit: 350,
    registrationsCount: 282,
    isPublished: true,
    isRegistrationOpen: true,
    buttonText: "Register for Conference",
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    badge: "Flagship Gathering",
    admissionFee: "Free Admission (Open to all students)",
    speakers: [
      {
        id: "sp-1",
        name: "Dr. Eyob Gebre",
        role: "Senior Campus Chaplain & Scholar",
        affiliation: "Fellowship Advisory Board & Evangelical Theological College",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        bio: "Dr. Eyob has served Ethiopian university student ministries for over 18 years, equipping campus leaders to integrate biblical discipleship with academic rigor.",
      },
      {
        id: "sp-2",
        name: "Pastor Aster Tesfaye",
        role: "Discipleship Director & Author",
        affiliation: "FOCUS Ethiopia / ECSF National Secretariat",
        avatarUrl:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        bio: "Pastor Aster specializes in mentoring young adults through identity, career purpose, and spiritual disciplines in secular university environments.",
      },
      {
        id: "sp-3",
        name: "Bro. Daniel Worku",
        role: "Fellowship President (2025/2026)",
        affiliation: "AAU 4-Kilo Christian Students Fellowship Executive",
        avatarUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        bio: "4th-year Computer Science senior leading the 4-Kilo ECSF committee, coordinating campus evangelism and student welfare initiatives.",
      },
    ],
    schedule: [
      {
        id: "sc-1",
        time: "Day 1 (Friday) - 4:00 PM - 5:30 PM",
        title: "Registration & Fellowship Welcome Reception",
        room: "Science Hall Foyer",
        description: "Badge distribution, registration verification, welcome pack and fellowship coffee.",
      },
      {
        id: "sc-2",
        time: "Day 1 (Friday) - 5:30 PM - 8:30 PM",
        title: "Opening Plenary: 'Deep Roots in Shaky Times'",
        speaker: "Dr. Eyob Gebre",
        room: "Amphitheater A",
        description: "Keynote exposition of Colossians 2, corporate praise by the 4-Kilo Fellowship Choir.",
      },
      {
        id: "sc-3",
        time: "Day 2 (Saturday) - 8:30 AM - 10:30 AM",
        title: "Morning Intercession & Word Exposition",
        speaker: "Bro. Daniel Worku & Prayer Team",
        room: "Amphitheater A",
        description: "Corporate prayer for student revivals, faculty outreach, and personal holiness.",
      },
      {
        id: "sc-4",
        time: "Day 2 (Saturday) - 11:00 AM - 1:00 PM",
        title: "Ministry Breakout Seminars: Apologetics, Media, & Dorm Life",
        speaker: "Pastor Aster Tesfaye & Department Leads",
        room: "Classrooms 101-105",
        description: "Focused tracks addressing practical Christian living in university dormitories.",
      },
      {
        id: "sc-5",
        time: "Day 2 (Saturday) - 3:00 PM - 7:00 PM",
        title: "Night of Awakening & Worship Encounter",
        speaker: "Fellowship Worship Team",
        room: "Amphitheater A",
        description: "Extended musical worship, testimonies of campus miracles, and ministry time.",
      },
      {
        id: "sc-6",
        time: "Day 3 (Sunday) - 2:00 PM - 5:30 PM",
        title: "Commissioning Service & Fellowship Feast",
        speaker: "Pastor Aster Tesfaye",
        room: "Amphitheater A & Lawn",
        description: "Commissioning graduating students, prayer over new executive candidates, and love feast.",
      },
    ],
    tags: ["Conference", "Revival", "Colossians", "All-Fellowship", "Discipleship"],
    requirements: [
      "Bring your university student ID card or admission pass",
      "Bring a physical Bible and notebook for seminar breakouts",
      "Please arrive 15 minutes prior to scheduled session starts",
    ],
    highlights: [
      "Over 350 university students and fellowship alumni gathered",
      "Comprehensive conference workbook and study guide provided",
      "Free fellowship love feast on Sunday closing session",
      "Special breakout tracks for freshmen and graduating seniors",
    ],
    createdAt: "2026-10-15T12:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "assembly-winter-2026",
    _id: "assembly-winter-2026",
    slug: "general-assembly-leadership-transition",
    title: "ECSF 4-Kilo General Assembly & Leadership Transition",
    category: "assembly",
    categoryLabel: "General Assembly",
    team: "All Fellowship",
    shortDescription:
      "Annual statutory assembly for all members of the fellowship. Reviewing ministry audits, constitutional updates, and praying over new committee nominees.",
    fullDescription:
      "The General Assembly is the solemn and joyful gathering where every registered member of AAU 4-Kilo Christian Students Fellowship gathers to reflect on God's faithfulness over the past semester. We will hear comprehensive financial and ministry reports from all 7 departmental teams, confirm incoming committee heads, and dedicate the upcoming term into the Lord's hands.",
    themeVerse:
      "For just as each of us has one body with many members, and these members do not all have the same function, so in Christ we, though many, form one body...",
    themeVerseReference: "Romans 12:4-5 (NIV)",
    startDate: "2026-12-12T13:30:00.000Z",
    endDate: "2026-12-12T18:00:00.000Z",
    location: {
      name: "Natural Science Faculty Assembly Hall 102",
      address: "AAU Arat Kilo Campus",
      room: "Lecture Hall 102 (First Floor)",
      coordinates: { lat: 9.036, lng: 38.7625 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0360,38.7625",
      directions: "Located inside Building 2, first floor staircase to the left.",
    },
    registrationLimit: 200,
    registrationsCount: 146,
    isPublished: true,
    isRegistrationOpen: true,
    buttonText: "Reserve Seat",
    imageUrl:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
    badge: "Official Assembly",
    admissionFee: "Free Admission (Open to registered members & seekers)",
    speakers: [
      {
        id: "sp-assembly-1",
        name: "Elder Solomon Tilahun",
        role: "Advisory Council Chairman",
        affiliation: "AAU ECSF Elders Board",
        avatarUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        bio: "Fellowship elder and former AAU faculty member with deep devotion to student spiritual governance.",
      },
    ],
    schedule: [
      {
        id: "as-1",
        time: "1:30 PM - 2:00 PM",
        title: "Member Check-In & Quorum Verification",
        room: "Hall 102 Foyer",
      },
      {
        id: "as-2",
        time: "2:00 PM - 3:30 PM",
        title: "Ministry Reports & Financial Accountability Overview",
        speaker: "Executive Committee Leads",
        room: "Hall 102",
      },
      {
        id: "as-3",
        time: "3:45 PM - 5:15 PM",
        title: "Presentation of Nominees & Constitutional Votes",
        speaker: "Elder Solomon Tilahun",
        room: "Hall 102",
      },
      {
        id: "as-4",
        time: "5:15 PM - 6:00 PM",
        title: "Laying on of Hands & Dedication Prayer",
        speaker: "All Fellowship Elders",
        room: "Hall 102",
      },
    ],
    tags: ["Assembly", "Governance", "Leadership", "Accountability"],
    requirements: [
      "Active fellowship members are encouraged to attend promptly",
      "Please review the emailed annual ministry report summary prior to arrival",
    ],
    highlights: [
      "Presentation of transparent ministry & giving financials",
      "Official handover to newly elected student leaders",
      "Open Q&A floor for students and team members",
    ],
    createdAt: "2026-10-20T14:00:00.000Z",
    updatedAt: "2026-11-05T09:00:00.000Z",
  },
  {
    id: "retreat-entoto-2026",
    _id: "retreat-entoto-2026",
    slug: "mount-entoto-prayer-retreat-deep-waters",
    title: "Mount Entoto Spiritual Retreat: 'Deep Waters' (Ezekiel 47)",
    category: "retreat",
    categoryLabel: "Spiritual Retreat",
    team: "Prayer & Intercession",
    shortDescription:
      "A 24-hour spiritual retreat away from campus noise on Mount Entoto. Focused on deep personal prayer, spiritual consecration, and communal intercession for university revival.",
    fullDescription:
      "Leave behind the academic pressures of lab reports, tests, and campus bustle for a day in God's presence. Nestled in the serene eucalyptus heights of Mount Entoto, this retreat provides space for personal silence, guided scriptural meditations, corporate dawn warfare prayer, and heartfelt fellowship around the Word.",
    themeVerse:
      "And he said to me, 'Son of man, have you seen this?' Then he led me back to the bank of the river... And it was a river that I could not pass through, for the water had risen. It was deep enough to swim in...",
    themeVerseReference: "Ezekiel 47:5-6",
    startDate: "2026-12-19T06:00:00.000Z",
    endDate: "2026-12-20T14:00:00.000Z",
    location: {
      name: "Entoto Christian Center & Retreat Ground",
      address: "Entoto Mountain Ridge, Addis Ababa",
      room: "Prayer Chapel & Forest Pavilion",
      coordinates: { lat: 9.088, lng: 38.756 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0880,38.7560",
      directions:
        "Chartered fellowship buses depart from 4-Kilo Campus Main Gate on Saturday at 5:30 AM sharp. Return bus arrives Sunday 2:30 PM.",
    },
    registrationLimit: 80,
    registrationsCount: 74,
    isPublished: true,
    isRegistrationOpen: true,
    buttonText: "Register (6 Seats Left)",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    badge: "Almost Full",
    admissionFee: "150 ETB (Covers roundtrip bus transport & meals)",
    speakers: [
      {
        id: "sp-retreat-1",
        name: "Evangelist Dawit Tadesse",
        role: "Prayer Ministry Coordinator",
        affiliation: "4-Kilo ECSF Intercession Team",
        avatarUrl:
          "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80",
        bio: "Passionate intercessor leading 4-Kilo campus all-night prayers and fasting initiatives for the past 3 years.",
      },
      {
        id: "sp-retreat-2",
        name: "Sister Selamawit Hailu",
        role: "Discipleship Coordinator",
        affiliation: "AAU 4-Kilo Fellowship",
        avatarUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        bio: "Dedicated Bible teacher focusing on quiet time disciplines and spiritual journals for university students.",
      },
    ],
    schedule: [
      {
        id: "ret-1",
        time: "Saturday 5:30 AM",
        title: "Bus Departure from 4-Kilo Campus Gate",
        room: "Campus Main Gate",
      },
      {
        id: "ret-2",
        time: "Saturday 7:00 AM - 9:00 AM",
        title: "Morning Mountain Devotion & Opening Exhortation",
        speaker: "Evangelist Dawit Tadesse",
        room: "Forest Pavilion",
      },
      {
        id: "ret-3",
        time: "Saturday 10:00 AM - 1:00 PM",
        title: "Extended Solitary Quiet Time & Reflection",
        room: "Forest Prayer Trails",
      },
      {
        id: "ret-4",
        time: "Saturday 6:00 PM - 10:30 PM",
        title: "Night of Brokenness, Worship & Intercession",
        speaker: "Intercession Team",
        room: "Retreat Chapel",
      },
      {
        id: "ret-5",
        time: "Sunday 6:00 AM - 12:00 PM",
        title: "Dawn Prayer, Communion & Testimonies",
        room: "Retreat Chapel",
      },
    ],
    tags: ["Retreat", "Prayer", "Fasting", "Entoto", "Intercession"],
    requirements: [
      "Warm clothing and jacket (Entoto nights are cold)",
      "Physical Bible, notebook, pen, and personal prayer journal",
      "Modest outdoor walking shoes for mountain trails",
    ],
    highlights: [
      "Transportation included from campus gate and back",
      "Nutritious fellowship meals provided at the retreat hall",
      "Guided solitary prayer walks in scenic eucalyptus trails",
    ],
    createdAt: "2026-10-22T08:00:00.000Z",
    updatedAt: "2026-11-06T11:00:00.000Z",
  },
  {
    id: "seminar-science-2026",
    _id: "seminar-science-2026",
    slug: "faith-science-and-university-seminar",
    title: "Faith, Science & University: Academic Excellence with a Christian Worldview",
    category: "seminar",
    categoryLabel: "Academic Seminar",
    team: "Discipleship & Bible Study",
    shortDescription:
      "A high-impact academic seminar exploring how Christian faith invigorates scientific inquiry, research integrity, and intellectual pursuit in university departments.",
    fullDescription:
      "Too often university students are told that faith and empirical science are fundamentally at war. In this focused seminar, Christian faculty professors and graduate researchers demonstrate that true science is the uncovering of God's majestic order. Learn practical frameworks for honoring God in your thesis, dealing with ideological skepticism in lectures, and excelling academically without compromising your spiritual integrity.",
    themeVerse:
      "The works of the Lord are great, studied by all who have pleasure in them. Full of splendor and majesty is his work, and his righteousness endures forever.",
    themeVerseReference: "Psalm 111:2-3 (ESV)",
    startDate: "2026-11-21T12:30:00.000Z",
    endDate: "2026-11-21T16:00:00.000Z",
    location: {
      name: "Department of Physics Lecture Theatre 4",
      address: "AAU Arat Kilo Science Complex",
      room: "Lecture Theatre 4 (Level 2)",
      coordinates: { lat: 9.0358, lng: 38.7619 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0358,38.7619",
      directions: "Physics building, 2nd floor, opposite the laboratory corridor.",
    },
    registrationLimit: 120,
    registrationsCount: 94,
    isPublished: true,
    isRegistrationOpen: true,
    buttonText: "Reserve Free Pass",
    imageUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    badge: "Popular Seminar",
    admissionFee: "Free Admission (Includes printed seminar handbook)",
    speakers: [
      {
        id: "sp-sem-1",
        name: "Prof. Bekele Hundessa",
        role: "Professor of Applied Physics",
        affiliation: "AAU College of Natural and Computational Sciences",
        avatarUrl:
          "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80",
        bio: "Senior researcher with 25+ published scientific papers and long-time mentor to Christian students in the physical sciences.",
      },
      {
        id: "sp-sem-2",
        name: "Dr. Meron Getachew",
        role: "Biochemistry Lecturer & Bioethics Fellow",
        affiliation: "AAU Department of Microbial, Cellular and Molecular Biology",
        avatarUrl:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
        bio: "Educating undergraduate and masters researchers on ethical conduct and God's fingerprint in molecular design.",
      },
    ],
    schedule: [
      {
        id: "sem-1",
        time: "12:30 PM - 1:00 PM",
        title: "Registration & Handbook Pickup",
        room: "Physics Theatre 4 Foyer",
      },
      {
        id: "sem-2",
        time: "1:00 PM - 2:15 PM",
        title: "Plenary 1: 'Can an Intelligent Student Believe in God?'",
        speaker: "Prof. Bekele Hundessa",
        room: "Theatre 4",
      },
      {
        id: "sem-3",
        time: "2:30 PM - 3:30 PM",
        title: "Plenary 2: 'Research Ethics, AI & the Christian Mind'",
        speaker: "Dr. Meron Getachew",
        room: "Theatre 4",
      },
      {
        id: "sem-4",
        time: "3:30 PM - 4:00 PM",
        title: "Interactive Open Mic & Q&A Panel",
        speaker: "All Faculty Panelists",
        room: "Theatre 4",
      },
    ],
    tags: ["Seminar", "Science", "Academics", "Apologetics", "Campus"],
    requirements: [
      "Open to all students across Science, Technology, and Humanities",
      "Q&A slips can be submitted anonymously or via digital form during sessions",
    ],
    highlights: [
      "Printed 32-page seminar syllabus on Faith & Science provided",
      "Network with Christian professors and researchers across faculties",
      "Free coffee break and networking time",
    ],
    createdAt: "2026-10-25T11:00:00.000Z",
    updatedAt: "2026-11-04T15:00:00.000Z",
  },
  {
    id: "worship-night-nov-2026",
    _id: "worship-night-nov-2026",
    slug: "night-of-awakening-and-praise",
    title: "Praise & Worship Night of Awakening: 'Atmosphere of Grace'",
    category: "worship",
    categoryLabel: "Praise & Worship Night",
    team: "Worship & Arts",
    shortDescription:
      "An unhurried evening of acoustic praise, corporate adoration, prophetic scripture reading, and deep intimacy in God's presence at the Campus Chapel Ground.",
    fullDescription:
      "Join the 4-Kilo Fellowship Choir and student worship bands for an atmosphere of intense worship. In the midst of stressful semester timelines, come pour your heart out to the Lord Jesus. We will sing ancient hymns of the faith alongside contemporary Ethiopian worship compositions, lifting a unified sound that shakes campus dormitories.",
    themeVerse:
      "God is spirit, and those who worship him must worship in spirit and truth.",
    themeVerseReference: "John 4:24 (ESV)",
    startDate: "2026-11-20T14:30:00.000Z",
    endDate: "2026-11-20T17:45:00.000Z",
    location: {
      name: "AAU Arat Kilo Campus Chapel Lawn & Pavilion",
      address: "AAU Arat Kilo Campus",
      room: "Fellowship Chapel Open Ground",
      coordinates: { lat: 9.0352, lng: 38.7615 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0352,38.7615",
      directions: "Behind the student union library, lawn adjacent to the chapel.",
    },
    registrationLimit: 300,
    registrationsCount: 220,
    isPublished: true,
    isRegistrationOpen: true,
    buttonText: "Join Worship Night",
    imageUrl:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    badge: "Special Evening",
    admissionFee: "Free Admission (Everyone is welcome)",
    speakers: [
      {
        id: "sp-worship-1",
        name: "Bro. Yohannes Bekele",
        role: "Worship Ministry Leader",
        affiliation: "4-Kilo Fellowship Choir",
        avatarUrl:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
        bio: "Leading congregational worship and campus worship songwriting for four years.",
      },
    ],
    schedule: [
      {
        id: "wn-1",
        time: "5:30 PM - 6:00 PM",
        title: "Acoustic Welcome & Opening Prayer",
        room: "Chapel Lawn",
      },
      {
        id: "wn-2",
        time: "6:00 PM - 7:30 PM",
        title: "Non-stop Praise & Congregational Worship",
        speaker: "4-Kilo Choir & Instrumentalists",
        room: "Chapel Lawn",
      },
      {
        id: "wn-3",
        time: "7:30 PM - 8:15 PM",
        title: "Scripture Meditation & Ministry of the Holy Spirit",
        speaker: "Bro. Yohannes Bekele",
        room: "Chapel Lawn",
      },
    ],
    tags: ["Worship", "Praise", "Night", "Awakening", "Choir"],
    requirements: [
      "Come with a heart open and expectant for God's touch",
      "Feel free to invite dorm mates and campus friends",
    ],
    highlights: [
      "Original worship songs in Amharic and English",
      "Candlelit acoustic worship atmosphere",
      "Personal ministry and prayer team on site",
    ],
    createdAt: "2026-10-28T16:00:00.000Z",
    updatedAt: "2026-11-08T09:00:00.000Z",
  },
  {
    id: "seminar-evangelism-2026",
    _id: "seminar-evangelism-2026",
    slug: "campus-evangelism-apologetics-workshop",
    title: "Campus Evangelism & Personal Apologetics Workshop",
    category: "seminar",
    categoryLabel: "Ministry Workshop",
    team: "Evangelism & Outreach",
    shortDescription:
      "Equipping university believers with practical tools, relational wisdom, and biblical answers to share Christ boldly across campus cafeterias and student dorms.",
    fullDescription:
      "How do we represent Christ winsomely to friends who are indifferent, skeptical, or antagonistic? This workshop provides hands-on roleplaying, apologetic guidelines, and spiritual preparation for door-to-door dorm visitation, campus tract distribution, and one-on-one friendship evangelism.",
    themeVerse:
      "Always being prepared to make a defense to anyone who asks you for a reason for the hope that is in you; yet do it with gentleness and respect...",
    themeVerseReference: "1 Peter 3:15 (ESV)",
    startDate: "2026-12-05T06:00:00.000Z",
    endDate: "2026-12-05T10:00:00.000Z",
    location: {
      name: "Department of Mathematics Seminar Hall 201",
      address: "AAU Arat Kilo Campus",
      room: "Room 201 (Second Floor)",
      coordinates: { lat: 9.0356, lng: 38.7622 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0356,38.7622",
      directions: "Math block, stairs near the courtyard, second floor right.",
    },
    registrationLimit: 90,
    registrationsCount: 52,
    isPublished: true,
    isRegistrationOpen: true,
    buttonText: "Register for Workshop",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    badge: "Hands-on Workshop",
    admissionFee: "Free Admission (Outreach tracts provided)",
    speakers: [
      {
        id: "sp-ev-1",
        name: "Bro. Caleb Mengistu",
        role: "Evangelism Coordinator",
        affiliation: "4-Kilo ECSF Outreach Department",
        avatarUrl:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
        bio: "3rd-year Biology major who coordinates weekly dorm outreaches and hospital visitation ministry.",
      },
    ],
    schedule: [
      {
        id: "ev-1",
        time: "9:00 AM - 10:00 AM",
        title: "The Heart of the Gospel & Overcoming Fear",
        speaker: "Bro. Caleb Mengistu",
        room: "Room 201",
      },
      {
        id: "ev-2",
        time: "10:15 AM - 11:30 AM",
        title: "Apologetics 101: Answering Common Student Objections",
        speaker: "Guest Apologist",
        room: "Room 201",
      },
      {
        id: "ev-3",
        time: "11:45 AM - 1:00 PM",
        title: "Paired Practice & Campus Outreach Commissioning",
        room: "Courtyard & Room 201",
      },
    ],
    tags: ["Evangelism", "Apologetics", "Outreach", "Workshop", "Mission"],
    requirements: [
      "Desire to learn how to share the Gospel with clarity and love",
      "Bring comfortable walking shoes for optional practical outreach walk",
    ],
    highlights: [
      "100+ evangelistic tracts in Amharic, Oromo, and English provided",
      "Role-playing conversational scenarios with experienced student mentors",
    ],
    createdAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-11-07T12:00:00.000Z",
  },
  // Past Events for archive filter testing
  {
    id: "conf-freshman-2026-past",
    _id: "conf-freshman-2026-past",
    slug: "freshman-welcome-orientation-summit-past",
    title: "Freshman Fellowship Welcome & Campus Orientation Summit 2026",
    category: "conference",
    categoryLabel: "Freshman Summit",
    team: "Freshman Ministry",
    shortDescription:
      "A grand fellowship welcome summit designed to embrace new university freshmen, connect them with Christian dorm seniors, and build solid foundations for campus life.",
    fullDescription:
      "Every year hundreds of young believers leave home and arrive at AAU 4-Kilo Campus for the first time. The Freshman Welcome Summit ensures no freshman walks alone. With guidance from seasoned senior fellowship leaders, freshmen learned how to balance demanding university academics, stay spiritually vibrant, find their local fellowship family, and avoid destructive campus pitfalls.",
    themeVerse:
      "How can a young person stay on the path of purity? By living according to your word.",
    themeVerseReference: "Psalm 119:9 (NIV)",
    startDate: "2026-10-10T06:00:00.000Z",
    endDate: "2026-10-11T14:00:00.000Z",
    location: {
      name: "AAU 4-Kilo Grand Amphitheater",
      address: "King George VI Street, Addis Ababa",
      room: "Amphitheater A",
      coordinates: { lat: 9.0354, lng: 38.7618 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9.0354,38.7618",
    },
    registrationLimit: 250,
    registrationsCount: 250,
    isPublished: true,
    isRegistrationOpen: false,
    buttonText: "Event Completed",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    badge: "Past Event",
    admissionFee: "Free Admission",
    speakers: [
      {
        id: "sp-past-1",
        name: "Senior Mentors Panel",
        role: "Graduating Fellowship Seniors",
        affiliation: "4-Kilo ECSF Mentorship Team",
        avatarUrl:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80",
        bio: "Senior students across Computer Science, Electrical Engineering, and Physics departments sharing survival testimonies.",
      },
    ],
    schedule: [
      {
        id: "pf-1",
        time: "Saturday 9:00 AM - 1:00 PM",
        title: "Welcome Address & Senior-Freshman Pairing",
        room: "Amphitheater A",
      },
      {
        id: "pf-2",
        time: "Sunday 2:00 PM - 5:00 PM",
        title: "Dorm Life Wisdom & Fellowship Induction",
        room: "Amphitheater A",
      },
    ],
    tags: ["Freshman", "Orientation", "Mentorship", "Foundations"],
    highlights: [
      "Over 250 first-year students successfully registered and paired with seniors",
      "Free university survival kits distributed",
    ],
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-10-12T16:00:00.000Z",
  },
  {
    id: "retreat-graduates-past",
    _id: "retreat-graduates-past",
    slug: "graduating-class-discipleship-commissioning",
    title: "Graduating Class Discipleship & Marketplace Commissioning Retreat",
    category: "retreat",
    categoryLabel: "Commissioning Retreat",
    team: "Discipleship & Bible Study",
    shortDescription:
      "Commissioning final-year university students into marketplace ministry, corporate integrity, and kingdom impact as they graduate into society.",
    fullDescription:
      "A landmark weekend where graduating seniors from all science departments came together for commissioning, career ethics seminars, and dedication prayers as they step out of university halls into professional life.",
    themeVerse:
      "Whatever you do, work heartily, as for the Lord and not for men, knowing that from the Lord you will receive the inheritance as your reward.",
    themeVerseReference: "Colossians 3:23-24 (ESV)",
    startDate: "2026-09-18T05:00:00.000Z",
    endDate: "2026-09-19T13:00:00.000Z",
    location: {
      name: "Bishoftu Fellowship Retreat Grounds",
      address: "Bishoftu, Oromia",
      room: "Lakeside Conference Pavilion",
      coordinates: { lat: 8.752, lng: 38.988 },
      mapUrl: "https://www.google.com/maps/search/?api=1&query=8.7520,38.9880",
    },
    registrationLimit: 75,
    registrationsCount: 75,
    isPublished: true,
    isRegistrationOpen: false,
    buttonText: "Event Completed",
    imageUrl:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80",
    badge: "Past Event",
    admissionFee: "200 ETB",
    speakers: [],
    schedule: [],
    tags: ["Graduation", "Commissioning", "Marketplace", "Retreat"],
    highlights: ["75 graduating seniors anointed and commissioned into the marketplace"],
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-09-20T12:00:00.000Z",
  },
];

// In-memory registrations store for instant responsiveness & mock data
export const IN_MEMORY_REGISTRATIONS: RegistrationTicket[] = [
  {
    ticketNumber: "ECSF-CONF-8821",
    registrationId: "reg-1",
    eventId: "conf-annual-2026",
    eventTitle: "Annual Fellowship General Conference 2026: 'Rooted and Built Up'",
    startDate: "2026-11-27T08:30:00.000Z",
    endDate: "2026-11-29T18:00:00.000Z",
    locationName: "AAU Arat Kilo Campus - Main Science Grand Amphitheater",
    room: "Amphitheater A",
    fullName: "Bereket Tsegaye",
    phoneNumber: "+251911223344",
    teamOrDepartment: "Computer Science - 3rd Year",
    registeredAt: "2026-11-02T14:30:00.000Z",
    status: "confirmed",
    qrCodeValue: "ECSF-REG:conf-annual-2026:reg-1",
    checkInCode: "CONF-8821",
  },
];

export function getEvents(): FellowshipEvent[] {
  return INITIAL_EVENTS;
}

export function getEventById(id: string): FellowshipEvent | undefined {
  return INITIAL_EVENTS.find(
    (e) => e.id === id || e._id === id || e.slug === id
  );
}

export function isEventUpcoming(eventDateStr: string): boolean {
  const eventDate = new Date(eventDateStr);
  const now = new Date();
  return eventDate.getTime() >= now.getTime();
}

export function isEventPast(eventEndDateStr: string): boolean {
  const eventEndDate = new Date(eventEndDateStr);
  const now = new Date();
  return eventEndDate.getTime() < now.getTime();
}
