import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export async function generateReview(
  tags: string[],
  rating: number,
  businessName: string
): Promise<string> {
  const tagList = tags.join(', ');

  const prompt = `Generate a natural sounding Google review for a retail clothing store called "${businessName}".

The customer rated the store ${rating} out of 5 stars.
They highlighted these positive aspects: ${tagList}.

Rules:
- Write in first person as a real customer
- Do not exaggerate or use overly enthusiastic language
- Keep between 40 and 90 words
- Use a natural, human tone
- Incorporate the selected tags naturally into the review
- Do not use hashtags or emojis
- Do not mention the star rating number
- Make it sound authentic and genuine
- Vary sentence structure for naturalness

Write only the review text, nothing else.`;

  try {
    const model = getGeminiClient().getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: 'You are a helpful assistant that generates authentic Google reviews for retail stores. Your reviews should sound like they were written by real customers.',
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.8,
      },
    });

    const result = await model.generateContent(prompt);
    const review = result.response.text().trim();

    if (!review) {
      throw new Error('No review generated');
    }

    return review;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate review. Please try again.');
  }
}
