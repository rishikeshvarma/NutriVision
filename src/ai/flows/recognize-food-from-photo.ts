'use server';
/**
 * @fileOverview Recognizes food items from a photo and estimates calorie and macro content.
 *
 * - recognizeFood - A function that handles the food recognition process.
 * - RecognizeFoodInput - The input type for the recognizeFood function.
 * - RecognizeFoodOutput - The return type for the recognizeFood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeFoodInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecognizeFoodInput = z.infer<typeof RecognizeFoodInputSchema>;

const RecognizeFoodOutputSchema = z.object({
  foodItems: z
    .array(
      z.object({
        name: z.string().describe('The name of the identified food item.'),
        quantity: z
          .number()
          .describe('The quantity of this specific food item.'),
        calories: z
          .number()
          .describe('The estimated calorie content for a single unit of this item.'),
        protein: z
          .number()
          .describe('The estimated protein content for a single unit of this item.'),
        carbohydrates: z
          .number()
          .describe('The estimated carbohydrate content for a single unit of this item.'),
        fat: z
          .number()
          .describe('The estimated fat content for a single unit of this item.'),
      })
    )
    .describe(
      'An array of recognized food items with their quantity and estimated nutritional content per single unit.'
    ),
});
export type RecognizeFoodOutput = z.infer<typeof RecognizeFoodOutputSchema>;

export async function recognizeFood(input: RecognizeFoodInput): Promise<RecognizeFoodOutput> {
  return recognizeFoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeFoodPrompt',
  input: {schema: RecognizeFoodInputSchema},
  output: {schema: RecognizeFoodOutputSchema},
  prompt: `You are an AI food recognition expert. Analyze the following photo to identify all food items.

  Key Instructions:
  1.  Group identical items together. For example, if you see three bananas, create one entry for "Banana" with a quantity of 3.
  2.  For each unique food item, provide the estimated nutritional information (calories, protein, carbohydrates, fat) for a *single unit* of that item.
  3.  Return the data in the specified JSON format.

  Analyze the following photo:
  Photo: {{media url=photoDataUri}}
  `,
});

const recognizeFoodFlow = ai.defineFlow(
  {
    name: 'recognizeFoodFlow',
    inputSchema: RecognizeFoodInputSchema,
    outputSchema: RecognizeFoodOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
