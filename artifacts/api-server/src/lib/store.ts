import { Registration } from "@workspace/db";

export interface EventStoreItem {
  id: number;
  title: string;
  category: string;
  venue: string;
  startTime: string;
  endTime: string;
  capacity: number;
  price: number;
  status: "draft" | "pending_approval" | "approved" | "published" | "rejected" | "closed";
  organizerId?: number;
  organizerName?: string;
  description?: string;
  bannerUrl?: string;
  submittedAt?: string;
  submittedBy?: number;
  approvedAt?: string;
  approvedBy?: number;
  rejectedAt?: string;
  rejectedBy?: number;
  rejectionReason?: string;
  createdAt: string;
  registeredCount: number;
  checkedInCount: number;
}

export interface PaymentLedgerEntry {
  orderId: string;
  paymentId?: string;
  signature?: string;
  eventId: number;
  userId: number;
  amount: number;
  currency: string;
  provider: "razorpay" | "upi" | "card";
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  createdAt: string;
  attendeeName?: string;
  attendeeEmail?: string;
  registration?: any;
}

export interface NotificationStoreItem {
  id: number;
  userId: number;
  type: "EVENT_SUBMITTED" | "EVENT_APPROVED" | "EVENT_REJECTED" | "VOLUNTEER_ASSIGNED" | "VOLUNTEER_APPLIED" | "PAYMENT_CONFIRMED" | "SYSTEM";
  title: string;
  message: string;
  relatedEventId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface VolunteerApplicationStoreItem {
  id: number;
  eventId: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: string;
  interests: string[];
  preferredRoles: string[];
  availability: string;
  resumeUrl?: string;
  resumeText?: string;
  status: "applied" | "shortlisted" | "assigned" | "rejected" | "withdrawn" | "completed";
  assignedRole?: string;
  matchScore: number;
  matchReason?: string;
  matchingSkills?: string[];
  skillGaps?: string[];
  appliedAt: string;
  updatedAt: string;
}

export interface VolunteerRequirementStoreItem {
  id: number;
  eventId: number;
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string;
  experienceRequirement: string;
  availabilityRequirement: string;
  numberRequired: number;
  createdAt: string;
}

// In-Memory Global Events Store
export const globalEvents: EventStoreItem[] = [
  {
    id: 1,
    title: "Spring Annual Hackathon & Tech Summit 2026",
    category: "Technology",
    venue: "Main Campus Auditorium, Block B",
    startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3 + 28800000).toISOString(),
    capacity: 500,
    price: 0, // Free event
    status: "published",
    approvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    approvedBy: 999,
    createdAt: new Date().toISOString(),
    registeredCount: 420,
    checkedInCount: 280,
  },
  {
    id: 2,
    title: "AI & Autonomous Robotics Masterclass",
    category: "Technology",
    venue: "Advanced Robotics Lab 4, Block C",
    startTime: new Date(Date.now() + 86400000 * 7).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 7 + 14400000).toISOString(),
    capacity: 200,
    price: 299, // Paid event ₹299
    status: "published",
    approvedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    approvedBy: 999,
    createdAt: new Date().toISOString(),
    registeredCount: 165,
    checkedInCount: 140,
  },
  {
    id: 3,
    title: "National Student Innovation Summit",
    category: "Academic",
    venue: "Grand Convention Center, Hall 1",
    startTime: new Date(Date.now() + 86400000 * 10).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 10 + 21600000).toISOString(),
    capacity: 350,
    price: 499, // Paid event ₹499
    status: "published",
    approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    approvedBy: 999,
    createdAt: new Date().toISOString(),
    registeredCount: 310,
    checkedInCount: 0,
  },
  {
    id: 4,
    title: "Campus Clean & Green Volunteer Drive",
    category: "Social",
    venue: "South Campus Botanical Grounds",
    startTime: new Date(Date.now() + 86400000 * 12).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 12 + 21600000).toISOString(),
    capacity: 150,
    price: 0, // Free event
    status: "published",
    approvedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    approvedBy: 999,
    createdAt: new Date().toISOString(),
    registeredCount: 110,
    checkedInCount: 0,
  },
];

export const globalEventPrices = new Map<number, number>([
  [1, 0],
  [2, 299],
  [3, 499],
  [4, 0],
]);

export const globalPaymentLedger = new Map<string, PaymentLedgerEntry>();
export const globalProcessedPayments = new Map<string, any>();
export const globalRegistrations = new Map<string, any>();

