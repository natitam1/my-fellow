// Centralized realistic mock data for 4 Kilo Christian Students Fellowship (AAU ECSF)
// Used when backend database is empty or during local development & testing.

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: "admin" | "leader" | "member" | "devotion_writer";
  status: "active" | "inactive" | "pending";
  department: string;
  year: string;
  ministryTeam: string;
  createdAt: string;
  avatarUrl?: string;
  grants?: string[];
}

export interface MockDevotion {
  _id: string;
  title: string;
  scripture: string;
  verseText: string;
  content: string;
  prayer: string;
  author: {
    _id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  date: string;
  tags: string[];
  likesCount: number;
  bookmarksCount: number;
  status: "published" | "draft" | "scheduled";
}

export interface MockEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  category: "worship" | "conference" | "prayer" | "outreach" | "training";
  speaker?: string;
  registeredCount: number;
  maxAttendees?: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  bannerUrl: string;
}

export interface MockTeam {
  _id: string;
  name: string;
  description: string;
  leader: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  memberCount: number;
  meetingTime: string;
  meetingLocation: string;
  isOpenForJoin: boolean;
  iconName: string;
}

export interface MockLeader {
  _id: string;
  name: string;
  role: string;
  term: string;
  department: string;
  phoneNumber: string;
  email: string;
  imageUrl: string;
  bio: string;
  isCurrent: boolean;
}

export interface MockProduct {
  _id: string;
  name: string;
  category: "apparel" | "books" | "accessories" | "stationery";
  price: number;
  description: string;
  inStock: boolean;
  stockQuantity: number;
  imageUrl: string;
  sizes?: string[];
  colors?: string[];
}

export interface MockOrder {
  _id: string;
  customerName: string;
  phoneNumber: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: "chapa" | "telebirr" | "cbe_birr" | "cash_on_pickup";
  paymentStatus: "paid" | "pending" | "failed";
  status: "completed" | "processing" | "ready_for_pickup" | "cancelled";
  txRef: string;
  createdAt: string;
}

export interface MockProgram {
  _id: string;
  title: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string;
  endTime: string;
  location: string;
  targetAudience: string;
  description: string;
  isActive: boolean;
}

export interface MockLocation {
  _id: string;
  name: string;
  type: "hall" | "prayer_room" | "office" | "field";
  building: string;
  roomNumber: string;
  capacity: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  isAvailable: boolean;
}

