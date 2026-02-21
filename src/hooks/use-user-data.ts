
"use client";

import { useMemo, useCallback, useState, useEffect } from 'react';
import type { UserProfile, DailyLog, Meal, FoodItem, Streak, DietPlan } from '@/lib/types';
import { generateDailyDietPlan } from '@/ai/flows/generate-daily-diet-plan';
import { useToast } from './use-toast';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format, isToday, isYesterday, subDays, startOfDay } from 'date-fns';
import { useCelebration } from '@/context/CelebrationContext';

const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

// These calculations provide a baseline for nutritional goals.
const activityMultipliers = {
  sedentary: 1.2,
  lightlyActive: 1.375,
  moderatelyActive: 1.55,
  veryActive: 1.725,
  extraActive: 1.9,
};

const goalAdjustments = {
  weightLoss: -500,
  maintainWeight: 0,
  weightGain: 500,
};

const macroRatios = {
    weightLoss: { p: 0.4, c: 0.3, f: 0.3 },
    maintainWeight: { p: 0.3, c: 0.4, f: 0.3 },
    weightGain: { p: 0.3, c: 0.5, f: 0.2 },
};

/**
 * A comprehensive hook for managing all user-related data in Firestore.
 * It handles fetching, creating, and updating user profiles, diet plans, daily logs, and streaks.
 * All data is stored under the currently authenticated user's ID.
 */
