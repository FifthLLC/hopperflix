import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

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
