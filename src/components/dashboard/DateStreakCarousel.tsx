
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useUserData } from '@/hooks/use-user-data';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

export default function DateStreakCarousel() {
  const { dailyLogs, isLoading } = useUserData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [api, setApi] = useState<CarouselApi>();

  const daysInMonth = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    return eachDayOfInterval({
        start: firstDayOfMonth,
        end: lastDayOfMonth,
    });
  }, [currentMonth]);

  useEffect(() => {
    if (!api) return;

    // Find index of the selected date to scroll to it.
    const selectedDayIndex = daysInMonth.findIndex(day => isSameDay(day, selectedDate));
    if (selectedDayIndex !== -1) {
      api.scrollTo(selectedDayIndex, true);
    }
  }, [api, daysInMonth, selectedDate]);
  
  // Effect to reset selectedDate to today when month changes to current month
  useEffect(() => {
    const today = new Date();
    if(isSameDay(startOfMonth(currentMonth), startOfMonth(today))) {
        setSelectedDate(today);
    } else {
        setSelectedDate(startOfMonth(currentMonth));
    }
  }, [currentMonth]);


  const streakStatusByDate = useMemo(() => {
    if (!dailyLogs) return {};

    const statusMap: { [key: string]: 'achieved' | 'missed' } = {};
    Object.values(dailyLogs).forEach(log => {
        const consumedCalories = log.meals.reduce((sum, meal) => 
          sum + meal.items.reduce((s, i) => s + i.calories, 0), 0
        );
        if (log.calorieGoal > 0) {
            statusMap[log.id] = consumedCalories >= log.calorieGoal ? 'achieved' : 'missed';
        }
    });
    return statusMap;
  }, [dailyLogs]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleDateClick = (day: Date) => setSelectedDate(day);

  if (isLoading) {
      return <Skeleton className="h-24 w-full" />
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-secondary/20">
        <CardHeader className='pb-2 flex-row items-center justify-between relative'>
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-7 w-7 absolute left-2">
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className='text-lg font-semibold text-center w-full'>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-7 w-7 absolute right-2">
                <ChevronRight className="h-5 w-5" />
            </Button>
        </CardHeader>
        <CardContent className="py-2">
            <Carousel setApi={setApi}>
                <CarouselContent className="-ml-1">
                    {daysInMonth.map((day, index) => {
                        const dateString = format(day, 'yyyy-MM-dd');
                        const status = streakStatusByDate[dateString];
                        const isCurrent = isToday(day);
                        const isSelected = isSameDay(day, selectedDate);
                        
                        // Determine the color for the underline
                        let dayStatusColor = '';
                        if (isCurrent) {
                            dayStatusColor = status === 'achieved' ? 'bg-green-500' : 'bg-orange-500';
                        } else if (status) {
                            dayStatusColor = status === 'achieved' ? 'bg-green-500' : 'bg-red-500';
                        }

                        return (
                            <CarouselItem key={index} className="basis-1/8 pl-1">
                                <button
                                    onClick={() => handleDateClick(day)}
                                    className={cn(
                                        "flex flex-col items-center justify-center h-full w-full rounded-lg transition-colors p-2 text-center",
                                        isSelected && "border border-primary bg-primary/10"
                                    )}>
                                    <span className="text-xs text-muted-foreground">{format(day, 'E')}</span>
                                    <span className="font-bold text-lg mt-1">
                                        {format(day, 'd')}
                                    </span>
                                    <div className={cn(
                                        "h-1 w-4 rounded-full mt-1",
                                        dayStatusColor,
                                    )} />
                                </button>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
      </CardContent>
      <CardFooter className="flex justify-center items-center gap-4 text-xs text-muted-foreground pt-2 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-1 w-3 rounded-full bg-green-500" />
          <span>Achieved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-3 rounded-full bg-red-500" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-3 rounded-full bg-orange-500" />
          <span>Ongoing</span>
        </div>
      </CardFooter>
    </Card>
  );
}