export function useUserData() {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [isInitialPlanCheckDone, setIsInitialPlanCheckDone] = useState(false);
    const { triggerCelebration } = useCelebration();


    const userId = user?.uid;

    // Memoized document and collection references
    const profileRef = useMemoFirebase(() => userId ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const dietPlansRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'dietPlans') : null, [firestore, userId]);
    const dailyLogsRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'dailyLogs') : null, [firestore, userId]);
    const streakRef = useMemoFirebase(() => userId ? doc(firestore, 'users', userId, 'streak', 'current') : null, [firestore, userId]);

    // Real-time data fetching using custom hooks
    const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);
    const { data: dietPlans, isLoading: arePlansLoading } = useCollection<DietPlan>(dietPlansRef);
    const { data: dailyLogs, isLoading: areLogsLoading } = useCollection<DailyLog>(dailyLogsRef);
    const { data: streakDoc, isLoading: isStreakLoading } = useDoc<Streak>(streakRef);
    
    /**
     * Calculates the user's daily caloric and macronutrient goals based on their profile.
     */
    const calculateGoals = useCallback((userProfile: UserProfile | null) => {
      if (!userProfile) {
        return { calorieGoal: 2000, proteinGoal: 150, carbGoal: 200, fatGoal: 60 };
      }
      // Harris-Benedict equation for Basal Metabolic Rate (BMR)
      const bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
      // Total Daily Energy Expenditure (TDEE)
      const tdee = bmr * (activityMultipliers[userProfile.activityLevel] || 1.55);
      const calorieGoal = Math.round(tdee + (goalAdjustments[userProfile.goals] || 0));
      
      const ratios = macroRatios[userProfile.goals] || macroRatios.maintainWeight;
      const proteinGoal = Math.round((calorieGoal * ratios.p) / 4);
      const carbGoal = Math.round((calorieGoal * ratios.c) / 4);
      const fatGoal = Math.round((calorieGoal * ratios.f) / 9);

      return { calorieGoal, proteinGoal, carbGoal, fatGoal };
    }, []);
    
    const sortedDietPlans = useMemo(() => {
      if (!dietPlans) return [];
      return [...dietPlans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [dietPlans]);

    const latestPlan = useMemo(() => sortedDietPlans.length > 0 ? sortedDietPlans[0] : null, [sortedDietPlans]);

    const generateAndSavePlan = useCallback(async (userProfile: UserProfile) => {
        if (!firestore || !userId || !dietPlansRef || isGeneratingPlan) return;
        setIsGeneratingPlan(true);
        try {
            toast({ title: "Generating New Daily Plan...", description: "Our AI is crafting a fresh plan for you." });
            const planResult = await generateDailyDietPlan({
                ...userProfile,
                dietaryRestrictions: userProfile.dietaryRestrictions || 'None',
                location: userProfile.location || undefined,
            });
            
            addDocumentNonBlocking(dietPlansRef, {
                createdAt: new Date().toISOString(),
                content: JSON.stringify(planResult),
                profileSnapshot: userProfile,
            });

            toast({ title: "New Diet Plan Generated!", description: "Your personalized plan for today is ready." });
        } catch (error) {
             console.error("Failed to generate plan", error);
             toast({ title: "AI Error", description: "Could not generate your diet plan. Please try again.", variant: "destructive" });
        } finally {
            setIsGeneratingPlan(false);
        }
    }, [firestore, userId, dietPlansRef, toast, isGeneratingPlan]);
    
    // Effect to auto-generate a plan for a new day, or on first login
    useEffect(() => {
        const hasFinishedInitialLoad = !isUserLoading && !isProfileLoading && !arePlansLoading;
        
        if (hasFinishedInitialLoad && profile && !isInitialPlanCheckDone) {
            setIsInitialPlanCheckDone(true); // Mark that we've done the check for this session
            const hasPlanForToday = latestPlan ? isToday(new Date(latestPlan.createdAt)) : false;
            
            if (!hasPlanForToday) {
                generateAndSavePlan(profile);
            }
        }
    }, [isUserLoading, isProfileLoading, arePlansLoading, profile, latestPlan, isInitialPlanCheckDone, generateAndSavePlan]);


    /**
     * Saves the user's profile and, if requested, generates a new AI diet plan.
     * It also initializes or updates today's log with the new goals.
     */
    const saveProfileAndGeneratePlan = useCallback(async (newProfile: UserProfile, regenerate: boolean = true) => {
        if (!firestore || !userId || !profileRef) return;

        setDocumentNonBlocking(profileRef, newProfile, { merge: true });

        if (regenerate) {
            await generateAndSavePlan(newProfile);
        }
        
        const today = getTodayDateString();
        const todayLogDocRef = doc(firestore, 'users', userId, 'dailyLogs', today);
        const goals = calculateGoals(newProfile);
        const currentLog = dailyLogs?.find(l => l.id === today);

        setDocumentNonBlocking(todayLogDocRef, { 
            date: today,
            meals: currentLog?.meals || [],
            waterIntake: currentLog?.waterIntake || 0,
            ...goals
        }, { merge: true });
        
    }, [firestore, userId, profileRef, calculateGoals, dailyLogs, generateAndSavePlan]);
    
    /**
     * Updates the user's streak based on daily log data.
     */
    const updateStreak = useCallback(async () => {
        if (!firestore || !userId || !streakRef || !dailyLogs) return;

        const todayStr = getTodayDateString();
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        
        const todayLog = dailyLogs.find(l => l.id === todayStr);
        const yesterdayLog = dailyLogs.find(l => l.id === yesterdayStr);

        const currentStreak = streakDoc ?? { count: 0, lastDate: '' };
        
        let newStreakCount = 0;
        let lastStreakDate = '';

        let isStreakConsecutive = false;
        if (yesterdayLog) {
            const consumedYesterday = yesterdayLog.meals.reduce((sum, meal) => sum + meal.items.reduce((s, i) => s + i.calories, 0), 0);
            if (consumedYesterday >= yesterdayLog.calorieGoal) {
                isStreakConsecutive = true;
                const yesterdayStreakCount = currentStreak.lastDate === yesterdayStr ? currentStreak.count : 1;
                newStreakCount = yesterdayStreakCount;
                lastStreakDate = yesterdayStr;
            }
        }
        
        if (todayLog) {
            const consumedToday = todayLog.meals.reduce((sum, meal) => sum + meal.items.reduce((s, i) => s + i.calories, 0), 0);
            if (consumedToday >= todayLog.calorieGoal) {
                 if (isStreakConsecutive) {
                    newStreakCount += 1;
                } else if (currentStreak.lastDate !== todayStr) {
                    newStreakCount = 1;
                } else {
                    newStreakCount = currentStreak.count;
                }
                lastStreakDate = todayStr;
            }
        }

        if (newStreakCount !== currentStreak.count || lastStreakDate !== currentStreak.lastDate) {
             if (newStreakCount > (currentStreak.count || 0)) {
                triggerCelebration('burst');
             }
             setDocumentNonBlocking(streakRef, { count: newStreakCount, lastDate: lastStreakDate }, { merge: true });
        }
    }, [firestore, userId, streakRef, streakDoc, dailyLogs, triggerCelebration]);

    useEffect(() => {
        if(!areLogsLoading) {
            updateStreak();
        }
    }, [dailyLogs, areLogsLoading, updateStreak]);


    /**
     * Adds a new meal to the current day's log.
     */
    const addMeal = useCallback((meal: Omit<Meal, 'id' | 'createdAt'>) => {
        if (!firestore || !userId || !profile) return;
        
        const today = getTodayDateString();
        const todayLogDocRef = doc(firestore, 'users', userId, 'dailyLogs', today);
        
        const newMeal: Meal = { 
          ...meal, 
          items: meal.items.map(i => ({...i, id: doc(collection(firestore, 'temp')).id})),
          id: doc(collection(firestore, 'temp')).id,
          createdAt: new Date().toISOString() 
        };

        const currentLog = dailyLogs?.find(l => l.id === today) || { 
            date: today, 
            meals: [], 
            waterIntake: 0,
            ...(calculateGoals(profile))
        };

        const updatedMeals = [...(currentLog.meals || []), newMeal];
        
        setDocumentNonBlocking(todayLogDocRef, { ...currentLog, meals: updatedMeals }, { merge: true });
        
        toast({ title: "Meal Logged!", description: `${meal.name} has been added to your daily log.` });
    }, [firestore, userId, profile, dailyLogs, calculateGoals, toast]);
    
    /**
     * Updates the water intake for today.
     */
    const addWater = useCallback((amount: number) => {
        if (!firestore || !userId || !profile) return;

        const today = getTodayDateString();
        const todayLogDocRef = doc(firestore, 'users', userId, 'dailyLogs', today);

        const currentLog = dailyLogs?.find(l => l.id === today) || {
            date: today,
            meals: [],
            waterIntake: 0,
            ...(calculateGoals(profile))
        };
        
        const oldWaterIntake = currentLog.waterIntake || 0;
        const newWaterIntake = Math.max(0, oldWaterIntake + amount);
        const waterGoal = profile.waterIntakeGoal || 2000;

        if(oldWaterIntake < waterGoal && newWaterIntake >= waterGoal) {
            triggerCelebration('shower');
        }

        setDocumentNonBlocking(todayLogDocRef, { ...currentLog, waterIntake: newWaterIntake }, { merge: true });

    }, [firestore, userId, profile, dailyLogs, calculateGoals, triggerCelebration]);


    /**
     * Removes a specific food item from a meal in a specific log.
     */
    const removeFoodItem = useCallback(async (mealId: string, foodItemId: string, date: string = getTodayDateString()) => {
        if (!firestore || !userId) return;

        const logDocRef = doc(firestore, 'users', userId, 'dailyLogs', date);
        const logData = dailyLogs?.find(l => l.id === date);

        if (!logData) return;
        
        const updatedMeals = logData.meals.map(meal => {
            if (meal.id === mealId) {
                const updatedItems = meal.items.filter(item => item.id !== foodItemId);
                return { ...meal, items: updatedItems };
            }
            return meal;
        }).filter(meal => meal.items.length > 0);
        
        await updateDocumentNonBlocking(logDocRef, { meals: updatedMeals });

        toast({ title: "Food Item Removed", description: "The item has been removed from your log." });
    }, [firestore, userId, dailyLogs, toast]);
    
    const removeDietPlan = useCallback(async (planId: string) => {
        if (!firestore || !userId) return;
        const planDocRef = doc(firestore, 'users', userId, 'dietPlans', planId);
        await deleteDocumentNonBlocking(planDocRef);
        toast({ title: "Plan Deleted", description: "The diet plan has been removed." });
    }, [firestore, userId, toast]);

    const todayLog = useMemo(() => {
        const todayString = getTodayDateString();
        const existingLog = dailyLogs?.find(l => l.id === todayString);
    
        if (existingLog) {
            return existingLog;
        }
    
        // If no log exists for today, create a placeholder in memory.
        if (profile) {
            return {
                id: todayString,
                date: todayString,
                meals: [],
                waterIntake: 0,
                ...calculateGoals(profile),
            };
        }
    
        return null;
    }, [dailyLogs, profile, calculateGoals]);
    
    const dailyLogsById = useMemo(() => {
        if (!dailyLogs) return {};
        return dailyLogs.reduce((acc, log) => {
            acc[log.id] = log;
            return acc;
        }, {} as Record<string, DailyLog>);
    }, [dailyLogs]);

    const isLoading = isUserLoading || isGeneratingPlan || (!!user && (isProfileLoading || arePlansLoading || areLogsLoading || isStreakLoading));

    return { 
        user,
        profile, 
        dietPlan: latestPlan,
        dietPlans: sortedDietPlans,
        dailyLogs: dailyLogsById,
        todayLog,
        streak: streakDoc ?? { id: 'current', count: 0, lastDate: '' },
        isLoading, 
        saveProfileAndGeneratePlan,
        addMeal,
        removeFoodItem,
        addWater,
        removeDietPlan,
    };
}
