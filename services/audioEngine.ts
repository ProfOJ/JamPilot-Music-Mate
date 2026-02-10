
import * as Tone from 'tone';
// Corrected imports: Genre and Instrument are in types.ts, while profiles and notes are in constants.ts
import { GENRE_PROFILES, CHORD_NOTES } from '../constants';
import { Genre, Instrument } from '../types';

class AudioEngine {
  private synths: Record<string, any> = {};
  private chordLoop: Tone.Loop | null = null;
  private transportStarted = false;
  private loopStep = 0;

  constructor() {}

  async init() {
    await Tone.start();
  }

  buildSynths(instrument: Instrument) {
    this.disposeSynths();
    const vol = new Tone.Volume(-10).toDestination();

    if (instrument === 'guitar' || instrument === 'full_band') {
      this.synths.guitar = new Tone.PolySynth(Tone.FMSynth, {
        maxPolyphony: 6,
        voice0: { modulationIndex: 2, harmonicity: 3.01 },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.2, release: 0.8 }
      }).connect(vol);
    }
    if (instrument === 'bass' || instrument === 'full_band') {
      this.synths.bass = new Tone.MonoSynth({
        oscillator: { type: 'fmsawtooth' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.5 },
        filterEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.3, baseFrequency: 80, octaves: 2 }
      }).connect(new Tone.Volume(-6).toDestination());
    }
    if (instrument === 'piano' || instrument === 'full_band') {
      this.synths.piano = new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: 8,
        oscillator: { type: 'triangle8' },
        envelope: { attack: 0.005, decay: 0.6, sustain: 0.3, release: 1.2 }
      }).connect(vol);
    }
    if (instrument === 'drums' || instrument === 'full_band') {
      this.synths.kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).connect(new Tone.Volume(-4).toDestination());
      this.synths.snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0 } }).connect(new Tone.Volume(-10).toDestination());
      this.synths.hihat = new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).connect(new Tone.Volume(-18).toDestination());
    }
  }

  startLoop(genre: Genre, bpm: number, currentChords: string[], onStep: (step: number, bar: number) => void) {
    this.stopLoop();
    const profile = GENRE_PROFILES[genre];
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.swing = profile.swingAmount;
    this.loopStep = 0;

    this.chordLoop = new Tone.Loop(time => {
      const step = this.loopStep % 16;
      const bar = Math.floor(this.loopStep / 16) % (currentChords.length || 1);
      const chord = currentChords[bar];
      const notes = CHORD_NOTES[chord] || CHORD_NOTES['C'];
      const pat = profile.rhythmPattern;

      onStep(step, bar);

      if (pat[step] === 1) {
        if (this.synths.guitar) this.synths.guitar.triggerAttackRelease(notes, '8n', time, 0.5 + Math.random() * 0.2);
        if (this.synths.piano) this.synths.piano.triggerAttackRelease(notes, '8n', time, 0.4 + Math.random() * 0.2);
      }
      if (this.synths.bass && (step === 0 || step === 8)) {
        const root = notes[0].replace(/\d/, '2');
        this.synths.bass.triggerAttackRelease(root, '4n', time, 0.7);
      }
      if (this.synths.kick && (step === 0 || step === 8)) this.synths.kick.triggerAttackRelease('C1', '8n', time, 0.9);
      if (this.synths.snare && (step === 4 || step === 12)) this.synths.snare.triggerAttackRelease('8n', time, 0.6);
      if (this.synths.hihat && step % 2 === 0) this.synths.hihat.triggerAttackRelease('32n', time, 0.2 + (step % 4 === 0 ? 0.15 : 0));

      this.loopStep++;
    }, '16n');

    this.chordLoop.start(0);
    if (!this.transportStarted) {
      Tone.Transport.start();
      this.transportStarted = true;
    }
  }

  stopLoop() {
    if (this.chordLoop) {
      this.chordLoop.stop();
      this.chordLoop.dispose();
      this.chordLoop = null;
    }
    Tone.Transport.stop();
    this.transportStarted = false;
  }

  disposeSynths() {
    Object.values(this.synths).forEach(s => {
      try { s.dispose(); } catch (e) {}
    });
    this.synths = {};
  }
}

export const audioEngine = new AudioEngine();
