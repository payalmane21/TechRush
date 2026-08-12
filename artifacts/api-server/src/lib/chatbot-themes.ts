/**
 * Server-Side Predefined Chatbot Themes & Mascots System
 */

export type ThemeCategory = 
  | "TECH"
  | "SPORTS"
  | "CULTURAL"
  | "ACADEMIC"
  | "BUSINESS"
  | "ENTERTAINMENT"
  | "GENERAL";

export interface ChatbotThemeConfig {
  category: ThemeCategory;
  displayName: string;
  badgeLabel: string;
  assistantName: string;
  greetingSubtitle: string;
  accentColor: string;
  mascotSvg: string;
}

const DEFAULT_NOVA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="novaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#581c87" />
      <stop offset="50%" stop-color="#801b3b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="sparkGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#novaBg)" />
  <circle cx="100" cy="100" r="72" fill="none" stroke="url(#sparkGlow)" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.7" />
  <path d="M 65 60 Q 100 45 135 60 Q 140 115 100 145 Q 60 115 65 60 Z" fill="#ffffff" />
  <path d="M 72 68 Q 100 55 128 68 Q 132 110 100 136 Q 68 110 72 68 Z" fill="#801b3b" />
  <ellipse cx="86" cy="85" rx="5" ry="6" fill="#ffffff" />
  <circle cx="87" cy="84" r="2.5" fill="#1e1b4b" />
  <ellipse cx="114" cy="85" rx="5" ry="6" fill="#ffffff" />
  <circle cx="115" cy="84" r="2.5" fill="#1e1b4b" />
  <path d="M 92 100 Q 100 108 108 100" stroke="#fde047" stroke-width="3" fill="none" stroke-linecap="round" />
  <polygon points="100,42 125,52 100,62 75,52" fill="#1e1b4b" />
  <polygon points="100,44 121,52 100,60 79,52" fill="#d97706" />
  <line x1="125" y1="52" x2="128" y2="68" stroke="#fbbf24" stroke-width="2" />
  <circle cx="128" cy="69" r="3" fill="#fbbf24" />
  <polygon points="100,15 103,24 112,27 103,30 100,39 97,30 88,27 97,24" fill="#fbbf24" />
</svg>`;

const TECH_OWL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="techBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#311042" />
    </linearGradient>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="goldFeather" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#techBg)" />
  <circle cx="100" cy="100" r="75" fill="none" stroke="url(#neonGlow)" stroke-width="3" stroke-dasharray="8 6" opacity="0.6" />
  <path d="M 60 130 C 60 70, 140 70, 140 130 C 140 165, 60 165, 60 130 Z" fill="url(#goldFeather)" />
  <polygon points="65,75 78,50 90,75" fill="#38bdf8" />
  <polygon points="135,75 122,50 110,75" fill="#8b5cf6" />
  <rect x="58" y="85" width="84" height="28" rx="14" fill="#030712" stroke="url(#neonGlow)" stroke-width="3" />
  <circle cx="80" cy="99" r="8" fill="#06b6d4" />
  <circle cx="120" cy="99" r="8" fill="#ec4899" />
  <line x1="72" y1="99" x2="128" y2="99" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 3" />
  <polygon points="100,116 93,126 107,126" fill="#f59e0b" />
</svg>`;

const CULTURAL_FOX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="cultBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a044e" />
      <stop offset="50%" stop-color="#831843" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <linearGradient id="foxFur" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#cultBg)" />
  <circle cx="100" cy="100" r="75" fill="none" stroke="#f472b6" stroke-width="3" stroke-dasharray="6 4" opacity="0.5" />
  <polygon points="60,80 50,45 85,65" fill="#ea580c" />
  <polygon points="65,75 58,55 80,68" fill="#fed7aa" />
  <polygon points="140,80 150,45 115,65" fill="#ea580c" />
  <polygon points="135,75 142,55 120,68" fill="#fed7aa" />
  <path d="M 60 90 Q 100 65 140 90 Q 145 135 100 155 Q 55 135 60 90 Z" fill="url(#foxFur)" />
  <ellipse cx="80" cy="105" rx="6" ry="8" fill="#1e1b4b" />
  <circle cx="82" cy="103" r="2.5" fill="#ffffff" />
  <ellipse cx="120" cy="105" rx="6" ry="8" fill="#1e1b4b" />
  <circle cx="122" cy="103" r="2.5" fill="#ffffff" />
  <polygon points="100,126 95,120 105,120" fill="#1e1b4b" />
