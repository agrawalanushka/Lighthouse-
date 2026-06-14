"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { ChevronLeft, Plus, X, Loader2 } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type Interest = UserProfile["interests"][number];

const INTEREST_OPTIONS: { value: Interest; label: string }[] = [
  { value: "ml", label: "Machine Learning & AI" },
  { value: "web", label: "Web Development" },
  { value: "mobile", label: "Mobile Development" },
  { value: "data", label: "Data Engineering" },
  { value: "systems", label: "Systems & Infrastructure" },
  { value: "security", label: "Cybersecurity" },
];

const schema = z.object({
  targetRoles: z
    .array(z.string())
    .min(1, "Add at least one target role"),
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
  const [interests, setInterests] = useState<Set<Interest>>(
    new Set((defaultValues.interests ?? []) as Interest[])
  );
  const [roleInput, setRoleInput] = useState("");
  const [errors, setErrors] = useState<{
    targetRoles?: string;
    interests?: string;
  }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const addRole = () => {
    const trimmed = roleInput.trim();
    if (!trimmed || roles.includes(trimmed)) return;
    setRoles((prev) => [...prev, trimmed]);
    setRoleInput("");
    setErrors((prev) => ({ ...prev, targetRoles: undefined }));
    inputRef.current?.focus();
  };

  const removeRole = (role: string) => {
    setRoles((prev) => prev.filter((r) => r !== role));
  };

  const toggleInterest = (value: Interest) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, interests: undefined }));
  };

  const handleSubmit = async () => {
    const result = schema.safeParse({
      targetRoles: roles,
      interests: Array.from(interests),
    });

    if (!result.success) {
      const fieldErrors: { targetRoles?: string; interests?: string } = {};
      result.error.issues.forEach((issue) => {
        const raw = issue.path[0];
        if (raw === "targetRoles" || raw === "interests") {
          fieldErrors[raw] = issue.message;
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
      <div className="space-y-2 mb-5">
        <Label>Target roles</Label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="e.g. Software Engineer at Grab"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addRole();
              }
            }}
            aria-invalid={!!errors.targetRoles}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addRole}
            disabled={!roleInput.trim()}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        {errors.targetRoles && (
          <p className="text-xs text-destructive">{errors.targetRoles}</p>
        )}
        {roles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {roles.map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className="gap-1 pr-1"
              >
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

      {/* Areas of interest */}
      <div className="space-y-2">
        <Label>Areas of interest</Label>
        {errors.interests && (
          <p className="text-xs text-destructive">{errors.interests}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {INTEREST_OPTIONS.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`interest-${value}`}
                checked={interests.has(value)}
                onCheckedChange={() => toggleInterest(value)}
              />
              <Label
                htmlFor={`interest-${value}`}
                className="font-normal cursor-pointer text-gray-700"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
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
