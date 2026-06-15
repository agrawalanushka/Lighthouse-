"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (raw: FormValues) => {
    const result = schema.safeParse(raw);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path.length === 0) return;
        const field = issue.path[0] as keyof FormValues;
        setError(field, { type: "manual", message: issue.message });
      });
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
    });

    setIsLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl border p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            Create your Lighthouse account
          </h2>

          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@u.nus.edu"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create account
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
