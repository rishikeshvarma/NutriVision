"use client";

import { useUserData } from "@/hooks/use-user-data";
import SummaryCards from "./SummaryCards";
import TodaysPlan from "./TodaysPlan";
import DailyLog from "./DailyLog";

export default function Dashboard() {
  const { profile } = useUserData();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <p className="text-xl font-bold text-foreground">{profile?.name}!</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <div className="space-y-6">
        <SummaryCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <TodaysPlan />
            <DailyLog />
          </div>
        </div>
      </div>
    </div>
  );
}
