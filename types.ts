
export type Genre = 'highlife' | 'afrobeats' | 'jazz' | 'reggae' | 'blues' | 'hiphop' | 'amapiano' | 'gospel';
export type Instrument = 'guitar' | 'bass' | 'piano' | 'drums' | 'full_band';
export type Locality = 'ghana' | 'nigeria' | 'south_africa' | 'jamaica' | 'usa' | 'uk';

export interface GenreProfile {
  progressions: Record<string, string[]>;
  feel: string;
  rhythmPattern: number[];
  swingAmount: number;
}

export interface AudioFeatures {
  avgFrequency: number;
  peakFrequency: number;
  amplitude: number;
  spectralCentroid: number;
  zeroCrossingRate: number;
}

export interface Recording {
  id: string;
  date: string;
  genre: Genre;
  locality: Locality;
  instrument: Instrument;
  key: string;
  bpm: number;
  duration: number;
  rawBlob: Blob | null;
  mixedBlob: Blob | null;
}
