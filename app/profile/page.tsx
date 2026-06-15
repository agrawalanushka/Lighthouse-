"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Search,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import type { UserProfile, Skill } from "@/lib/types";
import skillsData from "@/data/seed/skills.json";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---- Skills constants (from step-skills) ----

const ALL_SKILLS = skillsData as Skill[];

const CATEGORY_LABELS: Record<Skill["category"], string> = {
  language: "Languages",
  framework: "Frameworks & Libraries",
  tool: "Tools & Platforms",
  concept: "Concepts",
};

const CATEGORY_ORDER: Skill["category"][] = [
  "language",
  "framework",
  "tool",
  "concept",
];

// ---- Roles constants (from step-goals) ----

type Interest = UserProfile["interests"][number];

const ROLE_GROUPS: { group: string; roles: string[] }[] = [
  {
    group: "Machine Learning & AI",
    roles: [
      "ML Engineer",
      "AI Engineer",
      "Data Scientist",
      "Research Engineer",
      "MLOps Engineer",
      "Computer Vision Engineer",
      "NLP Engineer",
      "Applied Scientist",
      "Deep Learning Engineer",
    ],
  },
  {
    group: "Web Development",
    roles: [
      "Frontend Engineer",
      "Backend Engineer",
      "Full-Stack Engineer",
      "Web Developer",
      "UI Engineer",
      "Software Engineer",
      "Software Developer",
      "API Engineer",
    ],
  },
  {
    group: "Mobile Development",
    roles: [
      "iOS Engineer",
      "Android Engineer",
      "React Native Developer",
      "Flutter Developer",
      "Cross-Platform Mobile Engineer",
      "Mobile Software Engineer",
    ],
  },
  {
    group: "Data Engineering",
    roles: [
      "Data Engineer",
      "Analytics Engineer",
      "Data Analyst",
      "BI Engineer",
      "Data Architect",
      "Database Administrator",
      "Business Analyst",
      "Big Data Engineer",
    ],
  },
  {
    group: "Systems & Infrastructure",
    roles: [
      "DevOps Engineer",
      "Site Reliability Engineer (SRE)",
      "Cloud Engineer",
      "Platform Engineer",
      "Systems Engineer",
      "Infrastructure Engineer",
      "Network Engineer",
      "Embedded Systems Engineer",
      "Cloud Architect",
      "Build/Release Engineer",
    ],
  },
  {
    group: "Cybersecurity",
    roles: [
      "Security Engineer",
      "Security Analyst",
      "Penetration Tester",
      "Cloud Security Engineer",
      "SOC Analyst",
      "Incident Response Analyst",
      "Application Security Engineer",
      "GRC Analyst",
      "Security Architect",
    ],
  },
];

const GROUP_TO_INTEREST: Record<string, Interest> = {
  "Machine Learning & AI": "ml",
  "Web Development": "web",
  "Mobile Development": "mobile",
  "Data Engineering": "data",
  "Systems & Infrastructure": "systems",
  "Cybersecurity": "security",
};

const UNIVERSITY_LABELS: Record<UserProfile["university"], string> = {
  NTU: "Nanyang Technological University (NTU)",
  NUS: "National University of Singapore (NUS)",
  SMU: "Singapore Management University (SMU)",
  SIT: "Singapore Institute of Technology (SIT)",
  OTHER: "Other",
};

// ---- Helpers ----

function deriveInterests(selectedRoles: string[]): Interest[] {
  const seen = new Set<Interest>();
  for (const { group, roles: groupRoles } of ROLE_GROUPS) {
    const interest = GROUP_TO_INTEREST[group];
    if (interest && selectedRoles.some((r) => groupRoles.includes(r))) {
      seen.add(interest);
    }
  }
  return Array.from(seen);
}

function toYear(v: string): 1 | 2 | 3 | 4 {
  const n = Number(v);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  throw new Error("Invalid year");
}

// ---- Basics schema ----

const basicsSchema = z.object({
  fullName: z.string().min(2, "At least 2 characters required"),
  university: z.enum(["NTU", "NUS", "SMU", "SIT", "OTHER"]),
  yearOfStudy: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  major: z.string().min(2, "At least 2 characters required"),
});

type BasicsFormValues = z.infer<typeof basicsSchema>;

// ---- Layout wrapper ----

function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="w-full max-w-lg mx-auto">{children}</div>
    </div>
  );
}

// ---- Loading skeleton ----

function LoadingSkeleton() {
  return (
    <PageWrapper>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4 mb-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
    </PageWrapper>
  );
}

// ---- View mode (read-only) ----

