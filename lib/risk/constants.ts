// Real, sourced AEI/O*NET constants used to compute RiskScore via:
//   score = 100 * coverage * (AUGMENTATION_WEIGHT * augShare + AUTOMATION_WEIGHT * autoShare)
//
// Provenance is intentionally kept inline (not abstracted away) since this is
// the methodology surface the risk feature has to be able to justify on demand.

// Automation (AI fully performs the task) counts fully toward risk. Augmentation
// (AI assists, human stays in the loop) counts partially — weighted up slightly
// from the original 0.5 to better reflect that AI-assisted tasks still meaningfully
// reshape the role, not just fully-automated ones.
export const AUTOMATION_WEIGHT = 1.0;
export const AUGMENTATION_WEIGHT = 0.6;

// Global per-occupation AI exposure ("Intervention Breadth" / coverage).
// Source: Anthropic Economic Index, release_2026_03_24,
//   labor_market_impacts/job_exposure.csv — observed_exposure column.
// Keyed by 6-digit BLS SOC family. The file does not break out O*NET detail
// occupations (e.g. 15-1299.04 Penetration Testers, 15-1299.05 Information
// Security Engineers, 15-1299.06 Digital Forensics Analysts, 15-1299.08
// Computer Systems Engineers/Architects all fold into the "15-1299 Computer
// Occupations, All Other" family below) — disclosed in reasoning text per role.
export const GLOBAL_EXPOSURE_BY_SOC: Record<string, number> = {
  "13-1041": 0.1211, // Compliance Officers
  "13-1111": 0.2435, // Management Analysts
  "15-1212": 0.4859, // Information Security Analysts
  "15-1221": 0.3404, // Computer and Information Research Scientists
  "15-1241": 0.1987, // Computer Network Architects
  "15-1242": 0.3315, // Database Administrators
  "15-1243": 0.5787, // Database Architects (also covers 15-1243.01 Data Warehousing Specialists)
  "15-1244": 0.3373, // Network and Computer Systems Administrators
  "15-1252": 0.288, // Software Developers
  "15-1254": 0.4802, // Web Developers
  "15-1255": 0.249, // Web and Digital Interface Designers
  "15-1299": 0.3106, // Computer Occupations, All Other
  "15-2031": 0.4288, // Operations Research Analysts
  "15-2051": 0.4605, // Data Scientists (also covers 15-2051.01 Business Intelligence Analysts)
  "17-2061": 0.1453, // Computer Hardware Engineers
};

// Singapore-specific "Intervention Mode" split (automation vs. augmentation).
// Source: Anthropic Economic Index, release_2026_03_24,
//   aei_raw_claude_ai_2026-02-05_to_2026-02-12.csv, geo_id=SG, facet=collaboration.
// Raw SG collaboration-pattern shares: directive 29.02%, feedback loop 9.73%,
// task iteration 25.88%, learning 26.53%, validation 6.07%, none 2.76%.
// "directive" (AI executes per instruction) is treated as automation; the other
// four interactive patterns are treated as augmentation. Normalized excluding
// "none" (no AI collaboration at all), since that share reflects no AI usage.
export const SG_AUTO_SHARE = 0.2985;
export const SG_AUG_SHARE = 0.7015;

// Seniority shifts the auto/aug split (not coverage) — junior work skews toward
// directive/automatable tasks, senior work skews toward oversight/augmentation.
// This is a disclosed interpretive layer, not raw AEI data.
export const SENIORITY_SHIFT: Record<"junior" | "mid" | "senior", number> = {
  junior: 0.08,
  mid: 0,
  senior: -0.08,
};

export type RoleDefinition = {
  roleId: string;
  roleName: string;
  // Other job titles within the same category that map to this exact O*NET
  // occupation — same tasks, same coverage, same score, just a different
  // title on a job posting. Shown alongside roleName instead of giving each
  // alias its own card/score, since that would just repeat the same number.
  aliases: string[];
  soc: string;
  onetCode: string;
  onetTaskCount: number;
  industry: string;
};

