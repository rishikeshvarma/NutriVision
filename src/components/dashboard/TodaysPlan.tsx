"use client";

import { useUserData } from "@/hooks/use-user-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Loader2 } from "lucide-react";
import DietPlanDisplay from "./DietPlanDisplay";

export default function TodaysPlan() {
  const { dietPlan, isLoading } = useUserData();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-secondary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ClipboardList className="text-primary" />
          AI-Generated Daily Plan
        </CardTitle>
        <CardDescription>Your personalized meal suggestions for today. You can log meals manually or by scanning.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-semibold">View Your Plan</AccordionTrigger>
            <AccordionContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : dietPlan ? (
                <DietPlanDisplay planContent={dietPlan.content} />
              ) : (
                <p className="text-muted-foreground p-4 text-center">Your diet plan is not available. Please complete onboarding.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
