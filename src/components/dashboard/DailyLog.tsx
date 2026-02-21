
"use client";

import { useUserData } from "@/hooks/use-user-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BookOpen, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";

export default function DailyLog() {
  const { todayLog, removeFoodItem } = useUserData();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BookOpen className="text-primary" />
          Today's Log
        </CardTitle>
        <CardDescription>A record of all the meals you've logged today.</CardDescription>
      </CardHeader>
      <CardContent>
        {(!todayLog || todayLog.meals.length === 0) ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No meals logged yet today.</p>
            <p className="text-sm">Use the "Log a Meal" feature to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayLog.meals.map((meal) => (
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFoodItem(meal.id, item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
