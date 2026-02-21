
export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extraActive';
  workRoutine: 'mostlySitting' | 'mixed' | 'mostlyPhysical';
  goals: 'weightLoss' | 'maintainWeight' | 'weightGain';
  dietaryRestrictions?: string;
  location?: string;
  mealsPerDay: number;
  mealTimes: string[];
  diningOutFrequency: 'rarely' | 'occasionally' | 'frequently';
  foodPreference: 'home-cooked' | 'outside-food' | 'balanced';
  alcoholConsumption: 'none' | 'socially' | 'regularly';
  smokingHabits: 'none' | 'occasionally' | 'regularly';
  medicalConditions: string[];
  customMedicalConditions?: string;
  waterIntakeGoal: number; // in ml
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  items: FoodItem[];
  createdAt: string; // ISO string
}

export interface DailyLog {
  id: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  meals: Meal[];
  waterIntake: number; // in ml
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

export interface Streak {
    id: string; // 'current'
    count: number;
    lastDate: string; // YYYY-MM-DD
}

export interface DietPlan {
  id: string;
  createdAt: string; // ISO string
  content: string;
  profileSnapshot: UserProfile;
}

    