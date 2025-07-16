import { fetchImdbTitle } from '../fetchImdbTitle';

global.fetch = jest.fn();

describe('fetchImdbTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts title from <h1> tag', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '<h1>Test Movie Title</h1>',
    });
    const title = await fetchImdbTitle('https://imdb.com/title/tt123');
    expect(title).toBe('Test Movie Title');
  });

  it('extracts title from og:title meta tag if <h1> missing', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () =>
        '<meta property="og:title" content="Meta Movie Title" />',
    });
    const title = await fetchImdbTitle('https://imdb.com/title/tt456');
    expect(title).toBe('Meta Movie Title');
  });

  it('extracts title from <title> tag if others missing', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '<title>Title Tag Movie - IMDB</title>',
    });
    const title = await fetchImdbTitle('https://imdb.com/title/tt789');
    expect(title).toBe('Title Tag Movie');
  });

  it('returns null if no title found', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '<div>No title here</div>',
    });
    const title = await fetchImdbTitle('https://imdb.com/title/tt000');
    expect(title).toBeNull();
  });

  it('returns null on fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const title = await fetchImdbTitle('https://imdb.com/title/ttfail');
    expect(title).toBeNull();
  });
});