// Roles are grouped by O*NET occupation *within each category* — titles that
// share an O*NET-SOC code (same underlying tasks) are merged into one entry
// with the rest listed as aliases, so the same task content doesn't produce
// several cards repeating the same score. O*NET 29.2 has no detail occupation
// yet for several emerging titles (ML Engineer, AI Engineer, MLOps Engineer,
// most mobile titles, most cybersecurity specialist titles, etc.) — each is
// mapped to the closest existing O*NET-SOC occupation by task-content fit,
// disclosed per role in the generated reasoning text.
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  // Machine Learning & AI
  { roleId: "ml-engineer", roleName: "ML Engineer", aliases: ["AI Engineer", "Data Scientist", "Computer Vision Engineer", "NLP Engineer", "Deep Learning Engineer"], soc: "15-2051", onetCode: "15-2051.00", onetTaskCount: 16, industry: "Machine Learning & AI" },
  { roleId: "research-engineer", roleName: "Research Engineer", aliases: ["Applied Scientist"], soc: "15-1221", onetCode: "15-1221.00", onetTaskCount: 15, industry: "Machine Learning & AI" },
  { roleId: "mlops-engineer", roleName: "MLOps Engineer", aliases: [], soc: "15-1299", onetCode: "15-1299.08", onetTaskCount: 28, industry: "Machine Learning & AI" },

  // Web Development
  { roleId: "frontend-engineer", roleName: "Frontend Engineer", aliases: ["Web Developer"], soc: "15-1254", onetCode: "15-1254.00", onetTaskCount: 29, industry: "Web Development" },
  { roleId: "backend-engineer", roleName: "Backend Engineer", aliases: ["Full-Stack Engineer", "Software Engineer", "Software Developer", "API Engineer"], soc: "15-1252", onetCode: "15-1252.00", onetTaskCount: 19, industry: "Web Development" },
  { roleId: "ui-engineer", roleName: "UI Engineer", aliases: [], soc: "15-1255", onetCode: "15-1255.00", onetTaskCount: 30, industry: "Web Development" },

  // Mobile Development — O*NET has no mobile-specific detail occupation; all fold into Software Developers.
  { roleId: "ios-engineer", roleName: "iOS Engineer", aliases: ["Android Engineer", "React Native Developer", "Flutter Developer", "Cross-Platform Mobile Engineer", "Mobile Software Engineer"], soc: "15-1252", onetCode: "15-1252.00", onetTaskCount: 19, industry: "Mobile Development" },

  // Data Engineering
  { roleId: "data-engineer", roleName: "Data Engineer", aliases: ["Data Architect", "Big Data Engineer"], soc: "15-1243", onetCode: "15-1243.00", onetTaskCount: 25, industry: "Data Engineering" },
  { roleId: "analytics-engineer", roleName: "Analytics Engineer", aliases: [], soc: "15-1243", onetCode: "15-1243.01", onetTaskCount: 18, industry: "Data Engineering" },
  { roleId: "data-analyst", roleName: "Data Analyst", aliases: [], soc: "15-2031", onetCode: "15-2031.00", onetTaskCount: 17, industry: "Data Engineering" },
  { roleId: "bi-engineer", roleName: "BI Engineer", aliases: [], soc: "15-2051", onetCode: "15-2051.01", onetTaskCount: 17, industry: "Data Engineering" },
  { roleId: "database-administrator", roleName: "Database Administrator", aliases: [], soc: "15-1242", onetCode: "15-1242.00", onetTaskCount: 18, industry: "Data Engineering" },
  { roleId: "business-analyst", roleName: "Business Analyst", aliases: [], soc: "13-1111", onetCode: "13-1111.00", onetTaskCount: 11, industry: "Data Engineering" },

  // Systems & Infrastructure
  { roleId: "devops-engineer", roleName: "DevOps Engineer", aliases: ["Site Reliability Engineer (SRE)", "Infrastructure Engineer", "Build/Release Engineer"], soc: "15-1244", onetCode: "15-1244.00", onetTaskCount: 20, industry: "Systems & Infrastructure" },
  { roleId: "cloud-engineer", roleName: "Cloud Engineer", aliases: ["Platform Engineer", "Systems Engineer", "Cloud Architect"], soc: "15-1299", onetCode: "15-1299.08", onetTaskCount: 28, industry: "Systems & Infrastructure" },
  { roleId: "network-engineer", roleName: "Network Engineer", aliases: [], soc: "15-1241", onetCode: "15-1241.00", onetTaskCount: 33, industry: "Systems & Infrastructure" },
  { roleId: "embedded-systems-engineer", roleName: "Embedded Systems Engineer", aliases: [], soc: "17-2061", onetCode: "17-2061.00", onetTaskCount: 18, industry: "Systems & Infrastructure" },

  // Cybersecurity
  { roleId: "security-engineer", roleName: "Security Engineer", aliases: ["Cloud Security Engineer", "Application Security Engineer", "Security Architect"], soc: "15-1299", onetCode: "15-1299.05", onetTaskCount: 20, industry: "Cybersecurity" },
  { roleId: "security-analyst", roleName: "Security Analyst", aliases: ["SOC Analyst"], soc: "15-1212", onetCode: "15-1212.00", onetTaskCount: 11, industry: "Cybersecurity" },
  { roleId: "penetration-tester", roleName: "Penetration Tester", aliases: [], soc: "15-1299", onetCode: "15-1299.04", onetTaskCount: 22, industry: "Cybersecurity" },
  { roleId: "incident-response-analyst", roleName: "Incident Response Analyst", aliases: [], soc: "15-1299", onetCode: "15-1299.06", onetTaskCount: 20, industry: "Cybersecurity" },
  { roleId: "grc-analyst", roleName: "GRC Analyst", aliases: [], soc: "13-1041", onetCode: "13-1041.00", onetTaskCount: 16, industry: "Cybersecurity" },
];

