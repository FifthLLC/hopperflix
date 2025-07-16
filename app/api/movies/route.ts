import { NextResponse } from 'next/server';

import { HTTP_STATUS, MOVIES } from '@/utils/constants';

let sessionImdbMovies: string[] = [];

export async function GET() {
  const allMovies = Array.from(new Set([...MOVIES, ...sessionImdbMovies]));

  return NextResponse.json({ movies: allMovies });
}

export async function POST(request: Request) {
  try {
    const { imdbMovies } = await request.json();

    if (Array.isArray(imdbMovies)) {
      sessionImdbMovies = Array.from(
        new Set([...sessionImdbMovies, ...imdbMovies])
      );
    }

    return NextResponse.json({ success: true, movies: sessionImdbMovies });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
