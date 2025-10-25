'use server';

/**
 * @fileOverview An AI agent that suggests how to retry a body scan if the initial scan was of low quality.
 *
 * - suggestScanRetry - A function that suggests how to retry a body scan.
 * - SuggestScanRetryInput - The input type for the suggestScanRetry function.
 * - SuggestScanRetryOutput - The return type for the suggestScanRetry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestScanRetryInputSchema = z.object({
  scanQualityScore: z
    .number()
    .describe('A score representing the quality of the previous scan (0-1).'),
  lightingConditions: z
    .string()
    .describe('Description of the lighting conditions during the scan.'),
  userPosture: z
    .string()
    .describe('Description of the user\'s posture during the scan.'),
  clothingFit: z
    .string()
    .describe('Description of how well the user\'s clothing fit during the scan.'),
});
export type SuggestScanRetryInput = z.infer<typeof SuggestScanRetryInputSchema>;

const SuggestScanRetryOutputSchema = z.object({
  retrySuggested: z
    .boolean()
    .describe('Whether or not a retry is suggested based on the scan quality.'),
  feedback: z
    .string()
    .describe('Specific feedback and suggestions on how to improve the next scan.'),
});
export type SuggestScanRetryOutput = z.infer<typeof SuggestScanRetryOutputSchema>;

export async function suggestScanRetry(
  input: SuggestScanRetryInput
): Promise<SuggestScanRetryOutput> {
  return suggestScanRetryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestScanRetryPrompt',
  input: {schema: SuggestScanRetryInputSchema},
  output: {schema: SuggestScanRetryOutputSchema},
  prompt: `You are an AI assistant that analyzes body scan data and suggests how users can improve their next scan attempt.

Given the following information about a user's previous scan:

Scan Quality Score: {{scanQualityScore}}
Lighting Conditions: {{lightingConditions}}
User Posture: {{userPosture}}
Clothing Fit: {{clothingFit}}

Determine if a retry is suggested based on the scan quality score. If the score is below 0.7, suggest a retry.
Provide specific feedback and suggestions to the user on how to improve their next scan. This may include adjusting lighting, posture, or clothing.

Output:
retrySuggested: Whether or not a retry is suggested (true/false)
feedback: Specific, actionable advice for improving the next scan.
`,
});

const suggestScanRetryFlow = ai.defineFlow(
  {
    name: 'suggestScanRetryFlow',
    inputSchema: SuggestScanRetryInputSchema,
    outputSchema: SuggestScanRetryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
