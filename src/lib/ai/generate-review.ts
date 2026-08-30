import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
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
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates authentic Google reviews for retail stores. Your reviews should sound like they were written by real customers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const review = completion.choices[0]?.message?.content?.trim();
    
    if (!review) {
      throw new Error('No review generated');
    }

    return review;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate review. Please try again.');
  }
}
