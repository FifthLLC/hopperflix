export default function MoviesListToRecommend({
  movies,
  isLoading,
  error,
}: {
  movies: string[];
  isLoading?: boolean;
  error?: Error | null;
}) {
  if (isLoading) {
    return (
      <div className="text-center text-gray-300 my-8">Loading movies...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 my-8">
        Failed to load movies.
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          🎭 Movies to recommend
        </h2>
        <p className="text-gray-300">
          Our curated selection of classic and recent films
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full mt-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(new Set(movies)).map((movie, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-3">
              <span className="text-blue-400 font-bold text-lg">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-white font-medium text-sm leading-tight">
                {movie}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm">
          {Array.from(new Set(movies)).length} movies available for
          recommendation
        </p>
      </div>
    </div>
  );
}