export interface MockJoinRequest {
  _id: string;
  userName: string;
  fullName?: string;
  phoneNumber: string;
  department: string;
  year: string;
  teamId: string;
  teamName: string;
  reason: string;
  experience?: string;
  message?: string;
  telegramHandle?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// ---------------- Seed Data ----------------

export const MOCK_USERS: MockUser[] = [
  {
    _id: "usr-01",
    name: "Yohannes Bekele",
    email: "yohannes.bekele@aau.edu.et",
    phoneNumber: "+251911234567",
    role: "admin",
    status: "active",
    department: "Software Engineering",
    year: "5th Year",
    ministryTeam: "Media & Technical",
    createdAt: "2024-09-15T08:00:00Z",
    grants: ["users.manage", "events.manage", "teams.manage", "devotions.manage"],
  },
  {
    _id: "usr-02",
    name: "Selamawit Tadesse",
    email: "selamawit.t@aau.edu.et",
    phoneNumber: "+251922345678",
    role: "leader",
    status: "active",
    department: "Computer Science",
    year: "4th Year",
    ministryTeam: "Choir & Worship",
    createdAt: "2024-10-01T09:30:00Z",
    grants: ["teams.manage", "events.manage"],
  },
  {
    _id: "usr-03",
    name: "Ephrem Hailu",
    email: "ephrem.h@aau.edu.et",
    phoneNumber: "+251933456789",
    role: "devotion_writer",
    status: "active",
    department: "Electrical Engineering",
    year: "4th Year",
    ministryTeam: "Prayer & Intercession",
    createdAt: "2024-10-12T11:00:00Z",
    grants: ["devotions.manage"],
  },
  {
    _id: "usr-04",
    name: "Bethelhem Assefa",
    email: "bethelhem.a@aau.edu.et",
    phoneNumber: "+251944567890",
    role: "member",
    status: "active",
    department: "Architecture",
    year: "3rd Year",
    ministryTeam: "Charity & Social",
    createdAt: "2024-11-05T14:20:00Z",
  },
  {
    _id: "usr-05",
    name: "Natnael Desta",
    email: "natnael.d@aau.edu.et",
    phoneNumber: "+251955678901",
    role: "member",
    status: "active",
    department: "Civil Engineering",
    year: "2nd Year",
    ministryTeam: "Evangelical & Outreach",
    createdAt: "2025-01-10T16:45:00Z",
  },
  {
    _id: "usr-06",
    name: "Kalkidan Girma",
    email: "kalkidan.g@aau.edu.et",
    phoneNumber: "+251966789012",
    role: "member",
    status: "pending",
    department: "Biomedical Engineering",
    year: "1st Year",
    ministryTeam: "Choir & Worship",
    createdAt: "2025-02-01T10:15:00Z",
  },
];

export const MOCK_DEVOTIONS: MockDevotion[] = [
  {
    _id: "dev-01",
    title: "Rooted in Faith Amid Academic Seasons",
    scripture: "Colossians 2:6-7",
    verseText:
      "Therefore, as you received Christ Jesus the Lord, so walk in him, rooted and built up in him and established in the faith, just as you were taught, abounding in thanksgiving.",
    content:
      "University life at 4 Kilo presents demanding deadlines, intensive lab projects, and exam seasons that test our resilience. Yet the Apostle Paul reminds us that our primary foundation is not our academic performance, but our deep spiritual rootedness in Christ Jesus. When pressures mount, take fifteen quiet minutes every morning to align your heart with His promises.",
    prayer:
      "Lord Jesus, strengthen my heart as I pursue my academic studies. Keep me anchored in Your truth, protect my thoughts from anxiety, and let my conduct on campus reflect Your unfailing love. Amen.",
    author: {
      _id: "usr-03",
      name: "Ephrem Hailu",
      role: "Devotional Ministry Lead",
    },
    date: new Date().toISOString().split("T")[0],
    tags: ["Faith", "Exams", "Encouragement", "Campus Life"],
    likesCount: 142,
    bookmarksCount: 68,
    status: "published",
  },
  {
    _id: "dev-02",
    title: "Light on the Hill: Fellowship in Truth",
    scripture: "Matthew 5:14-16",
    verseText:
      "You are the light of the world. A city set on a hill cannot be hidden. Nor do people light a lamp and put it under a basket, but on a stand, and it gives light to all in the house.",
    content:
      "As Christian students at Addis Ababa University, we are strategically placed to demonstrate integrity, compassion, and unwavering faith. When others cut corners or succumb to discouragement, let your speech and dedication stand as a testament of God's grace.",
    prayer:
      "Heavenly Father, grant us courage to shine Your light across our campus dorms, classrooms, and cafeteria tables. Let our actions bring glory to Your name today. Amen.",
    author: {
      _id: "usr-02",
      name: "Selamawit Tadesse",
      role: "Spiritual Growth Team",
    },
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    tags: ["Integrity", "Witness", "Campus Mission"],
    likesCount: 98,
    bookmarksCount: 45,
    status: "published",
  },
  {
    _id: "dev-03",
    title: "The Quiet Place of Intercession",
    scripture: "Philippians 4:6-7",
    verseText:
      "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
    content:
      "No burden is too heavy when brought before the Lord in earnest prayer. Our fellowship prayer rooms remain a quiet sanctuary where students gather daily to seek God's guidance and support one another in intercession.",
    prayer:
      "Father, teach us to cast all our burdens upon You, knowing that Your peace surpasses all human understanding. Protect every student who is struggling in silence today. Amen.",
    author: {
      _id: "usr-03",
      name: "Ephrem Hailu",
      role: "Devotional Ministry Lead",
    },
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    tags: ["Prayer", "Peace", "Mental Health"],
    likesCount: 185,
    bookmarksCount: 89,
    status: "published",
  },
  {
    _id: "dev-04",
    title: "Walking in Wisdom on Campus",
    scripture: "James 1:5",
    verseText:
      "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.",
    content:
      "Every semester at Addis Ababa University presents defining choices—navigating difficult coursework, choosing uplifting peer associations, and balancing spiritual priorities with academic excellence. Scripture reminds us that wisdom is not merely intellect, but a gift generously supplied when we ask in earnest faith.",
    prayer:
      "Lord God of all wisdom, grant me spiritual discernment in my daily university schedule. Guide my thoughts, decisions, and speech so that my life bears witness to Your truth. Amen.",
    author: {
      _id: "usr-01",
      name: "Abel Tesfaye",
      role: "Fellowship President",
    },
    date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    tags: ["Wisdom", "Guidance", "Campus Life"],
    likesCount: 34,
    bookmarksCount: 12,
    status: "draft",
  },
  {
    _id: "dev-05",
    title: "Steadfast in Times of Examination",
    scripture: "Isaiah 41:10",
    verseText:
      "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
    content:
      "When exam weeks approach at AAU, dorm rooms fill with late-night study sessions and hearts wrestle with anxiety. The prophet Isaiah conveys God's personal reassurance: we do not walk into exam halls alone. The Creator of the universe walks beside us, infusing our minds with calm understanding and endurance.",
    prayer:
      "Heavenly Father, quiet my racing heart during exams. Replace anxiety with Your peace that surpasses all understanding, and help me glorify You through diligent study. Amen.",
    author: {
      _id: "usr-03",
      name: "Ephrem Hailu",
      role: "Devotional Ministry Lead",
    },
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    tags: ["Exams", "Peace", "Encouragement"],
    likesCount: 0,
    bookmarksCount: 0,
    status: "scheduled",
  },
];

export const MOCK_EVENTS: MockEvent[] = [
  {
    _id: "evt-01",
    title: "Annual Campus Revival & Freshmen Welcome",
    description:
      "Our flagship semester gathering welcoming all first-year students to the 4 Kilo fellowship family. An evening of inspiring worship, word of God, and student community.",
    date: "2026-11-28",
    time: "5:30 PM - 8:30 PM",
    location: "4 Kilo Main Fellowship Hall (Alumni Hall)",
    category: "worship",
    speaker: "Pastor Dawit Kebede",
    registeredCount: 430,
    maxAttendees: 600,
    status: "upcoming",
    bannerUrl: "/images/event-welcome.jpg",
  },
  {
    _id: "evt-02",
    title: "Weekly Friday Evening Fellowship",
    description:
      "Weekly community gathering for all campus faculties. Praise, student testimonies, scripture reflection, and fellowship tea.",
    date: "2026-11-20",
    time: "5:00 PM - 7:30 PM",
    location: "Block 21, Amphitheater 3",
    category: "worship",
    registeredCount: 290,
    maxAttendees: 350,
    status: "upcoming",
    bannerUrl: "/images/event-friday.jpg",
  },
  {
    _id: "evt-03",
    title: "All-Night Campus Prayer & Fasting Vigil",
    description:
      "A dedicated night of intercessory prayer for our country, our university faculty, upcoming exams, and national peace.",
    date: "2026-12-05",
    time: "10:00 PM - 5:30 AM",
    location: "Upper Prayer Hall",
    category: "prayer",
    registeredCount: 180,
    maxAttendees: 250,
    status: "upcoming",
    bannerUrl: "/images/event-prayer.jpg",
  },
  {
    _id: "evt-04",
    title: "Leadership & Integrity Workshop for Finalists",
    description:
      "Practical transition training for graduating seniors: Christian work ethics, marketplace readiness, and community leadership.",
    date: "2026-12-12",
    time: "2:00 PM - 5:00 PM",
    location: "Conference Room B",
    category: "training",
    speaker: "Dr. Aster Melaku (AAU Faculty)",
    registeredCount: 95,
    maxAttendees: 120,
    status: "upcoming",
    bannerUrl: "/images/event-leadership.jpg",
  },
  {
    _id: "evt-05",
    title: "National ECSF Student Leadership Conference",
    description:
      "Tri-annual gathering uniting Christian fellowship student leaders from universities across Ethiopia for gospel vision, strategic campus ministry, and peer mentorship.",
    date: "2026-12-18",
    endDate: "2026-12-20",
    time: "8:30 AM - 5:30 PM",
    location: "Sidist Kilo Campus & Alumni Hall",
    category: "conference",
    speaker: "Evangelist Daniel Mekonnen & Guest Speakers",
    registeredCount: 540,
    maxAttendees: 600,
    status: "upcoming",
    bannerUrl: "/images/event-conference.jpg",
  },
  {
    _id: "evt-06",
    title: "Campus Dorm Outreach & Hospital Ministry",
    description:
      "Charity and hospital visitation ministry sharing hope, warm tea, care packages, and bedside prayers with patients at Tikur Anbessa (Black Lion) Hospital and fellow students.",
    date: "2026-12-26",
    time: "1:30 PM - 6:00 PM",
    location: "4 Kilo Gate 2 Meeting Point & Tikur Anbessa Hospital",
    category: "outreach",
    registeredCount: 78,
    maxAttendees: 100,
    status: "upcoming",
    bannerUrl: "/images/event-outreach.jpg",
  },
];

export const MOCK_TEAMS: MockTeam[] = [
  {
    _id: "tm-01",
    name: "Choir & Worship Ministry",
    description:
      "Leads congregational praise, vocal training, instrumental orchestration, and worship night services.",
    leader: {
      _id: "usr-02",
      name: "Selamawit Tadesse",
      email: "selamawit.t@aau.edu.et",
      phoneNumber: "+251922345678",
    },
    memberCount: 48,
    meetingTime: "Tuesdays & Thursdays, 5:30 PM",
    meetingLocation: "Block 21 Hall",
    isOpenForJoin: true,
    iconName: "Music",
  },
  {
    _id: "tm-02",
    name: "Prayer & Intercession",
    description:
      "Maintains the daily 24/7 prayer chain, coordinates fasting vigils, and stands in prayer for student needs.",
    leader: {
      _id: "usr-03",
      name: "Ephrem Hailu",
      email: "ephrem.h@aau.edu.et",
      phoneNumber: "+251933456789",
    },
    memberCount: 36,
    meetingTime: "Mondays & Wednesdays, 6:00 PM",
    meetingLocation: "Upper Prayer Room",
    isOpenForJoin: true,
    iconName: "Flame",
  },
  {
    _id: "tm-03",
    name: "Media, Sound & Tech Team",
    description:
      "Oversees audio engineering, livestreaming, mobile app maintenance, social media broadcasts, and slide projection.",
    leader: {
      _id: "usr-01",
      name: "Yohannes Bekele",
      email: "yohannes.bekele@aau.edu.et",
      phoneNumber: "+251911234567",
    },
    memberCount: 22,
    meetingTime: "Wednesdays, 5:00 PM",
    meetingLocation: "Tech Desk, Main Hall",
    isOpenForJoin: true,
    iconName: "Video",
  },
  {
    _id: "tm-04",
    name: "Charity & Social Outreach",
    description:
      "Supports students facing financial hardship with meal coupons, academic stationery, hospital visits, and clothes drives.",
    leader: {
      _id: "usr-04",
      name: "Bethelhem Assefa",
      email: "bethelhem.a@aau.edu.et",
      phoneNumber: "+251944567890",
    },
    memberCount: 31,
    meetingTime: "Saturdays, 10:00 AM",
    meetingLocation: "Fellowship Office",
    isOpenForJoin: true,
    iconName: "HeartHandshake",
  },
  {
    _id: "tm-05",
    name: "Evangelical & Freshmen Ministry",
    description:
      "Welcomes new students to AAU 4 Kilo campus, organizes Bible study groups in dormitories, and shares the gospel.",
    leader: {
      _id: "usr-05",
      name: "Natnael Desta",
      email: "natnael.d@aau.edu.et",
      phoneNumber: "+251955678901",
    },
    memberCount: 40,
    meetingTime: "Fridays, 4:00 PM",
    meetingLocation: "Lawn near Library",
    isOpenForJoin: true,
    iconName: "Compass",
  },
];

export const MOCK_LEADERS: MockLeader[] = [
  {
    _id: "ldr-01",
    name: "Biruk Mengistu",
    role: "President / Main Leader",
    term: "2025/2026 Academic Year",
    department: "Electrical & Computer Engineering",
    phoneNumber: "+251911122233",
    email: "biruk.m@aau.edu.et",
    imageUrl: "/images/leaders/leader-1.jpg",
    bio: "Passionate about empowering Christian students in higher education and fostering genuine fellowship across faculties.",
    isCurrent: true,
  },
  {
    _id: "ldr-02",
    name: "Hanna Daniel",
    role: "Vice President & Spiritual Coordinator",
    term: "2025/2026 Academic Year",
    department: "Civil Engineering",
    phoneNumber: "+251922233344",
    email: "hanna.d@aau.edu.et",
    imageUrl: "/images/leaders/leader-2.jpg",
    bio: "Dedicated to student discipleship, dormitory prayer cells, and academic excellence rooted in Christ.",
    isCurrent: true,
  },
  {
    _id: "ldr-03",
    name: "Daniel Solomon",
    role: "General Secretary & Operations",
    term: "2025/2026 Academic Year",
    department: "Architecture",
    phoneNumber: "+251933344455",
    email: "daniel.s@aau.edu.et",
    imageUrl: "/images/leaders/leader-3.jpg",
    bio: "Coordinates event logistics, team communication, and university administration liaison.",
    isCurrent: true,
  },
  {
    _id: "ldr-04",
    name: "Ruth Tadesse",
    role: "Finance & Welfare Coordinator",
    term: "2025/2026 Academic Year",
    department: "Accounting & Finance",
    phoneNumber: "+251944556677",
    email: "ruth.t@aau.edu.et",
    imageUrl: "/images/leaders/leader-4.jpg",
    bio: "Oversees student welfare subsidies, fellowship accounting integrity, and brotherly support funds.",
    isCurrent: true,
  },
  {
    _id: "ldr-05",
    name: "Natnael Kebede",
    role: "Prayer & Intercession Director",
    term: "2025/2026 Academic Year",
    department: "Mechanical Engineering",
    phoneNumber: "+251955667788",
    email: "natnael.k@aau.edu.et",
    imageUrl: "/images/leaders/leader-5.jpg",
    bio: "Passionate about 24-hour campus prayer chains, morning glory gatherings, and revival vigils.",
    isCurrent: true,
  },
  {
    _id: "ldr-06",
    name: "Mikiyas Girma",
    role: "Former President / Advisory Elder",
    term: "2024/2025 Academic Year",
    department: "Software Engineering",
    phoneNumber: "+251911998877",
    email: "mikiyas.g@aau.edu.et",
    imageUrl: "/images/leaders/leader-6.jpg",
    bio: "Serves on the senior alumni advisory council supporting executive transition and mentoring fresh leaders.",
    isCurrent: false,
  },
  {
    _id: "ldr-07",
    name: "Bethelhem Wondwosen",
    role: "Former Discipleship Lead",
    term: "2023/2024 Academic Year",
    department: "Chemical Engineering",
    phoneNumber: "+251922887766",
    email: "bethelhem.w@aau.edu.et",
    imageUrl: "/images/leaders/leader-7.jpg",
    bio: "Pioneered the freshman cell ministry model and continues to counsel graduation classes.",
    isCurrent: false,
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    _id: "prd-01",
    name: "4 Kilo Fellowship Heritage Hoodie",
    category: "apparel",
    price: 1850,
    description:
      "Heavyweight cotton fleece hoodie with embroidered 4 Kilo Fellowship crest on chest and scripture back print.",
    inStock: true,
    stockQuantity: 42,
    imageUrl: "/images/store/hoodie-black.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Heather Grey", "Navy"],
  },
  {
    _id: "prd-02",
    name: "ECSF Campus Devotional Journal (Hardcover)",
    category: "books",
    price: 450,
    description:
      "180-day guided quiet time journal featuring daily prayer prompts, scripture study margins, and ribbon bookmark.",
    inStock: true,
    stockQuantity: 110,
    imageUrl: "/images/store/journal.jpg",
  },
  {
    _id: "prd-03",
    name: "Fellowship Classic Cross T-Shirt",
    category: "apparel",
    price: 750,
    description:
      "100% organic combed cotton t-shirt with subtle minimalist front logo and 'Light on the Hill' print.",
    inStock: true,
    stockQuantity: 65,
    imageUrl: "/images/store/tshirt-white.jpg",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Charcoal"],
  },
  {
    _id: "prd-04",
    name: "Stainless Steel Campus Water Bottle (750ml)",
    category: "accessories",
    price: 600,
    description:
      "Double-walled vacuum insulated thermal bottle keeping drinks cold for 24h or hot for 12h. Laser engraved logo.",
    inStock: true,
    stockQuantity: 30,
    imageUrl: "/images/store/bottle.jpg",
    colors: ["Matte Black", "Stainless Silver"],
  },
  {
    _id: "prd-05",
    name: "Handcrafted Olive & Honey Ministry Soap",
    category: "accessories",
    price: 160,
    description:
      "Pure organic cold-processed soap made with Ethiopian honey and virgin olive oil. Handcrafted by fellowship charity ministry.",
    inStock: true,
    stockQuantity: 4,
    imageUrl: "/images/store/soap.jpg",
  },
  {
    _id: "prd-06",
    name: "Amharic Fellowship Study Bible (Hardcover)",
    category: "books",
    price: 950,
    description:
      "Standard Amharic reference study edition with cross-references, concordance, and maps for campus discipleship.",
    inStock: false,
    stockQuantity: 0,
    imageUrl: "/images/store/bible.jpg",
  },
];

