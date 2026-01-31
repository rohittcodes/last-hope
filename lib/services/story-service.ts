'use server';

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { StoryNode, StoryContext } from '../types/game';

// Initialize Groq provider
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

const COMBAT_CHANCE = 0.2; // 20% chance of combat
const CHAPTER_PROGRESS_THRESHOLD = 5; // Number of steps before considering chapter advancement

// Define Zod schema for the story node
const storyNodeSchema = z.object({
  description: z.string().describe("2-3 sentence story description of what happens next"),
  visualDescription: z.string().describe("A vivid visual description of the scene for an image generator (no text overlay instructions)"),
  chapter: z.number().describe("The current chapter number"),
  options: z.array(z.object({
    option: z.string().describe("The choice text for the player"),
    next: z.number().describe("The next step number"),
    consequences: z.object({
      health: z.number().optional(),
      power: z.number().optional(),
      defense: z.number().optional(),
      experience: z.number().optional(),
    }).optional().describe("Stats changes resulting from this choice"),
  })),
  isInCombat: z.boolean().optional(),
  enemyType: z.string().optional(),
  enemyHealth: z.number().optional(),
  shopItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['weapon', 'armor', 'consumable', 'misc']),
    description: z.string(),
    cost: z.number(),
    effect: z.object({
      health: z.number().optional(),
      power: z.number().optional(),
      defense: z.number().optional(),
    }).optional(),
  })).optional(),
});

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
): Promise<StoryNode & { visualDescription?: string }> {
  try {
    const shouldInitiateCombat = Math.random() < COMBAT_CHANCE;
    const shouldAdvanceChapter = context.currentStep % CHAPTER_PROGRESS_THRESHOLD === 0;

    // Standard 30% chance for shop if not in combat/chapter transition
    const shouldHaveShop = !shouldInitiateCombat && !shouldAdvanceChapter && Math.random() < 0.3;

    // Extract keywords instead of full context
    const keywords = extractKeywords(context.playerChoices);
    const recentCombat = getRecentCombatSummary(context.combatHistory);

    const systemPrompt = `You are a text-based RPG storyteller for a post-apocalyptic game.
  Generate the next story segment based on the player's context, stats, and recent history.
  Keep descriptions immersive but concise.
  Create meaningful choices that affect the player's stats/journey.
  Include a 'visualDescription' that describes the scene vividly for an image generator.
  IMPORTANT: The 'visualDescription' MUST be unique to this specific moment and distinct from the previous turn. It should evolve as the story progresses.
  
  You MUST return ONLY valid JSON matching this structure:
  {
    "description": "string",
    "visualDescription": "string",
    "chapter": number,
    "options": [{ "option": "string", "next": number, "consequences": { ... } }],
    "isInCombat": boolean, // optional
    "enemyType": "string", // optional
    "enemyHealth": number, // optional
    "shopItems": [ // optional, only if explicitly asked or suitable context
      { "id": "string", "name": "string", "type": "weapon|armor|consumable|misc", "description": "string", "cost": number, "effect": { "health": number, "power": number, "defense": number } }
    ]
  }`;

    const prompt = `
Context:
- Player: ${playerName}
- Chapter: ${context.currentChapter}
- Step: ${context.currentStep}
- Recent Keywords: ${keywords.join(', ')}
- Recent Combat: ${recentCombat}
${context.previousStoryDescription ? `- Previous Story Segment: "${context.previousStoryDescription}"` : ''}

Stats:
- Health: ${context.playerStats.health}%
- Power: ${context.playerStats.power}
- Defense: ${context.playerStats.defense}
- Level: ${context.playerStats.level}
- XP: ${context.playerStats.experience}
- Currency: ${context.currency} Scrap
- Inventory: [${context.inventory.join(', ')}]

Directives:
${shouldInitiateCombat ? '- Initiate a combat encounter with a zombie, raider, or mutant.' : '- Continue the narrative exploration.'}
${shouldAdvanceChapter ? '- Narrative curve should suggest nearing the end of the chapter or a major event.' : ''}
${shouldHaveShop ? '- The player encounters a wandering trader or finds a vending machine. YOU MUST INCLUDE "shopItems" ARRAY with 3-4 items in the JSON response.' : ''}
${context.playerStats.health < 30 ? '- Offer a way to find healing or rest.' : ''}
${context.playerStats.level < 3 ? '- Offer distinct opportunities for growth (XP).' : ''}

Generate the response in VALID JSON only. Do not include markdown formatting like \`\`\`json.
`;

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'), // Using a fast, capable model
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7, // Creativity balance
    });

    const text = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(text);
    const validatedNode = storyNodeSchema.parse(json);

    console.log('Generated story node:', validatedNode);
    return validatedNode;
  } catch (error) {
    console.error('Error generating story node:', error);

    // Check for API Key issues
    if (!process.env.GROQ_API_KEY) {
      console.error('CRITICAL: GROQ_API_KEY is missing in environment variables.');
    } else if (process.env.GROQ_API_KEY.length < 10) {
      console.error('CRITICAL: GROQ_API_KEY appears to be invalid (too short).');
    }

    // Fallback if API fails
    // We need to pass valid params to fallback even if the generation setup failed
    const shouldInitiateCombat = Math.random() < COMBAT_CHANCE;
    return getFallbackStoryNode(context, shouldInitiateCombat);
  }
}

