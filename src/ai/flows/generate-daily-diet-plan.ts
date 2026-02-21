
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized daily diet plan based on user onboarding details.
 *
 * - generateDailyDietPlan - A function that triggers the diet plan generation flow.
 * - GenerateDailyDietPlanInput - The input type for the generateDailyDietPlan function.
 * - GenerateDailyDietPlanOutput - The return type for the generateDailyDietPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyDietPlanInputSchema = z.object({
  age: z.number().describe('The age of the user in years.'),
  weight: z.number().describe('The weight of the user in kilograms.'),
  height: z.number().describe('The height of the user in centimeters.'),
  activityLevel: z
    .enum(['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive'])
    .describe('The activity level of the user.'),
  goals: z
    .enum(['weightLoss', 'weightGain', 'maintainWeight'])
    .describe('The goals of the user.'),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe('Any dietary restrictions or preferences the user has, comma separated (e.g., vegetarian, gluten-free, no nuts).'),
  location: z.string().optional().describe("The user's location (e.g., 'city, country') to suggest local cuisine."),
});
export type GenerateDailyDietPlanInput = z.infer<typeof GenerateDailyDietPlanInputSchema>;

const NutritionSchema = z.object({
    calories: z.number().describe('The numerical value for calories.'),
    protein: z.number().describe('The numerical value for protein in grams.'),
    carbohydrates: z.number().describe('The numerical value for carbohydrates in grams.'),
    fats: z.number().describe('The numerical value for fats in grams.'),
});

const MealSchema = z.object({
    title: z.string().describe('The title of the meal (e.g., "Breakfast").'),
    description: z.string().describe('A short, appealing description of the meal.'),
    ingredients: z.array(z.string()).describe('A list of ingredients for the meal.'),
    preparation: z.array(z.string()).describe('A list of preparation steps.'),
    nutrition: NutritionSchema.describe('The estimated nutritional information for the meal.'),
});

const GenerateDailyDietPlanOutputSchema = z.object({
    title: z.string().describe('A creative and personalized title for the diet plan.'),
    intro: z.string().describe('A brief, encouraging introductory paragraph about the plan.'),
    meals: z.array(MealSchema).describe('An array of meal objects for the day.'),
    totals: z.object({
        description: z.string().describe('A concluding summary paragraph about the total nutrition.'),
        nutrition: NutritionSchema.describe('The total estimated nutritional information for the entire day.'),
    }).describe('The total estimated nutrition for the day.'),
});


export type GenerateDailyDietPlanOutput = z.infer<typeof GenerateDailyDietPlanOutputSchema>;

export async function generateDailyDietPlan(input: GenerateDailyDietPlanInput): Promise<GenerateDailyDietPlanOutput> {
  return generateDailyDietPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyDietPlanPrompt',
  input: {schema: GenerateDailyDietPlanInputSchema},
  output: {schema: GenerateDailyDietPlanOutputSchema},
  prompt: `You are an expert nutritionist creating a personalized daily diet plan.

  User Details:
  - Age: {{{age}}}
  - Weight: {{{weight}}} kg
  - Height: {{{height}}} cm
  - Activity Level: {{{activityLevel}}}
  - Primary Goal: {{{goals}}}
  - Dietary Restrictions/Preferences: {{{dietaryRestrictions}}}
  {{#if location}}- User Location: {{{location}}}{{/if}}

  Task:
  Generate a detailed, creative, and delicious daily diet plan.
  The output MUST be a valid JSON object matching the output schema.
  
  IMPORTANT: For all nutrition fields (calories, protein, carbohydrates, fats), provide only the numerical value. Do NOT include units like "kcal" or "g" in the response.

  Ensure the total daily calories and macronutrients align with the user's goal (e.g., surplus for weight gain, deficit for weight loss, maintenance otherwise).
  Do not wrap the output in markdown code blocks. The entire output must be a single, valid JSON object.
  `,
});

const generateDailyDietPlanFlow = ai.defineFlow(
  {
    name: 'generateDailyDietPlanFlow',
    inputSchema: GenerateDailyDietPlanInputSchema,
    outputSchema: GenerateDailyDietPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
