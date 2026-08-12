/**
 * AI Event Mascot Generator Service
 * Generates tailored, domain-specific mascot characters with high-resolution visual SVG assets.
 */

export interface MascotGenerationInput {
  title?: string;
  description?: string;
  category?: string;
  theme?: string;
  keywords?: string[] | string;
}

export interface GeneratedMascotResult {
  mascotName: string;
  personality: string;
  category: string;
  prompt: string;
  mascotUrl: string;
  tags: string[];
  themeColor: string;
}

// Preset visual themes and high-fidelity SVG mascot avatars
const MASCOT_PROFILES: Record<string, {
  name: string;
  personality: string;
  prompt: string;
  tags: string[];
  themeColor: string;
  svgIcon: string;
}> = {
  technology: {
    name: "Byte the Cyber Owl",
    personality: "Hyper-intelligent, sleepless coder who thrives during 24-hour hackathons and loves debugging neural networks.",
    prompt: "A futuristic neon cyber-owl wearing sleek holographic VR glasses, vibrant cyan and violet glowing circuitry, holding a floating glass laptop, 3D modern digital mascot art style, collegiate innovation emblem.",
    tags: ["Hackathon", "AI & Robotics", "Cyberpunk", "Innovation"],
    themeColor: "#6366f1",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
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
  
  <!-- Cyber Owl Body -->
  <path d="M 60 130 C 60 70, 140 70, 140 130 C 140 165, 60 165, 60 130 Z" fill="url(#goldFeather)" />
  
  <!-- Owl Ears / Horns -->
  <polygon points="65,75 78,50 90,75" fill="#38bdf8" />
  <polygon points="135,75 122,50 110,75" fill="#8b5cf6" />
  
  <!-- VR Goggles / Visor -->
  <rect x="58" y="85" width="84" height="28" rx="14" fill="#030712" stroke="url(#neonGlow)" stroke-width="3" />
  <circle cx="80" cy="99" r="8" fill="#06b6d4" />
  <circle cx="120" cy="99" r="8" fill="#ec4899" />
  <line x1="72" y1="99" x2="128" y2="99" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 3" />
  
  <!-- Beak -->
  <polygon points="100,116 93,126 107,126" fill="#f59e0b" />
  
  <!-- Chest Matrix Emblem -->
  <circle cx="100" cy="142" r="12" fill="#0f172a" stroke="#06b6d4" stroke-width="2" />
  <path d="M 100 135 L 100 149 M 93 142 L 107 142" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" />
  
  <!-- Floating Microchip sparks -->
  <circle cx="45" cy="65" r="3" fill="#22d3ee" opacity="0.8" />
  <circle cx="155" cy="70" r="4" fill="#ec4899" opacity="0.8" />
  <circle cx="160" cy="140" r="2.5" fill="#a855f7" opacity="0.9" />
</svg>`,
  },

  cultural: {
    name: "Aria the Melody Fox",
    personality: "Vibrant, creative spirit who connects artists, dancers, and musicians with magnetic rhythm and color.",
    prompt: "An energetic artistic festival fox mascot holding a glowing paintbrush and golden musical treble cleft, surrounded by kaleidoscope light bursts, expressive friendly face, campus cultural festival emblem.",
    tags: ["Music & Arts", "Cultural Fest", "Creativity", "Stage Performance"],
    themeColor: "#ec4899",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
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
  
  <!-- Fox Ears -->
  <polygon points="60,80 50,45 85,65" fill="#ea580c" />
  <polygon points="65,75 58,55 80,68" fill="#fed7aa" />
  <polygon points="140,80 150,45 115,65" fill="#ea580c" />
  <polygon points="135,75 142,55 120,68" fill="#fed7aa" />
  
  <!-- Fox Head -->
  <path d="M 60 90 Q 100 65 140 90 Q 145 135 100 155 Q 55 135 60 90 Z" fill="url(#foxFur)" />
  
  <!-- White Cheeks -->
  <path d="M 65 110 Q 80 135 100 145 Q 120 135 135 110 Q 100 130 65 110 Z" fill="#ffffff" />
  
  <!-- Eyes -->
  <ellipse cx="80" cy="105" rx="6" ry="8" fill="#1e1b4b" />
  <circle cx="82" cy="103" r="2.5" fill="#ffffff" />
  <ellipse cx="120" cy="105" rx="6" ry="8" fill="#1e1b4b" />
  <circle cx="122" cy="103" r="2.5" fill="#ffffff" />
  
  <!-- Nose & Smile -->
  <polygon points="100,126 95,120 105,120" fill="#1e1b4b" />
  <path d="M 95 130 Q 100 135 105 130" stroke="#1e1b4b" stroke-width="2" fill="none" stroke-linecap="round" />
  
  <!-- Musical Notes / Sparkles -->
  <path d="M 45 60 Q 45 50 55 50 L 55 70" stroke="#fde047" stroke-width="2.5" fill="none" />
  <circle cx="45" cy="70" r="4" fill="#fde047" />
  <path d="M 155 60 Q 155 50 165 50 L 165 70" stroke="#f472b6" stroke-width="2.5" fill="none" />
  <circle cx="155" cy="70" r="4" fill="#f472b6" />
</svg>`,
  },

  sports: {
    name: "Bolt the Lightning Panther",
    personality: "Relentless athletic energy, agility, and champion teamwork mindset leading campus athletics to victory.",
    prompt: "An agile electric blue and golden panther in a numbered varsity sports jersey, sprinting with lightning trails, bold collegiate athletics emblem, high energy sports mascot style.",
    tags: ["Athletics", "Championship", "Fitness", "College Sports"],
    themeColor: "#eab308",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
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
  <polygon points="100,20 170,165 30,165" fill="none" stroke="#facc15" stroke-width="2.5" opacity="0.4" />
  
  <!-- Panther Head -->
  <path d="M 60 85 C 55 55, 145 55, 140 85 C 145 135, 55 135, 60 85 Z" fill="url(#pantherGold)" />
  
  <!-- Ears -->
  <polygon points="62,65 52,40 75,55" fill="#b45309" />
  <polygon points="138,65 148,40 125,55" fill="#b45309" />
  
  <!-- Fierce Eyes -->
  <polygon points="75,90 90,92 78,98" fill="#1e1b4b" />
  <polygon points="125,90 110,92 122,98" fill="#1e1b4b" />
  <circle cx="82" cy="94" r="2" fill="#22c55e" />
  <circle cx="118" cy="94" r="2" fill="#22c55e" />
  
  <!-- Lightning Bolt Snout -->
  <polygon points="100,105 106,118 97,118 103,130 94,120 101,120" fill="#fef08a" stroke="#78350f" stroke-width="1" />
  
  <!-- Whiskers -->
  <line x1="50" y1="115" x2="80" y2="112" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="52" y1="125" x2="80" y2="118" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="150" y1="115" x2="120" y2="112" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="148" y1="125" x2="120" y2="118" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
</svg>`,
  },

  business: {
    name: "Apex the Visionary Falcon",
    personality: "Sharp strategist with keen market vision, guiding startup pitch competitors and business leaders to executive success.",
    prompt: "A sophisticated golden falcon mascot in a sleek modern charcoal blazer with a glowing startup venture emblem, analytical posture, leadership excellence art style.",
    tags: ["Leadership", "Pitch Deck", "Finance & Startups", "Keynote"],
    themeColor: "#0284c7",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bizBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#082f49" />
      <stop offset="50%" stop-color="#0c4a6e" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="falconFeather" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bizBg)" />
  <circle cx="100" cy="100" r="70" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.5" />
  
  <!-- Falcon Head -->
  <path d="M 70 70 Q 100 45 130 70 Q 145 110 100 135 Q 55 110 70 70 Z" fill="url(#falconFeather)" />
  
  <!-- Hooked Beak -->
  <path d="M 92 95 Q 108 95 112 110 Q 100 128 92 115 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
  
  <!-- Focused Eye -->
  <circle cx="85" cy="85" r="7" fill="#ffffff" />
  <circle cx="85" cy="85" r="4" fill="#0f172a" />
  <circle cx="86" cy="84" r="1.5" fill="#38bdf8" />
  
  <!-- Executive Collar & Tie -->
  <polygon points="80,140 100,165 120,140 100,135" fill="#f8fafc" />
  <polygon points="96,145 104,145 102,175 98,175" fill="#0284c7" />
</svg>`,
  },

  science: {
    name: "Atom the Discovery Otter",
    personality: "Curious, hands-on scientific explorer always experimenting with molecular physics, robotics, and clean energy.",
    prompt: "An adorable inquisitive river otter wearing safety goggles and a miniature laboratory coat, holding an orbital atom ring model with glowing energy sparks, STEM workshop style.",
    tags: ["STEM", "Research & Labs", "Workshop", "Hands-on Discovery"],
    themeColor: "#10b981",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="sciBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#065f46" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="otterFur" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a16207" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#sciBg)" />
  <ellipse cx="100" cy="100" rx="75" ry="30" fill="none" stroke="#34d399" stroke-width="2" transform="rotate(-30 100 100)" opacity="0.6" />
  <ellipse cx="100" cy="100" rx="75" ry="30" fill="none" stroke="#6ee7b7" stroke-width="2" transform="rotate(30 100 100)" opacity="0.6" />
  
  <!-- Otter Head -->
  <circle cx="100" cy="100" r="42" fill="url(#otterFur)" />
  <circle cx="65" cy="75" r="10" fill="#78350f" />
  <circle cx="135" cy="75" r="10" fill="#78350f" />
  
  <!-- Snout -->
  <ellipse cx="100" cy="112" rx="22" ry="16" fill="#fef3c7" />
  <polygon points="100,105 93,98 107,98" fill="#1e1b4b" />
  <ellipse cx="85" cy="94" rx="5" ry="6" fill="#1e1b4b" />
  <circle cx="86" cy="92" r="2" fill="#ffffff" />
  <ellipse cx="115" cy="94" rx="5" ry="6" fill="#1e1b4b" />
  <circle cx="116" cy="92" r="2" fill="#ffffff" />
  
  <!-- Lab Goggles on Head -->
  <rect x="70" y="65" width="26" height="18" rx="8" fill="#10b981" opacity="0.8" stroke="#34d399" stroke-width="2" />
  <rect x="104" y="65" width="26" height="18" rx="8" fill="#10b981" opacity="0.8" stroke="#34d399" stroke-width="2" />
  <line x1="96" y1="74" x2="104" y2="74" stroke="#34d399" stroke-width="3" />
</svg>`,
  },
};

/**
 * Generate a tailored Mascot based on event properties
 */
export function generateEventMascot(input: MascotGenerationInput): GeneratedMascotResult {
  const catInput = (input.category || "").toLowerCase();
  const combined = `${input.title || ""} ${input.description || ""} ${input.category || ""} ${input.theme || ""} ${Array.isArray(input.keywords) ? input.keywords.join(" ") : input.keywords || ""}`.toLowerCase();

  let matchedCategory = "technology";

  if (catInput === "cultural" || catInput === "arts" || catInput === "music" || (!catInput && (combined.includes("music") || combined.includes("art") || combined.includes("dance") || combined.includes("cultural") || combined.includes("drama")))) {
    matchedCategory = "cultural";
  } else if (catInput === "sports" || (!catInput && (combined.includes("sports") || combined.includes("cricket") || combined.includes("football") || combined.includes("athletics") || combined.includes("marathon")))) {
    matchedCategory = "sports";
  } else if (catInput === "business" || catInput === "entrepreneurship" || (!catInput && (combined.includes("startup") || combined.includes("pitch") || combined.includes("leadership") || combined.includes("finance") || combined.includes("summit")))) {
    matchedCategory = "business";
  } else if (catInput === "science" || catInput === "academic" || (!catInput && (combined.includes("science") || combined.includes("research") || combined.includes("lab") || combined.includes("biology") || combined.includes("physics")))) {
    matchedCategory = "science";
  } else {
    matchedCategory = "technology";
  }

  const profile = MASCOT_PROFILES[matchedCategory] || MASCOT_PROFILES.technology;

  // Convert SVG string to base64 Data URL for universal cross-browser image rendering
  const base64Svg = Buffer.from(profile.svgIcon).toString("base64");
  const mascotUrl = `data:image/svg+xml;base64,${base64Svg}`;

  // Custom prompt tailored to the event title
  const dynamicPrompt = input.title 
    ? `${profile.prompt} Specifically customized for '${input.title}'.` 
    : profile.prompt;

  return {
    mascotName: profile.name,
    personality: profile.personality,
    category: matchedCategory,
    prompt: dynamicPrompt,
    mascotUrl,
    tags: profile.tags,
    themeColor: profile.themeColor,
  };
}
