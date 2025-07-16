export interface GuardrailConfig {
  enabled: boolean;
  strictMode: boolean;
  allowedCategories: string[];
  blockedCategories: string[];
  confidenceThreshold: number;
}

export interface ContentGuardrailRequest {
  content: string;
  contentType: 'description' | 'movie_title' | 'recommendation';
  userId?: string;
  sessionId?: string;
}

export interface ContentGuardrailResponse {
  isAppropriate: boolean;
  confidence: number;
  flaggedCategories: string[];
  reasoning: string;
  suggestions?: string[];
  riskLevel: 'low' | 'medium' | 'high';
}
