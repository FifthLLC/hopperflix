import * as guardrailService from '../guardrailService';
import { validateUserInput, validateRecommendation } from '../contentValidator';

describe('contentValidator', () => {
  const mockValidateContent = jest.spyOn(guardrailService, 'validateContent');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserInput', () => {
    it('returns isValid true for appropriate content', async () => {
      mockValidateContent.mockResolvedValueOnce({
        isAppropriate: true,
        confidence: 1,
        flaggedCategories: [],
        reasoning: 'ok',
        riskLevel: 'low',
        suggestions: [],
      });
      const req = { description: 'A nice movie' };
      const res = await validateUserInput(req);
      expect(res.isValid).toBe(true);
    });

    it('returns isValid false for inappropriate content', async () => {
      mockValidateContent.mockResolvedValueOnce({
        isAppropriate: false,
        confidence: 0.1,
        flaggedCategories: ['violence'],
        reasoning: 'bad',
        riskLevel: 'high',
        suggestions: ['Try something else'],
      });
      const req = { description: 'A bad movie' };
      const res = await validateUserInput(req);
      expect(res.isValid).toBe(false);
      expect(res.suggestions).toContain('Try something else');
    });

    it('returns isValid true if error and imdbUrls present', async () => {
      mockValidateContent.mockRejectedValueOnce(new Error('fail'));
      const req = { description: 'desc', imdbUrls: ['url'] };
      const res = await validateUserInput(req);
      expect(res.isValid).toBe(true);
    });

    it('returns isValid false if error and no imdbUrls', async () => {
      mockValidateContent.mockRejectedValueOnce(new Error('fail'));
      const req = { description: 'desc' };
      const res = await validateUserInput(req);
      expect(res.isValid).toBe(false);
      expect(res.suggestions).toContain(
        'Please try again with different content'
      );
    });
  });

  describe('validateRecommendation', () => {
    it('returns isValid true for appropriate recommendation', async () => {
      mockValidateContent.mockResolvedValueOnce({
        isAppropriate: true,
        confidence: 1,
        flaggedCategories: [],
        reasoning: 'ok',
        riskLevel: 'low',
        suggestions: [],
      });
      const res = await validateRecommendation('Good rec');
      expect(res.isValid).toBe(true);
    });

    it('returns isValid false for inappropriate recommendation', async () => {
      mockValidateContent.mockResolvedValueOnce({
        isAppropriate: false,
        confidence: 0.1,
        flaggedCategories: ['violence'],
        reasoning: 'bad',
        riskLevel: 'high',
        suggestions: ['Try something else'],
      });
      const res = await validateRecommendation('Bad rec');
      expect(res.isValid).toBe(false);
      expect(res.suggestions).toContain('Try something else');
    });

    it('returns isValid false on error', async () => {
      mockValidateContent.mockRejectedValueOnce(new Error('fail'));
      const res = await validateRecommendation('fail rec');
      expect(res.isValid).toBe(false);
      expect(res.suggestions).toContain(
        'Please requesting a different recommendation'
      );
    });
  });
});
