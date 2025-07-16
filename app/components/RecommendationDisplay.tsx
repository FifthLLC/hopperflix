import { RecommendationDisplayProps } from '@/types';

export default function RecommendationDisplay({
  data,
  isPending = false,
}: RecommendationDisplayProps) {
  if (isPending) {
    return (
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl p-8 mb-8 flex flex-col items-center justify-center min-h-[200px]">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mr-4" />
          <span className="text-white text-xl font-semibold">
            Finding your perfect movie match...
          </span>
        </div>
        <div className="text-gray-300 text-sm">
          Our AI is analyzing your preferences and movie list.
        </div>
      </div>
    );
  }

  if (!data || !data.recommendation) return null;

  const isAllRecommended = data.recommendation.startsWith(
    'All movies have been recommended! Starting fresh with:'
  );

  const getMoviesFromRecommendation = (recommendation: string) => {
    if (!isAllRecommended) return [];

    const moviesPart = recommendation
      .replace('All movies have been recommended! Starting fresh with:', '')
      .trim();

    return moviesPart.split(', ').map((movie) => movie.trim());
  };

  const movies = getMoviesFromRecommendation(data.recommendation);

  return (
    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          🎬 Your Perfect Movie Match
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto rounded-full" />
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105 mb-6">
        <div className="text-lg md:text-2xl font-bold text-white">
          {isAllRecommended
            ? 'All movies have been recommended! Starting fresh with:'
            : data.recommendation}
        </div>
      </div>

      {isAllRecommended && movies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {movies.map((movie, index) => (
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
      )}

      <div className="text-center">
        <p className="text-gray-300 text-sm">Enjoy your movie night! 🍿</p>
      </div>
    </div>
  );
}
