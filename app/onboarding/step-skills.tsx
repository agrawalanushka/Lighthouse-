"use client";

import { useState } from "react";
import { z } from "zod";
import { Search, ChevronRight, ChevronLeft, X } from "lucide-react";
import type { UserProfile, Skill } from "@/lib/types";
import skillsData from "@/data/seed/skills.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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

const schema = z.object({
  skills: z.array(z.string()).min(1, "Select at least one skill"),
});

type SkillsData = Pick<UserProfile, "skills">;

interface Props {
  defaultValues: Partial<SkillsData>;
  onNext: (data: SkillsData) => void;
  onBack: () => void;
}

export default function StepSkills({ defaultValues, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultValues.skills ?? [])
  );
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setError(null);
  };

  const handleNext = () => {
    const selectedIds = Array.from(selected);
    const result = schema.safeParse({ skills: selectedIds });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Select at least one skill");
      return;
    }
    onNext({ skills: result.data.skills });
  };

  const lowerQuery = query.toLowerCase();
  const filtered = ALL_SKILLS.filter((s) =>
    s.name.toLowerCase().includes(lowerQuery)
  );

  const grouped = CATEGORY_ORDER.reduce<Record<string, Skill[]>>((acc, cat) => {
    const items = filtered.filter((s) => s.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const selectedSkills = ALL_SKILLS.filter((s) => selected.has(s.id));

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        What are your skills?
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Select everything you know — you can always update this later.
      </p>

      {/* Selected pills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-blue-50 rounded-lg">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill.id}
              variant="secondary"
              className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
              onClick={() => toggle(skill.id)}
            >
              {skill.name}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Search skills…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {error && <p className="text-xs text-destructive mb-3">{error}</p>}

      {/* Grouped skill list */}
      <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
        {Object.entries(grouped).map(([category, skills]) => (
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
                    onCheckedChange={() => toggle(skill.id)}
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

        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-6">
            No skills match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {selected.size} skill{selected.size !== 1 ? "s" : ""} selected
      </p>

      <div className="mt-4 flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="button" size="lg" onClick={handleNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
