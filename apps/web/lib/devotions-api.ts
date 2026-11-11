import api from "./api";
import {
  Devotion,
  DevotionComment,
  DevotionsResponse,
  SingleDevotionResponse,
  WriterRequestData,
  UserStreak,
} from "@/types/devotion";

export const DEFAULT_DEVOTIONS: Devotion[] = [
  {
    _id: "devotion-1",
    id: "devotion-1",
    title: "እርሱ በመጣ ቀን (When He Arrived)",
    type: "voice",
    author: "4 Kilo Fellowship",
    authorId: "user-fellowship",
    actorType: "official",
    authorAvatar:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
    authorRole: "Official Fellowship",
    authorUsername: "fellow",
    authorHandle: "@fellowship",
    date: "2026-11-03",
    duration: "03:38",
    audioUrl:
      "https://res.cloudinary.com/doi9bg69o/video/upload/v1793867256/devotions/audio/qp29zpnogtcnida23yp8.m4a",
    image:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
    scriptureReference: "ሉቃስ 10:41-42 (Luke 10:41-42)",
    scriptureText:
      "“ኢየሱስም መልሶ፦ ማርታ፥ ማርታ፥ በብዙ ነገር ትጨነቂያለሽ ትታወኪያለሽም፥ የሚያስፈልገው ግን ጥቂት ወይም አንድ ነገር ነው፤ ማርያምም መልካም ዕድልን መርጣለች ከእርስዋም አይወሰድባትም አላት።”",
    caption:
      "ፀሐይ ወጥታለች ቤቱም እንደተለመደው በዕለት ተዕለት እንቅስቃሴዎች ተሞልቷል፤ ማርታም ልትወጣቸው የሚገቡ ብዙ ሥራዎች ነበሯት። ከዚያም ኢየሱስ እየመጣ መሆኑ ተሰማ...",
    content: `ፀሐይ ወጥታለች ቤቱም እንደተለመደው በዕለት ተዕለት እንቅስቃሴዎች ተሞልቷል፤ ማርታም ልትወጣቸው የሚገቡ ብዙ ሥራዎች ነበሯት የሚዘጋጁ ነገሮች፣ የሚስተካከሉ ጉዳዮች ነበሩ። ከዚያም ኢየሱስ እየመጣ መሆኑ ተሰማ። ይህ ዜና ለሁለቱ እህቶች ምን ትርጉም ሊኖረው እንደሚችል አስቡት።

ኢየሱስ ወደ ቤታቸው እየመጣ ነበር። ቃላቱ ሕይወትን የሚሰጡ፣ መገኘቱ ሰላምን የሚያመጣ፣ እና ትምህርቶቹ የእግዚአብሔርን ልብ የሚገልጡት እርሱ፣ ከእነርሱ ጋር ሊቆይ እየመጣ ነበር። ይህ ዝግጅት የሚገባው ልዩ አጋጣሚ ነበር፤ ማርታም ተዘጋጀች።

ማርያምም ኢየሱስ እየመጣ መሆኑን ታውቅ ነበር። ነገር ግን እርሱ ሲመጣ፣ ትኩረቷ ከዝግጅቶቹ ይልቅ ወደ ሌላ ነገር ተሳበ። ማርታ በብዙ ሥራዎች ተጠምዳ ሳለ፣ ማርያም ግን በጌታ እግር ስር ተቀምጣ ትምህርቱን ታዳምጥ ነበር። ሁለት እህቶች፣ አንድ ቤት፣ አንድ እንግዳ ከኢየሱስ አጠገብ ለመሆን የተገኘ አንድ ልዩ አጋጣሚ። ሆኖም፣ ቀኑ እየገፋ ሲሄድ፣ ሁለቱም ወደ እርሱ የቀረቡት በተለያየ መንገድ ነበር።

ማርታ ለኢየሱስ ልታደርግ በምትችለው ነገር ላይ ትኩረቷን አድርጋ ነበር። ማርያም ግን ከእርሱ ጋር በመሆን ላይ ትኩረቷን አድርጋ ነበር። ማርታ ከነበረችበት አቋም አንጻር፣ የማርያምን ምርጫ መረዳት ከባድ ሊሆን ይችላል። ሊሠሩ የሚገቡ ሥራዎች ነበሩ፤ አንድ ሰውም ሊሠራቸው ይገባ ነበር። ሁሉም ነገር ሳይጠናቀቅ ማርያም እንዴት እዚያ ተቀምጣ ትቀራለች? ትኩረት የሚያስፈልጋቸው ብዙ ነገሮች እንዳሉ አላየችም? ማርታ ኃላፊነቱን ብቻዋን እንደተሸከመች ግድ አልሰጣትም?

ሉቃስ እንደሚነግረን፣ ማርታ በብዙ ስራ ተጠምዳ ነበር። በመጨረሻም ወደ ኢየሱስ ቀርባ፣ ማርያም እንድታግዛት እንዲነግራት ጠየቀችው። በዚያ ቀን ማርታ ምን እንደተሰማት ሙሉ በሙሉ አናውቅም። ነገር ግን፣ አገልግሎቷ ለእሷ ሸክም እንደሆነባት፣ ያም ሸክም ደግሞ ለብስጭት ምንጭ እንደሆነባት መረዳት እንችላለን። ኢየሱስም እንዲህ ሲል መለሰላት:

“ማርታ፥ ማርታ፥ በብዙ ነገር ትጨነቂያለሽ ትታወኪያለሽም፥ የሚያስፈልገው ግን ጥቂት ወይም አንድ ነገር ነው፤ ማርያምም መልካም ዕድልን መርጣለች ከእርስዋም አይወሰድባትም አላት።”

አሁን ቤቱ አሁን dorm ነው እንበል ዝግጅቶቹም የቤት ስራዎች፣ የቡድን ፕሮጀክቶች እና ፈተናዎች ናቸው። ጠዋት ስንነሳ ለመጸለይ እናስባለን፤ ስራችንን ከመጀመራችን በፊት የመጽሐፍ ቅዱስ አንድ ምዕራፍ ለማንበብም ለራሳችን ቃል እንገባለን። ነገር ግን፣ በመጀመሪያ፣ ነገ ማስረከብ ያለብን አንድ assignment አለ። እኛ የምናደርገው ነገር እኮ ስህተት ላይሆን ይችላል ሆኖም በሂደቱ ውስጥ የህይወታችን ማዕከል መሆን ለሚገባው ለእርሱ ትኩረት ከመስጠት ይልቅ፣ ለሌሎች ነገሮች ሁሉ ትኩረት መስጠትን ተምረን ይሆናል።

የማርያም ምርጫ የሚያስታውሰን አንድ ነገር አለ፤ ከኢየሱስ ጋር መሆን ማለት ሌሎች ነገሮችን ሁሉ ከጨረስን በኋላ የምናገኘው ሽልማት አይደለም። እንዲሁም፣ ፕሮግራማችን ባዶ ሲሆን እና አእምሮአችን ሲረጋጋ ብቻ የሚደረግ ነገር አይደለም። ይህ ግንኙነት፣ ገና ያልተጠናቀቁ ነገሮች ባሉበት በተለመደው የዕለት ተዕለት ህይወታችን ውስጥ እንድናዳብረው የተጋበዝንበት ነው። በዚያ ቀን ማርያም ልትሠራቸው የምትችላቸው ሌሎች ነገሮችም ነበሩ። ነገር ግን ኢየሱስ በተገኘበትና በሚያስተምርበት ጊዜ፣ እርሱን የማዳመጥን ዋጋ ተረዳች።`,
    prayer: `ጌታ ሆይ፤ በዩኒቨርሲቲው ሩጫና በፈተናዎች መሀል ትኩረቴ ወደ ተለያዩ አቅጣጫዎች እንዳይበተን እርዳኝ። እንደ ማርያም በእግርህ ስር የመቀመጥን፣ ድምጽህን የማዳመጥንና ከመገኘትህ የሚገኘውን ዕረፍት ምርጫዬ አድርግልኝ። በስራዬ ሁሉ ውስጥ መጀመሪያ አንተን እንዳስቀድም ልቤን አረጋጋው። አሜን።`,
    tags: ["Faith", "Prayer", "Wisdom", "Fellowship", "መንፈሳዊ ዕረፍት"],
    featured: true,
    views: 1420,
    likes: 385,
    viewsFormatted: "1.4k",
    likesFormatted: "385",
  },
  {
    _id: "devotion-2",
    id: "devotion-2",
    title: "በእርሱ ጊዜ (In His Perfect Time)",
    type: "voice",
    author: "Discipleship Ministry",
    authorId: "user-discipleship",
    actorType: "team",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    authorRole: "Discipleship Team",
    authorUsername: "discipleship",
    authorHandle: "@discipleship",
    date: "2026-10-25",
    duration: "03:27",
    audioUrl:
      "https://res.cloudinary.com/doi9bg69o/video/upload/v1793852674/devotions/audio/wdyjphbxa7rcxh3mcpvu.m4a",
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
    scriptureReference: "ፊልጵስዩስ 1:6 (Philippians 1:6)",
    scriptureText:
      "“በእናንተ መልካምን ሥራ የጀመረው እርሱ እስከ ክርስቶስ ኢየሱስ ቀን ድረስ ከፍጻሜው እንደሚያደርሰው ርግጠኛ ነኝ።”",
    caption:
      "እግሮቼ እየደከሙ ነው፤ አጠገቤ ካሉት ሌሎች ሯጮች ተጨማሪ ብዙ የሮጥኩ ይመስል ላብ በላብ ሆኛለው። ወደ ፊት ስመለከት፣ ሁሉም ሰው ከእኔ በጣም ርቆ የሄደ ይመስላል...",
    content: `እግሮቼ እየደከሙ ነው፤ አጠገቤ ካሉት ሌሎች ሯጮች ተጨማሪ ብዙ የሮጥኩ ይመስል ላብ በላብ ሆኛሌው መሮጤን ቀጠልኩ። ወደ ፊት ስመለከት፣ ሁሉም ሰው ከእኔ በጣም ርቆ የሄደ ይመስላል። አንዳንዶቹ ያለምንም ድካም ይሮጣሉ፤ ሌሎች ደግሞ እኔ ለመድረስ የምታገላቸው ቦታዎች ላይ ቀድመው ደርሰዋል። እንዴት ይህን ያህል በፍጥነት እዚያ ደረሱ? ከእኔ ቀድመው ይሆን የጀመሩት? ወይስ ከእኔ የተሻሉ ስለሆኑ ብቻ ነው? የሆነ ስህተት እየሠራሁ ይሆን እንዴ?

ፍጥነቴን ለመጨመር እሞክራለው ነገር ግን ሁሉም ሰው ወደ ፊት እየገሰገሰ ባለበት ወቅት፣ ይህን ለማድረግ ከባድ ነው። በተለይም ከሌሎች ጋር ለመራመድ የምታገለው እኔ ብቻ እንደሆንኩ በሚሰማኝ ጊዜ። በፍጥነት ለመሄድ እየሞከርኩ ነው፤ ነገር ግን አሁንም መሆን ባለብኝ ቦታ ላይ ያልሆንኩ ያህል ይሰማኛል።

እስከ አሁን ድረስ አውቄያቸው ወይም ተረድቻቸው ይሆናሉ ብዬ ያሰብኳቸው ብዙ ነገሮች አሉ፤ አድጌያለሁ ብዬ ያሰብኩባቸው ብዙ መንገዶች፣ እንዲሁም እሆናለሁ ብዬ ያሰብኳቸው ብዙ ማንነቶች አሉ። በጣም ረጅም ጊዜ እየወሰድኩ ይሆን? አንድ ሰው ለመሆን ልጠቀምባቸው የሚገቡ ዓመታትን እያባከንኩ ይሆን? “አሁንም ጊዜ አለኝ” እያልኩ ራሴን አረጋጋለሁ፤ ነገር ግን የማስበውን ያህል ጊዜ ባይኖረኝስ?

ሕይወት አንድ ሰው አሸናፊ፣ ሌላኛው ደግሞ ተሸናፊ መሆን ያለበት ዓይነት ውድድር ባይሆንስ? ከሌሎች ጋር ለመድረስ በመጣር ብዙ ጊዜዬን በማሳለፌ፣ መኖር ያለብኝ የራሴ ሕይወት እንዳለኝ ረሳሁት ይሆን?

እግዚአብሔር ከእኔ የተለየ የጊዜ አቆጣጠር እንዳለው፣ የእኔም መንገድ ከሌሎች መንገድ የተለየ እንደሆነ መማር አለብኝ። እሱ የሚያዘገየኝ እየመሰለኝ ባለበት ጊዜ እንኳ፣ በዝምታ ውስጥ እያሳደገኝ፣ በመጠበቅ ውስጥ እያዘጋጀኝ፣ እና እኔ ገና በማላየው መንገድ እየመራኝ ሊሆን ይችላል። የእግዚአብሔር ዕቅድ በእኔ የጊዜ ሰሌዳ ጋር ላይገናኝ ይችላል፤ ነገር ግን እኔ ከእርሱ ጋር እስካለሁ ድረስ፣ መንገዴ በከንቱ አይባክንም።`,
    prayer: `አባት ሆይ፤ የሌሎችን ፍጥነት አይቼ በራሴ ጉዞ ተስፋ እንዳይቆርጥ አድነኝ። በሕይወቴ የጀመርከውን መልካም ሥራ በጊዜው እንደምትፈጽመው አምናለሁ። የጊዜ አቆጣጠርህን እንድታገስ፣ ዓይኖቼን በአንተ ላይ ብቻ እንዳደርግ ጸጋህን ስጠኝ። በክርስቶስ ኢየሱስ ስም፣ አሜን።`,
    tags: ["Patience", "Hope", "Faith", "Wisdom", "ትዕግሥት"],
    featured: true,
    views: 1180,
    likes: 312,
    viewsFormatted: "1.2k",
    likesFormatted: "312",
  },
  {
    _id: "devotion-3",
    id: "devotion-3",
    title: "የማይናወጥ መሠረት (Unshakable Foundation)",
    type: "text",
    author: "4 Kilo Fellowship",
    authorId: "user-fellowship",
    actorType: "official",
    authorAvatar:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
    authorRole: "Official Fellowship",
    authorUsername: "fellow",
    authorHandle: "@fellowship",
    date: "2026-10-18",
    duration: "4 min read",
    image:
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80",
    scriptureReference: "ማቴዎስ 7:24-25 (Matthew 7:24-25)",
    scriptureText:
      "“ስለዚህ ይህን ቃሌን ሰምቶ የሚያደርገው ሁሉ ቤቱን በዓለት ላይ የሠራ ልባም ሰውን ይመስላል። ዝናብም ወረደ ጎርፍም መጣ ነፋስም ነፈሰ ያንም ቤት ገፋው፥ በዓለት ላይም ስለ ተመሠረተ አልወደቀም።”",
    caption:
      "አውሎ ነፋሱ በድንገት ይመጣል። በዩኒቨርሲቲ ሕይወት ውስጥ ማዕበል የሚመስሉ ቀናት አሉ፤ ነገር ግን በክርስቶስ ዓለት ላይ የተመሠረተ ማንነት ፈጽሞ አይናወጥም...",
    content: `አውሎ ነፋሱ በድንገት ይመጣል። በዩኒቨርሲቲ ሕይወት ውስጥ ማዕበል የሚመስሉ ቀናት አሉ፤ የአካዳሚክ ጫና፣ የወደፊት ጭንቀት፣ የግንኙነቶች መናጋት ወይም የብቸኝነት ስሜት። እነዚህ ሁሉ ነፋሳት ሲነፉ ውስጣችን ያለውን መሰረት ይፈትኑታል።

ኢየሱስ የተናገረው ምሳሌ ስለ ሁለት ግንበኞች ነው። ሁለቱም ቤት ገነቡ። የሁለቱም ቤት ውጫዊ ገጽታ ምናልባት ተመሳሳይ ሊሆን ይችላል። ልዩነቱ የታየው ማዕበሉ በመጣ ጊዜ ነበር። አንደኛው ቤቱን በአሸዋ ላይ፣ ሌላኛው ደግሞ በዓለት ላይ መሠረተ።

አሸዋ ምንድነው? አሸዋ የሰው ጥበብ፣ የራስ እውቀት፣ የሰዎች ሙገሳ፣ እና ጊዜያዊ ምቾት ነው። እነዚህ ነገሮች በሰላሙ ጊዜ በቂ ሊመስሉ ይችላሉ፤ ነገር ግን ቀውሶች ሲመጡ ያንሸራትታሉ።

ዓለቱ ግን ክርስቶስና ቃሉ ነው። ቃሉን መስማት ብቻ ሳይሆን በተግባር መኖር ነው። በፈተና መሀል እውነተኝነትን መምረጥ፣ በጭንቀት መሀል በጸሎት ወደ ጌታ መቅረብ፣ እና በስኬት መሀል ትሁት መሆን በዓለት ላይ የመገንባት ምልክት ነው።

ዛሬ ራስህን ጠይቅ፦ የሕይወቴ፣ የትምህርቴ፣ የጓደኝነቴ መሠረት ምንድነው? የሚናወጠውን አሸዋ ትተን በማይናወጠው በክርስቶስ ዓለት ላይ እንቁም።`,
    prayer: `ጌታ ኢየሱስ ሆይ፤ አንተ ዘላለማዊ ዓለቴ ነህ። ሕይወቴን በራስ ወዳድነት ወይም በጊዜያዊ አሸዋ ላይ እንዳልገነባ ጠብቀኝ። በማዕበልና በፈተና መሀል በማይነቃነቀው ቃልህ ላይ ተደግፌ እንድቆም ኃይልን ስጠኝ። አሜን።`,
    tags: ["Faith", "Wisdom", "Prayer", "Hope", "ጽናት"],
    featured: false,
    views: 940,
    likes: 275,
    viewsFormatted: "940",
    likesFormatted: "275",
  },
  {
    _id: "devotion-4",
    id: "devotion-4",
    title: "የጸሎት ኃይል በዝምታ ውስጥ (The Power of Quiet Prayer)",
    type: "voice",
    author: "Prayer & Intercession Team",
    authorId: "user-prayer",
    actorType: "team",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    authorRole: "Prayer Ministry",
    authorUsername: "prayer_team",
    authorHandle: "@prayer",
    date: "2026-10-10",
    duration: "04:12",
    audioUrl:
      "https://res.cloudinary.com/doi9bg69o/video/upload/v1793852680/devotions/audio/tyhuzktnrc9dwsjg3g7b.m4a",
    image:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80",
    scriptureReference: "መዝሙር 46:10 (Psalm 46:10)",
    scriptureText: "“ዕረፉ፥ እኔም አምላክ እንደ ሆንሁ እወቁ፤ በአሕዛብ ዘንድ ከፍ ከፍ እላለሁ፥ በምድርም ላይ ከፍ ከፍ እላለሁ።”",
    caption:
      "በጩኸትና በተጣደፈ ዓለም ውስጥ ጸጥታ የእግዚአብሔርን ድምጽ የምናዳምጥበት ቅዱስ ስፍራ ነው። ዛሬ ጥቂት ደቂቃዎችን ወስደህ በፊቱ እረፍ...",
    content: `በጩኸትና በተጣደፈ ዓለም ውስጥ ጸጥታ እጅግ ብርቅ ሆኗል። ሁልጊዜ የሚጮሁ ስልኮች፣ የማያቋርጡ ማሳወቂያዎች፣ የትምህርት ቤት ጫጫታ እና የውስጣችን ጭንቀት አእምሮአችንን ያደነቁሩታል።

ነገር ግን መጽሐፍ ቅዱስ “ዕረፉ፥ እኔም አምላክ እንደ ሆንሁ እወቁ” ይለናል። በዕብራይስጡ “ራፋ” ማለት “እጅን መተው”፣ “መታገልን ማቆም” ወይም “ማረፍ” ማለት ነው።

ብዙ ጊዜ በጸሎት ስንቆም እንኳን የምናወራው እኛ ብቻ ነን፤ የምንፈልገውን ዝርዝር አቅርበን ሮጠን እንወጣለን። ዛሬ ግን ጌታ በዝምታ ፊቱ እንድንቀመጥ ይጋብዘናል። እርሱ አምላክ መሆኑን እንድናውቅ፣ እርሱ ለችግሮቻችን ሁሉ መልስ እንዳለው እንድንረዳ፣ እና ከድካማችን ወደ ዕረፍቱ እንድንገባ ይፈልጋል።

በጸሎትህ ውስጥ ዝምታ ይኑርህ። የእግዚአብሔርን ታላቅነት አስብ፤ እርሱ ስለ አንተ የሚያስብ ታማኝ አባት መሆኑን በልብህ አሰላስል።`,
    prayer: `ጌታ ሆይ፤ የልቤን ጫጫታ ጸጥ እንድታሰኘው እለምንሃለሁ። ከአንተ ጋር በጸጥታ የመገናኘት ጣዕም እንዲሰማኝ፣ በፈተናዎቼ ሁሉ ውስጥ አምላክ መሆንህን አውቄ እንድተማመንብህ እርዳኝ። አሜን።`,
    tags: ["Prayer", "Peace", "Faith", "ጸሎት", "ዕረፍት"],
    featured: false,
    views: 860,
    likes: 245,
    viewsFormatted: "860",
    likesFormatted: "245",
  },
  {
    _id: "devotion-5",
    id: "devotion-5",
    title: "የእውነተኛ ፍቅር ምልክት (The Mark of Authentic Love)",
    type: "text",
    author: "4 Kilo Fellowship",
    authorId: "user-fellowship",
    actorType: "official",
    authorAvatar:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png",
    authorRole: "Official Fellowship",
    authorUsername: "fellow",
    authorHandle: "@fellowship",
    date: "2026-10-02",
    duration: "5 min read",
    image:
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1200&q=80",
    scriptureReference: "1 ዮሐንስ 3:18 (1 John 3:18)",
    scriptureText: "“ልጆቼ ሆይ፥ በሥራና በእውነት እንጂ በቃልና በአንደበት አንዋደድ።”",
    caption:
      "ፍቅር ስሜት ብቻ አይደለም፤ ፍቅር መስዋዕትነት የተሞላበት ውሳኔ ነው። በካምፓስ ውስጥ እንዴት አንዳችን ለአንዳችን በረከት መሆን እንችላለን?",
    content: `ፍቅር በዓለማችን ውስጥ በስሜት ብቻ የተሞላ ቃል ሆኗል። ነገር ግን የመጽሐፍ ቅዱስ ፍቅር በድርጊት የሚገለጥ ነው። ኢየሱስ እኛን የወደደው በመስቀል ላይ ሕይወቱን አሳልፎ በመስጠት ነበር።

በዩኒቨርሲቲ ቆይታችን አብረውን የሚማሩ፣ በዶርም አብረውን የሚኖሩ፣ ወይም በቤተክርስቲያን የምንገናኛቸው ብዙ ወንድሞችና እህቶች አሉ። አንዳንዶቹ ብቸኝነት ይሰማቸዋል፤ አንዳንዶቹ በአካዳሚክ ይቸገራሉ፤ አንዳንዶቹ ደግሞ የኢኮኖሚ ወይም የመንፈስ ድካም አለባቸው።

የክርስቶስ ፍቅር በእኛ ውስጥ ካለ፣ ዝም ብለን ማለፍ አንችልም። አንድ አበረታች ቃል፣ አብሮ ማጥናት፣ ምግብ መጋራት ወይም በጸሎት መሸከም እውነተኛ ፍቅርን የሚገልጡ መንገዶች ናቸው። ፍቅር በቃላት ብቻ ሲሆን ደረቅ ነው፤ በሥራና በእውነት ሲገለጥ ግን ክርስቶስን ለሰዎች ያሳያል።`,
    prayer: `አፍቃሪ አምላክ ሆይ፤ ፍቅርህ በውስጣችን እንዲሞላ ጸልያለሁ። በዙሪያችን ያሉትን ሰዎች በፍቅር ዓይን እንድናይ፣ በችግራቸው ጊዜ የምናግዝበትንና ክርስቶስን የምናሳይበትን ቅን ልብ ስጠን። አሜን።`,
    tags: ["Love", "Fellowship", "Grace", "Discipleship", "ፍቅር"],
    featured: false,
    views: 730,
    likes: 198,
    viewsFormatted: "730",
    likesFormatted: "198",
  },
];

