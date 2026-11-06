import "dotenv/config";
import mongoose from "mongoose";
import ProgramModel from "../src/models/program.model.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

export const PROGRAMS_SEED_DATA = [
  {
    title: "Monday General Service",
    description:
      "The premier weekly campus-wide gathering for all 4 Kilo Christian students. Join us every Monday evening at Hibret Amba for an uplifting time of heartfelt corporate worship, powerful intercessory prayer, expository Scripture teaching, and warm fellowship across faculties. Whether you are a freshman finding your feet or a graduating senior preparing for the marketplace, Monday Service is the spiritual heartbeat of our campus fellowship where lives are transformed and hearts are aligned with Christ.",
    day: "Monday",
    time: "5:15 PM - 8:00 PM",
    category: "General Fellowship",
    location: "Hibret Amba Kale Heywet Church",
    coordinates: {
      lat: 9.038952,
      lng: 38.758315,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908638/programs/program-monday1.jpg",
    isDeleted: false,
  },
  {
    title: "Daily Morning Prayer",
    description:
      "Start your campus mornings anchored in the presence of God. Our early morning prayer altar at the Anglican Church provides a dedicated sanctuary for student believers to seek the Lord before university lectures begin. We intercede for university students, professors, campus revival, national peace, and personal spiritual breakthrough. Come together with fellow students to stand in the gap, cultivate deep intimacy with the Holy Spirit, and carry divine strength throughout your academic day.",
    day: "Monday - Friday",
    time: "6:30 AM - 7:30 AM",
    category: "Prayer",
    location: "Anglican Church",
    coordinates: {
      lat: 9.033291,
      lng: 38.76878,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908639/programs/program-wed.jpg",
    isDeleted: false,
  },
  {
    title: "Fresh Batch Fellowship",
    description:
      "A vibrant, welcoming weekly gathering specially tailored for first-year undergraduate students at Addis Ababa University (4 Kilo Campus). Transitioning into university life brings unique challenges, academic pressures, and freedom; Fresh Batch is designed to guide freshmen with elder student mentorship, dorm life advice, academic coaching, authentic friendships, and solid foundational discipleship in Christ to ensure every freshman thrives spiritually and academically from day one.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Freshman",
    location: "Anglican Church",
    coordinates: {
      lat: 9.033291,
      lng: 38.76878,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908632/programs/program-fresh.jpg",
    isDeleted: false,
  },
  {
    title: "Worship Team Rehearsal",
    description:
      "The dedicated worship ministry of 4 Kilo Fellowship consisting of vocalists, instrumentalists, and technical worship servants. Weekly rehearsals at Hibret Amba combine vocal harmonizing, musical excellence, sound checks, and deep spiritual consecration. Team members spend time ministering to the Lord in prayer and study of biblical worship before preparing arrangements that usher the campus student body into God's presence during general gatherings.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Ministry",
    location: "Hibret Amba Kale Heywet Church",
    coordinates: {
      lat: 9.038952,
      lng: 38.758315,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908642/programs/program-wer.jpg",
    isDeleted: false,
  },
  {
    title: "Bible & Manuscript Study",
    description:
      "Equipping student believers to handle the Word of God with theological rigor and practical obedience (2 Timothy 2:15). Gathering weekly at 6 Kilo Church, the Bible Study Team leads inductive chapter-by-chapter scriptural analysis, hermeneutical discussions, and group Bible study material preparation. Students delve into biblical doctrine, apologetics, and contemporary ethical issues facing campus scholars, fostering deep roots in scriptural truth.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Teaching",
    location: "6 Kilo Church",
    coordinates: {
      lat: 9.040463,
      lng: 38.75974,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908629/programs/program-bss.jpg",
    isDeleted: false,
  },
  {
    title: "Media & Production Team",
    description:
      "The creative and technological backbone that amplifies the Gospel across campus and social networks. The Media Team oversees audio engineering, live streaming, multi-camera operations, projection, stage lighting, photography, and social media coverage for fellowship events. Weekly workshops provide hands-on training for students in sound mixing, graphic design, and video editing, deploying digital excellence for the glory of God.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Service",
    location: "6 Kilo Church",
    coordinates: {
      lat: 9.040463,
      lng: 38.75974,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908635/programs/program-image.jpg",
    isDeleted: false,
  },
  {
    title: "Evangelism Outreach & Campus Walk",
    description:
      "Fulfilling the Great Commission with boldness, compassion, and cultural relevance. Meeting every Thursday at Hibret Amba, the Evangelism Team conducts prayer preparation, practical gospel training, and active outreach across campus walkways, dormitory halls, cafeterias, and nearby neighborhoods. Team members share the hope of Christ one-on-one, distribute literature, and follow up with seekers and new converts to integrate them into Christian community.",
    day: "Thursday",
    time: "5:00 PM - 7:00 PM",
    category: "Outreach",
    location: "Hibret Amba Meeting Point",
    coordinates: {
      lat: 9.038952,
      lng: 38.758315,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908630/programs/program-evan.jpg",
    isDeleted: false,
  },
  {
    title: "I4U: Identity & Life Fellowship",
    description:
      "Identity 4 You (I4U) is a safe, Christ-centered ministry focused on personal identity, emotional wholeness, relationships, and Christian ethics in modern culture. Meeting at Emmanuel Church, this fellowship creates intimate dialogue tables where university students explore life purpose, mental health, relational boundaries, and overcoming societal peer pressures through biblical truth and confidential peer mentorship.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Fellowship",
    location: "Emmanuel Church",
    coordinates: {
      lat: 9.030377,
      lng: 38.77197,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908634/programs/program-i4u.jpg",
    isDeleted: false,
  },
  {
    title: "Prayer & Intercession Team",
    description:
      "The spiritual powerhouse providing constant intercession and covering for the entire 4 Kilo campus community. Meeting weekly at Emmanuel Church, the Prayer Team engages in focused spiritual warfare, warfare praise, praying in the Spirit, and carrying prayer petitions submitted by university students. Whether contending for revival across Ethiopian universities or lifting up personal crises, this team ministers on its knees before God.",
    day: "Thursday",
    time: "5:30 PM - 7:30 PM",
    category: "Prayer",
    location: "Emmanuel Church",
    coordinates: {
      lat: 9.030377,
      lng: 38.77197,
    },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908636/programs/program-image2.jpg",
    isDeleted: false,
  },
];

const REMOVED_PROGRAM_TITLES = [
  "Graduating Class (GC) Night & Commissioning",
  "Mini Mission & City Outreach",
  "Praise Night & All-Night Worship",
];

async function seedPrograms() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB successfully.");

  // Clean up removed programs
  const deleteResult = await ProgramModel.deleteMany({
    title: { $in: REMOVED_PROGRAM_TITLES },
  });
  if (deleteResult.deletedCount > 0) {
    console.log(`Deleted ${deleteResult.deletedCount} removed programs from DB.`);
  }

  console.log(`Starting to seed ${PROGRAMS_SEED_DATA.length} programs in English...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const prog of PROGRAMS_SEED_DATA) {
    // Check if title or similar exists
    const query = {
      $or: [
        { title: prog.title },
        // Also match legacy "Monday Service" if seeding "Monday General Service"
        ...(prog.title === "Monday General Service" ? [{ title: "Monday Service" }] : []),
      ],
    };

    const existing = await ProgramModel.findOne(query);
    if (existing) {
      await ProgramModel.findByIdAndUpdate(existing._id, {
        ...prog,
        updatedAt: new Date(),
      });
      console.log(`  Updated existing program: "${prog.title}" (${prog.day} ${prog.time} at ${prog.location})`);
      updatedCount++;
    } else {
      await ProgramModel.create(prog);
      console.log(`  Created new program: "${prog.title}" (${prog.day} ${prog.time} at ${prog.location})`);
      createdCount++;
    }
  }

  const total = await ProgramModel.countDocuments({ isDeleted: false });
  console.log(`\n Programs Seed Summary:`);
  console.log(`   Created: ${createdCount}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Total active programs in DB: ${total}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seedPrograms().catch((err) => {
  console.error("❌ Failed to seed programs:", err);
  process.exit(1);
});
