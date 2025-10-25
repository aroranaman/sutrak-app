'use server';
/**
 * @fileOverview Flow to generate a try-on image of a user wearing a selected garment.
 *
 * - generateTryOnImage - A function that handles the try-on image generation process.
 * - GenerateTryOnImageInput - The input type for the generateTryOnImage function.
 * - GenerateTryOnImageOutput - The return type for the generateTryOnImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTryOnImageInputSchema = z.object({
  userBodyDataUri: z
    .string()
    .describe(
      'A data URI of the user body 3D model, must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  garmentTemplateDataUri: z
    .string()
    .describe(
      'A data URI of the garment template 3D model, must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  fabricTextureDataUri: z
    .string()
    .describe(
      'A data URI of the fabric texture, must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  fit: z.enum(['truefit', 'slim', 'loose']).describe('The desired fit of the garment.'),
  views: z.array(z.enum(['front', 'side', 'back', '3/4'])).describe('The views to render.'),
});

export type GenerateTryOnImageInput = z.infer<typeof GenerateTryOnImageInputSchema>;

const GenerateTryOnImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated try-on image.'),
});

export type GenerateTryOnImageOutput = z.infer<typeof GenerateTryOnImageOutputSchema>;

export async function generateTryOnImage(input: GenerateTryOnImageInput): Promise<GenerateTryOnImageOutput> {
  return generateTryOnImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTryOnImagePrompt',
  input: {schema: GenerateTryOnImageInputSchema},
  output: {schema: GenerateTryOnImageOutputSchema},
  prompt: `You are an AI fashion assistant that generates photo-realistic images of users trying on garments.

  Use the provided user body model, garment template, and fabric texture to create a realistic image of the user wearing the garment.
  Ensure the fit is appropriate based on the user's selection ({{{fit}}}).
  Generate images for the following views: {{#each views}}{{{this}}} {{/each}}.

  User Body Model: {{media url=userBodyDataUri}}
  Garment Template: {{media url=garmentTemplateDataUri}}
  Fabric Texture: {{media url=fabricTextureDataUri}}`,
});

const generateTryOnImageFlow = ai.defineFlow(
  {
    name: 'generateTryOnImageFlow',
    inputSchema: GenerateTryOnImageInputSchema,
    outputSchema: GenerateTryOnImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
