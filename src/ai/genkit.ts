import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  // Explicitly read the Gemini API key from environment variables.
  // Preferred: GOOGLE_API_KEY. Fallback: GEMINI_API_KEY.
  // Do NOT expose these on the client; they are server-only secrets.
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
