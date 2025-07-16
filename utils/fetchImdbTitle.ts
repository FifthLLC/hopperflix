import { load } from 'cheerio';

export async function fetchImdbTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // cache for 1 day
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch IMDB URL: ${url}, status: ${res.status}`);

      return null;
    }

    const html = await res.text();

    let title = null;

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

    if (h1Match && h1Match[1]) {
      title = h1Match[1].trim();
    }

    if (!title) {
      const metaMatch = html.match(
        /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i
      );

      if (metaMatch && metaMatch[1]) {
        title = metaMatch[1].trim();
      }
    }

    if (!title) {
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);

      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
        title = title.replace(/\s*-\s*IMDB.*$/i, '');
      }
    }

    if (!title) {
      console.error(`Title not found in IMDB page: ${url}`);

      return null;
    }

    const cleaned = title.replace(/\s*\(\d{4}\).*$/, '').trim();

    console.log(`Successfully extracted title from ${url}: "${cleaned}"`);

    return cleaned || null;
  } catch (error) {
    console.error(`Error scraping IMDB URL: ${url}`, error);

    return null;
  }
}

export interface ImdbMovieInfo {
  title: string | null;
  year: string | null;
  genre: string[];
  description: string | null;
  rating: string | null;
  runtime: string | null;
  director: string | null;
  cast: string[];
}

export async function fetchImdbMovieInfo(url: string): Promise<ImdbMovieInfo> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch IMDB URL: ${url}, status: ${res.status}`);

      return {
        title: null,
        year: null,
        genre: [],
        description: null,
        rating: null,
        runtime: null,
        director: null,
        cast: [],
      };
    }

    const html = await res.text();
    const $ = load(html);

    // Title
    let title = $('h1').first().text().trim() || null;

    if (!title) {
      const metaTitle = $('meta[property="og:title"]').attr('content');

      if (metaTitle) title = metaTitle.trim();
    }
    if (title) title = title.replace(/\s*\(\d{4}\).*$/, '').trim();

    let year: string | null = null;
    const yearEl = $("a[href^='/title/tt'][href*='releaseinfo']")
      .first()
      .text()
      .trim();

    if (yearEl && /\d{4}/.test(yearEl))
      year = yearEl.match(/\d{4}/)?.[0] || null;
    if (!year) {
      const yearMatch = html.match(/\((\d{4})\)/);

      if (yearMatch) year = yearMatch[1];
    }

    let genre: string[] = [];

    $("a[href^='/search/title?genres=']").each((_: any, el: any) => {
      const g = $(el).text().trim();

      if (g) genre.push(g);
    });
    genre = Array.from(new Set(genre));
    if (genre.length === 0) {
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
      );

      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const json = JSON.parse(jsonLdMatch[1]);

          if (json && json.genre) {
            if (Array.isArray(json.genre)) genre = json.genre;
            else if (typeof json.genre === 'string') genre = [json.genre];
          }
        } catch {}
      }
    }

    let description: string | null = null;

    description = $('span[data-testid="plot-l"]').first().text().trim() || null;
    if (!description) {
      description = $('meta[name="description"]').attr('content') || null;
    }
    if (!description) {
      description =
        $('meta[property="og:description"]').attr('content') || null;
    }

    // Rating
    let rating: string | null = null;

    rating =
      $('span[data-testid="hero-rating-bar__aggregate-rating__score"]')
        .first()
        .text()
        .trim() || null;
    if (!rating) {
      const ratingValue = $('span[aria-label*="rating"]').first().text().trim();

      if (ratingValue) rating = ratingValue;
    }

    // Runtime
    let runtime: string | null = null;
    // Try multiple selectors for runtime
    const runtimeSelectors = [
      'li[data-testid="title-techspec_runtime"] span:last-child',
      'li[data-testid="title-techspec_runtime"] div:last-child',
      'li[data-testid="title-techspec_runtime"] .ipc-metadata-list-item__content-container',
      'li:contains("Runtime") span:last-child',
      'li:contains("Runtime") div:last-child',
    ];

    for (const selector of runtimeSelectors) {
      const runtimeEl = $(selector).text().trim();

      if (runtimeEl && runtimeEl !== 'Runtime' && runtimeEl.length > 0) {
        runtime = runtimeEl;
        break;
      }
    }

    if (!runtime || runtime === 'Runtime') {
      // Try JSON-LD
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
      );

      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const json = JSON.parse(jsonLdMatch[1]);

          if (json && json.duration) {
            runtime = json.duration;
          }
        } catch {}
      }
    }

    if (!runtime || runtime === 'Runtime') {
      const runtimeMatch = html.match(
        /<li[^>]*>\s*<span[^>]*>Runtime<\/span>\s*<span[^>]*>([^<]+)<\/span>/i
      );

      if (runtimeMatch) runtime = runtimeMatch[1].trim();
    }

    let director: string | null = null;
    const directorEl = $('a[data-testid="title-pc-principal-credit"]')
      .first()
      .text()
      .trim();

    if (directorEl) director = directorEl;
    if (!director) {
      // Try JSON-LD
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
      );

      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const json = JSON.parse(jsonLdMatch[1]);

          if (json && json.director) {
            if (Array.isArray(json.director) && json.director[0]?.name)
              director = json.director[0].name;
            else if (typeof json.director === 'object' && json.director.name)
              director = json.director.name;
          }
        } catch {}
      }
    }

    let cast: string[] = [];

    $("a[data-testid='title-cast-item__actor']").each((_: any, el: any) => {
      const actor = $(el).text().trim();

      if (actor) cast.push(actor);
    });
    if (cast.length === 0) {
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
      );

      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const json = JSON.parse(jsonLdMatch[1]);

          if (json && json.actor) {
            if (Array.isArray(json.actor))
              cast = json.actor.map((a: any) => a.name).filter(Boolean);
          }
        } catch {}
      }
    }

    return {
      title: title || null,
      year: year || null,
      genre,
      description,
      rating,
      runtime,
      director,
      cast,
    };
  } catch (error) {
    console.error(`Error scraping IMDB URL: ${url}`, error);

    return {
      title: null,
      year: null,
      genre: [],
      description: null,
      rating: null,
      runtime: null,
      director: null,
      cast: [],
    };
  }
}
