
"use client";

import { useUser } from "@/firebase";
import { useUserData } from "@/hooks/use-user-data";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Logo from "@/components/Logo";

export default function Home() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { profile, isLoading: isProfileLoading } = useUserData();
  const router = useRouter();
  
  useEffect(() => {
    // This is the single source of truth for routing decisions after auth state is resolved.
    if (isAuthLoading) {
      return; // Wait until Firebase has determined the auth state.
    }

    if (!user) {
      // If there's no user, they must log in.
      router.replace('/login');
      return;
    }

    // If there is a user, we might need to wait for their profile to load.
    if (user && isProfileLoading) {
        return;
    }

    // Now we have a user and their profile status is known.
    if (user && profile) {
      // If there is a user and they have a profile, they belong on the dashboard.
      router.replace('/dashboard');
    }
    // If there's a user but NO profile, we stay on this page to render the OnboardingFlow.
    
  }, [isAuthLoading, isProfileLoading, user, profile, router]);

  // This unified loading state will show a spinner while authentication and profile
  // checks are in progress. It prevents content flicker.
  const isLoading = isAuthLoading || (user && isProfileLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Logo className="h-12 w-auto mb-8 text-primary" />
        <div className="space-y-6 w-full max-w-lg">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  // If we have a user but no profile, this is the onboarding page.
  // The useEffect above has already determined that we should be here.
  if (user && !profile) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <OnboardingFlow />
      </main>
    );
  }

  // This state is temporary while the initial redirect is happening.
  // It shows a loading skeleton to provide a good user experience.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Logo className="h-12 w-auto mb-8 text-primary" />
      <div className="space-y-6 w-full max-w-lg">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
