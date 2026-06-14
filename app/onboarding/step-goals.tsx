"use client";

import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronDown, X, Loader2 } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

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

const schema = z.object({
  targetRoles: z
    .array(z.string())
    .min(1, "Select at least one target role"),
  interests: z
    .array(z.enum(["ml", "web", "mobile", "data", "systems", "security"]))
    .min(1, "Select at least one area of interest"),
});

type GoalsData = Pick<UserProfile, "targetRoles" | "interests">;

interface Props {
  defaultValues: Partial<GoalsData>;
  onSubmit: (data: GoalsData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function StepGoals({
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting,
}: Props) {
  const [roles, setRoles] = useState<string[]>(defaultValues.targetRoles ?? []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<{ targetRoles?: string }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    setErrors({});
  };

  const removeRole = (role: string) => {
    setRoles((prev) => prev.filter((r) => r !== role));
  };

  const deriveInterests = (selectedRoles: string[]): Interest[] => {
    const seen = new Set<Interest>();
    for (const { group, roles: groupRoles } of ROLE_GROUPS) {
      const interest = GROUP_TO_INTEREST[group];
      if (interest && selectedRoles.some((r) => groupRoles.includes(r))) {
        seen.add(interest);
      }
    }
    return Array.from(seen);
  };

  const handleSubmit = async () => {
    const interests = deriveInterests(roles);
    const result = schema.safeParse({ targetRoles: roles, interests });

    if (!result.success) {
      const fieldErrors: { targetRoles?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "targetRoles") {
          fieldErrors.targetRoles = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        What are your goals?
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Tell us where you want to go — we&apos;ll tailor your insights to match.
      </p>

      {/* Target roles */}
      <div className="space-y-2">
        <Label>Target roles</Label>
        <div className="relative" ref={dropdownRef}>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          >
            <span className={roles.length === 0 ? "text-gray-400" : "text-gray-900"}>
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

        {errors.targetRoles && (
          <p className="text-xs text-destructive">{errors.targetRoles}</p>
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

      <div className="mt-6 flex justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Finish setup"
          )}
        </Button>
      </div>
    </div>
  );
}