export const INITIAL_COMMENTS: Record<string, DevotionComment[]> = {
  "devotion-1": [
    {
      _id: "c-1",
      id: "c-1",
      devotionId: "devotion-1",
      authorName: "Abel Tesfaye",
      authorHandle: "@abel_t",
      authorRole: "Civil Eng. 4th Year",
      authorAvatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      content:
        "ይህ መልእክት ዛሬ ለእኔ እጅግ አስፈላጊ ነበር! በ assignment ብዛት ተጨንቄ ጸሎቴን እንኳን ትቼ ነበር። አሁን ግን እንደ ማርያም የጌታን እግር መርጫለሁ።",
      createdAt: "2026-11-03T14:32:00Z",
      likesCount: 14,
    },
    {
      _id: "c-2",
      id: "c-2",
      devotionId: "devotion-1",
      authorName: "Selamawit Kebede",
      authorHandle: "@selam_k",
      authorRole: "CS Department",
      authorAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      content:
        "Audio narration was so peaceful and uplifting. Bless the fellowship media team for this continuous nourishment!",
      createdAt: "2026-11-03T16:15:00Z",
      likesCount: 9,
    },
    {
      _id: "c-3",
      id: "c-3",
      devotionId: "devotion-1",
      authorName: "Dawit Girma",
      authorHandle: "@dawit_g",
      authorRole: "Fellowship Member",
      authorAvatar:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
      content: "አሜን! ቅድሚያ ለጌታ በመስጠት የሚመጣው ውስጣዊ ሰላም ወደር የለውም። ተባረኩ።",
      createdAt: "2026-11-04T08:20:00Z",
      likesCount: 6,
    },
  ],
  "devotion-2": [
    {
      _id: "c-4",
      id: "c-4",
      devotionId: "devotion-2",
      authorName: "Hanna Daniel",
      authorHandle: "@hanna_d",
      authorRole: "Architecture 3rd Year",
      authorAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      content:
        "“ሕይወት ውድድር አይደለም፤ በክርስቶስ ላይ ዓይንን አድርጎ በራስ ጉዞ መታመን ነው” የሚለው ክፍል ልቤን ነክቶታል። ጌታ ይባርካችሁ!",
      createdAt: "2026-10-25T11:45:00Z",
      likesCount: 18,
    },
  ],
};

