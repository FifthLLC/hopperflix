export function normalizeImdbUrl(url: string): string | null {
  const trimmedUrl = url.trim();
  const match = trimmedUrl.match(
    /^(https?:\/\/(www\.)?imdb\.com\/title\/tt\d+)/i
  );

  if (match) {
    return match[1] + '/';
  }

  return null;
}

export function isValidImdbUrl(url: string): boolean {
  return !!normalizeImdbUrl(url);
}

export function parseImdbUrl(input: string): string | null {
  return normalizeImdbUrl(input);
}
