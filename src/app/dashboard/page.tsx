
'use client';

import { useUserData } from '@/hooks/use-user-data';
import DateStreakCarousel from '@/components/dashboard/DateStreakCarousel';
import TodaysPlan from '@/components/dashboard/TodaysPlan';
import DailyLog from '@/components/dashboard/DailyLog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import WaterTracker from '@/components/dashboard/WaterTracker';
import CaloriesCard from '@/components/dashboard/cards/CaloriesCard';
import MacrosCard from '@/components/dashboard/cards/MacrosCard';
import StreakCard from '@/components/dashboard/cards/StreakCard';


export default function Dashboard() {
  const { profile, isLoading } = useUserData();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error) {
      console.error("Sign out error", error);
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    }
  };


  if (isLoading) {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center mb-8">
                <div className="w-1/2 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
                <div className="w-1/4">
                    <Skeleton className="h-10 w-24" />
                </div>
            </header>
            <Skeleton className="h-20" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
            </div>
            <Skeleton className="h-64" />
            <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <p className="text-xl font-bold text-foreground">{profile?.name}!</p>
        </div>
        <div className="text-right">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <LogOut className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
        </div>
      </header>

      <div className="space-y-6">
        <DateStreakCarousel />
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <CaloriesCard />
            <MacrosCard />
            <WaterTracker />
            <StreakCard />
        </div>

        <div className="space-y-6">
            <TodaysPlan />
            <DailyLog />
        </div>
      </div>
    </div>
  );
}

    