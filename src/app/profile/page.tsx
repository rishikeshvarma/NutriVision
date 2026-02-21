
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserData } from "@/hooks/use-user-data";
import type { UserProfile } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const medicalConditionsList = [
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hypertension', label: 'Hypertension' },
    { id: 'high_cholesterol', label: 'High Cholesterol' },
    { id: 'celiac', label: 'Celiac Disease' },
    { id: 'lactose_intolerance', label: 'Lactose Intolerance' },
    { id: 'none', label: 'None' },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(13, { message: "You must be at least 13 years old." }).max(120),
  weight: z.coerce.number().min(30, { message: "Weight must be a positive number." }),
  height: z.coerce.number().min(100, { message: "Height must be a positive number." }),
  activityLevel: z.enum(['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive']),
  workRoutine: z.enum(['mostlySitting', 'mixed', 'mostlyPhysical']),
  goals: z.enum(['weightLoss', 'maintainWeight', 'weightGain']),
  dietaryRestrictions: z.string().optional(),
  location: z.string().optional(),
  mealsPerDay: z.coerce.number().min(1).max(10),
  mealTimes: z.array(z.string()),
  diningOutFrequency: z.enum(['rarely', 'occasionally', 'frequently']),
  foodPreference: z.enum(['home-cooked', 'outside-food', 'balanced']),
  alcoholConsumption: z.enum(['none', 'socially', 'regularly']),
  smokingHabits: z.enum(['none', 'occasionally', 'regularly']),
  medicalConditions: z.array(z.string()),
  customMedicalConditions: z.string().optional(),
  waterIntakeGoal: z.coerce.number().min(1000, { message: "Goal should be at least 1000ml." }),
});

function ProfileForm({ profile, onSave, onSaveAndRegenerate, isSaving }: { profile: UserProfile, onSave: (values: UserProfile) => void, onSaveAndRegenerate: (values: UserProfile) => void, isSaving: boolean }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: profile,
  });

  useEffect(() => {
    form.reset(profile);
  }, [profile, form]);

  return (
    <Card className="shadow-sm">
      <Form {...form}>
      <form>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              {/* Basic Info */}
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Alex" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 25" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl><FormMessage /></FormItem> )} />

              {/* Activity & Work */}
              <FormField control={form.control} name="activityLevel" render={({ field }) => (
                <FormItem><FormLabel>General Activity Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="lightlyActive">Lightly Active</SelectItem>
                      <SelectItem value="moderatelyActive">Moderately Active</SelectItem>
                      <SelectItem value="veryActive">Very Active</SelectItem>
                      <SelectItem value="extraActive">Extra Active</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="workRoutine" render={({ field }) => (
                <FormItem><FormLabel>Work Routine</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="mostlySitting">Mostly Sitting</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="mostlyPhysical">Mostly Physical</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />

              {/* Eating Habits */}
              <FormField control={form.control} name="mealsPerDay" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Meals Per Day: {field.value}</FormLabel>
                <FormControl><Slider defaultValue={[field.value]} min={1} max={6} step={1} onValueChange={(value) => field.onChange(value[0])} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="diningOutFrequency" render={({ field }) => (
                <FormItem><FormLabel>Dining Out</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="frequently">Frequently</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="foodPreference" render={({ field }) => (
                <FormItem><FormLabel>Food Preference</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="home-cooked">Home-cooked</SelectItem>
                    <SelectItem value="outside-food">Outside Food</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              
              {/* Lifestyle */}
               <FormField control={form.control} name="alcoholConsumption" render={({ field }) => (
                <FormItem><FormLabel>Alcohol</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="socially">Socially</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="smokingHabits" render={({ field }) => (
                <FormItem><FormLabel>Smoking</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              
              {/* Goals and Water */}
              <FormField control={form.control} name="goals" render={({ field }) => (
                <FormItem><FormLabel>Primary Goal</FormLabel>
                <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="weightLoss" /></FormControl><FormLabel className="font-normal">Loss</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="maintainWeight" /></FormControl><FormLabel className="font-normal">Maintain</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="weightGain" /></FormControl><FormLabel className="font-normal">Gain</FormLabel></FormItem>
                </RadioGroup></FormControl><FormMessage/></FormItem>
              )} />
              <FormField control={form.control} name="waterIntakeGoal" render={({ field }) => (
                <FormItem><FormLabel>Water Goal (ml)</FormLabel><FormControl><Input type="number" step="100" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              {/* Medical & Dietary */}
              <FormField control={form.control} name="medicalConditions" render={() => (
                <FormItem className="md:col-span-2"><FormLabel>Medical Conditions</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {medicalConditionsList.map((item) => (
                      <FormField key={item.id} control={form.control} name="medicalConditions" render={({ field }) => (
                        <FormItem key={item.id} className="flex items-center space-x-2"><FormControl>
                          <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                            return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))
                          }}/>
                        </FormControl><FormLabel className="text-sm font-normal">{item.label}</FormLabel></FormItem>
                      )} />
                    ))}
                  </div><FormMessage/>
                </FormItem>
              )} />
              <FormField control={form.control} name="customMedicalConditions" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Other Conditions</FormLabel><FormControl><Textarea placeholder="Peanut allergy, IBS, etc." {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="dietaryRestrictions" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Dietary Restrictions</FormLabel><FormControl><Textarea placeholder="Vegetarian, gluten-free, etc." {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Location (Optional)</FormLabel><FormControl><Input placeholder="e.g., London, UK" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

          </CardContent>
          <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
              <Button variant="secondary" onClick={form.handleSubmit(onSave)} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
              </Button>
              <Button onClick={form.handleSubmit(onSaveAndRegenerate)} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save & Regenerate Plan
              </Button>
          </CardFooter>
      </form>
      </Form>
    </Card>
  );
}


export default function ProfilePage() {
  const { profile, saveProfileAndGeneratePlan, isLoading: isUserLoading } = useUserData();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  async function onSave(values: UserProfile) {
    setIsSaving(true);
    await saveProfileAndGeneratePlan(values, false);
    setIsSaving(false);
    toast({ title: "Profile Saved", description: "Your profile has been updated." });
  }

  async function onSaveAndRegenerate(values: UserProfile) {
    setIsSaving(true);
    await saveProfileAndGeneratePlan(values, true);
    setIsSaving(false);
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold font-headline text-foreground flex items-center gap-2">
                    <User className="text-primary"/>
                    Your Profile
                </h1>
                <p className="text-muted-foreground">Manage your personal details and goals.</p>
            </div>
        </header>

        {isUserLoading || !profile ? (
            <div className="space-y-4">
              <Skeleton className="h-[500px] w-full" />
            </div>
        ) : (
            <ProfileForm 
              profile={profile}
              onSave={onSave}
              onSaveAndRegenerate={onSaveAndRegenerate}
              isSaving={isSaving}
            />
        )}
    </div>
  );
}

    