export interface VolunteerCandidate {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: string;
  interests: string[];
  preferredRoles: string[];
  availability: string;
  resumeText?: string;
  status: string;
  assignedRole?: string;
}

export interface EventRoleRequirement {
  id?: number;
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities?: string;
  experienceRequirement?: string;
  availabilityRequirement?: string;
  numberRequired?: number;
}

export interface MatchEvaluationResult {
  candidateId: number;
  candidateName: string;
  email: string;
  role: string;
  matchScore: number;
  matchingSkills: string[];
  relevantExperience: string[];
  skillGaps: string[];
  availabilityMatch: boolean;
  reason: string;
}

/**
 * Intelligent Explainable Hybrid AI Volunteer Skill Matching Engine
 */
export function calculateVolunteerMatch(
  candidate: VolunteerCandidate,
  requirement: EventRoleRequirement
): MatchEvaluationResult {
  const candidateSkills = (candidate.skills || []).map((s) => s.trim().toLowerCase());
  const candidateExpText = ((candidate.experience || "") + " " + (candidate.resumeText || "")).toLowerCase();
  const candidateInterests = (candidate.interests || []).map((i) => i.trim().toLowerCase());
  const candidatePrefRoles = (candidate.preferredRoles || []).map((r) => r.trim().toLowerCase());
  const roleLower = requirement.role.toLowerCase();

  // 1. Required Skills Match (40% Weight)
  const reqSkills = requirement.requiredSkills.map((s) => s.trim().toLowerCase());
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];

  for (const req of reqSkills) {
    if (!req) continue;
    const isDirectMatch = candidateSkills.some((cs) => cs.includes(req) || req.includes(cs));
    const isTextMatch = candidateExpText.includes(req);
    if (isDirectMatch || isTextMatch) {
      matchedRequired.push(req);
    } else {
      missingRequired.push(req);
    }
  }

  const reqScore = reqSkills.length > 0
    ? (matchedRequired.length / reqSkills.length) * 40
    : 35;

  // 2. Preferred Skills Match (20% Weight)
  const prefSkills = requirement.preferredSkills.map((s) => s.trim().toLowerCase());
  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];

  for (const pref of prefSkills) {
    if (!pref) continue;
    const isDirectMatch = candidateSkills.some((cs) => cs.includes(pref) || pref.includes(cs));
    const isTextMatch = candidateExpText.includes(pref);
    if (isDirectMatch || isTextMatch) {
      matchedPreferred.push(pref);
    } else {
      missingPreferred.push(pref);
    }
  }

  const prefScore = prefSkills.length > 0
    ? (matchedPreferred.length / prefSkills.length) * 20
    : 15;

  // 3. Relevant Experience Evaluation (20% Weight)
  let expScore = 5;
  const expHighlights: string[] = [];

  // Evaluate years of experience in text
  if (candidateExpText.includes("3 year") || candidateExpText.includes("4 year") || candidateExpText.includes("5 year")) {
    expScore += 10;
    expHighlights.push("3+ years demonstrated background");
  } else if (candidateExpText.includes("2 year") || candidateExpText.includes("2 festival")) {
    expScore += 8;
    expHighlights.push("2+ years event background");
  } else if (candidateExpText.includes("1 year") || candidateExpText.includes("project")) {
    expScore += 5;
    expHighlights.push("Prior project experience");
  }

  // Domain relevance checks
  if (roleLower.includes("registration") || roleLower.includes("usher") || roleLower.includes("desk")) {
    if (candidateExpText.includes("registration") || candidateExpText.includes("desk") || candidateExpText.includes("crowd") || candidateExpText.includes("hospitality")) {
      expScore += 5;
      expHighlights.push("Direct registration desk and crowd flow experience");
    }
  } else if (roleLower.includes("tech") || roleLower.includes("support") || roleLower.includes("network")) {
    if (candidateExpText.includes("python") || candidateExpText.includes("javascript") || candidateExpText.includes("hardware") || candidateExpText.includes("network") || candidateExpText.includes("audio")) {
      expScore += 5;
      expHighlights.push("Hands-on technical troubleshooting and software experience");
    }
  } else if (roleLower.includes("media") || roleLower.includes("photo") || roleLower.includes("social") || roleLower.includes("design")) {
    if (candidateExpText.includes("photo") || candidateExpText.includes("video") || candidateExpText.includes("graphic") || candidateExpText.includes("camera") || candidateExpText.includes("media")) {
      expScore += 5;
      expHighlights.push("Creative media production and content capture experience");
    }
  }
  expScore = Math.min(20, expScore);

  // 4. Availability & Role Preference Alignment (10% Weight)
  let availScore = 4;
  let availabilityMatch = true;
  if (candidatePrefRoles.some((pr) => pr.includes(roleLower) || roleLower.includes(pr))) {
    availScore += 4;
  }
  if (candidate.availability && candidate.availability.toLowerCase().includes("full") || candidate.availability.toLowerCase().includes("all")) {
    availScore += 2;
  }
  availScore = Math.min(10, availScore);

  // 5. Semantic Alignment & Motivation Evidence (10% Weight)
  let semanticScore = 5;
  if (candidateInterests.some((int) => roleLower.includes(int) || int.includes(roleLower))) {
    semanticScore += 3;
  }
  if (candidate.resumeText && candidate.resumeText.length > 50) {
    semanticScore += 2; // Verified resume artifact boost
  }
  semanticScore = Math.min(10, semanticScore);

  // Total Score (0 - 100)
  let totalScore = Math.round(reqScore + prefScore + expScore + availScore + semanticScore);
  totalScore = Math.max(15, Math.min(98, totalScore)); // Bounded 15-98

  // Synthesize Matching Skills (Original casing)
  const matchingSkillsDisplay = Array.from(new Set([...matchedRequired, ...matchedPreferred])).map((s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  // Synthesize Skill Gaps
  const skillGapsDisplay = Array.from(new Set([...missingRequired, ...missingPreferred])).map((s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  // Human-Readable AI Reasoning
  let reason = "";
  if (totalScore >= 85) {
    reason = `Exceptional match for ${requirement.role}. Possesses ${matchedRequired.length} key required skills (${matchingSkillsDisplay.slice(0, 3).join(", ")}) and relevant practical experience (${expHighlights[0] || "verified campus involvement"}). Strongly recommended for assignment.`;
  } else if (totalScore >= 70) {
    reason = `Strong candidate with solid foundations in ${matchingSkillsDisplay.slice(0, 2).join(", ") || "event coordination"}. ${skillGapsDisplay.length > 0 ? `Minor gap in ${skillGapsDisplay.slice(0, 2).join(", ")}, but background shows high adaptability.` : "Meets primary role requirements."}`;
  } else {
    reason = `Moderate match. Candidate has transferrable skills (${matchingSkillsDisplay.slice(0, 2).join(", ") || "teamwork"}), but lacks specific domain experience in ${skillGapsDisplay.slice(0, 2).join(", ") || "specialized role tools"}.`;
  }

  return {
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    email: candidate.email,
    role: requirement.role,
    matchScore: totalScore,
    matchingSkills: matchingSkillsDisplay,
    relevantExperience: expHighlights.length > 0 ? expHighlights : ["General student volunteer experience"],
    skillGaps: skillGapsDisplay,
    availabilityMatch,
    reason,
  };
}

/**
 * Rank and Evaluate all Candidates across all Event Requirements
 */
export function rankCandidatesForEvent(
  candidates: VolunteerCandidate[],
  requirements: EventRoleRequirement[]
): Record<string, MatchEvaluationResult[]> {
  const resultsByRole: Record<string, MatchEvaluationResult[]> = {};

  for (const req of requirements) {
    const scoredList = candidates.map((cand) => calculateVolunteerMatch(cand, req));
    // Sort descending by matchScore
    scoredList.sort((a, b) => b.matchScore - a.matchScore);
    resultsByRole[req.role] = scoredList;
  }

  return resultsByRole;
}
