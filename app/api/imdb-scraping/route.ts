import { HTTP_STATUS } from '@/utils/constants';
import { NextRequest, NextResponse } from 'next/server';

import { fetchImdbMovieInfo } from '@/utils/fetchImdbTitle';

export async function POST(request: NextRequest) {
  try {
    const { url, urls } = await request.json();

    if (urls && Array.isArray(urls)) {
      const results = await Promise.all(
        urls.map(async (u: string) => {
          if (!u) return null;
          const info = await fetchImdbMovieInfo(u);

          return info && info.title ? info : null;
        })
      );

      return NextResponse.json(results.filter(Boolean));
    }

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const movieInfo = await fetchImdbMovieInfo(url);

    if (!movieInfo || !movieInfo.title) {
      return NextResponse.json(
        { error: 'Failed to extract movie info from IMDB URL' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json(movieInfo);
  } catch (error) {
    console.error('Error in IMDB title API:', error);

    return NextResponse.json(
      { error: 'Failed to fetch IMDB title' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