</svg>`;

const SPORTS_PANTHER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="sportsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14532d" />
      <stop offset="50%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="pantherGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#sportsBg)" />
  <path d="M 60 85 C 55 55, 145 55, 140 85 C 145 135, 55 135, 60 85 Z" fill="url(#pantherGold)" />
  <polygon points="62,65 52,40 75,55" fill="#b45309" />
  <polygon points="138,65 148,40 125,55" fill="#b45309" />
  <polygon points="75,90 90,92 78,98" fill="#1e1b4b" />
  <polygon points="125,90 110,92 122,98" fill="#1e1b4b" />
</svg>`;

export const SERVER_CHATBOT_THEMES: Record<ThemeCategory, ChatbotThemeConfig> = {
  TECH: {
    category: "TECH",
    displayName: "Technology & Innovation",
    badgeLabel: "TECH ASSISTANT",
    assistantName: "Byte the Cyber Owl",
    greetingSubtitle: "AI & Hackathon Concierge",
    accentColor: "#6366f1",
    mascotSvg: TECH_OWL_SVG,
  },
  CULTURAL: {
    category: "CULTURAL",
    displayName: "Cultural & Performing Arts",
    badgeLabel: "CULTURAL ASSISTANT",
    assistantName: "Aria the Melody Fox",
    greetingSubtitle: "Arts & Celebration Concierge",
    accentColor: "#ec4899",
    mascotSvg: CULTURAL_FOX_SVG,
  },
  SPORTS: {
    category: "SPORTS",
    displayName: "Sports & Athletics",
    badgeLabel: "SPORTS ASSISTANT",
    assistantName: "Bolt the Lightning Panther",
    greetingSubtitle: "Athletics & Tournament Concierge",
    accentColor: "#eab308",
    mascotSvg: SPORTS_PANTHER_SVG,
  },
  ACADEMIC: {
    category: "ACADEMIC",
    displayName: "Academic & Science Labs",
    badgeLabel: "ACADEMIC ASSISTANT",
    assistantName: "Atom the Discovery Otter",
    greetingSubtitle: "Research & Workshop Concierge",
    accentColor: "#10b981",
    mascotSvg: DEFAULT_NOVA_SVG,
  },
  BUSINESS: {
    category: "BUSINESS",
    displayName: "Business & Leadership",
    badgeLabel: "EXECUTIVE ASSISTANT",
    assistantName: "Apex the Visionary Falcon",
    greetingSubtitle: "Summit & Pitch Deck Concierge",
    accentColor: "#0284c7",
    mascotSvg: DEFAULT_NOVA_SVG,
  },
  ENTERTAINMENT: {
    category: "ENTERTAINMENT",
    displayName: "Entertainment & Fest",
    badgeLabel: "FEST ASSISTANT",
    assistantName: "Aria the Melody Fox",
    greetingSubtitle: "Campus Fest Concierge",
    accentColor: "#a855f7",
    mascotSvg: CULTURAL_FOX_SVG,
  },
  GENERAL: {
    category: "GENERAL",
    displayName: "Campus Events Concierge",
    badgeLabel: "CAMPUS ASSISTANT",
    assistantName: "Nova the Campus Spark",
    greetingSubtitle: "Official EventHub Concierge",
    accentColor: "#801b3b",
    mascotSvg: DEFAULT_NOVA_SVG,
  },
};

export function resolveServerThemeCategory(category?: string, title?: string): ThemeCategory {
  const cat = (category || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (cat.includes("tech") || cat.includes("code") || cat.includes("hack") || t.includes("tech") || t.includes("hackathon") || t.includes("ai") || t.includes("robot")) {
    return "TECH";
  }
  if (cat.includes("sport") || cat.includes("athletic") || cat.includes("fitness") || t.includes("sports") || t.includes("cricket") || t.includes("football") || t.includes("tournament")) {
    return "SPORTS";
  }
  if (cat.includes("cultur") || cat.includes("art") || cat.includes("music") || cat.includes("dance") || t.includes("music") || t.includes("dance") || t.includes("gala")) {
    return "CULTURAL";
  }
  if (cat.includes("acad") || cat.includes("sci") || cat.includes("research") || t.includes("workshop") || t.includes("seminar") || t.includes("science")) {
    return "ACADEMIC";
  }
  if (cat.includes("busin") || cat.includes("entrepreneur") || cat.includes("lead") || t.includes("startup") || t.includes("pitch") || t.includes("summit")) {
    return "BUSINESS";
  }
  if (cat.includes("entertain") || cat.includes("fest") || cat.includes("social") || t.includes("fest")) {
    return "ENTERTAINMENT";
  }

  return "GENERAL";
}

export function serverSvgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
