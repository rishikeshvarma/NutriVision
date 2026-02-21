

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserData } from "@/hooks/use-user-data";
import type { UserProfile } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Logo from "@/components/Logo";
import { Loader2, User, Scale, Ruler, Activity, Briefcase, Utensils, GlassWater, HeartPulse, Sparkles, Wine, Cigarette, MoveRight, MoveLeft, MapPin } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { cn } from "@/lib/utils";

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

const medicalConditionsList = [
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hypertension', label: 'Hypertension' },
    { id: 'high_cholesterol', label: 'High Cholesterol' },
    { id: 'celiac', label: 'Celiac Disease' },
    { id: 'lactose_intolerance', label: 'Lactose Intolerance' },
    { id: 'none', label: 'None of the above' },
];

const getImageForStep = (step: number) => {
    const images = {
        1: PlaceHolderImages.find(img => img.id === 'hero-onboarding'),
        2: PlaceHolderImages.find(img => img.id === 'onboarding-habits'),
        3: PlaceHolderImages.find(img => img.id === 'onboarding-habits'),
        4: PlaceHolderImages.find(img => img.id === 'macros-card-bg'),
        5: PlaceHolderImages.find(img => img.id === 'onboarding-lifestyle'),
        6: PlaceHolderImages.find(img => img.id === 'onboarding-medical'),
        7: PlaceHolderImages.find(img => img.id === 'calories-card-bg'),
    };
    return images[step as keyof typeof images];
};


