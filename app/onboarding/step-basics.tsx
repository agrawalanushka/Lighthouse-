"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { ChevronRight } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BasicsData = Pick<UserProfile, "fullName" | "university" | "yearOfStudy" | "major">;

const schema = z.object({
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

type FormValues = z.infer<typeof schema>;

const FIELD_REQUIRED_MESSAGES: Partial<Record<keyof FormValues, string>> = {
  university: "Select your university",
  yearOfStudy: "Select your year of study",
};

function toYear(v: string): 1 | 2 | 3 | 4 {
  const n = Number(v);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  throw new Error("Invalid year");
}

interface Props {
  defaultValues: Partial<BasicsData>;
  onNext: (data: BasicsData) => void;
}

export default function StepBasics({ defaultValues, onNext }: Props) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fullName: defaultValues.fullName ?? "",
      university: defaultValues.university,
      yearOfStudy: defaultValues.yearOfStudy,
      major: defaultValues.major ?? "",
    },
  });

  const onSubmit = (raw: FormValues) => {
    const result = schema.safeParse(raw);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path.length === 0) return;
        const field = issue.path[0] as keyof FormValues;
        const message = FIELD_REQUIRED_MESSAGES[field] ?? issue.message;
        setError(field, { type: "manual", message });
      });
      return;
    }
    onNext(result.data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl border p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Tell us about yourself
      </h2>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            placeholder="Jane Tan"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
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
                  aria-invalid={!!errors.university}
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
          {errors.university && (
            <p className="text-xs text-destructive">
              {FIELD_REQUIRED_MESSAGES.university}
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
                    aria-invalid={!!errors.yearOfStudy}
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
            {errors.yearOfStudy && (
              <p className="text-xs text-destructive">
                {FIELD_REQUIRED_MESSAGES.yearOfStudy}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="major">Major</Label>
            <Input
              id="major"
              placeholder="Computer Science"
              aria-invalid={!!errors.major}
              {...register("major")}
            />
            {errors.major && (
              <p className="text-xs text-destructive">{errors.major.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" size="lg">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
