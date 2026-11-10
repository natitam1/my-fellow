import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import DevotionModel from "../src/models/devotion.model.js";
import { UserModel } from "../src/models/user.model.js";

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not found in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully.");

  // 1. Ensure Official "4 Kilo Fellowship" Admin Account exists
  const officialPhone = process.env.OFFICIAL_PHONE || "0900004000";
  const adminPhone = process.env.ADMIN_PHONE || "0911000002";

  console.log("\nEnsuring official 4 Kilo Fellowship user account...");
  const officialUser = await UserModel.findOneAndUpdate(
    { phoneNumber: officialPhone },
    {
      $set: {
        fullName: "4 Kilo Fellowship",
        phoneNumber: officialPhone,
        role: "admin",
        department: "Campus Ministry Leadership",
        telegramUserName: "4kilo_fellowship",
        profileImage:
          "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=400&q=80",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log("Official Fellowship User ID:", officialUser._id.toString());

  // 2. Ensure Admin Profile
  console.log("Updating admin profile...");
  const adminNati = await UserModel.findOneAndUpdate(
    { phoneNumber: adminPhone },
    {
      $set: {
        fullName: "Natnael Tamiru",
        role: "admin",
        department: "Software Engineering & Media Team",
        telegramUserName: "nati",
        profileImage:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
    },
    { new: true },
  );
  const natiId = adminNati ? adminNati._id.toString() : officialUser._id.toString();

  // 3. Load scraped Telegraph articles
  const jsonPath = path.resolve("./scripts/scraped_devotions.json");
  const scrapedData: { title: string; content: string }[] = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8"),
  );
  const contentMap = new Map<string, string>();
  for (const item of scrapedData) {
    contentMap.set(item.title.trim(), item.content.trim());
  }

  // 4. Define all 14 devotions with 100% UNIQUE images and complete data
  const devotionsToSeed = [
    // ─── 1. እርሱ በመጣ ቀን (Voice Devotion) ──────────────────────────
    {
      title: "እርሱ በመጣ ቀን",
      type: "voice" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-11-03",
      duration: "03:38",
      audioUrl:
        "https://res.cloudinary.com/doi9bg69o/video/upload/v1793867256/devotions/audio/qp29zpnogtcnida23yp8.m4a",
      audioPublicId: "devotions/audio/qp29zpnogtcnida23yp8",
      image:
        "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ፀሐይ ወጥታለች ቤቱም እንደተለመደው በዕለት ተዕለት እንቅስቃሴዎች ተሞልቷል፤ ማርታም ልትወጣቸው የሚገቡ ብዙ ሥራዎች ነበሯት። ከዚያም ኢየሱስ እየመጣ መሆኑ ተሰማ...",
      content: contentMap.get("እርሱ በመጣ ቀን") || "",
      tags: ["ማርታና ማርያም", "መንፈሳዊ ዕረፍት", "የእግዚአብሔር ቃል", "Fellowship", "ጸሎት"],
      featured: true,
      views: 1420,
      likes: 385,
    },

    // ─── 2. እርሱ በመጣ ቀን — በማርታና በማርያም ቤት (Text Devotion) ──────
    {
      title: "እርሱ በመጣ ቀን — በማርታና በማርያም ቤት",
      type: "text" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-11-03",
      duration: "4 min read",
      image:
        "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ማርታ ለኢየሱስ ልታደርግ በምትችለው ነገር ላይ ትኩረቷን አድርጋ ነበር፤ ማርያም ግን ከእርሱ ጋር በመሆን ላይ...",
      content: contentMap.get("እርሱ በመጣ ቀን") || "",
      tags: ["ማርታና ማርያም", "መንፈሳዊ ዕረፍት", "አገልግሎት", "ጥሞና", "ምርጫ"],
      featured: false,
      views: 890,
      likes: 240,
    },

    // ─── 3. በእርሱ ጊዜ (Voice Devotion) ───────────────────────────
    {
      title: "በእርሱ ጊዜ",
      type: "voice" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-10-25",
      duration: "03:27",
      audioUrl:
        "https://res.cloudinary.com/doi9bg69o/video/upload/v1793852674/devotions/audio/wdyjphbxa7rcxh3mcpvu.m4a",
      audioPublicId: "devotions/audio/wdyjphbxa7rcxh3mcpvu",
      image:
        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
      caption:
        "እግሮቼ እየደከሙ ነው፤ አጠገቤ ካሉት ሌሎች ሯጮች ተጨማሪ ብዙ የሮጥኩ ይመስል ላብ በላብ ሆኛለው። ወደ ፊት ስመለከት፣ ሁሉም ሰው ከእኔ በጣም ርቆ የሄደ ይመስላል...",
      content: contentMap.get("በእርሱ ጊዜ") || "",
      tags: ["ትዕግሥት", "የእግዚአብሔር ጊዜ", "የሕይወት ሩጫ", "እምነት", "ተስፋ"],
      featured: true,
      views: 1180,
      likes: 312,
    },

    // ─── 4. በእርሱ ጊዜ — የሕይወት ሩጫና ትዕግሥት (Text Devotion) ───────
    {
      title: "በእርሱ ጊዜ — የሕይወት ሩጫና ትዕግሥት",
      type: "text" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-10-25",
      duration: "4 min read",
      image:
        "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ዋናው ቁምነገር ሌሎችን ሁሉ ቀድሞ መሮጥ አይደለም፤ ዋናው ነገር ዓይኖቼን በክርስቶስ ላይ ብቻ በማድረግ በታማኝነት መሮጥ ነው።",
      content: contentMap.get("በእርሱ ጊዜ") || "",
      tags: ["ፊልጵስዩስ 1:6", "የሕይወት ጉዞ", "ትዕግሥት", "እምነት"],
      featured: false,
      views: 740,
      likes: 198,
    },

    // ─── 5. ውሎህ እንዴት ነው? (Voice Devotion) ──────────────────────
    {
      title: "ውሎህ እንዴት ነው?",
      type: "voice" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-10-19",
      duration: "03:00",
      audioUrl:
        "https://res.cloudinary.com/doi9bg69o/video/upload/v1793852680/devotions/audio/tyhuzktnrc9dwsjg3g7b.m4a",
      audioPublicId: "devotions/audio/tyhuzktnrc9dwsjg3g7b",
      image:
        "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ክብደት ለመቀነስ በማሰብ gym መምጣት ከጀመርኩ አንድ አመት ሆኖኛል... 'ዛሬ ብቻ…' ይሄን አባባል ስንት ጊዜ እንደተጠቀምኩበት አላውቅም፤ እነዚህ ቃላት ትልልቅ ውድቀቶች የሚጀምሩባቸው ትንንሽ በሮች ናቸው...",
      content: contentMap.get("ውሎህ እንዴት ነው?") || "",
      tags: ["የዕለት ልማድ", "መንፈሳዊ ጥንካሬ", "ራስን መግዛት", "ዕለታዊ ውሎ", "Fellowship"],
      featured: false,
      views: 950,
      likes: 276,
    },

    // ─── 6. ውሎህ እንዴት ነው? — ዕለታዊ ልማድና መንፈሳዊ ማንነት (Text) ─
    {
      title: "ውሎህ እንዴት ነው? — ዕለታዊ ልማድና መንፈሳዊ ማንነት",
      type: "text" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-10-19",
      duration: "3 min read",
      image:
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80",
      caption:
        "በየቀኑ የምንሰማው፣ የምናየው፣ የምናስበው እና በልባችን ቦታ የምንሰጠው ነገር ቀስ በቀስ ማን እንደምንሆን ይቀርፀናል።",
      content: contentMap.get("ውሎህ እንዴት ነው?") || "",
      tags: ["ዕለታዊ ልማድ", "የልብ ጥበቃ", "መንፈሳዊ ጥንካሬ", "ጥበብ"],
      featured: false,
      views: 680,
      likes: 185,
    },

    // ─── 7. የመሆን ንድፍ (Voice Devotion) ─────────────────────────
    {
      title: "የመሆን ንድፍ",
      type: "voice" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-10-10",
      duration: "03:45",
      audioUrl:
        "https://res.cloudinary.com/doi9bg69o/video/upload/v1793852685/devotions/audio/j7uqzbwuyhq5wnp8afr2.m4a",
      audioPublicId: "devotions/audio/j7uqzbwuyhq5wnp8afr2",
      image:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ሰዎች በተፈጥሮአቸው ከሚኖሩበት ማህበራዊ አካባቢ ጋር ራሳቸውን ለማስማማት ራሳቸውም ሳያውቁት ይሞክራሉ። አንድ ሰው አብሮ ከሚውላቸው ሰዎች ጋር ቀስ በቀስ መመሳሰል ሲጀምር አስተውላችሁ ታውቃላችሁ?...",
      content: contentMap.get("የመሆን ንድፍ") || "",
      tags: ["ማንነት", "ማህበረሰብ", "መለወጥ", "ክርስቲያናዊ ሕይወት", "ጥበብ"],
      featured: false,
      views: 1240,
      likes: 340,
    },

    // ─── 8. የመሆን ንድፍ — ይህን ዓለም አትምሰሉ (Text Devotion) ───────
    {
      title: "የመሆን ንድፍ — ይህን ዓለም አትምሰሉ",
      type: "text" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-10-10",
      duration: "4 min read",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ከሌሎች ሰዎች ጋር ለመመሳሰል ከመሞከር ይልቅ፣ እንደ ክርስቶስ ለመኖር መሞከር አለብን። ንድፋችን ክርስቶስ ነው።",
      content: contentMap.get("የመሆን ንድፍ") || "",
      tags: ["ሮሜ 12:2", "ማንነት", "ክርስቶስን መምሰል", "የልብ መታደስ"],
      featured: false,
      views: 820,
      likes: 215,
    },

    // ─── 9. በድካም ውስጥ ስናልፍ (Voice Devotion) ───────────────────
    {
      title: "በድካም ውስጥ ስናልፍ",
      type: "voice" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-09-28",
      duration: "04:12",
      audioUrl:
        "https://res.cloudinary.com/doi9bg69o/video/upload/v1775813620/devotions/audio/ihqfvipsza9ua1vs6kr7.mp3",
      image:
        "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ድካም ሲሰማንና መንገዱ ሲረዝም ኃይልን የሚያድሰው የጌታ መገኘት ከእኛ ጋር ነው።",
      content:
        "በመንፈሳዊ ጉዟችንና በዩኒቨርሲቲ የትምህርት ቆይታችን ውስጥ ድካም የሚሰማንና ተስፋ የመቁረጥ ስሜት የሚከበንባቸው ወቅቶች ሊኖሩ ይችላሉ። የፈተናዎች ጫና፣ የፕሮጀክቶች መደራረብ፣ በዶርም ውስጥ ያለው ድምፅና ግርግር፣ እንዲሁም ከቤተሰብ ርቆ በካምፓስ ውስጥ የመኖር ውጣ ውረድ አእምሯችንንና መንፈሳችንን ሊያደክመው ይችላል። በዚህ ጊዜ ብዙዎቻችን “እኔ ብቻዬን ነኝ፤ ጥንካሬዬ አልቋል” ወደሚል መደምደሚያ እንደርሳለን።\n\nነገር ግን የእግዚአብሔር ቃል በኢሳይያስ 40:29 ላይ “ለደከመው ኃይልን ይሰጣል፤ ጉልበት ለሌለውም ብርታትን ይጨምራል” ይላል። ክርስትና ማለት በእኛ ብርታት ብቻ ሮጠን የምንጨርሰው ሩጫ ሳይሆን፣ ድካማችንን ለጌታ ሰጥተን በእርሱ መደገፍን የምንማርበት መንገድ ነው። ሐዋርያው ጳውሎስ “ስደክም ያን ጊዜ ኃይለኛ ነኝና፤ ጸጋዬ ይበቃሃል፥ ኃይሌ በድካም ይፈጸማልና” ሲል የተረዳው ይህንኑ ምስጢር ነበር።\n\nብዙ ጊዜ ድካም የሚመጣው ሁሉን ነገር በእጃችን ለመቆጣጠር ስንሞክር ነው። ነገሮችን በራሳችን ጥበብ ለማስተካከል፣ ውጤታችንን ብቻችንን ለመሸከም፣ እና ለሁሉም ሰው ፍጹም መስለን ለመታየት በምንጥርበት ጊዜ ነፍሳችን ትዝላለች። ጸሎት ግን የቁጥጥር መልቀቂያ በር ነው። ጸሎት ማለት “ጌታ ሆይ፥ እኔ አልችልም፤ አንተ ግን ትችላለህ” ብሎ በፊቱ መንበርከክ ነው።\n\nዛሬ በካምፓስ ውስጥ እየተመላለስክ ድካም ከተሰማህ፣ እርምጃህን ትንሽ ቀነስ አድርግ። ጌታችን ኢየሱስ በማቴዎስ 11:28 ላይ “እናንተ ደካሞች ሸክማችሁ የከበደ ሁሉ፥ ወደ እኔ ኑ፥ እኔም አሳርፋችኋለሁ” ይልሃል። ሸክምህን በጸሎት ለእርሱ አስረክብ። እርሱ አዲስ ኃይል ያድስልሃል፤ እንደ ንስርም በክንፍ ታወጣለህ።",
      tags: ["ጸሎት", "እረፍት", "የእግዚአብሔር ፀጋ", "ጥንካሬ", "ኢሳይያስ 40"],
      featured: false,
      views: 650,
      likes: 190,
    },

    // ─── 10. እኔ በሚገባኝ ቦታ ነኝ? (Voice Devotion) ─────────────────
    {
      title: "እኔ በሚገባኝ ቦታ ነኝ?",
      type: "voice" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-09-18",
      duration: "03:50",
      audioUrl:
        "https://res.cloudinary.com/doi9bg69o/video/upload/v1775814822/devotions/audio/fd5es4io5bquxl0hpldm.m4a",
      image:
        "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ሕይወት ብዙ ምርጫዎች አሏት፤ እግዚአብሔር ግን እያንዳንዳችንን ለዓላማ አስቀምጦናል።",
      content:
        "ብዙ ጊዜ ራሳችንን ከሌሎች የዩኒቨርሲቲ ተማሪዎች ጋር በማነጻጸር “እኔ ያለሁበት ቦታ ትክክል ነው? ለምን እዚህ ዲፓርትመንት ገባሁ? ለምን በዚህ ካምፓስ ተመደብኩ?” ብለን እንጠይቃለን። ጓደኞቻችን የተሻለ መስክ የገቡ ወይም የተሻለ እድል ያገኙ ሲመስለን፣ በልባችን ውስጥ የቅናት፣ የጥርጣሬና ያለመደሰት ዘሮች ሊዘሩ ይችላሉ።\n\nነገር ግን መጽሐፍ ቅዱስ የሚያስተምረን ታላቅ እውነት አለ፤ እግዚአብሔር በልጆቹ ሕይወት ውስጥ ምንም ዓይነት አጋጣሚ (accident) አያደርግም። ንግሥት አስቴር በአስቸጋሪ ሁኔታ ውስጥ በቤተመንግሥት ውስጥ ስትገኝ መርዶክዮስ “ለእንደዚህ ያለ ጊዜ ወደ መንግሥት እንዳልመጣሽ ማን ያውቃል?” እንዳላት፣ አንተም ዛሬ በ4 ኪሎ ካምፓስ ውስጥ፣ በዚያ ዲፓርትመንትና በዚያ ዶርም ውስጥ የተገኘኸው ለታላቅ የእግዚአብሔር ዓላማ ነው።\n\nዩኒቨርሲቲ የትምህርት ብቻ ሳይሆን የመለኮታዊ ተልእኮ ማዕከል ነው። እግዚአብሔር እያንዳንዳችንን በክፍላችን፣ በቤተ-ሙከራችን፣ እና በግቢው ውስጥ ያስቀመጠን እርሱ ሊሰራበት በወደደው ምክንያት ነው። ክርስቶስን ለተማሪዎች ለማሳየት፣ የተጨነቁትን ለማጽናናት፣ እና የሕይወት ብርሃን ሆነህ እንድትበራ ነው።\n\nስለዚህ ቦታህን አትናቀው፤ ያለህበትን ምዕራፍ በጸጸት አታሳልፈው። ምሳሌ 16:9 “የሰው ልብ መንገዱን ያዘጋጃል፥ እግዚአብሔር ግን እርምጃውን ያቀናለታል” ይላል። ዛሬ ያለህበት ቦታ ለእግዚአብሔር ክብር የምታበራበት መድረክህ ነው። እርምጃህን በቃሉ ምራ፤ እርሱም የቀና መንገድ ያደርግልሃል።",
      tags: ["ዓላማ", "የሕይወት ጥሪ", "መመራት", "እምነት", "ምሳሌ 16"],
      featured: false,
      views: 590,
      likes: 165,
    },

    // ─── 11. ምስጋናዬ የሚገባህ (Voice Devotion) ───────────────────
    {
      title: "ምስጋናዬ የሚገባህ",
      type: "voice" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-09-10",
      duration: "05:15",
      audioUrl:
        "https://res.cloudinary.com/doi9bg69o/video/upload/v1775815128/devotions/audio/o7c3w9dwacexpu4ixec7.ogg",
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ሁሉ በአመስጋኝነት ልብ ሲከናወን በሕይወታችን የሰማይ ሰላም ይነግሣል።",
      content:
        "ዳዊት በመዝሙር 103:1-2 ላይ “ነፍሴ ሆይ፥ እግዚአብሔርን ባርኪ፤ ምስጋናውንም ሁሉ አትርሺ” ይላል። ዳዊት ይህንን ሲጽፍ ሕይወቱ ሁልጊዜ በአበባ የተሞላ አልነበረም፤ በብዙ ፈተናዎች፣ በስደትና በጭንቀት መሃል አልፏል። ነገር ግን በነፍሱ ውስጥ ቆም ብሎ የእግዚአብሔርን ውለታ ለማሰብ ወሰነ።\n\nበዩኒቨርሲቲ ውጥረት ውስጥ፣ ብዙ ጊዜ የምናየው የጎደለንን ነገር ብቻ ነው። ያልተጠናቀቀ assignment፣ የሚመጣ ፈተና፣ የገንዘብ እጥረት፣ ወይም የጤና መጓደል ልባችንን ሊሞላው ይችላል። ነገር ግን ዛሬ እስትንፋስ ኖሮህ መንቃትህ፣ ወደዚህ ደረጃ መድረስህ፣ በፈተናዎች ሁሉ ውስጥ እግዚአብሔር ደግፎ ማቆሙ እጅግ ታላቅ ምስጋና የሚገባው ውለታ ነው።\n\nምስጋና የልብ አመለካከት ነው። 1 ኛ ተሰሎንቄ 5:18 “በሁሉ አመስግኑ፤ የእግዚአብሔር ፈቃድ በክርስቶስ ኢየሱስ ወደ እናንተ ይህ ነውና” ይለናል። በሁኔታዎች ላይ ሳይሆን በማይለወጠው በእግዚአብሔር ቸርነት ላይ መደገፍ ሲጀምር፣ ልባችን ከጭንቀት ወደ ሰላም ይሻገራል። ምስጋና በፈተና ውስጥ ብርታትን፣ በጨለማ ውስጥ ደግሞ ተስፋን ያበራል።\n\nዛሬ ከመማሪያ ክፍልህ ወይም ከቤተ-መጽሐፍት ወጥተህ ወደ ዶርምህ ስትመለስ፣ ቆም ብለህ አምላክህን አመስግን። ለሰጠህ ጤና፣ ለሰጠህ የካምፓስ ኅብረት፣ እና ነገን በክርስቶስ ተስፋ እንድትጠብቅ ስላደረገህ ልብህን በምስጋና ሙላው። በምስጋና ልብ ውስጥ የሰማይ ሰላም ይነግሣል።",
      tags: ["ምስጋና", "አምልኮ", "የልብ ሰላም", "መዝሙር 103", "ተሰሎንቄ 5"],
      featured: false,
      views: 710,
      likes: 220,
    },

    // ─── 12. የጠዋት ጸሎትና ፀጋ (Text Devotion) ─────────────────────
    {
      title: "የጠዋት ጸሎትና ፀጋ — የማለዳ ኅብረት",
      type: "text" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-11-04",
      duration: "4 min read",
      image:
        "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ማለዳ ከእግዚአብሔር ቃልና ከጸሎት ጋር መጀመር የቀናችንን ሙሉ አቅጣጫና ሰላም ይወስናል።",
      content:
        "ማለዳ ፀሐይ ከመውጣቷ በፊት ከእግዚአብሔር ጋር የሚደረግ ኅብረት የቀኑን ሙሉ አቅጣጫና መንፈሳዊ ድባብ ይወስናል። ጌታችን ኢየሱስ በምድር በነበረበት ዘመን፣ በማለዳ ገና ሳይነጋ ተነስቶ ወደ ምድረ በዳ ሄዶ ይጸልይ ነበር (ማርቆስ 1:35)። የአጽናፈ ዓለም ፈጣሪ የሆነው እርሱ ከአባቱ ጋር ለመገናኘት ማለዳን ከመረጠ፣ እኛ ተማሪዎችማ ምን ያህል በየማለዳው በእርሱ ጸጋ መሞላት ያስፈልገን ይሆን?\n\nበካምፓስ ውስጥ ማለዳ በቀላሉ በስልካችን notifications፣ በዜናዎች፣ እና በሚያስጨንቁን ፕሮግራሞች ሊሰረቅ ይችላል። ስልካችንን ከፍተን ማህበራዊ ሚዲያ ስንጎበኝ አእምሯችን ሳይነጋ በሰው ሀሳቦችና በዓለም ጫጫታ ይሞላል። ከዚያም ቀኑን ሙሉ እንረበሻለን፣ እንጨነቃለን፣ እና መንፈሳዊ ጥንካሬ እናጣለን።\n\nነገር ግን ጠዋት 6:00 AM ላይ በጸሎት ከጌታ ጋር ስንጀምር፣ ልባችን በእርሱ እውነት ይታጠባል። ሰቆቃወ ኤርምያስ 3:22-23 “ያልጠፋነው ከእግዚአብሔር ምሕረት የተነሣ ነው፤ ርኅራኄው አያልቅምና። ማለዳ ማለዳ አዲስ ነው፤ ታማኝነትህ ታላቅ ነው” ይላል። የትናንት ስህተታችንና ድካማችን አልፎ ዛሬ አዲስ የእግዚአብሔር ጸጋ ተዘጋጅቶልናል።\n\nበዩኒቨርሲቲ ውጥረትና በፈተናዎች መሀል ቀንህን ከእግዚአብሔር ጋር ጀምር። ከካምፓስ ኅብረት ወንድሞችና እህቶች ጋር በማለዳ ጸሎት መቆም፣ የእግዚአብሔርን ቃል መመገብ፣ እና የዕለቱን ውሎ ለጌታ መስጠት የድል ምስጢር ነው። “እግዚአብሔር ሆይ፥ በማለዳ ድምፄን ትሰማለህ፤ በማለዳ በፊትህ እቆማለሁ፥ እጠብቅማለሁ።” — መዝሙር 5:3",
      tags: ["ማለዳ", "ጸሎት", "የእግዚአብሔር ቃል", "ካምፓስ", "መዝሙር 5"],
      featured: false,
      views: 450,
      likes: 130,
    },

    // ─── 13. በፈተና ውስጥ ያለ ደስታ (Text Devotion) ────────────────
    {
      title: "በፈተና ውስጥ ያለ ደስታ — ያዕቆብ 1:2",
      type: "text" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-10-05",
      duration: "4 min read",
      image:
        "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80",
      caption:
        "ፈተናዎች እምነታችንን የሚያጠሩና ትዕግሥትን በሕይወታችን የሚሰሩ ታላላቅ በረከቶች ናቸው።",
      content:
        "ያዕቆብ በመልእክቱ ምዕራፍ 1 ቁጥር 2 ላይ “ወንድሞቼ ሆይ፥ የእምነታችሁ መፈተን ትዕግሥትን እንዲያደርግላችሁ አውቃችሁ፥ ልዩ ልዩ ፈተና ሲደርስባችሁ እንደ ሙሉ ደስታ ቁጠሩት” ይለናል። ይህ ቃል ለመስማት እንግዳ ሊመስል ይችላል፤ ፈተናና መከራ እንዴት እንደ ደስታ ይቆጠራል?\n\nያዕቆብ የሚነግረን ስለ ሥጋዊ ፈንጠዝያ ሳይሆን፣ በመከራ ውስጥ ስለሚገኝ ጥልቅ መንፈሳዊ ፍሬ ነው። በዩኒቨርሲቲ ሕይወት ውስጥ የሚያጋጥሙን ፈተናዎች፣ የውጤት ውጣ ውረዶች፣ ወይም የሚደርሱብን አለመግባባቶች እምነታችንን የሚያጠሩና ወደ ብስለት የሚያደርሱን መለኮታዊ ትምህርት ቤቶች ናቸው። ወርቅ በእሳት ተፈትኖ እንደሚነጻ፣ የእኛም እምነት በፈተና ውስጥ አልፎ ጽኑ ይሆናል።\n\nፈተና ሲመጣ የምናደርገው ምርጫ ማንነታችንን ይገልጻል። ማማረር፣ ተስፋ መቁረጥ፣ ወይም ሌሎችን መውቀስ እንችላለን። ወይም ደግሞ ወደ ጌታ ቀርበን “ጌታ ሆይ፥ በዚህ ሁኔታ ውስጥ ምን ልታስተምረኝ ወደድህ?” ብለን መጠየቅ እንችላለን። ሮሜ 5:3-4 “መከራ ትዕግሥትን እንዲያደርግ፥ ትዕግሥትም ፈተናን፥ ፈተናም ተስፋን እንዲያደርግ እናውቃለን” እንደሚል፣ ፈተና የክርስቶስን ባህሪ በውስጣችን የሚቀርጽ መሳሪያ ነው።\n\nስለዚህ ዛሬ በፈተና ውስጥ እያለፍክ ከሆነ ተስፋ አትቁረጥ። የሚጠብቅህ ጌታ ታማኝ ነው፤ ከአቅምህ በላይ እንድትፈተን አይተወህም (1 ኛ ቆሮንቶስ 10:13)። ዓይኖችህን በመከራው ላይ ሳይሆን በመጨረሻው ክብር ላይ አድርግ፤ በእርሱም ጸጋ ጸንተህ ቁም።",
      tags: ["ያዕቆብ 1", "ትዕግሥት", "ደስታ", "የእምነት ፈተና", "ሮሜ 5"],
      featured: false,
      views: 520,
      likes: 145,
    },

    // ─── 14. የእረኛው ድምፅ (Text Devotion) ────────────────────────
    {
      title: "የእረኛው ድምፅ — ዮሐንስ 10:27",
      type: "text" as const,
      author: "4 Kilo Fellowship",
      authorId: officialUser._id,
      authorAvatar: officialUser.profileImage,
      authorRole: "Executive Ministry",
      authorUsername: "4kilo_fellowship",
      date: "2026-09-30",
      duration: "4 min read",
      image:
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
      caption:
        "በዓለም ጫጫታ መካከል የመልካሙን እረኛ የኢየሱስን ድምፅ በጥሞና እናዳምጥ።",
      content:
        "“በጎቼ ድምፄን ይሰማሉ እኔም አውቃቸዋለሁ ይከተሉኝማል፤” ይላል ጌታችን ኢየሱስ በዮሐንስ 10:27 ላይ። በጎች የባለቤታቸውን ድምፅ ጠንቅቀው ያውቃሉ፤ እንግዳ ሰው ቢጠራቸው ግን አይከተሉትም ምክንያቱም የእንግዳውን ድምፅ አያውቁትም።\n\nበዛሬው ዓለምና በካምፓስ ሕይወት ውስጥ ብዙ ተፎካካሪ ድምፆች አሉ። የዓለም ፍልስፍናዎች፣ የማህበራዊ ሚዲያ አዝማሚያዎች፣ የጓደኞች ግፊት፣ እንዲሁም የራሳችን ፍርሃትና ጭንቀት ያለማቋረጥ ጆሯችንን ይሞሉታል። እነዚህ ድምፆች ብዙ ጊዜ ወደ ግራ መጋባት፣ ወደ ብቸኝነትና ወደ ማንነት ቀውስ ይመሩናል።\n\nየመልካሙ እረኛ ድምፅ ግን የተለየ ነው። እርሱ በጸጥታና በእውነት ይናገራል። ድምፁ የሚያረጋጋ፣ የሚያነጻ፣ ወደ ንስሐና ወደ ሕይወት የሚመራ ነው። ኢሳይያስ 30:21 “ወደ ቀኝም ወደ ግራም ፈቀቅ ብትሉ ጆሮዎችህ በኋላህ፦ መንገዱ ይህች ናት በእርስዋም ሂድ የሚለውን ቃል ይሰማሉ” ይላል። የእርሱን ድምፅ ለመስማት ግን በየቀኑ በጸጥታ በቃሉ ፊት መቆየትን መለማመድ አለብን።\n\nዛሬ የትኛውን ድምፅ እያዳመጥክ ነው? ሰዎችን ለማስደሰት የምትሮጥበትን ጩኸት ወይስ የኢየሱስን የፍቅር ጥሪ? ዛሬ ልብህን ለእውነተኛው እረኛ ክፈት። እርሱ በስምህ ይጠራሃል፤ ወደ ዘላለማዊ እረፍትና ወደ ሕይወት ማዕድ ይመራሃል።",
      tags: ["ዮሐንስ 10", "የእረኛው ድምፅ", "መከተል", "ሕይወት", "ኢሳይያስ 30"],
      featured: false,
      views: 610,
      likes: 175,
    },
  ];

  // 5. Verify image uniqueness
  const imageSet = new Set<string>();
  for (const d of devotionsToSeed) {
    if (imageSet.has(d.image)) {
      throw new Error(`DUPLICATE IMAGE DETECTED: ${d.image} in "${d.title}"`);
    }
    imageSet.add(d.image);
  }
  console.log(`\nVerified ${imageSet.size} completely UNIQUE cover images!`);

  // 6. Clear existing devotions and insert the fresh, curated set
  console.log("\nReplacing devotions collection with clean, rich devotions...");
  await DevotionModel.deleteMany({});
  const inserted = await DevotionModel.insertMany(devotionsToSeed);
  console.log(`Successfully seeded ${inserted.length} devotions into MongoDB!`);

  const voiceCount = inserted.filter((d) => d.type === "voice").length;
  const textCount = inserted.filter((d) => d.type === "text").length;
  console.log(`- Voice Devotions (audio + full captions): ${voiceCount}`);
  console.log(`- Text Devotions (full word-for-word text): ${textCount}`);
  console.log(`- Devotions with Official / User profile links: ${inserted.length}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB. Seeding finished cleanly!");
}

seed().catch((err) => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
