
'use client';

import { useState } from 'react';
import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GlassWater, Minus, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function WaterTracker() {
  const { todayLog, profile, addWater } = useUserData();
  const [amountToAdd, setAmountToAdd] = useState(250); // Default to 250ml

  const waterIntake = todayLog?.waterIntake || 0;
  const waterGoal = profile?.waterIntakeGoal || 2000;
  const progress = Math.min((waterIntake / waterGoal) * 100, 100);

  const handleAddWater = () => {
    addWater(amountToAdd);
  };
  
  const handleRemoveWater = () => {
    addWater(-amountToAdd);
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-secondary/20 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-base">
          <GlassWater className="text-primary" />
          Water Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4 flex-grow">
         <p className="text-2xl font-bold text-primary">
          {waterIntake} / <span className="text-base text-muted-foreground">{waterGoal} ml</span>
        </p>
        <div className="relative w-full">
          <Progress value={progress} className="h-4 w-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-primary-foreground mix-blend-difference">
            {Math.round(progress)}%
          </div>
        </div>
      </CardContent>
       <CardFooter className="flex justify-center gap-2 pt-4">
        <Button variant="outline" size="icon" onClick={handleRemoveWater} className="h-8 w-8">
            <Minus className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="h-8 px-4" onClick={handleAddWater}>
            {`Log ${amountToAdd}ml`}
        </Button>
        <Button variant="outline" size="icon" onClick={handleAddWater} className="h-8 w-8">
            <Plus className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
