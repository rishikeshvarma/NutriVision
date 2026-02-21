
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface Meal {
    title: string;
    description: string;
    ingredients: string[];
    preparation: string[];
    nutrition: {
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
    };
}

interface DailyTotals {
    description: string;
    nutrition: {
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
    }
}

interface ParsedPlan {
  title: string;
  intro: string;
  meals: Meal[];
  totals: DailyTotals | null;
}

const parseOldMarkdownPlan = (content: string): ParsedPlan | null => {
    try {
        const sections = content.split(/---|\n## \d*\.? /).map(s => s.trim()).filter(Boolean);
        if (sections.length === 0) return null;

        // Extract title and intro from the first section
        const headerSection = sections.shift() || '';
        const titleMatch = headerSection.match(/^#\s*(.*)/);
        const title = titleMatch ? titleMatch[1].trim() : "Your Diet Plan";
        const intro = headerSection.replace(/^#\s*.*?\n/, '').trim();

        // Find and process the totals section
        let totals: DailyTotals | null = null;
        const totalsSectionIndex = sections.findIndex(s => s.toLowerCase().includes('total estimated daily nutrition'));
        if (totalsSectionIndex > -1) {
            const totalsSection = sections.splice(totalsSectionIndex, 1)[0];
            const nutritionText = totalsSection.split('\n').slice(1).join('\n');
            totals = {
                description: totalsSection.split('\n')[0].replace(/\*\*|Total Estimated Daily Nutrition:/gi, '').trim(),
                nutrition: {
                    calories: Number(nutritionText.match(/Calories:\s*\**(\d+)/i)?.[1] ?? 0),
                    protein: Number(nutritionText.match(/Protein:\s*\**(\d+)/i)?.[1] ?? 0),
                    carbohydrates: Number(nutritionText.match(/Carbohydrates?:\s*\**(\d+)/i)?.[1] ?? 0),
                    fats: Number(nutritionText.match(/Fats:\s*\**(\d+)/i)?.[1] ?? 0),
                }
            };
        }
        
        const meals: Meal[] = sections.map(section => {
            const lines = section.split('\n');
            const mealTitle = lines.shift()?.replace(/#* \d*\.?\s*/, '').replace(/\*\*/g, '').trim() || "Meal";

            const ingredientsIndex = lines.findIndex(l => l.toLowerCase().includes('ingredients'));
            const prepIndex = lines.findIndex(l => l.toLowerCase().includes('preparation'));
            const nutritionIndex = lines.findIndex(l => l.toLowerCase().includes('nutrition'));

            const description = lines.slice(0, ingredientsIndex > -1 ? ingredientsIndex : prepIndex > -1 ? prepIndex : nutritionIndex > -1 ? nutritionIndex : lines.length).join(' ').trim();
            
            const ingredients = lines.slice(ingredientsIndex + 1, prepIndex > -1 ? prepIndex : nutritionIndex > -1 ? nutritionIndex : lines.length).map(l => l.replace(/[-\*]|\d+\.\s*/g, '').trim()).filter(Boolean);
            const preparation = lines.slice(prepIndex + 1, nutritionIndex > -1 ? nutritionIndex : lines.length).map(l => l.replace(/[-\*]|\d+\.\s*/g, '').trim()).filter(Boolean);

            const nutritionLine = lines.slice(nutritionIndex).join(' ');
            const nutrition = {
                calories: Number(nutritionLine.match(/Calories:\s*\**(\d+)/i)?.[1] ?? 0),
                protein: Number(nutritionLine.match(/Protein:\s*\**(\d+)/i)?.[1] ?? 0),
                carbohydrates: Number(nutritionLine.match(/Carbohydrates?:\s*\**(\d+)/i)?.[1] ?? 0),
                fats: Number(nutritionLine.match(/Fats:\s*\**(\d+)/i)?.[1] ?? 0),
            };

            return { title: mealTitle, description, ingredients, preparation, nutrition };
        });

        return { title, intro, meals, totals };
    } catch (error) {
        console.error("Failed to parse old markdown plan:", error);
        return { title: "Diet Plan", intro: content, meals: [], totals: null };
    }
}


const parsePlanContent = (content: string): ParsedPlan | null => {
    try {
        // First, try to parse as JSON (the new format)
        const plan = JSON.parse(content);
        if (plan.title && plan.intro && Array.isArray(plan.meals)) {
            return plan;
        }
        // If it's valid JSON but not our expected format, let it fall through
        throw new Error("JSON structure is not a valid diet plan.");
    } catch (e) {
        // If JSON parsing fails, assume it's the old markdown format
        return parseOldMarkdownPlan(content);
    }
};

const getMealCardStyle = (title: string) => {
    const lowerCaseTitle = title.toLowerCase();
    const breakfastTerms = ['breakfast', 'sunrise', 'morning'];
    const lunchTerms = ['lunch', 'mid-day', 'noon'];
    const dinnerTerms = ['dinner', 'evening', 'supper'];
    const snackTerms = ['snack', 'mid-morning', 'afternoon', 'power-packed'];

    if (breakfastTerms.some(term => lowerCaseTitle.includes(term))) {
        return "bg-gradient-to-br from-amber-50 to-orange-100";
    }
    if (lunchTerms.some(term => lowerCaseTitle.includes(term))) {
        return "bg-gradient-to-br from-sky-50 to-cyan-100";
    }
    if (dinnerTerms.some(term => lowerCaseTitle.includes(term))) {
        return "bg-gradient-to-br from-indigo-50 to-purple-100";
    }
    if (snackTerms.some(term => lowerCaseTitle.includes(term))) {
        return "bg-gradient-to-br from-lime-50 to-green-100";
    }
    return "bg-gradient-to-br from-card to-secondary/20";
};


export default function DietPlanDisplay({ planContent }: { planContent: string }) {
  
  const parsedPlan = useMemo(() => {
    if (!planContent) return null;
    return parsePlanContent(planContent);
  }, [planContent]);

  if (!parsedPlan || !parsedPlan.meals || parsedPlan.meals.length === 0) {
    return (
        <div className="prose prose-sm max-w-none text-muted-foreground p-4 text-center">
            <p>There was an issue displaying your diet plan.</p>
            {planContent && <p className="text-xs mt-4">This may be an older plan. To see it in the new format, please regenerate it from your profile page.</p>}
            <pre className="mt-4 text-left text-xs whitespace-pre-wrap bg-secondary p-4 rounded-md">{planContent || 'No content available.'}</pre>
        </div>
    );
  }

  const { title, intro, meals, totals } = parsedPlan;

  return (
    <div className="space-y-6">
        <header className="text-center">
            <h2 className="text-2xl font-bold font-headline text-primary">{title}</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{intro}</p>
        </header>

        <div className="space-y-6">
            {meals.map((meal, index) => (
                <Card key={index} className={cn("shadow-sm", getMealCardStyle(meal.title))}>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">{meal.title}</CardTitle>
                        {meal.description && <p className="text-sm text-muted-foreground">{meal.description}</p>}
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        {meal.ingredients && meal.ingredients.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Ingredients</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {meal.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                        {meal.preparation && meal.preparation.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Preparation</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    {meal.preparation.map((step, i) => <li key={i}>{step}</li>)}
                                </ol>
                            </div>
                        )}
                        {(meal.nutrition.calories > 0 || meal.nutrition.protein > 0 || meal.nutrition.carbohydrates > 0 || meal.nutrition.fats > 0) && (
                             <div className="md:col-span-2">
                                 <h4 className="font-semibold mb-2">Estimated Nutrition</h4>
                                 <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    {meal.nutrition.calories > 0 && <span>Calories: {meal.nutrition.calories} kcal</span>}
                                    {meal.nutrition.protein > 0 && <span>Protein: {meal.nutrition.protein} g</span>}
                                    {meal.nutrition.carbohydrates > 0 && <span>Carbs: {meal.nutrition.carbohydrates} g</span>}
                                    {meal.nutrition.fats > 0 && <span>Fats: {meal.nutrition.fats} g</span>}
                                 </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
            {totals && (
                <Card className="shadow-sm bg-gradient-to-br from-card to-secondary/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Daily Totals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {totals.description && <p className="text-sm text-muted-foreground">{totals.description}</p>}
                        {(totals.nutrition.calories > 0 || totals.nutrition.protein > 0 || totals.nutrition.carbohydrates > 0 || totals.nutrition.fats > 0) && (
                            <div>
                                <h4 className="font-semibold mb-2">Total Estimated Nutrition</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    {totals.nutrition.calories > 0 && <span>Calories: {totals.nutrition.calories} kcal</span>}
                                    {totals.nutrition.protein > 0 && <span>Protein: {totals.nutrition.protein} g</span>}
                                    {totals.nutrition.carbohydrates > 0 && <span>Carbs: {totals.nutrition.carbohydrates} g</span>}
                                    {totals.nutrition.fats > 0 && <span>Fats: {totals.nutrition.fats} g</span>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