export const MOCK_ORDERS: MockOrder[] = [
  {
    _id: "ord-01",
    customerName: "Amanuel Tesfaye",
    phoneNumber: "+251912001122",
    items: [
      {
        productId: "prd-01",
        productName: "4 Kilo Fellowship Heritage Hoodie (Size L, Black)",
        quantity: 1,
        price: 1850,
      },
    ],
    totalAmount: 1850,
    paymentMethod: "chapa",
    paymentStatus: "paid",
    status: "completed",
    txRef: "CHP-882910-AAU",
    createdAt: "2026-11-13T14:10:00Z",
  },
  {
    _id: "ord-02",
    customerName: "Mahlet Bekele",
    phoneNumber: "+251923112233",
    items: [
      {
        productId: "prd-02",
        productName: "ECSF Campus Devotional Journal",
        quantity: 2,
        price: 450,
      },
      {
        productId: "prd-03",
        productName: "Fellowship Classic Cross T-Shirt (Size M)",
        quantity: 1,
        price: 750,
      },
    ],
    totalAmount: 1650,
    paymentMethod: "telebirr",
    paymentStatus: "paid",
    status: "ready_for_pickup",
    txRef: "TLB-746291-AAU",
    createdAt: "2026-11-14T08:35:00Z",
  },
  {
    _id: "ord-03",
    customerName: "Henok Tilahun",
    phoneNumber: "+251934223344",
    items: [
      {
        productId: "prd-04",
        productName: "Stainless Steel Campus Water Bottle",
        quantity: 1,
        price: 600,
      },
    ],
    totalAmount: 600,
    paymentMethod: "chapa",
    paymentStatus: "pending",
    status: "processing",
    txRef: "CHP-991823-AAU",
    createdAt: "2026-11-14T09:05:00Z",
  },
  {
    _id: "ord-04",
    customerName: "Bereket Tadesse",
    phoneNumber: "+251911223344",
    items: [
      {
        productId: "prd-06",
        productName: "Amharic Fellowship Study Bible (Hardcover)",
        quantity: 1,
        price: 950,
      },
    ],
    totalAmount: 950,
    paymentMethod: "telebirr",
    paymentStatus: "paid",
    status: "completed",
    txRef: "TLB-653198-AAU",
    createdAt: "2026-11-14T06:15:00Z",
  },
  {
    _id: "ord-05",
    customerName: "Ruth Solomon",
    phoneNumber: "+251944556677",
    items: [
      {
        productId: "prd-03",
        productName: "Fellowship Classic Cross T-Shirt (Size S)",
        quantity: 1,
        price: 750,
      },
      {
        productId: "prd-05",
        productName: "Handcrafted Olive & Honey Ministry Soap",
        quantity: 2,
        price: 160,
      },
    ],
    totalAmount: 1070,
    paymentMethod: "chapa",
    paymentStatus: "paid",
    status: "ready_for_pickup",
    txRef: "CHP-771234-AAU",
    createdAt: "2026-11-14T07:45:00Z",
  },
  {
    _id: "ord-06",
    customerName: "Yared Alemu",
    phoneNumber: "+251955667788",
    items: [
      {
        productId: "prd-04",
        productName: "Stainless Steel Campus Water Bottle",
        quantity: 1,
        price: 600,
      },
    ],
    totalAmount: 600,
    paymentMethod: "telebirr",
    paymentStatus: "pending",
    status: "cancelled",
    txRef: "TLB-128945-AAU",
    createdAt: "2026-11-13T19:20:00Z",
  },
];

