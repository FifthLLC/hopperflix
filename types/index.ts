import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface ErrorHandlerOptions {
  onError?: (error: Error) => void;
  showUserMessage?: boolean;
  logToConsole?: boolean;
}
export interface ValidationResult {
  isValid: boolean;
  blockedContent?: string;
  reasoning?: string;
  suggestions?: string[];
}

export interface SubmitButtonProps {
  isPending: boolean;
  description: string;
  imdbUrl: string;
  savedImdbUrls: string[];
  onSubmit: () => void;
}
export interface RecommendationData {
  recommendation: string;
  reasoning: string;
  genre: string;
  year: string;
  alternative?: string;
  alternativeReason?: string;
  mood?: string;
  perfectFor?: string;
  fullResponse?: string;
}

export interface RecommendationRequest {
  description: string;
  imdbUrls?: string[];
}

export interface ImdbMovieInfo {
  title: string | null;
  year: string | null;
  genre: string[];
  description: string | null;
  rating: string | null;
  runtime: string | null;
  director: string | null;
  cast: string[];
}

export interface ImdbMovieInfoWithUrl extends ImdbMovieInfo {
  url: string;
}

export interface DescriptionInputProps {
  description: string;
  setDescription: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}
export interface ErrorDisplayProps {
  error: string | { message: string; suggestions?: string[] } | null;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export interface ImdbUrlInputProps {
  imdbUrl: string;
  setImdbUrl: (value: string) => void;
  urlError: string;
  setUrlError: (value: string) => void;
  validUrlCount: number;
  setValidUrlCount: (value: number) => void;
  savedImdbUrls: string[];
  setSavedImdbUrls: (value: string[]) => void;
  imdbMovieInfos: ImdbMovieInfo[];
  setImdbMovieInfos: (value: ImdbMovieInfo[]) => void;
  sessionMovies: string[];
  setSessionMovies: (value: string[]) => void;
  description?: string;
}

export interface RecommendationFormProps {
  description: string;
  setDescription: (value: string) => void;
  imdbUrl: string;
  setImdbUrl: (value: string) => void;
  urlError: string;
  setUrlError: (value: string) => void;
  validUrlCount: number;
  setValidUrlCount: (value: number) => void;
  savedImdbUrls: string[];
  setSavedImdbUrls: (value: string[]) => void;
  isPending: boolean;
  handleSubmit: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  imdbMovieInfos?: ImdbMovieInfo[];
  setImdbMovieInfos?: (value: ImdbMovieInfo[]) => void;
  sessionMovies?: string[];
  setSessionMovies?: (value: string[]) => void;
}

export interface RecommendationDisplayProps {
  data: RecommendationData | null;
  isPending?: boolean;
}
