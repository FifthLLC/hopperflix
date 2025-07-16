import {
  isValidApiResponse,
  parseOpenAIResponse,
  createApiSuccessResponse,
  processJSONBody,
} from '../api.utils';

describe('api.utils', () => {
  describe('isValidApiResponse', () => {
    it('returns true for valid ApiResponse', () => {
      expect(isValidApiResponse({ success: true, data: 123 })).toBe(true);
      expect(isValidApiResponse({ success: false, data: null })).toBe(true);
    });
    it('returns false for invalid ApiResponse', () => {
      expect(isValidApiResponse({ data: 123 })).toBe(false);
      expect(isValidApiResponse(null)).toBe(false);
      expect(isValidApiResponse(undefined)).toBe(false);
      expect(isValidApiResponse(123)).toBe(false);
    });
  });

  describe('parseOpenAIResponse', () => {
    it('returns content for valid OpenAI response', () => {
      const response = {
        choices: [{ message: { content: 'test content' } }],
      };
      expect(parseOpenAIResponse(response)).toBe('test content');
    });
    it('throws for invalid OpenAI response', () => {
      expect(() => parseOpenAIResponse({})).toThrow();
      expect(() => parseOpenAIResponse({ choices: [] })).toThrow();
      expect(() =>
        parseOpenAIResponse({ choices: [{ message: {} }] })
      ).toThrow();
    });
  });

  describe('createApiSuccessResponse', () => {
    it('creates a success response', () => {
      expect(createApiSuccessResponse('foo')).toEqual({
        success: true,
        data: 'foo',
      });
    });
  });

  describe('processJSONBody', () => {
    it('stringifies an object', () => {
      expect(processJSONBody({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    });
  });
});
