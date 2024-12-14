import { HfInference } from '@huggingface/inference';
import { StoryNode } from '../types/game';

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

console.log('Hugging Face API key:', process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

export async function generateStoryNode(
  context: string,
  chapterId: number,
  stepId: number,
  playerName: string
): Promise<StoryNode> {
  const prompt = `
You are a creative AI helping to generate an interactive story about ${playerName} in a post-apocalyptic world. Based on the following context:
${context}

Create a new story node for Chapter ${chapterId}, Step ${stepId}. Include:
- A vivid description of what happens at this step (2-3 sentences).
- Two distinct choices for the player with clear consequences.
- The next step IDs for each choice.

Format the response exactly as a JSON object with this structure:
{
  "description": "Description of the step",
  "options": [
    { "option": "Choice 1 description", "next": nextStepId1 },
    { "option": "Choice 2 description", "next": nextStepId2 }
  ]
}`;

  try {
    const response = await retryGeneration(prompt);
    
    const jsonStr = response.generated_text.trim();
    const startIdx = jsonStr.indexOf('{');
    const endIdx = jsonStr.lastIndexOf('}') + 1;
    const cleanJson = jsonStr.slice(startIdx, endIdx);
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating story node:', error);
    return {
      description: "Connection error. The story continues...",
      options: [
        { option: "Try again", next: stepId },
        { option: "Return to previous chapter", next: stepId - 1 }
      ]
    };
  }
}

async function retryGeneration(prompt: string, retryCount = 0) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is not set');
  }

  try {
    const response = await hf.textGeneration({
      model: 'tiiuae/falcon-7b-instruct',
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
      },
    });

    return response;
  } catch (error) {
    if (retryCount < 3) {
      // Exponential backoff
      const waitTime = Math.pow(2, retryCount) * 1000;
      console.log(`Retrying in ${waitTime/1000} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return retryGeneration(prompt, retryCount + 1);
    }
    throw error;
  }
}