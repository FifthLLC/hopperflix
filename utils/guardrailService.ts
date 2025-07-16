import { OPENAPI_URL } from './constants';

import {
  ContentGuardrailRequest,
  ContentGuardrailResponse,
  GuardrailConfig,
} from '@/types/guardrail';

// Default guardrail configuration
const DEFAULT_CONFIG: GuardrailConfig = {
  enabled: true,
  strictMode: true,
  allowedCategories: [
    'family',
    'comedy',
    'adventure',
    'drama',
    'romance',
    'fantasy',
  ],
  blockedCategories: [
    'violence',
    'gore',
    'explicit_content',
    'hate_speech',
    'drug_use',
    'sexual_content',
  ],
  confidenceThreshold: 0.7,
};

let currentConfig: GuardrailConfig = { ...DEFAULT_CONFIG };
const apiKey = process.env.OPENAI_API_KEY;

export async function validateContent(
  request: ContentGuardrailRequest
): Promise<ContentGuardrailResponse> {
  if (!currentConfig.enabled) {
    return {
      isAppropriate: true,
      confidence: 1.0,
      flaggedCategories: [],
      reasoning: 'Guardrail disabled',
      riskLevel: 'low',
    };
  }

  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(request);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await fetch(OPENAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(
        `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return parseGuardrailResponse(content);
  } catch (error) {
    console.error('Guardrail validation error:', error);
    throw new Error(
      `Content validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function buildSystemPrompt(): string {
  return `You are a content safety guardrail system for a movie recommendation platform. Your job is to analyze user input and movie content to ensure it's appropriate for general audiences.
 
CRITICAL RULES:
1. BLOCK movies with violent titles like "Kill", "Murder", "Death", "Blood", "Gore", "Torture", "Slaughter", "Massacre"
2. BLOCK movies that focus on graphic violence, gore, blood, or explicit harm
3. BLOCK movies with themes of rape, sexual assault, or graphic violence against children
4. BLOCK movies that glorify or depict serious crimes in detail
5. BLOCK movies with descriptions involving killing, murder, violence, combat, fighting, or harm
6. ALLOW normal adult content like romantic relationships, mild violence in action movies, and mature themes
7. Consider context and intent - adults can request adult-appropriate content
8. Be reasonable - don't block normal conversation or preferences

RESPONSE FORMAT (JSON only - respond with ONLY valid JSON):
{
  "isAppropriate": true,
  "confidence": 0.9,
  "flaggedCategories": [],
  "reasoning": "Content is appropriate",
  "suggestions": [],
  "riskLevel": "low"
}

When blocking content, provide helpful suggestions in the "suggestions" array:
- "Try asking for 'family adventure movies' or 'animated films'."
- "Request 'comedies', 'nature documentaries', or 'uplifting stories'."
- "Describe the mood or type of story you enjoy, like 'fun', 'exciting', or 'heartwarming'."
- "Ask for movies suitable for all ages or for a family movie night."

CATEGORIES TO FLAG (BLOCK IF EXPLICIT OR REQUESTED):
- violence: requests for violent content, graphic violence, torture, snuff films, killing, murder
- gore: requests for blood scenes, graphic descriptions of injuries, dismemberment
- explicit_content: hardcore pornography, explicit sexual acts
- hate_speech: discriminatory language, racism, sexism, threats
- drug_use: glorification of illegal drugs, drug dealing
- illegal_activities: criminal activities, terrorism
- sexual_violence: rape, sexual assault, sexual violence
- child_violence: violence against children, child abuse
- serious_crimes: detailed depictions of serious crimes

SPECIFIC BLOCKING RULES FOR MOVIE TITLES AND CONTENT:
- BLOCK movies with violent titles: "Kill", "Murder", "Death", "Blood", "Gore", "Torture", "Slaughter", "Massacre", "Assassination"
- BLOCK movies with descriptions involving: killing, murder, violence, combat, fighting, commandos, bandits, invading, war, death
- BLOCK requests asking for "blood scenes", "gore", "violent movies", "graphic violence"
- BLOCK requests that focus on injury, death, or harm
- BLOCK movies with rape, sexual assault, or child violence themes
- BLOCK movies that depict serious crimes in detail
- ALLOW general action movies, thrillers, and mature content (but NOT violent ones)
- ALLOW normal movie preferences and descriptions

ALLOW NORMAL CONTENT:
- Romantic relationships and dating
- Action movies and thrillers (without focusing on violence)
- Adult themes and mature content
- Normal personal preferences and requests
- General movie preferences and descriptions

EXAMPLES OF WHAT TO BLOCK:
- Movie title "Kill" with description about commandos fighting bandits
- Movies with "murder", "death", "blood" in title or description
- Movies about killing, assassination, or graphic violence
- Movies glorifying crime or violence`;
}

/**
 * Builds the user prompt for OpenAI
 */
function buildUserPrompt(request: ContentGuardrailRequest): string {
  const contentTypeMap = {
    description: 'user description for movie preferences',
    movie_title:
      'movie information (title, genre, description, directors, writers, stars, year, metascore, user reviews, runtime)',
    recommendation: 'movie recommendation content',
  };

  // If movie_title, format the content as a structured list for better LLM analysis
  if (
    request.contentType === 'movie_title' &&
    typeof request.content === 'string'
  ) {
    return `Analyze this movie for family-friendly appropriateness. Pay special attention to the title and description for violent content. Here is all the information scraped from IMDb:\n\n${request.content}\n\nCONTENT TYPE: movie_title\nUSER ID: ${request.userId || 'anonymous'}\nSESSION ID: ${request.sessionId || 'unknown'}\n\nIMPORTANT: If the movie title contains words like "Kill", "Murder", "Death", "Blood", or if the description mentions violence, killing, combat, fighting, commandos, bandits, invading, war, or death - BLOCK it.\n\nProvide your analysis in the exact JSON format specified above.`;
  }

  return `Analyze this ${contentTypeMap[request.contentType]} for family-friendly appropriateness:\n\nCONTENT: "${request.content}"\n\nCONTENT TYPE: ${request.contentType}\nUSER ID: ${request.userId || 'anonymous'}\nSESSION ID: ${request.sessionId || 'unknown'}\n\nProvide your analysis in the exact JSON format specified above.`;
}

function parseGuardrailResponse(content: string): ContentGuardrailResponse {
  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('No JSON found in OpenAI response:', content);
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (typeof parsed.isAppropriate !== 'boolean') {
      throw new Error('Invalid isAppropriate field');
    }
    if (
      typeof parsed.confidence !== 'number' ||
      parsed.confidence < 0 ||
      parsed.confidence > 1
    ) {
      throw new Error('Invalid confidence value');
    }
    if (!Array.isArray(parsed.flaggedCategories)) {
      throw new Error('Invalid flaggedCategories field');
    }
    if (typeof parsed.reasoning !== 'string') {
      throw new Error('Invalid reasoning field');
    }
    if (!['low', 'medium', 'high'].includes(parsed.riskLevel)) {
      throw new Error('Invalid riskLevel field');
    }

    return {
      isAppropriate: parsed.isAppropriate,
      confidence: parsed.confidence,
      flaggedCategories: parsed.flaggedCategories,
      reasoning: parsed.reasoning,
      suggestions: parsed.suggestions || [],
      riskLevel: parsed.riskLevel,
    };
  } catch (error) {
    console.error('Failed to parse guardrail response:', error);
    console.error('Raw content:', content);

    // Fallback to blocking content if parsing fails
    return {
      isAppropriate: false,
      confidence: 0.5,
      flaggedCategories: ['parsing_error'],
      reasoning:
        'Failed to parse content validation response - blocking for safety',
      riskLevel: 'high',
    };
  }
}