// Real Singapore-specific O*NET task matches, where Singapore's reported
// top-task list (release_2026_03_24, facet=onet_task) happens to include a
// task for this O*NET code. Most CS occupations have none — Singapore's raw
// export only surfaces the ~63 highest-volume O*NET tasks economy-wide, so
// niche occupations rarely clear that threshold even when real local AI usage
// is substantial. Codes with no match fall back entirely to
// GLOBAL_EXPOSURE_BY_SOC for coverage. Keyed by onetCode (not roleId) since
// roles sharing a code share the same evidence — expanded to SG_TASK_EVIDENCE
// below, keyed by roleId, for lookup convenience at the call site.
const SG_TASK_EVIDENCE_BY_ONET_CODE: Record<string, { task: string; pct: number }[]> = {
  "15-1221.00": [
    { task: "conduct logical analyses of business, scientific, engineering, and other technical problems, formulating mathematical models of problems for solution by computers.", pct: 0.85 },
  ],
  "15-1242.00": [{ task: "test programs or databases, correct errors, and make necessary modifications.", pct: 0.33 }],
  "15-1243.00": [{ task: "test programs or databases, correct errors, and make necessary modifications.", pct: 0.33 }],
  "15-1243.01": [
    { task: "write new programs or modify existing programs to meet customer requirements, using current programming languages and technologies.", pct: 2.25 },
  ],
  "15-1244.00": [
    { task: "diagnose, troubleshoot, and resolve hardware, software, or other network and system problems, and replace defective components when necessary.", pct: 1.67 },
  ],
  "15-1252.00": [
    { task: "analyze user needs and software requirements to determine feasibility of design within time and cost constraints.", pct: 0.6 },
    { task: "store, retrieve, and manipulate data for analysis of system capabilities and requirements.", pct: 0.29 },
  ],
  "15-1254.00": [
    { task: "design, build, or maintain web sites, using authoring or scripting languages, content creation tools, management tools, and digital media.", pct: 0.84 },
  ],
  "15-1255.00": [
    { task: "design, build, or maintain web sites, using authoring or scripting languages, content creation tools, management tools, and digital media.", pct: 0.84 },
  ],
  "17-2061.00": [{ task: "store, retrieve, and manipulate data for analysis of system capabilities and requirements.", pct: 0.29 }],
};