// Fallback story generator for when API is unavailable
function getFallbackStoryNode(context: StoryContext, shouldInitiateCombat: boolean): StoryNode & { visualDescription?: string } {
  const fallbackStories = [
    {
      description: "You notice movement in the shadows ahead. The air feels tense, and you must decide your next move carefully.",
      visualDescription: "Dark ruins of a city street at twilight, shadows stretching long, a sense of danger in the air, rubble and debris everywhere.",
      combat: {
        description: "A raider emerges from behind a rusted car, weapon drawn and eyes wild with desperation.",
        enemyType: "raider",
        enemyHealth: 75
      }
    },
    {
      description: "A abandoned building looms before you, its broken windows like empty eyes. You hear faint sounds from within.",
      visualDescription: "An eerie abandoned concrete building, broken windows, overgrown with dead vines, gray sky, ominous atmosphere.",
      combat: {
        description: "Infected creatures shamble out of the building's entrance, attracted by your presence.",
        enemyType: "zombie",
        enemyHealth: 60
      }
    },
    {
      description: "You discover a cache of supplies hidden behind debris. This could be exactly what you need to survive.",
      visualDescription: "A hidden survival cache behind crumpled concrete, wooden crate with supplies, sunbeam breaking through clouds onto it.",
      combat: {
        description: "A mutant beast guards the supplies, its growl echoing through the wasteland.",
        enemyType: "mutant",
        enemyHealth: 90
      }
    },
    {
      description: "The wind howls through the desolate streets, carrying the scent of rain and decay. You find a moment of respite.",
      visualDescription: "A desolate city street with wind blowing dust, dark storm clouds gathering, broken streetlights.",
      combat: {
        description: "A pack of wild dogs, mutated by the fallout, circles you with hungry eyes.",
        enemyType: "mutated dog pack",
        enemyHealth: 45
      }
    },
    {
      description: "You stumble upon what looks like an old military checkpoint. It's quiet... too quiet.",
      visualDescription: "An abandoned military checkpoint, sandbags, rusted barricades, a tattered flag flapping in the wind.",
      combat: {
        description: "An armored sentinel, long forgotten but still active, powers up as you approach.",
        enemyType: "rogue sentinel",
        enemyHealth: 120
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

  // Chance for a shop in fallback mode (30%)
  const shouldHaveShop = !shouldInitiateCombat && Math.random() < 0.3;

  const fallbackShopItems: any[] = [
    { id: 'f1', name: 'Scavenged Medkit', type: 'consumable', description: 'Old but sealed. Restores health.', cost: 20, effect: { health: 25 } },
    { id: 'f2', name: 'Rusted Pipe', type: 'weapon', description: 'Better than fists. Increases power.', cost: 15, effect: { power: 5 } },
    { id: 'f3', name: 'Scrap Plate', type: 'armor', description: 'Rudimentary protection. Increases defense.', cost: 30, effect: { defense: 5 } },
    { id: 'f4', name: 'Stale Rations', type: 'consumable', description: 'Not tasty, but nutritious.', cost: 10, effect: { health: 10 } }
  ];

  return {
    description: shouldInitiateCombat ? randomStory.combat.description : randomStory.description,
    visualDescription: randomStory.visualDescription + ` ${Math.random() > 0.5 ? 'during a storm' : 'under a clear sky'}, digital art style.`,
    chapter: context.currentChapter,
    options: shouldInitiateCombat ? combatOptions : baseOptions,
    isInCombat: shouldInitiateCombat,
    ...(shouldInitiateCombat && {
      enemyType: randomStory.combat.enemyType,
      enemyHealth: randomStory.combat.enemyHealth
    }),
    ...(shouldHaveShop && {
      shopItems: fallbackShopItems.sort(() => 0.5 - Math.random()).slice(0, 3)
    })
  };
}
