
'use client';

import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

export default function StreakCard() {
    const { streak } = useUserData();

    return (
      <Card className="shadow-sm hover-shadow-md transition-shadow flex flex-col items-center justify-center text-center bg-gradient-to-br from-amber-200 to-yellow-400 overflow-hidden">
        <CardHeader className="z-10">
          <CardTitle className="flex items-center gap-2 font-headline text-yellow-900/90">
            <Flame className="text-orange-500" />
            Goal Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="relative flex-1 flex items-center justify-center w-full">
            <Flame className="absolute w-full h-full text-orange-400/30 animate-flame-up" />
            <div className="z-10 flex flex-col items-center justify-center">
                <p className="text-5xl font-bold text-orange-700">{streak.count}</p>
                <p className="text-sm text-orange-800/80 -mt-1">{streak.count === 1 ? "day" : "days"}</p>
            </div>
        </CardContent>
      </Card>
    )
}
