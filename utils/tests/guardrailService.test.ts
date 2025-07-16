import * as apiUtils from '../api.utils';

global.fetch = jest.fn();
const mockProcessJSONBody = jest.spyOn(apiUtils, 'processJSONBody');

describe('validateContent', () => {
  const validRequest = {
    content: 'A family-friendly movie',
    contentType: 'description' as const,
    userId: 'user1',
    sessionId: 'sess1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'mock-key';
    jest.resetModules();
  });

  it('returns isAppropriate true for safe content', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '{"isAppropriate":true,"confidence":0.9,"flaggedCategories":[],"reasoning":"ok","riskLevel":"low"}',
            },
          },
        ],
      }),
    });
    mockProcessJSONBody.mockImplementation((obj) => JSON.stringify(obj));
    const { validateContent } = await import('../guardrailService');
    const res = await validateContent(validRequest);
    expect(res.isAppropriate).toBe(true);
    expect(res.confidence).toBeGreaterThan(0.5);
    expect(res.flaggedCategories).toEqual([]);
    expect(res.riskLevel).toBe('low');
  });

  it('returns isAppropriate false for unsafe content', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '{"isAppropriate":false,"confidence":0.2,"flaggedCategories":["violence"],"reasoning":"bad","riskLevel":"high"}',
            },
          },
        ],
      }),
    });
    mockProcessJSONBody.mockImplementation((obj) => JSON.stringify(obj));
    const { validateContent } = await import('../guardrailService');
    const res = await validateContent(validRequest);
    expect(res.isAppropriate).toBe(false);
    expect(res.flaggedCategories).toContain('violence');
    expect(res.riskLevel).toBe('high');
  });

  it('throws if OpenAI API key is missing', async () => {
    process.env.OPENAI_API_KEY = '';
    jest.resetModules();
    const { validateContent } = await import('../guardrailService');
    await expect(validateContent(validRequest)).rejects.toThrow(
      'OpenAI API key not found'
    );
  });

  it('throws on fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('network fail'));
    const { validateContent } = await import('../guardrailService');
    const res = validateContent(validRequest);
    await expect(res).rejects.toThrow('Content validation failed');
  });

  it('returns fallback response on invalid OpenAI response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'not a json' } }],
      }),
    });
    mockProcessJSONBody.mockImplementation((obj) => JSON.stringify(obj));
    const { validateContent } = await import('../guardrailService');
    const res = await validateContent(validRequest);
    expect(res.isAppropriate).toBe(false);
    expect(res.flaggedCategories).toContain('parsing_error');
    expect(res.riskLevel).toBe('high');
  });
});
