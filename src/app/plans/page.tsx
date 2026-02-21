
'use client';
import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardList, User, Calendar, Activity, Target, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import DietPlanDisplay from '@/components/dashboard/DietPlanDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PlansPage() {
  const { dietPlans, removeDietPlan, isLoading } = useUserData();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold font-headline text-foreground flex items-center gap-2">
                <ClipboardList className="text-primary"/>
                Diet Plan History
            </h1>
            <p className="text-muted-foreground">All of your AI-generated diet plans.</p>
        </div>
      </header>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 pr-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : dietPlans.length === 0 ? (
            <div className="text-center text-muted-foreground py-24">
                <p className="text-lg">No diet plans found.</p>
                <p className="text-sm">Complete your profile to generate your first plan.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {dietPlans.map((plan) => (
                <AccordionItem value={`item-${plan.id}`} key={plan.id} className="border rounded-lg bg-card shadow-sm">
                    <div className="flex items-center p-4">
                        <AccordionTrigger className="font-semibold text-lg hover:no-underline p-0">
                            <div className='flex items-center gap-4'>
                                <Calendar className="h-5 w-5 text-primary/80"/>
                                <span>Plan from {format(new Date(plan.createdAt), 'MMMM d, yyyy')}</span>
                            </div>
                        </AccordionTrigger>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 shrink-0">
                                    <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this diet plan.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeDietPlan(plan.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <AccordionContent className="p-4 pt-0">
                        <DietPlanDisplay planContent={plan.content} />
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className='text-md'>Profile Used for this Plan</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className='flex items-center gap-2'><User className="h-4 w-4 text-muted-foreground"/> <span>{plan.profileSnapshot.age} years</span></div>
                                <div className='flex items-center gap-2'><User className="h-4 w-4 text-muted-foreground"/> <span>{plan.profileSnapshot.weight} kg</span></div>
                                <div className='flex items-center gap-2'><User className="h-4 w-4 text-muted-foreground"/> <span>{plan.profileSnapshot.height} cm</span></div>
                                <div className='flex items-center gap-2'><Activity className="h-4 w-4 text-muted-foreground"/> <span>{plan.profileSnapshot.activityLevel}</span></div>
                                <div className='flex items-center gap-2 col-span-2'><Target className="h-4 w-4 text-muted-foreground"/> <span>Goal: {plan.profileSnapshot.goals}</span></div>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
