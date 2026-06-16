"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import StepBasics from "./step-basics";
import StepSkills from "./step-skills";
import StepGoals from "./step-goals";

type BasicsData = Pick<UserProfile, "fullName" | "university" | "yearOfStudy" | "major">;
type SkillsData = Pick<UserProfile, "skills">;
type GoalsData = Pick<UserProfile, "targetRoles" | "interests">;
type WizardData = BasicsData & SkillsData & GoalsData;

const STEP_LABELS = ["Basics", "Skills", "Goals"] as const;

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accumulated, setAccumulated] = useState<Partial<WizardData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleBasicsNext = (basics: BasicsData) => {
    setAccumulated((prev) => ({ ...prev, ...basics }));
    setStep(2);
  };

  const handleSkillsNext = (skills: SkillsData) => {
    setAccumulated((prev) => ({ ...prev, ...skills }));
    setStep(3);
  };

  const handleGoalsSubmit = async (goals: GoalsData) => {
    const merged = { ...accumulated, ...goals };

    if (
      !merged.fullName ||
      !merged.university ||
      !merged.yearOfStudy ||
      !merged.major ||
      !merged.skills?.length ||
      !merged.targetRoles?.length ||
      !merged.interests?.length
    ) {
      setSubmitError("Incomplete profile data. Please go back and fill in all steps.");
      return;
    }

    const finalData = merged as WizardData;

    setIsSubmitting(true);
    setSubmitError(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setSubmitError("You must be logged in to complete onboarding.");
      setIsSubmitting(false);
      return;
    }

    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: authData.user.id,
      email: authData.user.email ?? "",
      ...finalData,
      createdAt: now,
      updatedAt: now,
    };

    const { error: dbError } = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" });

    if (dbError) {
      setSubmitError(dbError.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Set up your profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Step {step} of 3 — {STEP_LABELS[step - 1]}
        </p>
        <Progress value={(step / 3) * 100} className="mt-3 h-1.5" />
        <div className="flex justify-between mt-2">
          {STEP_LABELS.map((label, i) => {
            const done = i + 1 < step;
            const active = i + 1 === step;
            return (
              <span
                key={label}
                className={
                  done
                    ? "text-xs text-blue-600 font-medium flex items-center gap-0.5"
                    : active
                    ? "text-xs text-gray-900 font-semibold"
                    : "text-xs text-gray-400"
                }
              >
                {done && <CheckCircle2 className="w-3 h-3" />}
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to save profile</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {step === 1 && (
        <StepBasics defaultValues={accumulated} onNext={handleBasicsNext} />
      )}
      {step === 2 && (
        <StepSkills
          defaultValues={accumulated}
          onNext={handleSkillsNext}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepGoals
          defaultValues={accumulated}
          onSubmit={handleGoalsSubmit}
          onBack={() => setStep(2)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
