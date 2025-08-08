import { GoogleGenerativeAI } from '@google/generative-ai';
import { StoryNode, StoryContext } from '../types/game';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const COMBAT_CHANCE = 0.2; // 20% chance of combat
const CHAPTER_PROGRESS_THRESHOLD = 5; // Number of steps before considering chapter advancement

// Helper function to extract keywords from recent choices
function extractKeywords(choices: string[]): string[] {
  const keywords = new Set<string>();
  const recentChoices = choices.slice(-3); // Only last 3 choices
  
  recentChoices.forEach(choice => {
    const words = choice.toLowerCase()
      .split(/[^a-z]+/)
      .filter(word => word.length > 3 && !['with', 'that', 'this', 'they', 'were', 'have', 'been'].includes(word));
    words.forEach(word => keywords.add(word));
  });
  
  return Array.from(keywords).slice(0, 10); // Max 10 keywords
}

// Helper function to get recent combat summary
function getRecentCombatSummary(combatHistory: string[]): string {
  if (combatHistory.length === 0) return 'No recent combat';
  const recent = combatHistory.slice(-2); // Only last 2 combat events
  return recent.join(', ');
}

export async function generateStoryNode(
  context: StoryContext,
  playerName: string
): Promise<StoryNode> {
  const shouldInitiateCombat = Math.random() < COMBAT_CHANCE;
  const shouldAdvanceChapter = context.currentStep % CHAPTER_PROGRESS_THRESHOLD === 0;
  
  // Extract keywords instead of full context
  const keywords = extractKeywords(context.playerChoices);
  const recentCombat = getRecentCombatSummary(context.combatHistory);

  const prompt = `
Generate post-apocalyptic story for ${playerName}. Chapter ${context.currentChapter}, Step ${context.currentStep}.

Recent context keywords: ${keywords.join(', ')}
Recent combat: ${recentCombat}

Stats: Health ${context.playerStats.health}%, Power ${context.playerStats.power}, Defense ${context.playerStats.defense}, Level ${context.playerStats.level}, XP ${context.playerStats.experience}

Conditions:
${shouldInitiateCombat ? '- Include combat encounter' : ''}
${shouldAdvanceChapter ? '- Consider chapter advancement' : ''}
${context.playerStats.health < 30 ? '- Include healing option' : ''}
${context.playerStats.level < 3 ? '- Include growth opportunity' : ''}

Generate JSON:
{
  "description": "2-3 sentence story description",
  "chapter": ${shouldAdvanceChapter ? 'number (can increase)' : context.currentChapter},
  "options": [
    {
      "option": "Choice text",
      "next": ${context.currentStep + 1},
      "consequences": {"health": number, "power": number, "defense": number, "experience": number}
    }
  ],
  "isInCombat": ${shouldInitiateCombat}${shouldInitiateCombat ? ',\n  "enemyType": "zombie/raider/mutant",\n  "enemyHealth": 50-100' : ''}
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
    
    // If it's a 503 or overload error, try with retry logic
    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      return await generateStoryNodeWithRetry(context, playerName, keywords, recentCombat, shouldInitiateCombat, shouldAdvanceChapter);
    }
    
    // For other errors, return fallback immediately
    return getFallbackStoryNode(context, shouldInitiateCombat);
  }
}

// Retry function with exponential backoff
async function generateStoryNodeWithRetry(
  context: StoryContext,
  playerName: string,
  keywords: string[],
  recentCombat: string,
  shouldInitiateCombat: boolean,
  shouldAdvanceChapter: boolean,
  attempt: number = 0
): Promise<StoryNode> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  if (attempt >= maxRetries) {
    console.log('Max retries reached, using fallback story');
    return getFallbackStoryNode(context, shouldInitiateCombat);
  }

  try {
    // Wait before retry (exponential backoff)
    if (attempt > 0) {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const prompt = `
Generate post-apocalyptic story for ${playerName}. Chapter ${context.currentChapter}, Step ${context.currentStep}.

Recent context keywords: ${keywords.join(', ')}
Recent combat: ${recentCombat}

Stats: Health ${context.playerStats.health}%, Power ${context.playerStats.power}, Defense ${context.playerStats.defense}, Level ${context.playerStats.level}, XP ${context.playerStats.experience}

Conditions:
${shouldInitiateCombat ? '- Include combat encounter' : ''}
${shouldAdvanceChapter ? '- Consider chapter advancement' : ''}
${context.playerStats.health < 30 ? '- Include healing option' : ''}
${context.playerStats.level < 3 ? '- Include growth opportunity' : ''}

Generate JSON:
{
  "description": "2-3 sentence story description",
  "chapter": ${shouldAdvanceChapter ? 'number (can increase)' : context.currentChapter},
  "options": [
    {
      "option": "Choice text",
      "next": ${context.currentStep + 1},
      "consequences": {"health": number, "power": number, "defense": number, "experience": number}
    }
  ],
  "isInCombat": ${shouldInitiateCombat}${shouldInitiateCombat ? ',\n  "enemyType": "zombie/raider/mutant",\n  "enemyHealth": 50-100' : ''}
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.trim();
    const startIdx = jsonStr.indexOf('{');
    const endIdx = jsonStr.lastIndexOf('}') + 1;
    const cleanJson = jsonStr.slice(startIdx, endIdx);
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`Retry attempt ${attempt + 1} failed:`, error);
    return generateStoryNodeWithRetry(context, playerName, keywords, recentCombat, shouldInitiateCombat, shouldAdvanceChapter, attempt + 1);
  }
}