export const MOCK_PROGRAMS: MockProgram[] = [
  {
    _id: "prg-01",
    title: "Morning Glory & Campus Intercession",
    dayOfWeek: "Monday",
    startTime: "06:30 AM",
    endTime: "07:30 AM",
    location: "Upper Prayer Hall",
    targetAudience: "All students & faculty",
    description: "Start your academic week with early morning prayer, meditation on Psalms, and mutual encouragement.",
    isActive: true,
  },
  {
    _id: "prg-02",
    title: "Midweek Bible Study & Discipleship",
    dayOfWeek: "Wednesday",
    startTime: "05:30 PM",
    endTime: "07:00 PM",
    location: "Block 21, Room 104",
    targetAudience: "Undergraduate & Graduate students",
    description: "Expository verse-by-verse study currently covering the Book of Ephesians and Christian ethics in campus life.",
    isActive: true,
  },
  {
    _id: "prg-03",
    title: "Main Friday Congregational Fellowship",
    dayOfWeek: "Friday",
    startTime: "05:00 PM",
    endTime: "07:45 PM",
    location: "Main Auditorium (Alumni Hall)",
    targetAudience: "Entire 4 Kilo Fellowship Family",
    description: "Our primary congregational gathering: high praise, word ministrations, student choir presentations, and community tea.",
    isActive: true,
  },
  {
    _id: "prg-04",
    title: "Saturday Mercy & Campus Outreach",
    dayOfWeek: "Saturday",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    location: "Fellowship Office & Campus Gates",
    targetAudience: "Evangelism & Charity Ministry Volunteers",
    description: "Hospital visitation, student welfare support, dorm evangelism, and campus community engagement around Arat Kilo.",
    isActive: true,
  },
  {
    _id: "prg-05",
    title: "Sunday Freshmen Transition & Discipleship Circle",
    dayOfWeek: "Sunday",
    startTime: "04:00 PM",
    endTime: "06:00 PM",
    location: "Block 21 Amphitheater",
    targetAudience: "First-Year Freshmen Students",
    description: "Dedicated small-group discipleship, foundational spiritual growth, academic orientation, and senior peer mentorship.",
    isActive: false,
  },
];

