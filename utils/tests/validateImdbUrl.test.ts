import {
  normalizeImdbUrl,
  isValidImdbUrl,
  parseImdbUrl,
} from '../validateImdbUrl';

describe('validateImdbUrl utils', () => {
  describe('normalizeImdbUrl', () => {
    it('normalizes valid IMDb URLs', () => {
      expect(normalizeImdbUrl('https://www.imdb.com/title/tt1234567')).toBe(
        'https://www.imdb.com/title/tt1234567/'
      );
      expect(normalizeImdbUrl('http://imdb.com/title/tt7654321/')).toBe(
        'http://imdb.com/title/tt7654321/'
      );
      expect(normalizeImdbUrl(' https://imdb.com/title/tt0000001 ')).toBe(
        'https://imdb.com/title/tt0000001/'
      );
    });
    it('returns null for invalid URLs', () => {
      expect(normalizeImdbUrl('https://www.google.com')).toBeNull();
      expect(normalizeImdbUrl('imdb.com/title/tt1234567')).toBeNull();
      expect(normalizeImdbUrl('')).toBeNull();
    });
  });

  describe('isValidImdbUrl', () => {
    it('returns true for valid IMDb URLs', () => {
      expect(isValidImdbUrl('https://www.imdb.com/title/tt1234567')).toBe(true);
      expect(isValidImdbUrl('http://imdb.com/title/tt7654321/')).toBe(true);
    });
    it('returns false for invalid URLs', () => {
      expect(isValidImdbUrl('https://www.google.com')).toBe(false);
      expect(isValidImdbUrl('imdb.com/title/tt1234567')).toBe(false);
      expect(isValidImdbUrl('')).toBe(false);
    });
  });

  describe('parseImdbUrl', () => {
    it('parses valid IMDb URLs', () => {
      expect(parseImdbUrl('https://www.imdb.com/title/tt1234567')).toBe(
        'https://www.imdb.com/title/tt1234567/'
      );
    });
    it('returns null for invalid URLs', () => {
      expect(parseImdbUrl('not a url')).toBeNull();
    });
  });
});