// Fallback story generator for when API is unavailable
function getFallbackStoryNode(context: StoryContext, shouldInitiateCombat: boolean): StoryNode {
  const fallbackStories = [
    {
      description: "You notice movement in the shadows ahead. The air feels tense, and you must decide your next move carefully.",
      combat: {
        description: "A raider emerges from behind a rusted car, weapon drawn and eyes wild with desperation.",
        enemyType: "raider",
        enemyHealth: 75
      }
    },
    {
      description: "A abandoned building looms before you, its broken windows like empty eyes. You hear faint sounds from within.",
      combat: {
        description: "Infected creatures shamble out of the building's entrance, attracted by your presence.",
        enemyType: "zombie",
        enemyHealth: 60
      }
    },
    {
      description: "You discover a cache of supplies hidden behind debris. This could be exactly what you need to survive.",
      combat: {
        description: "A mutant beast guards the supplies, its growl echoing through the wasteland.",
        enemyType: "mutant",
        enemyHealth: 90
      }
    }
  ];

  const randomStory = fallbackStories[Math.floor(Math.random() * fallbackStories.length)];
  const baseOptions = [
    {
      option: "Approach cautiously and assess the situation",
      next: context.currentStep + 1,
      consequences: { defense: 2, experience: 15 }
    },
    {
      option: "Take a bold action and move forward decisively",
      next: context.currentStep + 1,
      consequences: { power: 3, experience: 20 }
    }
  ];

  const combatOptions = [
    {
      option: "Engage in direct combat",
      next: context.currentStep + 1,
      consequences: { power: 5, experience: 25, health: -10 }
    },
    {
      option: "Try to avoid confrontation",
      next: context.currentStep + 1,
      consequences: { defense: 3, experience: 15 }
    }
  ];

  return {
    description: shouldInitiateCombat ? randomStory.combat.description : randomStory.description,
    chapter: context.currentChapter,
    options: shouldInitiateCombat ? combatOptions : baseOptions,
    isInCombat: shouldInitiateCombat,
    ...(shouldInitiateCombat && {
      enemyType: randomStory.combat.enemyType,
      enemyHealth: randomStory.combat.enemyHealth
    })
  };
}