export const MOCK_LOCATIONS: MockLocation[] = [
  {
    _id: "loc-01",
    name: "Alumni Fellowship Hall",
    type: "hall",
    building: "Block 10 (Main Campus)",
    roomNumber: "Hall A",
    capacity: 650,
    coordinates: { lat: 9.0358, lng: 38.7618 },
    description: "Main congregational venue equipped with full acoustic sound system, digital projector, and livestream cameras.",
    isAvailable: true,
  },
  {
    _id: "loc-02",
    name: "Upper Prayer Sanctuary",
    type: "prayer_room",
    building: "Block 21 (Engineering Wing)",
    roomNumber: "Room 302",
    capacity: 60,
    coordinates: { lat: 9.0362, lng: 38.7625 },
    description: "Quiet carpeted room open 24 hours for silent prayer, personal study, and small group intercession.",
    isAvailable: true,
  },
  {
    _id: "loc-03",
    name: "Fellowship Leadership & Welfare Office",
    type: "office",
    building: "Student Services Building",
    roomNumber: "Office 12",
    capacity: 15,
    coordinates: { lat: 9.0352, lng: 38.7611 },
    description: "Office for student counseling, pastoral consultations, charity distribution, and team meetings.",
    isAvailable: true,
  },
  {
    _id: "loc-04",
    name: "Freshmen Discipleship Lecture Hall",
    type: "hall",
    building: "Block 04 (Freshman Wing)",
    roomNumber: "Lecture Hall 101",
    capacity: 220,
    coordinates: { lat: 9.0371, lng: 38.7634 },
    description: "Spacious tiered lecture hall equipped with AV projectors, dedicated to first-year orientation and bible foundations.",
    isAvailable: true,
  },
  {
    _id: "loc-05",
    name: "Morning Intercession Chapel",
    type: "prayer_room",
    building: "Block 15 (Postgraduate Hall)",
    roomNumber: "Basement Room 03",
    capacity: 45,
    coordinates: { lat: 9.0365, lng: 38.7615 },
    description: "Early morning prayer room dedicated for daily 6:30 AM intercession and fasting vigils.",
    isAvailable: false,
  },
  {
    _id: "loc-06",
    name: "Central Quad Lawn & Open Stage",
    type: "field",
    building: "Outdoor Quadrangle",
    roomNumber: "Main Stage Green",
    capacity: 1200,
    coordinates: { lat: 9.0355, lng: 38.7622 },
    description: "Open-air green lawn for annual campus gospel mission, outdoor evangelism concerts, and fellowship picnics.",
    isAvailable: true,
  },
];

