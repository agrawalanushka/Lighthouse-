export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  university: "NTU" | "NUS" | "SMU" | "SIT" | "OTHER";
  yearOfStudy: 1 | 2 | 3 | 4;
  major: string;
  skills: string[];
  targetRoles: string[];
  interests: ("ml" | "web" | "mobile" | "data" | "systems" | "security")[];
  createdAt: string;
  updatedAt: string;
};

export type Skill = {
  id: string;
  name: string;
  category: "language" | "framework" | "tool" | "concept";
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  requiredSkills: string[];
  description: string;
  url: string;
  postedAt: string;
  matchPercentage?: number;
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  relevantSkills: string[];
};

export type PulseItem = {
  id: string;
  headline: string;
  summary: string;
  relevance: string;
  url: string;
  source: string;
  publishedAt: string;
};

export type PulseDigest = {
  id: string;
  userId: string;
  weekOf: string;
  // General: how AI is reshaping the tech industry broadly (not user-specific)
  generalItems: PulseItem[];
  // Personalized: matched to the user's skills + target roles from onboarding
  personalizedItems: PulseItem[];
  generatedAt: string;
};

export type RiskScore = {
  roleId: string;
  roleName: string;
  score: number;
  reasoning: string;
  sources: string[];
  industry: string;
  seniority: "junior" | "mid" | "senior";
};

export type SkillGap = {
  userId: string;
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
};

export type DashboardSnapshot = {
  userId: string;
  pulseItem: PulseItem;
  topJobs: (Job & { matchPercentage: number })[];
  riskScore: RiskScore;
  skillGap: SkillGap;
  weeklyFocus: string;
  generatedAt: string;
};
