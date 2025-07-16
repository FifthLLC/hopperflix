import DescriptionInput from './DescriptionInput';
import ImdbUrlInput from './ImdbUrlInput';
import SubmitButton from './SubmitButton';

import { RecommendationFormProps } from '@/types';

export default function RecommendationForm({
  description,
  setDescription,
  imdbUrl,
  setImdbUrl,
  urlError,
  setUrlError,
  validUrlCount,
  setValidUrlCount,
  savedImdbUrls,
  setSavedImdbUrls,
  isPending,
  handleSubmit,
  handleKeyPress,
  imdbMovieInfos = [],
  setImdbMovieInfos = () => {},
  sessionMovies = [],
  setSessionMovies = () => {},
}: RecommendationFormProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8">
      <div className="space-y-6">
        <DescriptionInput
          description={description}
          handleKeyPress={handleKeyPress}
          setDescription={setDescription}
        />

        <ImdbUrlInput
          description={description}
          imdbMovieInfos={imdbMovieInfos}
          imdbUrl={imdbUrl}
          savedImdbUrls={savedImdbUrls}
          sessionMovies={sessionMovies}
          setImdbMovieInfos={setImdbMovieInfos}
          setImdbUrl={setImdbUrl}
          setSavedImdbUrls={setSavedImdbUrls}
          setSessionMovies={setSessionMovies}
          setUrlError={setUrlError}
          setValidUrlCount={setValidUrlCount}
          urlError={urlError}
          validUrlCount={validUrlCount}
        />

        <SubmitButton
          description={description}
          imdbUrl={imdbUrl}
          isPending={isPending}
          savedImdbUrls={savedImdbUrls}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
