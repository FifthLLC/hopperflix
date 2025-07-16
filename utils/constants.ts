export const CONTENT_SUGGESTIONS = [
  '🎬 Search for safe and family-friendly films',
  '😊 Try comedies, documentaries, or uplifting stories',
  '🌟 Ask for fun, exciting, or heartwarming movies',
  '👨‍👩‍👧‍👦 Request movies suitable for all ages',
  '💕 Look for romantic comedies or feel-good dramas',
  '🚀 Find action movies or sci-fi adventures (family-friendly)',
];

export const SECURITY_BLOCKED_SUGGESTIONS = [
  '🚫 Please use this service for legitimate movie recommendations only',
  '🎬 Search for safe and family-friendly films',
  '🌟 Ask for fun, exciting, or heartwarming movies',
  '💡 Focus on genres, themes, or specific movie preferences',
];
export const MOVIES = [
  'The Silence of the Lambs',
  'Pulp Fiction',
  'The Shawshank Redemption',
  'Inception',
  'Jurassic Park',
  'The Lord of the Rings: The Fellowship of the Ring',
  'Fight Club',
  'Titanic',
  'The Matrix',
  'Forrest Gump',
];

export const OPENAPI_URL = 'https://api.openai.com/v1/chat/completions';

export const getOpenAiModelOptions = (
  model: string,
  temperature: number,
  max_tokens: number
) => ({
  model: model || 'gpt-4',
  temperature: temperature || 0.1,
  max_tokens: max_tokens || 20,
});
