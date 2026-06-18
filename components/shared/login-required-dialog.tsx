"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function LoginRequiredDialog({
  description = "This page is personalised to your profile. Log in to see your weekly Pulse, AI Intervention Score, and more.",
}: {
  description?: string;
}) {
  const router = useRouter();

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <AlertDialogTitle>Log in to access this page</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => router.push("/")}>
            Back to home
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push("/login")}>
            Log in
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
