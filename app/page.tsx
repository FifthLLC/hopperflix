'use client';
import type { ImdbMovieInfo } from '@/types';

import { useState } from 'react';
import { useEffect } from 'react';

import Header from './components/Header';
import RecommendationForm from './components/RecommendationForm';
import ErrorDisplay from './components/ErrorDisplay';
import RecommendationDisplay from './components/RecommendationDisplay';
import MoviesListToRecommend from './components/MoviesToRecommend';
import Features from './components/Features';

import { RecommendationData } from '@/types';
import { parseImdbUrl } from '@/utils/validateImdbUrl';
import { useRecommend } from '@/hooks/useRecommend';
import { useMovies, useAddMovies } from '@/hooks/useMovies';

export default function Home() {
  const [description, setDescription] = useState('');
  const [imdbUrl, setImdbUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [validUrlCount, setValidUrlCount] = useState(0);
  const [savedImdbUrls, setSavedImdbUrls] = useState<string[]>([]);
  const { mutate, data, isPending, error } = useRecommend();
  const {
    data: moviesData,
    isLoading: isMoviesLoading,
    error: moviesError,
  } = useMovies();
  const addMoviesMutation = useAddMovies();

  const [sessionMovies, setSessionMovies] = useState<string[]>([]);
  const [imdbMovieInfos, setImdbMovieInfos] = useState<ImdbMovieInfo[]>([]);
  const [guardrailError, setGuardrailError] = useState<string | null>(null);
  const [isGuardrailPending, setIsGuardrailPending] = useState(false);

  useEffect(() => {
    const handleRecommendationData = async () => {
      if (
        data &&
        data.recommendation &&
        savedImdbUrls.length > 0 &&
        !isPending
      ) {
        if (
          !data.recommendation.startsWith(
            'All movies have been recommended! Starting fresh with:'
          )
        ) {
          const rec = data.recommendation.trim();

          if (rec && !sessionMovies.includes(rec)) {
            setSessionMovies((prev) => [...prev, rec]);
          }
        }

        if (savedImdbUrls.length > 0) {
          const imdbMovies = [];

          for (const url of savedImdbUrls) {
            if (data.recommendation.includes(url)) {
              imdbMovies.push(data.recommendation);
            }
          }

          if (imdbMovies.length > 0) {
            await addMoviesMutation.mutateAsync({ imdbMovies });
          }
        }
      }
    };

    handleRecommendationData();
  }, [data, savedImdbUrls, isPending, sessionMovies, addMoviesMutation]);

  useEffect(() => {
    if (data) {
      setGuardrailError(null);
    }
  }, [data]);

  const allMovies = [
    ...(moviesData?.movies || []),
    ...sessionMovies.filter((m) => !(moviesData?.movies || []).includes(m)),
    ...imdbMovieInfos
      .map((info) => info.title)
      .filter((movie): movie is string => {
        return (
          typeof movie === 'string' &&
          !(moviesData?.movies || []).includes(movie) &&
          !sessionMovies.includes(movie)
        );
      }),
  ];

  const handleSubmit = async () => {
    if (!description.trim()) {
      setGuardrailError(
        'Please enter a description of yourself and your preferences.'
      );

      return;
    }

    const currentImdbUrl = parseImdbUrl(imdbUrl);

    if (imdbUrl.trim() && !currentImdbUrl) {
      setUrlError(
        'Please enter a valid IMDB URL (e.g., https://www.imdb.com/title/tt0133093/)'
      );

      return;
    }

    const allImdbUrls = currentImdbUrl
      ? Array.from(new Set([...savedImdbUrls, currentImdbUrl]))
      : savedImdbUrls;

    setUrlError('');
    setGuardrailError(null);
    setIsGuardrailPending(true);

    mutate(
      {
        description,
        imdbUrls: allImdbUrls.length > 0 ? allImdbUrls : undefined,
      },
      {
        onSettled: () => {
          setIsGuardrailPending(false);
          setDescription('');
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Header />

        <RecommendationForm
          description={description}
          handleKeyPress={handleKeyPress}
          handleSubmit={handleSubmit}
          imdbMovieInfos={imdbMovieInfos}
          imdbUrl={imdbUrl}
          isPending={isGuardrailPending || isPending}
          savedImdbUrls={savedImdbUrls}
          sessionMovies={sessionMovies}
          setDescription={setDescription}
          setImdbMovieInfos={setImdbMovieInfos}
          setImdbUrl={setImdbUrl}
          setSavedImdbUrls={setSavedImdbUrls}
          setSessionMovies={setSessionMovies}
          setUrlError={setUrlError}
          setValidUrlCount={setValidUrlCount}
          urlError={urlError}
          validUrlCount={validUrlCount}
        />

        <ErrorDisplay error={guardrailError || error} />

        <RecommendationDisplay
          data={data as RecommendationData}
          isPending={isGuardrailPending || isPending}
        />

        <MoviesListToRecommend
          error={moviesError}
          isLoading={isMoviesLoading}
          movies={allMovies}
        />

        <Features />
      </div>
    </main>
  );
}
