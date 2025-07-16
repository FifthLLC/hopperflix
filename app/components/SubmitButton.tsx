interface SubmitButtonProps {
  isPending: boolean;
  description: string;
  imdbUrl: string;
  savedImdbUrls: string[];
  onSubmit: () => void;
}

export default function SubmitButton({
  isPending,
  description,
  imdbUrl,
  savedImdbUrls,
  onSubmit,
}: SubmitButtonProps) {
  const isDisabled =
    isPending ||
    !description.trim() ||
    (imdbUrl.trim() !== '' && savedImdbUrls.length === 0);

  return (
    <div className="space-y-3">
      {savedImdbUrls.length > 0 && (
        <p className="text-sm text-blue-300 text-center">
          📽️ {savedImdbUrls.length} IMDB movie
          {savedImdbUrls.length > 1 ? 's' : ''} will be included in your
          recommendation
        </p>
      )}
      {imdbUrl.trim() !== '' && savedImdbUrls.length === 0 && (
        <p className="text-sm text-yellow-300 text-center">
          ⚠️ Please click &quot;Add&quot; to include your IMDB URL in the
          recommendation
        </p>
      )}
      <button
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
        disabled={isDisabled}
        onClick={onSubmit}
      >
        {isPending ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
            Analyzing your preferences...
          </div>
        ) : (
          '🎬 Get My Movie Recommendation'
        )}
      </button>
    </div>
  );
}