// SG_TASK_EVIDENCE_BY_ONET_CODE above, re-keyed by roleId for direct lookup.
export const SG_TASK_EVIDENCE: Record<string, { task: string; pct: number }[]> = Object.fromEntries(
  ROLE_DEFINITIONS.map((role) => [role.roleId, SG_TASK_EVIDENCE_BY_ONET_CODE[role.onetCode] ?? []])
);

export const AEI_SOURCES = [
  "Anthropic Economic Index, release_2026_03_24, labor_market_impacts/job_exposure.csv (global occupational exposure)",
  "Anthropic Economic Index, release_2026_03_24, aei_raw_claude_ai_2026-02-05_to_2026-02-12.csv, geo=SG (collaboration mix)",
  "O*NET 29.2 Database, Task Statements.txt (onetcenter.org)",
];

export const JOB_EXPOSURE_CSV_URL =
  "https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/labor_market_impacts/job_exposure.csv";

// Historical Singapore "Intervention Mode" snapshots, one per AEI report release,
// each extracted the same way as SG_AUTO_SHARE/SG_AUG_SHARE above (geo_id=SG,
// facet=collaboration, level=0, variable=collaboration_pct, directive normalized
// against 100 - none).
// Sources:
//   release_2025_09_15/data/intermediate/aei_raw_claude_ai_2025-08-04_to_2025-08-11.csv
//   release_2026_01_15/data/intermediate/aei_raw_claude_ai_2025-11-13_to_2025-11-20.csv
//   release_2026_03_24/data/aei_raw_claude_ai_2026-02-05_to_2026-02-12.csv
// Anthropic has not published a historical version of job_exposure.csv (single
// commit, never revised), so "coverage" (Intervention Breadth) has no historical
// series — every point below reuses the current GLOBAL_EXPOSURE_BY_SOC value.
// Only the automation/augmentation mix genuinely varies release to release.
export const SG_COLLAB_MIX_HISTORY: {
  periodStart: string;
  periodEnd: string;
  releaseLabel: string;
  autoShare: number;
  augShare: number;
}[] = [
  { periodStart: "2025-08-04", periodEnd: "2025-08-11", releaseLabel: "Aug 2025", autoShare: 0.359, augShare: 0.641 },
  { periodStart: "2025-11-13", periodEnd: "2025-11-20", releaseLabel: "Nov 2025", autoShare: 0.2867, augShare: 0.7133 },
  { periodStart: "2026-02-05", periodEnd: "2026-02-12", releaseLabel: "Feb 2026", autoShare: SG_AUTO_SHARE, augShare: SG_AUG_SHARE },
];

// AEI's two earliest releases (Feb 2025, Mar 2025) predate Anthropic publishing
// any country-level breakdown — there is no Singapore-specific data for these.
// They're kept as a separate, clearly-labeled GLOBAL (worldwide Claude.ai
// usage, not Singapore) series so the trend chart can show pre-SG-reporting
// history without it being mistaken for the Singapore-specific trend above.
// A second caveat: neither release's README states an exact usage-data
// collection window, so periodStart/periodEnd below are each release's
// publish date (the only date Anthropic actually confirms), not a measured
// date range like the Singapore entries have.
// Sources:
//   release_2025_02_10/automation_vs_augmentation.csv ("v1" methodology)
//   release_2025_03_27/automation_vs_augmentation_v2.csv ("v2" methodology —
//     release_2025_03_27/automation_vs_augmentation_v1.csv is byte-identical
//     to the Feb 2025 file, i.e. carried forward, not a new measurement)
export const GLOBAL_COLLAB_MIX_HISTORY: {
  periodStart: string;
  periodEnd: string;
  releaseLabel: string;
  autoShare: number;
  augShare: number;
}[] = [
  { periodStart: "2025-02-10", periodEnd: "2025-02-10", releaseLabel: "v1 report (Feb 2025)", autoShare: 0.2324, augShare: 0.7676 },
  { periodStart: "2025-03-27", periodEnd: "2025-03-27", releaseLabel: "v2 report (Mar 2025)", autoShare: 0.3041, augShare: 0.6959 },
];