// In-Memory Volunteer Requirements
export const globalVolunteerRequirements: VolunteerRequirementStoreItem[] = [
  {
    id: 1,
    eventId: 1,
    role: "Registration Coordinator",
    requiredSkills: ["Communication", "Crowd Management", "Organization"],
    preferredSkills: ["Event Coordination", "QR Scanning", "Basic Computer Skills"],
    responsibilities: "Lead student check-in desks, scan cryptographic QR passes, distribute badges and attendee kits.",
    experienceRequirement: "1+ year prior college fest registration desk experience preferred.",
    availabilityRequirement: "Full Day (8:00 AM - 5:00 PM)",
    numberRequired: 3,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    eventId: 1,
    role: "Technical Support Specialist",
    requiredSkills: ["Technical Support", "Hardware Troubleshooting", "Networking"],
    preferredSkills: ["Python", "JavaScript", "Audio Systems"],
    responsibilities: "Manage stage AV equipment, projector feeds, hackathon lab power drops, and high-speed Wi-Fi desks.",
    experienceRequirement: "Hands-on engineering or IT lab background.",
    availabilityRequirement: "Full Day",
    numberRequired: 2,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 3,
    eventId: 1,
    role: "Media & Social Coverage Coordinator",
    requiredSkills: ["Photography", "Video Editing", "Graphic Design"],
    preferredSkills: ["Social Media Management", "Content Writing"],
    responsibilities: "Capture keynote highlights, record winner interviews, produce real-time campus reels and social posts.",
    experienceRequirement: "Portfolio of photo/video production.",
    availabilityRequirement: "Flexible Shifts",
    numberRequired: 2,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// In-Memory Realistic Volunteer Applications
export const globalVolunteerApplications: VolunteerApplicationStoreItem[] = [
  {
    id: 1,
    eventId: 1,
    userId: 4, // Volunteer A
    fullName: "Priya Patel (Volunteer A)",
    email: "priya.patel@university.edu",
    phone: "+91 98765 43210",
    skills: ["Communication", "Crowd Management", "Event Coordination", "Hospitality", "QR Scanning"],
    experience: "2 years organizing college tech festivals and registration desks. Managed 600+ attendee flows with zero bottlenecks.",
    interests: ["Technology", "Hackathons", "Hospitality"],
    preferredRoles: ["Registration Coordinator", "Entry Usher"],
    availability: "Full Day Available",
    resumeText: "PRIYA PATEL - Student Lead Coordinator. Skills: Communication, Crowd Management, Event Logistics, Fast QR Check-ins. Experience: 2 years lead coordinator for Annual Tech Fest registration desk.",
    status: "applied",
    matchScore: 94,
    matchReason: "Exceptional match for Registration Coordinator. Possesses 3 key required skills (Communication, Crowd Management, Organization) and 2+ years verified event registration experience.",
    matchingSkills: ["Communication", "Crowd Management", "Event Coordination", "QR Scanning"],
    skillGaps: [],
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    eventId: 1,
    userId: 5, // Volunteer B
    fullName: "Aarav Sharma (Volunteer B)",
    email: "aarav.sharma@university.edu",
    phone: "+91 98765 43211",
    skills: ["Graphic Design", "Video Editing", "Photography", "Social Media Management"],
    experience: "1 year media team lead for University Media Club. Produced 15+ aftermovies and reels.",
    interests: ["Media", "Design", "Cultural Events"],
    preferredRoles: ["Media & Social Coverage Coordinator", "Creative Lead"],
    availability: "Flexible Shifts",
    resumeText: "AARAV SHARMA - Visual Media Lead. Skills: Adobe Premiere Pro, Sony Alpha Photography, After Effects, Social Media Campaigns. Experience: 1 year university campus media coverage.",
    status: "applied",
    matchScore: 92,
    matchReason: "Outstanding match for Media & Social Coverage. Possesses all required photography, video editing, and social media production capabilities.",
    matchingSkills: ["Photography", "Video Editing", "Graphic Design", "Social Media Management"],
    skillGaps: [],
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    eventId: 1,
    userId: 6, // Volunteer C
    fullName: "Rohan Gupta (Volunteer C)",
    email: "rohan.gupta@university.edu",
    phone: "+91 98765 43212",
    skills: ["Python", "JavaScript", "Technical Support", "Hardware Troubleshooting", "Networking"],
    experience: "2 years technical coordinator for robotics and coding clubs. Managed server labs and Wi-Fi networks.",
    interests: ["Artificial Intelligence", "Robotics", "Hardware Hackathons"],
    preferredRoles: ["Technical Support Specialist", "Hackathon Lab Mentor"],
    availability: "Full Day Available",
    resumeText: "ROHAN GUPTA - CS Technical Lead. Skills: Linux, Python, Network Configuration, Audio-Visual Staging, Hardware Debugging. Experience: 2 years managing hackathon IT infrastructure.",
    status: "applied",
    matchScore: 95,
    matchReason: "Top recommendation for Technical Support Specialist. Demonstrates deep hardware, network troubleshooting, and live hackathon IT experience.",
    matchingSkills: ["Technical Support", "Hardware Troubleshooting", "Networking", "Python", "JavaScript"],
    skillGaps: [],
    appliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// In-Memory Persistent Notifications
export const globalNotifications: NotificationStoreItem[] = [
  {
    id: 1,
    userId: 1,
    type: "EVENT_APPROVED",
    title: "Event Approved: Spring Annual Hackathon 2026",
    message: "Admin approved your event. You can now publish it to make it live for students.",
    relatedEventId: 1,
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 2,
    userId: 999, // Admin ID
    type: "EVENT_SUBMITTED",
    title: "New Event Submitted for Approval",
    message: "Organizer ACM Chapter submitted 'AI Career Symposium' for approval.",
    relatedEventId: 3,
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

let nextNotificationId = 100;
let nextApplicationId = 10;
let nextRequirementId = 10;

export function addPersistentNotification(notification: Omit<NotificationStoreItem, "id" | "createdAt">): NotificationStoreItem {
  const item: NotificationStoreItem = {
    ...notification,
    id: nextNotificationId++,
    createdAt: new Date().toISOString(),
  };
  globalNotifications.unshift(item);
  return item;
}

export function getUserNotifications(userId?: number, role?: string): NotificationStoreItem[] {
  if (!userId) return [];
  if (role === "admin") {
    return globalNotifications.filter(n => n.userId === userId || n.userId === 999 || n.userId === 0);
  }
  return globalNotifications.filter(n => n.userId === userId);
}
