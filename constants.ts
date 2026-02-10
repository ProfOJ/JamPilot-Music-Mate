
import { GenreProfile, Genre } from './types';

export const GENRE_PROFILES: Record<Genre, GenreProfile> = {
  highlife: {
    progressions: { C: ['C', 'Am', 'F', 'G'], D: ['D', 'Bm', 'G', 'A'], G: ['G', 'Em', 'C', 'D'], E: ['E', 'C#m', 'A', 'B'], F: ['F', 'Dm', 'Bb', 'C'], A: ['A', 'F#m', 'D', 'E'] },
    feel: 'Relaxed & Groovy',
    rhythmPattern: [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
    swingAmount: 0.2
  },
  afrobeats: {
    progressions: { C: ['C', 'G', 'Am', 'F'], D: ['D', 'A', 'Bm', 'G'], G: ['G', 'D', 'Em', 'C'], E: ['E', 'B', 'C#m', 'A'], F: ['F', 'C', 'Dm', 'Bb'], A: ['A', 'E', 'F#m', 'D'] },
    feel: 'Driving & Percussive',
    rhythmPattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
    swingAmount: 0.1
  },
  jazz: {
    progressions: { C: ['Cmaj7', 'Dm7', 'G7', 'Cmaj7'], D: ['Dmaj7', 'Em7', 'A7', 'Dmaj7'], G: ['Gmaj7', 'Am7', 'D7', 'Gmaj7'], F: ['Fmaj7', 'Gm7', 'C7', 'Fmaj7'], Bb: ['Bbmaj7', 'Cm7', 'F7', 'Bbmaj7'], Eb: ['Ebmaj7', 'Fm7', 'Bb7', 'Ebmaj7'] },
    feel: 'Smooth & Chromatic',
    rhythmPattern: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
    swingAmount: 0.6
  },
  reggae: {
    progressions: { C: ['C', 'G', 'Am', 'F'], D: ['D', 'A', 'Bm', 'G'], G: ['G', 'D', 'Em', 'C'], A: ['A', 'E', 'F#m', 'D'], E: ['E', 'B', 'C#m', 'A'], F: ['F', 'C', 'Dm', 'Bb'] },
    feel: 'Off-beat & Laid-back',
    rhythmPattern: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    swingAmount: 0.3
  },
  blues: {
    progressions: { E: ['E7', 'E7', 'A7', 'E7'], A: ['A7', 'A7', 'D7', 'A7'], G: ['G7', 'G7', 'C7', 'G7'], C: ['C7', 'C7', 'F7', 'C7'], D: ['D7', 'D7', 'G7', 'D7'], B: ['B7', 'B7', 'E7', 'B7'] },
    feel: 'Soulful & Swinging',
    rhythmPattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    swingAmount: 0.5
  },
  hiphop: {
    progressions: { C: ['Cm', 'Ab', 'Eb', 'Bb'], D: ['Dm', 'Bb', 'F', 'C'], G: ['Gm', 'Eb', 'Bb', 'F'], A: ['Am', 'F', 'C', 'G'], E: ['Em', 'C', 'G', 'D'], F: ['Fm', 'Db', 'Ab', 'Eb'] },
    feel: 'Hard & Rhythmic',
    rhythmPattern: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    swingAmount: 0.05
  },
  amapiano: {
    progressions: { C: ['Cm', 'Ab', 'Fm', 'G'], D: ['Dm', 'Bb', 'Gm', 'A'], A: ['Am', 'F', 'Dm', 'E'], G: ['Gm', 'Eb', 'Cm', 'D'], E: ['Em', 'C', 'Am', 'B'], F: ['Fm', 'Db', 'Bbm', 'C'] },
    feel: 'Bouncy & Deep',
    rhythmPattern: [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
    swingAmount: 0.15
  },
  gospel: {
    progressions: { C: ['C', 'Am7', 'Dm7', 'G7'], D: ['D', 'Bm7', 'Em7', 'A7'], G: ['G', 'Em7', 'Am7', 'D7'], F: ['F', 'Dm7', 'Gm7', 'C7'], Bb: ['Bb', 'Gm7', 'Cm7', 'F7'], Eb: ['Eb', 'Cm7', 'Fm7', 'Bb7'] },
    feel: 'Uplifting & Rich',
    rhythmPattern: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    swingAmount: 0.3
  }
};

export const CHORD_NOTES: Record<string, string[]> = {
  'C': ['C4','E4','G4'], 'Cm': ['C4','Eb4','G4'], 'C7': ['C4','E4','G4','Bb4'], 'Cmaj7': ['C4','E4','G4','B4'], 'Cm7': ['C4','Eb4','G4','Bb4'],
  'D': ['D4','F#4','A4'], 'Dm': ['D4','F4','A4'], 'D7': ['D4','F#4','A4','C5'], 'Dmaj7': ['D4','F#4','A4','C#5'], 'Dm7': ['D4','F4','A4','C5'],
  'E': ['E4','G#4','B4'], 'Em': ['E4','G4','B4'], 'E7': ['E4','G#4','B4','D5'], 'Emaj7': ['E4','G#4','B4','D#5'], 'Em7': ['E4','G4','B4','D5'],
  'F': ['F3','A3','C4'], 'Fm': ['F3','Ab3','C4'], 'F7': ['F3','A3','C4','Eb4'], 'Fmaj7': ['F3','A3','C4','E4'], 'Fm7': ['F3','Ab3','C4','Eb4'],
  'G': ['G3','B3','D4'], 'Gm': ['G3','Bb3','D4'], 'G7': ['G3','B3','D4','F4'], 'Gmaj7': ['G3','B3','D4','F#4'], 'Gm7': ['G3','Bb3','D4','F4'],
  'A': ['A3','C#4','E4'], 'Am': ['A3','C4','E4'], 'A7': ['A3','C#4','E4','G4'], 'Amaj7': ['A3','C#4','E4','G#4'], 'Am7': ['A3','C4','E4','G4'],
  'B': ['B3','D#4','F#4'], 'Bm': ['B3','D4','F#4'], 'B7': ['B3','D#4','F#4','A4'], 'Bmaj7': ['B3','D#4','F#4','A#4'], 'Bm7': ['B3','D4','F#4','A4'],
  'Bb': ['Bb3','D4','F4'], 'Bbmaj7': ['Bb3','D4','F4','A4'], 'Bb7': ['Bb3','D4','F4','Ab4'], 'Eb': ['Eb4','G4','Bb4'], 'Ebmaj7': ['Eb4','G4','Bb4','D5'],
  'Ab': ['Ab3','C4','Eb4'], 'Db': ['Db4','F4','Ab4'], 'Bbm': ['Bb3','Db4','F4'], 'C#m': ['C#4','E4','G#4'], 'F#m': ['F#3','A3','C#4'], 'F#m7': ['F#3','A3','C#4','E4']
};
