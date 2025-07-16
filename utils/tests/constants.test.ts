import {
  CONTENT_SUGGESTIONS,
  SECURITY_BLOCKED_SUGGESTIONS,
  MOVIES,
} from '../constants';

describe('constants', () => {
  it('CONTENT_SUGGESTIONS contains expected values', () => {
    expect(CONTENT_SUGGESTIONS).toEqual(
      expect.arrayContaining([
        expect.stringContaining('family-friendly'),
        expect.stringContaining('comedies'),
        expect.stringContaining('heartwarming'),
      ])
    );
  });

  it('SECURITY_BLOCKED_SUGGESTIONS contains expected values', () => {
    expect(SECURITY_BLOCKED_SUGGESTIONS).toEqual(
      expect.arrayContaining([
        expect.stringContaining('legitimate movie recommendations'),
        expect.stringContaining('family-friendly'),
      ])
    );
  });

  it('MOVIES contains some classic movie titles', () => {
    expect(MOVIES).toEqual(
      expect.arrayContaining([
        'The Silence of the Lambs',
        'Pulp Fiction',
        'The Shawshank Redemption',
        'Inception',
        'Jurassic Park',
      ])
    );
  });
});
