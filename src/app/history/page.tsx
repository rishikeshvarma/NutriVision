
'use client';
import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
  const { dailyLogs, removeFoodItem, isLoading } = useUserData();

  const sortedDates = Object.keys(dailyLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold font-headline text-foreground flex items-center gap-2">
                <BookOpen className="text-primary"/>
                Meal History
            </h1>
            <p className="text-muted-foreground">A complete record of all your logged meals.</p>
        </div>
      </header>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
            {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
            ) : sortedDates.length === 0 ? (
                <div className="text-center text-muted-foreground py-24">
                    <p className="text-lg">No meals logged yet.</p>
                    <p className="text-sm">Your logged meals will appear here.</p>
                </div>
            ) : (
                sortedDates.map(date => (
                    <Card key={date} className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                                <Calendar className="h-5 w-5 text-primary/80"/>
                                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        {dailyLogs[date].meals.map(meal => (
                            <Card key={meal.id} className="bg-secondary/50">
                                <CardHeader className="flex-row items-center justify-between py-3 px-4">
                                <CardTitle className="text-base font-semibold">{meal.name}</CardTitle>
                                <CardDescription className="text-xs">{format(new Date(meal.createdAt), "h:mm a")}</CardDescription>
                                </CardHeader>
                                <CardContent className="px-4 pb-3">
                                <ul className="space-y-2">
                                    {meal.items.map((item) => (
                                    <li key={item.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-background">
                                        <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.calories} kcal · P: {item.protein}g · C: {item.carbohydrates}g · F: {item.fat}g
                                        </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFoodItem(meal.id, item.id, date)}>
                                            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                        </Button>
                                    </li>
                                    ))}
                                </ul>
                                </CardContent>
                            </Card>
                        ))}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
