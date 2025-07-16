import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { parseImdbUrl } from '@/utils/validateImdbUrl';

interface ImdbUrlInputProps {
  imdbUrl: string;
  setImdbUrl: (value: string) => void;
  urlError: string;
  setUrlError: (value: string) => void;
  validUrlCount: number;
  setValidUrlCount: (value: number) => void;
  savedImdbUrls: string[];
  setSavedImdbUrls: (value: string[]) => void;
  imdbMovieInfos: any[];
  setImdbMovieInfos: (value: any[]) => void;
  sessionMovies: string[];
  setSessionMovies: (value: string[]) => void;
  description?: string;
}

export default function ImdbUrlInput({
  imdbUrl,
  setImdbUrl,
  urlError,
  setUrlError,
  validUrlCount,
  setValidUrlCount,
  savedImdbUrls,
  setSavedImdbUrls,
  imdbMovieInfos,
  setImdbMovieInfos,
  sessionMovies,
  setSessionMovies,
  description = '',
}: ImdbUrlInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // For IMDB scraping
  const imdbScrapeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/imdb-scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok)
        throw new Error('Failed to fetch movie info from IMDB.');

      return response.json();
    },
  });

  const guardrailMutation = useMutation({
    mutationFn: async (imdbUrls: string[]) => {
      const response = await fetch('/api/guardrail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imdbUrls }),
      });

      const data = await response.json();

      return data;
    },
  });

  const handleAddImdbUrl = async () => {
    setAddError('');
    const parsedUrl = parseImdbUrl(imdbUrl);

    if (imdbUrl.trim() && !parsedUrl) {
      setUrlError(
        'Please enter a valid IMDB URL (e.g., https://www.imdb.com/title/tt0133093/)'
      );

      return;
    }

    if (parsedUrl) {
      if (savedImdbUrls.includes(parsedUrl)) {
        setAddError('This IMDB URL has already been added.');

        return;
      }

      setIsAdding(true);
      try {
        // 1. Scrape IMDB info
        const info = await imdbScrapeMutation.mutateAsync(parsedUrl);

        if (!info || !info.title) {
          setAddError('Could not extract movie info from IMDB URL.');
          setIsAdding(false);

          return;
        }

        // 2. Guardrail check
        const guardrailData = await guardrailMutation.mutateAsync([parsedUrl]);

        if (!guardrailData.isValid) {
          setAddError(
            guardrailData.reasoning || 'Movie did not pass content validation.'
          );
          setIsAdding(false);

          return;
        }

        // 3. Add to state if not duplicate
        const newSavedUrls = Array.from(new Set([...savedImdbUrls, parsedUrl]));

        setSavedImdbUrls(newSavedUrls);
        setImdbMovieInfos([...imdbMovieInfos, info]);
        setSessionMovies([...sessionMovies, info.title]);
        setImdbUrl('');
        setValidUrlCount(0);
        setUrlError('');
      } catch (err: any) {
        setAddError(err.message || 'Unexpected error adding movie. Try again.');
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <div>
      <label className="block text-white font-semibold mb-3" htmlFor="imdbUrl">
        IMDB Movie URL (Optional):
      </label>
      <div className="flex gap-2 mb-2">
        <input
          className={`flex-1 rounded-xl border-2 bg-gray-800/50 p-4 text-white placeholder-gray-400 focus:outline-none transition-colors ${
            urlError
              ? 'border-red-500'
              : 'border-gray-600 focus:border-blue-500'
          }`}
          id="imdbUrl"
          placeholder="https://www.imdb.com/title/tt0133093/"
          type="text"
          value={imdbUrl}
          onChange={(e) => {
            setImdbUrl(e.target.value);
            // Show warning if not empty and not valid
            const parsedUrl = parseImdbUrl(e.target.value);

            if (e.target.value.trim() && !parsedUrl) {
              setUrlError('This is an invalid IMDB URL');
            } else {
              setUrlError('');
            }
            setValidUrlCount(parsedUrl ? 1 : 0);
          }}
        />
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
          disabled={!imdbUrl.trim() || validUrlCount === 0 || isAdding}
          onClick={handleAddImdbUrl}
        >
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </div>

      {/* Display saved IMDB URLs */}
      {savedImdbUrls.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-300 mb-2">
            Saved IMDB URLs ({savedImdbUrls.length} total):
          </p>
          <div className="space-y-2">
            {savedImdbUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-800/30 rounded-lg p-2"
              >
                <span className="text-sm text-gray-300 truncate">{url}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {urlError && <p className="text-sm text-red-400 mt-2">{urlError}</p>}
      {addError && <p className="text-sm text-red-400 mt-2">{addError}</p>}
      {validUrlCount > 0 && (
        <p className="text-sm text-green-400 mt-2">
          ✅ Valid IMDB URL detected
        </p>
      )}
      <p className="text-sm text-gray-400 mt-2">
        Add an IMDB URL for a recent movie you&apos;re interested in. Click
        &quot;Add&quot; to save it.
      </p>
    </div>
  );
}
