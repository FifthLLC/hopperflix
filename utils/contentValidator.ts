import { validateContent } from './guardrailService';

import { RecommendationRequest, ValidationResult } from '@/types';

export async function validateUserInput(
  request: RecommendationRequest,
  userId?: string,
  sessionId?: string
): Promise<ValidationResult> {
  try {
    const descriptionValidation = await validateContent({
      content: request.description,
      contentType: 'description',
      userId,
      sessionId,
    });

    if (!descriptionValidation.isAppropriate) {
      const defaultSuggestions = [
        "Try asking for 'family adventure movies' or 'animated films'.",
        "Request 'comedies', 'nature documentaries', or 'uplifting stories'.",
        "Describe the mood or type of story you enjoy, like 'fun', 'exciting', or 'heartwarming'.",
        'Ask for movies suitable for all ages or for a family movie night.',
      ];

      return {
        isValid: false,
        blockedContent: request.description,
        reasoning: descriptionValidation.reasoning,
        suggestions:
          descriptionValidation.suggestions &&
          descriptionValidation.suggestions.length > 0
            ? descriptionValidation.suggestions
            : defaultSuggestions,
      };
    }

    // Skip validation for IMDB URLs - they're just URLs, not content that needs validation
    // The actual movie titles will be fetched and used in the recommendation process

    return { isValid: true };
  } catch (error) {
    console.error('Content validation error:', error);
    // For IMDB URLs, be more lenient if validation fails
    if (request.imdbUrls && request.imdbUrls.length > 0) {
      console.log('IMDB URL validation failed, allowing to proceed');

      return { isValid: true };
    }

    // Fail safe - block content if validation fails
    return {
      isValid: false,
      blockedContent: 'validation_error',
      reasoning: 'Content validation failed - blocking for safety',
      suggestions: ['Please try again with different content'],
    };
  }
}

/**
 * Validates movie recommendation before returning to user
 */
export async function validateRecommendation(
  recommendation: string,
  userId?: string,
  sessionId?: string
): Promise<ValidationResult> {
  try {
    const validation = await validateContent({
      content: recommendation,
      contentType: 'recommendation',
      userId,
      sessionId,
    });

    if (!validation.isAppropriate) {
      return {
        isValid: false,
        blockedContent: recommendation,
        reasoning: validation.reasoning,
        suggestions: validation.suggestions,
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Recommendation validation error:', error);

    return {
      isValid: false,
      blockedContent: recommendation,
      reasoning: 'Recommendation validation failed - blocking for safety',
      suggestions: ['Please requesting a different recommendation'],
    };
  }
}