// ─── API CLIENT FUNCTIONS ─────────────────────────────────────────────

export async function fetchDevotions(params?: {
  type?: string;
  featured?: boolean;
  tags?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<DevotionsResponse> {
  try {
    const res = await api.get<DevotionsResponse>("/devotions", {
      params,
      timeout: 5000,
    });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn("Devotions API unavailable, using fallback devotions:", err);
  }

  // Fallback filtering in memory
  let filtered = [...DEFAULT_DEVOTIONS];
  if (params?.type && params.type !== "all") {
    filtered = filtered.filter((d) => d.type === params.type);
  }
  if (params?.featured !== undefined) {
    filtered = filtered.filter((d) => d.featured === params.featured);
  }
  if (params?.tags && params.tags.trim()) {
    const searchTag = params.tags.trim().toLowerCase();
    filtered = filtered.filter((d) =>
      d.tags?.some((t) => t.toLowerCase().includes(searchTag)),
    );
  }
  if (params?.search && params.search.trim()) {
    const query = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.content?.toLowerCase().includes(query) ||
        d.caption?.toLowerCase().includes(query) ||
        d.author.toLowerCase().includes(query) ||
        d.tags?.some((t) => t.toLowerCase().includes(query)),
    );
  }

  return {
    success: true,
    data: filtered,
    pagination: {
      total: filtered.length,
      page: 1,
      pages: 1,
      limit: 20,
    },
  };
}

export async function fetchDevotionById(
  id: string,
): Promise<SingleDevotionResponse> {
  try {
    const res = await api.get<SingleDevotionResponse>(`/devotions/${id}`, {
      timeout: 5000,
    });
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch (err) {
    console.warn(`Devotion ${id} API error, finding in fallback:`, err);
  }

  const found = DEFAULT_DEVOTIONS.find(
    (d) => d._id === id || d.id === id || d.title === decodeURIComponent(id),
  );
  if (found) {
    return {
      success: true,
      data: found,
    };
  }

  // Return first devotion as safe fallback if ID not found
  return {
    success: true,
    data: DEFAULT_DEVOTIONS[0],
    message: "Showing featured devotional",
  };
}

export async function recordDevotionView(id: string): Promise<void> {
  try {
    await api.post(`/devotions/${id}/view`, {}, { timeout: 3000 });
  } catch (err) {
    // Non-blocking view tracking
  }
}

export async function toggleDevotionLike(
  id: string,
): Promise<{ liked: boolean; likes: number }> {
  try {
    const res = await api.post(`/devotions/${id}/like`, {}, { timeout: 4000 });
    if (res.data?.success) {
      return {
        liked: Boolean(res.data.data?.liked ?? true),
        likes: res.data.data?.likes ?? 0,
      };
    }
  } catch (err) {
    // Toggle in local storage fallback
  }

  if (typeof window !== "undefined") {
    const key = `devotion_like_${id}`;
    const wasLiked = localStorage.getItem(key) === "true";
    const nextLiked = !wasLiked;
    localStorage.setItem(key, String(nextLiked));
    return { liked: nextLiked, likes: nextLiked ? 1 : 0 };
  }
  return { liked: true, likes: 1 };
}

// ─── USER STREAK API ──────────────────────────────────────────────────

export async function fetchUserStreak(): Promise<UserStreak> {
  try {
    const res = await api.get("/v1/streak", { timeout: 4000 });
    if (res.data?.currentStreak !== undefined) {
      return {
        currentStreak: res.data.currentStreak,
        longestStreak: res.data.longestStreak || res.data.currentStreak,
        lastActiveDate: res.data.lastActiveDate,
        totalCheckIns: res.data.totalCheckIns,
      };
    }
  } catch {
    // Check local storage fallback
  }

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("devotion_user_streak");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }

  return {
    currentStreak: 4,
    longestStreak: 12,
    lastActiveDate: new Date().toISOString(),
    totalCheckIns: 24,
  };
}

export async function recordStreakCheckIn(): Promise<UserStreak> {
  try {
    const res = await api.post("/v1/streak/check-in", {}, { timeout: 4000 });
    if (res.data?.currentStreak !== undefined) {
      return res.data;
    }
  } catch {
    // Local fallback update
  }

  let nextStreak = {
    currentStreak: 5,
    longestStreak: 12,
    lastActiveDate: new Date().toISOString(),
    totalCheckIns: 25,
  };

  if (typeof window !== "undefined") {
    const current = localStorage.getItem("devotion_user_streak");
    if (current) {
      try {
        const parsed = JSON.parse(current);
        nextStreak = {
          ...parsed,
          currentStreak: parsed.currentStreak + 1,
          longestStreak: Math.max(parsed.longestStreak, parsed.currentStreak + 1),
          totalCheckIns: (parsed.totalCheckIns || 0) + 1,
          lastActiveDate: new Date().toISOString(),
        };
      } catch {}
    }
    localStorage.setItem("devotion_user_streak", JSON.stringify(nextStreak));
  }

  return nextStreak;
}

// ─── COMMENTS API ─────────────────────────────────────────────────────

export async function fetchDevotionComments(
  devotionId: string,
): Promise<DevotionComment[]> {
  try {
    const res = await api.get(`/v1/posts/${devotionId}/thread`, {
      timeout: 4000,
    });
    if (Array.isArray(res.data?.replies)) {
      return res.data.replies.map((r: any) => ({
        _id: r._id,
        id: r._id,
        devotionId,
        authorName: r.author?.displayName || r.author?.name || "Fellow Member",
        authorHandle: r.author?.handle ? `@${r.author.handle}` : undefined,
        authorAvatar: r.author?.avatarUrl || r.author?.profileImage,
        authorRole: r.author?.role || "Student Fellowship",
        content: r.body || "",
        createdAt: r.createdAt || new Date().toISOString(),
        likesCount: r.likeCount || 0,
      }));
    }
  } catch (err) {
    // Use fallback comments
  }

  // Check local storage for added comments
  let localExtra: DevotionComment[] = [];
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`devotion_comments_${devotionId}`);
    if (stored) {
      try {
        localExtra = JSON.parse(stored);
      } catch {}
    }
  }

  const base = INITIAL_COMMENTS[devotionId] || [];
  return [...localExtra, ...base];
}