function ProfileView({
  profile,
  onEdit,
}: {
  profile: UserProfile;
  onEdit: () => void;
}) {
  const skillNames = ALL_SKILLS.filter((s) =>
    profile.skills.includes(s.id)
  ).map((s) => s.name);

  return (
    <div className="space-y-4">
      {/* Basics */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">About you</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Email
            </p>
            <p className="text-sm text-gray-900">{profile.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Full name
            </p>
            <p className="text-sm text-gray-900">{profile.fullName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              University
            </p>
            <p className="text-sm text-gray-900">
              {UNIVERSITY_LABELS[profile.university]}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Year
              </p>
              <p className="text-sm text-gray-900">Year {profile.yearOfStudy}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Major
              </p>
              <p className="text-sm text-gray-900">{profile.major}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
        {skillNames.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skillNames.map((name) => (
              <Badge key={name} variant="secondary">
                {name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No skills added yet.</p>
        )}
      </div>

      {/* Target roles */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Target roles
        </h2>
        {profile.targetRoles.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.targetRoles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No target roles added yet.</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" size="lg" onClick={onEdit}>
          Edit profile
        </Button>
      </div>
    </div>
  );
}

// ---- Edit mode (form) ----

function ProfileForm({
  profile,
  onSaveSuccess,
  onCancel,
}: {
  profile: UserProfile;
  onSaveSuccess: (updated: UserProfile) => void;
  onCancel: () => void;
}) {
  const {
    register,
    control,
    getValues,
    setError,
    formState: { errors: formErrors },
  } = useForm<BasicsFormValues>({
    defaultValues: {
      fullName: profile.fullName,
      university: profile.university,
      yearOfStudy: profile.yearOfStudy,
      major: profile.major,
    },
  });

  // Skills state
  const [selected, setSelected] = useState<Set<string>>(
    new Set(profile.skills)
  );
  const [query, setQuery] = useState("");
  const [skillError, setSkillError] = useState<string | null>(null);

  // Roles state
  const [roles, setRoles] = useState<string[]>(profile.targetRoles);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSkill = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSkillError(null);
  };

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    setRolesError(null);
  };

  const removeRole = (role: string) =>
    setRoles((prev) => prev.filter((r) => r !== role));

  const lowerQuery = query.toLowerCase();
  const filteredSkills = ALL_SKILLS.filter((s) =>
    s.name.toLowerCase().includes(lowerQuery)
  );
  const groupedSkills = CATEGORY_ORDER.reduce<Record<string, Skill[]>>(
    (acc, cat) => {
      const items = filteredSkills.filter((s) => s.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {}
  );
  const selectedSkillObjects = ALL_SKILLS.filter((s) => selected.has(s.id));

  const handleSave = async () => {
    const rawBasics = getValues();
    const basicsResult = basicsSchema.safeParse(rawBasics);

    let hasErrors = false;

    if (!basicsResult.success) {
      hasErrors = true;
      basicsResult.error.issues.forEach((issue) => {
        if (issue.path.length === 0) return;
        const field = issue.path[0] as keyof BasicsFormValues;
        setError(field, { type: "manual", message: issue.message });
      });
    }

    if (selected.size === 0) {
      setSkillError("Select at least one skill");
      hasErrors = true;
    }

    if (roles.length === 0) {
      setRolesError("Select at least one target role");
      hasErrors = true;
    }

    if (hasErrors) return;

    // basicsResult.success is true here — ensured by hasErrors guard above
    const basics = (
      basicsResult as Extract<typeof basicsResult, { success: true }>
    ).data;
    const interests = deriveInterests(roles);

    const updated: UserProfile = {
      ...profile,
      fullName: basics.fullName,
      university: basics.university,
      yearOfStudy: basics.yearOfStudy,
      major: basics.major,
      skills: Array.from(selected),
      targetRoles: roles,
      interests,
      updatedAt: new Date().toISOString(),
    };

    setIsSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from("profiles")
      .upsert(updated, { onConflict: "id" });

    setIsSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    onSaveSuccess(updated);
  };

  return (
    <div className="space-y-4">
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to save</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Basics */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">About you</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={profile.email}
              readOnly
              className="bg-gray-50 text-gray-500 cursor-default"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              placeholder="Jane Tan"
              aria-invalid={!!formErrors.fullName}
              {...register("fullName")}
            />
            {formErrors.fullName && (
              <p className="text-xs text-destructive">
                {formErrors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="university">University</Label>
            <Controller
              name="university"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v: string) =>
                    field.onChange(v as UserProfile["university"])
                  }
                >
                  <SelectTrigger
                    id="university"
                    className="w-full"
                    aria-invalid={!!formErrors.university}
                  >
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NTU">
                      Nanyang Technological University (NTU)
                    </SelectItem>
                    <SelectItem value="NUS">
                      National University of Singapore (NUS)
                    </SelectItem>
                    <SelectItem value="SMU">
                      Singapore Management University (SMU)
                    </SelectItem>
                    <SelectItem value="SIT">
                      Singapore Institute of Technology (SIT)
                    </SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {formErrors.university && (
              <p className="text-xs text-destructive">
                {formErrors.university.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="yearOfStudy">Year of study</Label>
              <Controller
                name="yearOfStudy"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v: string) => field.onChange(toYear(v))}
                  >
                    <SelectTrigger
                      id="yearOfStudy"
                      className="w-full"
                      aria-invalid={!!formErrors.yearOfStudy}
                    >
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {([1, 2, 3, 4] as const).map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          Year {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {formErrors.yearOfStudy && (
                <p className="text-xs text-destructive">
                  {formErrors.yearOfStudy.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                placeholder="Computer Science"
                aria-invalid={!!formErrors.major}
                {...register("major")}
              />
              {formErrors.major && (
                <p className="text-xs text-destructive">
                  {formErrors.major.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Skills</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select everything you know.
        </p>

        {selectedSkillObjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-blue-50 rounded-lg">
            {selectedSkillObjects.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                onClick={() => toggleSkill(skill.id)}
              >
                {skill.name}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search skills…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {skillError && (
          <p className="text-xs text-destructive mb-3">{skillError}</p>
        )}

        <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {CATEGORY_LABELS[category as Skill["category"]]}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`skill-${skill.id}`}
                      checked={selected.has(skill.id)}
                      onCheckedChange={() => toggleSkill(skill.id)}
                    />
                    <Label
                      htmlFor={`skill-${skill.id}`}
                      className="font-normal cursor-pointer text-gray-700"
                    >
                      {skill.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredSkills.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              No skills match &ldquo;{query}&rdquo;
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {selected.size} skill{selected.size !== 1 ? "s" : ""} selected
        </p>
      </div>

      {/* Target roles */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Target roles
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Tell us where you want to go.
        </p>

        <div className="space-y-2">
          <Label>Roles</Label>
          <div className="relative" ref={dropdownRef}>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between font-normal"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
            >
              <span
                className={
                  roles.length === 0 ? "text-gray-400" : "text-gray-900"
                }
              >
                {roles.length === 0
                  ? "Select roles…"
                  : `${roles.length} role${roles.length > 1 ? "s" : ""} selected`}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </Button>

            {dropdownOpen && (
              <div
                className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-72 overflow-y-auto"
                role="listbox"
                aria-multiselectable="true"
              >
                {ROLE_GROUPS.map(({ group, roles: groupRoles }) => (
                  <div key={group}>
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 sticky top-0">
                      {group}
                    </div>
                    {groupRoles.map((role) => {
                      const checked = roles.includes(role);
                      return (
                        <div
                          key={role}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleRole(role)}
                          role="option"
                          aria-selected={checked}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleRole(role)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label className="font-normal cursor-pointer text-gray-700 text-sm pointer-events-none">
                            {role}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {rolesError && (
            <p className="text-xs text-destructive">{rolesError}</p>
          )}

          {roles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="gap-1 pr-1">
                  {role}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="h-3.5 w-3.5 rounded-full hover:bg-gray-200"
                    onClick={() => removeRole(role)}
                    aria-label={`Remove ${role}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}

// ---- Page (default export) ----

type PageState = "loading" | "no-auth" | "error" | "empty" | "ready";

export default function ProfilePage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        setPageState("no-auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (error) {
        setFetchError(error.message);
        setPageState("error");
        return;
      }

      if (!data) {
        setPageState("empty");
        return;
      }

      setProfile(data as UserProfile);
      setPageState("ready");
    }

    load();
  }, []);

  const handleSaveSuccess = (updated: UserProfile) => {
    setProfile(updated);
    setIsEditing(false);
    setSaveSuccess(true);
  };

  if (pageState === "loading") return <LoadingSkeleton />;

  if (pageState === "no-auth") {
    return (
      <PageWrapper>
        <div className="bg-white rounded-xl border p-8 shadow-sm text-center">
          <p className="text-gray-600 mb-4">
            You need to be logged in to view your profile.
          </p>
          <Link
            href="/login"
            className="text-primary underline underline-offset-4 text-sm"
          >
            Log in
          </Link>
        </div>
      </PageWrapper>
    );
  }

  if (pageState === "error") {
    return (
      <PageWrapper>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load profile</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  if (pageState === "empty") {
    return (
      <PageWrapper>
        <div className="bg-white rounded-xl border p-8 shadow-sm text-center">
          <p className="text-gray-600 mb-4">
            You haven&apos;t set up your profile yet.
          </p>
          <Link
            href="/onboarding"
            className="text-primary underline underline-offset-4 text-sm"
          >
            Complete onboarding
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Your profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        Keep your details up to date for better matches.
      </p>

      {saveSuccess && !isEditing && (
        <Alert className="border-green-200 bg-green-50 mb-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Profile saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {isEditing ? (
        <ProfileForm
          profile={profile!}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView
          profile={profile!}
          onEdit={() => {
            setSaveSuccess(false);
            setIsEditing(true);
          }}
        />
      )}
    </PageWrapper>
  );
}