const totalSteps = 7;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { saveProfileAndGeneratePlan, user } = useUserData();
  const [direction, setDirection] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.displayName || "",
      age: 25,
      weight: 70,
      height: 175,
      activityLevel: "lightlyActive",
      workRoutine: "mostlySitting",
      goals: "maintainWeight",
      dietaryRestrictions: "",
      location: "",
      mealsPerDay: 3,
      mealTimes: ['08:00', '13:00', '19:00'],
      diningOutFrequency: 'occasionally',
      foodPreference: 'balanced',
      alcoholConsumption: 'none',
      smokingHabits: 'none',
      medicalConditions: [],
      customMedicalConditions: "",
      waterIntakeGoal: 2000,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    await saveProfileAndGeneratePlan(values as UserProfile);
  }

  const nextStep = () => { setDirection(1); setStep(s => s + 1); };
  const prevStep = () => { setDirection(-1); setStep(s => s - 1); };
  
  const currentImage = getImageForStep(step);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold font-headline mb-2">Crafting your personalized plan...</h1>
        <p className="text-muted-foreground max-w-md">Our AI is analyzing your details to create the perfect diet plan. This might take a moment.</p>
      </div>
    );
  }

  const StepIndicator = ({ icon: Icon, title }: { icon: React.ElementType, title: string }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold font-headline">{title}</h2>
    </div>
  );

  return (
    <div className={cn("min-h-screen w-full lg:grid lg:grid-cols-2", step % 2 === 0 && "lg:[&>*:first-child]:-order-1")}>
      <div className="relative hidden lg:block">
        <div className="absolute top-8 left-8 z-10">
            <Logo />
        </div>
        <AnimatePresence initial={false} custom={direction}>
            {currentImage && (
                 <motion.div
                    key={step}
                    initial={{ opacity: 0, x: direction * 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 50 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="h-full w-full"
                >
                    <Image
                        src={currentImage.imageUrl}
                        alt={currentImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={currentImage.imageHint}
                        priority
                    />
                </motion.div>
            )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-secondary/30">
         <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-6">
              <Logo />
            </div>

            <div className="lg:hidden mb-4 h-32 w-full relative rounded-lg overflow-hidden">
                {currentImage && 
                    <Image 
                        src={currentImage.imageUrl} 
                        alt={currentImage.description} 
                        fill 
                        className="object-cover" 
                        data-ai-hint={currentImage.imageHint}
                    />
                }
            </div>
            
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-hidden">
             <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                     key={step}
                     initial={{ opacity: 0, x: direction * 40 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -direction * 40 }}
                     transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground text-center lg:text-left">Step {step} of {totalSteps}</p>
                    <Progress value={(step / totalSteps) * 100} className="mt-1 h-2" />
                </div>
              <Card>
              {step === 1 && (
                <>
                  <CardHeader><StepIndicator icon={User} title="The Basics" /></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>What should we call you? 👋</FormLabel>
                        <FormControl><Input placeholder="e.g., Alex" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How old are you?</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 25" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                  <CardFooter><Button type="button" onClick={nextStep} className="w-full">Next <MoveRight className="ml-2" /></Button></CardFooter>
                </>
              )}

              {step === 2 && (
                <>
                  <CardHeader><StepIndicator icon={Ruler} title="Physical Details" /></CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="weight" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Scale/> Weight (kg)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="height" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Ruler/> Height (cm)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}><MoveLeft className="mr-2" />Back</Button>
                    <Button type="button" onClick={nextStep}>Next <MoveRight className="ml-2" /></Button>
                  </CardFooter>
                </>
              )}

              {step === 3 && (
                <>
                  <CardHeader><StepIndicator icon={Activity} title="Activity & Work" /></CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="activityLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Activity Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select your activity level" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                            <SelectItem value="lightlyActive">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                            <SelectItem value="moderatelyActive">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                            <SelectItem value="veryActive">Very Active (hard exercise 6-7 days a week)</SelectItem>
                            <SelectItem value="extraActive">Extra Active (very hard exercise & physical job)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="workRoutine" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Briefcase/> Your Typical Work Day</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:border-primary"><FormControl><RadioGroupItem value="mostlySitting" /></FormControl><FormLabel className="font-normal">Mostly Sitting (e.g., Desk Job)</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:border-primary"><FormControl><RadioGroupItem value="mixed" /></FormControl><FormLabel className="font-normal">Mixed (Sitting, Standing, Walking)</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:border-primary"><FormControl><RadioGroupItem value="mostlyPhysical" /></FormControl><FormLabel className="font-normal">Mostly Physical (e.g., Construction)</FormLabel></FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                     )} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}><MoveLeft className="mr-2" />Back</Button>
                    <Button type="button" onClick={nextStep}>Next <MoveRight className="ml-2" /></Button>
                  </CardFooter>
                </>
              )}

              {step === 4 && (
                <>
                  <CardHeader><StepIndicator icon={Utensils} title="Eating Habits" /></CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="mealsPerDay" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How many meals do you eat per day? ({field.value})</FormLabel>
                        <FormControl><Slider defaultValue={[field.value]} min={1} max={6} step={1} onValueChange={(value) => field.onChange(value[0])} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="diningOutFrequency" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How often do you eat out?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="rarely">Rarely (less than once a week)</SelectItem>
                            <SelectItem value="occasionally">Occasionally (1-3 times a week)</SelectItem>
                            <SelectItem value="frequently">Frequently (4+ times a week)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="foodPreference" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="home-cooked">Prefer Home-cooked Meals</SelectItem>
                            <SelectItem value="outside-food">Prefer Eating Out</SelectItem>
                            <SelectItem value="balanced">A good balance of both</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}><MoveLeft className="mr-2" />Back</Button>
                    <Button type="button" onClick={nextStep}>Next <MoveRight className="ml-2" /></Button>
                  </CardFooter>
                </>
              )}

              {step === 5 && (
                <>
                  <CardHeader><StepIndicator icon={Sparkles} title="Lifestyle Choices" /></CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="alcoholConsumption" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Wine/> Alcohol Consumption</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="socially">Socially / Occasionally</SelectItem>
                            <SelectItem value="regularly">Regularly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="smokingHabits" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Cigarette/> Smoking Habits</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="occasionally">Occasionally</SelectItem>
                            <SelectItem value="regularly">Regularly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="waterIntakeGoal" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><GlassWater/> Daily Water Intake Goal (ml)</FormLabel>
                            <FormControl><Input type="number" step="100" placeholder="e.g., 2000" {...field} /></FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}><MoveLeft className="mr-2" />Back</Button>
                    <Button type="button" onClick={nextStep}>Next <MoveRight className="ml-2" /></Button>
                  </CardFooter>
                </>
              )}

              {step === 6 && (
                <>
                  <CardHeader><StepIndicator icon={HeartPulse} title="Dietary & Medical Details" /></CardHeader>
                  <CardContent className="space-y-6">
                     <FormField control={form.control} name="medicalConditions" render={() => (
                        <FormItem>
                            <FormLabel>Do you have any of the following?</FormLabel>
                            {medicalConditionsList.map((item) => (
                                <FormField key={item.id} control={form.control} name="medicalConditions" render={({ field }) => (
                                    <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...field.value, item.id])
                                                        : field.onChange(field.value?.filter((value) => value !== item.id))
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                    </FormItem>
                                )} />
                            ))}
                            <FormMessage />
                        </FormItem>
                     )} />
                    <FormField control={form.control} name="customMedicalConditions" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Any other conditions or allergies?</FormLabel>
                            <FormControl><Textarea placeholder="e.g., Peanut allergy, IBS" {...field} /></FormControl>
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="dietaryRestrictions" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Any other dietary restrictions?</FormLabel>
                            <FormControl><Textarea placeholder="e.g., vegetarian, gluten-free, no nuts" {...field} /></FormControl>
                        </FormItem>
                     )} />
                      <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><MapPin /> Location (Optional)</FormLabel>
                            <FormControl><Input placeholder="e.g., London, UK" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}><MoveLeft className="mr-2" />Back</Button>
                    <Button type="button" onClick={nextStep}>Next <MoveRight className="ml-2" /></Button>
                  </CardFooter>
                </>
              )}

              {step === 7 && (
                <>
                  <CardHeader><StepIndicator icon={Sparkles} title="Your Primary Goal" /></CardHeader>
                  <CardContent>
                    <FormField control={form.control} name="goals" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-md border has-[:checked]:border-primary">
                                    <FormControl><RadioGroupItem value="weightLoss" /></FormControl>
                                    <FormLabel className="font-normal">⚖️ Weight Loss</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-md border has-[:checked]:border-primary">
                                    <FormControl><RadioGroupItem value="maintainWeight" /></FormControl>
                                    <FormLabel className="font-normal">🧘 Maintain Weight</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-md border has-[:checked]:border-primary">
                                    <FormControl><RadioGroupItem value="weightGain" /></FormControl>
                                    <FormLabel className="font-normal">💪 Weight Gain</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}><MoveLeft className="mr-2" />Back</Button>
                    <Button type="submit">Create My Plan</Button>
                  </CardFooter>
                </>
              )}
              </Card>
              </motion.div>
                </AnimatePresence>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
