import { NextRequest, NextResponse } from 'next/server';

import { validateContent } from '@/utils/guardrailService';
import { isValidImdbUrl } from '@/utils/validateImdbUrl';
import { fetchImdbMovieInfo } from '@/utils/fetchImdbTitle';

export async function POST(request: NextRequest) {
  try {
    const { description, imdbUrls } = await request.json();

    if (
      (!imdbUrls || imdbUrls.length === 0) &&
      (!description || typeof description !== 'string')
    ) {
      return NextResponse.json(
        {
          isValid: false,
          reasoning: 'Description is required.',
          blockedContent: ['description'],
          suggestions: ['Please provide a description.'],
        },
        { status: 400 }
      );
    }

    const descResult = await validateContent({
      content: description,
      contentType: 'description',
    });

    if (!descResult.isAppropriate) {
      return NextResponse.json(
        {
          isValid: false,
          reasoning: descResult.reasoning,
          blockedContent: [description],
          suggestions: descResult.suggestions || [],
        },
        { status: 403 }
      );
    }

    let blockedMovies: string[] = [];
    let movieInfos: any[] = [];

    if (Array.isArray(imdbUrls)) {
      for (const url of imdbUrls) {
        if (isValidImdbUrl(url)) {
          const info = await fetchImdbMovieInfo(url);

          movieInfos.push({ url, ...info });
          const movieText = [
            info.title,
            ...(info.genre || []),
            info.description,
          ]
            .filter(Boolean)
            .join('. ');
          const movieResult = await validateContent({
            content: movieText,
            contentType: 'movie_title',
          });

          if (!movieResult.isAppropriate) {
            blockedMovies.push(info.title || url);
          }
        }
      }
    }

    if (blockedMovies.length > 0) {
      return NextResponse.json(
        {
          isValid: false,
          reasoning: 'This doesn’t meet our criteria.',
          blockedContent: blockedMovies,
          suggestions: ['Remove inappropriate movies or try different ones.'],
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isValid: true,
      reasoning: 'All content is appropriate.',
      blockedContent: [],
      suggestions: [],
      movieInfos,
    });
  } catch (error) {
    console.error('Guardrail API error:', error);

    return NextResponse.json(
      {
        isValid: false,
        reasoning: 'Internal server error.',
        blockedContent: [],
        suggestions: ['Please try again later.'],
      },
      { status: 500 }
    );
  }
}
