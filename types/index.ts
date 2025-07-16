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
