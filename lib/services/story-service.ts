import { GoogleGenerativeAI } from '@google/generative-ai';
import { StoryNode, StoryContext } from '../types/game';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const COMBAT_CHANCE = 0.2; // 20% chance of combat
const CHAPTER_PROGRESS_THRESHOLD = 5; // Number of steps before considering chapter advancement

export async function generateStoryNode(
  context: StoryContext,
  playerName: string
): Promise<StoryNode> {
  const shouldInitiateCombat = Math.random() < COMBAT_CHANCE;
  const shouldAdvanceChapter = context.currentStep % CHAPTER_PROGRESS_THRESHOLD === 0;

  const prompt = `
You are generating an interactive post-apocalyptic story about ${playerName}. This is Chapter ${context.currentChapter}, Step ${context.currentStep}.

Previous story context:
${context.playerChoices.join('\n')}

Player's current stats:
- Health: ${context.playerStats.health}%
- Power: ${context.playerStats.power}
- Defense: ${context.playerStats.defense}
- Level: ${context.playerStats.level}
- Experience: ${context.playerStats.experience}

Combat history:
${context.combatHistory.join('\n')}

Special conditions:
${shouldInitiateCombat ? '- Include a combat encounter' : ''}
${shouldAdvanceChapter ? '- Consider advancing to next chapter if story progression warrants it' : ''}
${context.playerStats.health < 30 ? '- Include healing opportunities' : ''}
${context.playerStats.level < 3 ? '- Include training/growth opportunities' : ''}

Generate the next story node with:
1. A vivid description (2-3 sentences)
2. Two meaningful choices with consequences
3. If in combat, make choices combat-related (fight, dodge, use environment, etc.)
4. Always include stat changes in consequences
5. Experience rewards should be 10-30 points for significant actions

Response must be a JSON object with this structure:
{
  "description": "Story description",
  "chapter": ${shouldAdvanceChapter ? 'number (can be increased)' : context.currentChapter},
  "options": [
    {
      "option": "Choice description",
      "next": ${context.currentStep + 1},
      "consequences": {
        "health": number (optional),
        "power": number (optional),
        "defense": number (optional),
        "experience": number (optional)
      }
    }
  ],
  "isInCombat": ${shouldInitiateCombat},
  ${shouldInitiateCombat ? `
  "enemyType": "string (zombie, raider, mutant, etc.)",
  "enemyHealth": number (50-100)
  ` : ''}
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.trim();
    const startIdx = jsonStr.indexOf('{');
    const endIdx = jsonStr.lastIndexOf('}') + 1;
    const cleanJson = jsonStr.slice(startIdx, endIdx);
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating story node:', error);
    return {
      description: "Connection error. The story continues...",
      chapter: context.currentChapter,
      options: [
        { 
          option: "Try again", 
          next: context.currentStep,
          consequences: { health: 10, experience: 5 }
        },
        { 
          option: "Rest and recover", 
          next: context.currentStep,
          consequences: { health: 20, experience: 10 }
        }
      ]
    };
  }
}