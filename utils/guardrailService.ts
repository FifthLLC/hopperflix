import { getOpenAiModelOptions, OPENAPI_URL } from './constants';
import {
  CONTENT_SAFETY_PROMPT,
  getAnotherUserPrompt,
  getUserPrompt,
} from './prompts';

import {
  ContentGuardrailRequest,
  ContentGuardrailResponse,
  GuardrailConfig,
} from '@/types/guardrail';
import { processJSONBody } from '@/utils/api.utils';

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
      body: processJSONBody({
        ...getOpenAiModelOptions('gpt-4', 0.1, 200),
        messages: messages,
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
  return CONTENT_SAFETY_PROMPT;
}

function buildUserPrompt(request: ContentGuardrailRequest): string {
  const contentTypeMap = {
    description: 'user description for movie preferences',
    movie_title:
      'movie information (title, genre, description, directors, writers, stars, year, metascore, user reviews, runtime)',
    recommendation: 'movie recommendation content',
  };

  if (
    request.contentType === 'movie_title' &&
    typeof request.content === 'string'
  ) {
    return getUserPrompt(request);
  }

  return getAnotherUserPrompt(contentTypeMap, request);
}

function parseGuardrailResponse(content: string): ContentGuardrailResponse {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('No JSON found in OpenAI response:', content);
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

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