export const MOCK_JOIN_REQUESTS: MockJoinRequest[] = [
  {
    _id: "req-01",
    userName: "Abel Teklu",
    phoneNumber: "+251913445566",
    department: "Mechanical Engineering",
    year: "2nd Year",
    teamId: "tm-03",
    teamName: "Media, Sound & Tech Team",
    reason: "I have experience with Yamaha digital sound mixers and video livestreaming from my home church.",
    experience: "3 years sound technician",
    status: "pending",
    createdAt: "2026-11-12T10:15:00Z",
  },
  {
    _id: "req-02",
    userName: "Tsion Kebede",
    phoneNumber: "+251924556677",
    department: "Computer Science",
    year: "3rd Year",
    teamId: "tm-01",
    teamName: "Choir & Worship Ministry",
    reason: "Singing alto for 4 years, desiring to worship with university brothers and sisters.",
    experience: "Youth choir member",
    status: "pending",
    createdAt: "2026-11-13T16:40:00Z",
  },
];

export const MOCK_STATS = {
  totalUsers: 1482,
  activeUsers: 1240,
  activeDevotions: 184,
  totalRegistrations: 620,
  monthlyGivingsETB: 84250,
  givingsGrowthPercentage: 12.4,
  activeTeamsCount: 5,
  pendingJoinRequests: 14,
  recentActivity: [
    { id: "act-1", title: "New devotion published", detail: "Rooted in Faith Amid Academic Seasons", time: "2 hours ago", type: "devotion" },
    { id: "act-2", title: "Event registration milestone", detail: "Annual Revival reached 430 attendees", time: "4 hours ago", type: "event" },
    { id: "act-3", title: "Giving verified", detail: "2,500 ETB verified via Chapa", time: "6 hours ago", type: "payment" },
    { id: "act-4", title: "New team application", detail: "Abel Teklu applied for Media Team", time: "Yesterday", type: "team" },
  ],
  attendanceTrends: [
    { month: "Jun", attendance: 820, givings: 54000 },
    { month: "Jul", attendance: 750, givings: 49000 },
    { month: "Aug", attendance: 600, givings: 42000 },
    { month: "Sep", attendance: 1100, givings: 76000 },
    { month: "Oct", attendance: 1210, givings: 81000 },
    { month: "Nov", attendance: 1240, givings: 84250 },
  ],
};
