'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-red-200 via-red-300 to-red-400 rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold text-red-800 mb-6">
        Oops! Something went wrong.
      </h2>
      <button
        className="px-5 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-transform transform hover:scale-105 duration-300"
        onClick={() => reset()}
      >
        Try Again
      </button>
    </div>
  );
}
