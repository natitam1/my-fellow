/**
 * Utility functions for detecting and formatting scripture verses and quotes
 * in Ethiopian fellowship reflections (Amharic & English).
 */

export interface ParsedScripture {
  quote: string;
  reference: string;
  remainingText: string;
}

// Common scripture detection patterns:
// 1. “Quote...” — Reference
// 2. "Quote..." - Reference
// 3. «Quote...» — Reference (Amharic style)
const SCRIPTURE_QUOTE_REGEX = /^[“"«]([\s\S]+?)[”"»]\s*[—–-]\s*([A-Za-z0-9\u1200-\u137F\s:,-]+?)(?:\r?\n\r?\n|\n|$)/;

// Also match embedded quote anywhere in text
const EMBEDDED_SCRIPTURE_REGEX = /[“"«]([\s\S]+?)[”"»]\s*[—–-]\s*([A-Za-z0-9\u1200-\u137F\s:,-]+?)(?:\r?\n|$)/;

export function parseScriptureQuote(text: string | null | undefined): ParsedScripture | null {
  if (!text) return null;

  const trimmed = text.trim();

  // Try matching leading quote
  let match = trimmed.match(SCRIPTURE_QUOTE_REGEX);
  if (match) {
    const quote = match[1].trim();
    const reference = match[2].trim();
    const remainingText = trimmed.replace(match[0], "").trim();
    if (quote && reference) {
      return { quote, reference, remainingText };
    }
  }

  // Try matching embedded quote
  match = trimmed.match(EMBEDDED_SCRIPTURE_REGEX);
  if (match) {
    const quote = match[1].trim();
    const reference = match[2].trim();
    const remainingText = trimmed.replace(match[0], "").trim();
    if (quote && reference) {
      return { quote, reference, remainingText };
    }
  }

  return null;
}

export const POPULAR_CAMPUS_VERSES = [
  {
    ref: "Matthew 18:20",
    text: "For where two or three gather in my name, there am I with them.",
    lang: "en",
  },
  {
    ref: "Proverbs 3:5-6",
    text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    lang: "en",
  },
  {
    ref: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    lang: "en",
  },
  {
    ref: "Philippians 4:6-7",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    lang: "en",
  },
  {
    ref: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
    lang: "en",
  },
  {
    ref: "መዝሙር 23:1",
    text: "እግዚአብሔር እረኛዬ ነው፤ የሚያሳጣኝም የለም።",
    lang: "am",
  },
  {
    ref: "መዝሙር 27:1",
    text: "እግዚአብሔር ብርሃኔና መድኃኒቴ ነው፤ የሚያስፈራኝ ማን ነው?",
    lang: "am",
  },
  {
    ref: "ኢሳይያስ 40:31",
    text: "እግዚአብሔርን በመተማመን የሚጠባበቁ ግን ኃይላቸውን ያድሳሉ፤ እንደ ንስር በክንፍ ይወጣሉ፤ ይሮጣሉ አይታክቱም፤ ይሄዳሉ አይደክሙም።",
    lang: "am",
  },
];