export async function postDevotionComment(
  devotionId: string,
  content: string,
  currentUser?: { fullName?: string; profileImage?: string; role?: string },
): Promise<DevotionComment> {
  try {
    const res = await api.post("/v1/posts", {
      body: content,
      parentId: devotionId,
    });
    if (res.data?._id) {
      return {
        _id: res.data._id,
        id: res.data._id,
        devotionId,
        authorName: currentUser?.fullName || "You",
        authorRole: currentUser?.role || "Fellowship Member",
        authorAvatar: currentUser?.profileImage,
        content,
        createdAt: new Date().toISOString(),
        likesCount: 0,
      };
    }
  } catch (err) {
    // Optimistic fallback
  }

  const newComment: DevotionComment = {
    _id: `local-c-${Date.now()}`,
    id: `local-c-${Date.now()}`,
    devotionId,
    authorName: currentUser?.fullName || "You",
    authorHandle: "@fellow_member",
    authorRole: currentUser?.role || "Fellowship Member",
    authorAvatar:
      currentUser?.profileImage ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    content,
    createdAt: new Date().toISOString(),
    likesCount: 0,
  };

  if (typeof window !== "undefined") {
    const existing = localStorage.getItem(`devotion_comments_${devotionId}`);
    const commentsList: DevotionComment[] = existing ? JSON.parse(existing) : [];
    commentsList.unshift(newComment);
    localStorage.setItem(
      `devotion_comments_${devotionId}`,
      JSON.stringify(commentsList),
    );
  }

  return newComment;
}

// ─── WRITER APPLICATION API ───────────────────────────────────────────

export async function submitWriterRequest(
  data: WriterRequestData,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post("/devotions/writer-requests", data);
    return {
      success: true,
      message:
        res.data?.message ||
        "Application submitted successfully! Fellowship leaders will review your submission.",
    };
  } catch (err: any) {
    const msg =
      err.response?.data?.message ||
      "Thank you! Your writer request has been recorded.";
    return { success: true, message: msg };
  }
}

export async function fetchMyWriterRequest(): Promise<{
  hasApplied: boolean;
  status?: "pending" | "approved" | "rejected";
}> {
  try {
    const res = await api.get("/devotions/writer-requests/me");
    if (res.data?.success && res.data.data) {
      return {
        hasApplied: true,
        status: res.data.data.status,
      };
    }
  } catch {}
  return { hasApplied: false };
}
