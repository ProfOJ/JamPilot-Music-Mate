
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as Tone from 'tone';
import { Instrument, Genre, Locality, AudioFeatures, Recording } from './types';
import { GENRE_PROFILES, CHORD_NOTES } from './constants';
import { audioEngine } from './services/audioEngine';
import InteractiveStage from './components/InteractiveStage';

const App: React.FC = () => {
  // UI State
  const [viewMode, setViewMode] = useState<'form' | 'stage'>('stage');
  const [activeTab, setActiveTab] = useState<'live' | 'recordings'>('live');
  const [genre, setGenre] = useState<Genre>('highlife');
  const [locality, setLocality] = useState<Locality>('ghana');
  const [instrument, setInstrument] = useState<Instrument>('full_band');
  const [bpm, setBpm] = useState<number>(110);

  // Session State
  const [isRecording, setIsRecording] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>('');
  const [chords, setChords] = useState<string[]>([]);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [logs, setLogs] = useState<{ id: number; msg: string; time: string; error?: boolean }[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);

  // Audio Processing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // Fix: Use any to avoid NodeJS namespace error in browser environment
  const loopRef = useRef<any>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const addLog = useCallback((msg: string, error = false) => {
    setLogs(prev => [
      { id: Date.now(), msg, time: new Date().toLocaleTimeString(), error },
      ...prev.slice(0, 49)
    ]);
  }, []);

  const loadRecordings = async () => {
    const saved = localStorage.getItem('jampilot_recordings');
    if (saved) {
      try { setRecordings(JSON.parse(saved)); } catch (e) {}
    }
  };

  const handleKeyDetection = async (features: AudioFeatures) => {
    // Adhering to guidelines: Always use process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Act as a master musician. Based on these audio features: avgFreq=${features.avgFrequency.toFixed(1)}Hz peakFreq=${features.peakFrequency.toFixed(1)}Hz amp=${features.amplitude.toFixed(3)} spectralCentroid=${features.spectralCentroid.toFixed(1)}Hz. The genre is ${genre}. Identify the most likely musical key (C, D, E, F, G, A, B, Bb, Eb, Ab, Db). Return JSON: {"key": "C", "confidence": 0.9, "mood": "joyful"}`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const data = JSON.parse(response.text || '{}');
      if (data.key) {
        return data;
      }
    } catch (e) {
      console.error('Gemini Detection Error:', e);
    }
    return null;
  };

  const startSession = async () => {
    try {
      await audioEngine.init();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const src = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecorderRef.current.start();

      audioEngine.buildSynths(instrument);
      setIsRecording(true);
      addLog(`Session started: ${genre} / ${instrument}`);

      // Initial detection loop
      const detectLoop = async () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0, peak = 0, pi = 0, ws = 0, ta = 0;
        const n = dataArray.length;
        const sr = audioContextRef.current?.sampleRate || 44100;
        for (let i = 0; i < n; i++) {
          const v = dataArray[i];
          sum += v; ta += v / 255; ws += v * i;
          if (v > peak) { peak = v; pi = i; }
        }
        const avgFreq = (ws / (sum || 1)) * (sr / (n * 2));
        const features: AudioFeatures = {
          avgFrequency: avgFreq,
          peakFrequency: pi * (sr / (n * 2)),
          amplitude: ta / n,
          spectralCentroid: avgFreq,
          zeroCrossingRate: 0
        };

        if (features.amplitude > 0.02) {
          const res = await handleKeyDetection(features);
          if (res && res.key) {
            setCurrentKey(res.key);
            const profile = GENRE_PROFILES[genre];
            const prog = profile.progressions[res.key] || profile.progressions[Object.keys(profile.progressions)[0]];
            setChords(prog);
            audioEngine.startLoop(genre, bpm, prog, (step, bar) => {
              setCurrentChordIndex(bar);
            });
            addLog(`Detected Key: ${res.key} (${Math.round(res.confidence * 100)}% confidence)`);
          }
        }

        if (loopRef.current) {
          loopRef.current = setTimeout(detectLoop, 5000);
        }
      };

      loopRef.current = setTimeout(detectLoop, 1000);

    } catch (err) {
      addLog(`Error: ${(err as Error).message}`, true);
    }
  };

  const stopSession = () => {
    setIsRecording(false);
    if (loopRef.current) {
      clearTimeout(loopRef.current);
      loopRef.current = null;
    }
    audioEngine.stopLoop();
    audioEngine.disposeSynths();
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const newRec: Recording = {
          id: `rec_${Date.now()}`,
          date: new Date().toISOString(),
          genre, locality, instrument, bpm,
          key: currentKey || '?',
          duration: 0,
          rawBlob: blob,
          mixedBlob: null
        };
        const updated = [newRec, ...recordings];
        setRecordings(updated);
        localStorage.setItem('jampilot_recordings', JSON.stringify(updated));
        addLog('Session saved to recordings.');
      };
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const toggleMic = () => {
    if (isRecording) stopSession();
    else startSession();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 overflow-x-hidden relative pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-orange-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-700 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="text-lg">🎵</span> JamPilot AI
          </div>
          <h1 className="font-serif text-6xl md:text-8xl mb-4 bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent leading-none">
            Your AI Band
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-lg">
            Jam with a virtual band that listens to you.
          </p>
        </header>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 p-1 rounded-xl flex gap-1 border border-gray-800">
            <button 
              onClick={() => setViewMode('stage')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'stage' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              🎤 Live Stage
            </button>
            <button 
              onClick={() => setViewMode('form')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'form' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              ⚙️ Setup
            </button>
          </div>
        </div>

        {/* Tab Selector (Live vs Recordings) */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-3 border-b-2 font-bold transition-colors ${activeTab === 'live' ? 'border-orange-500 text-orange-500' : 'border-gray-800 text-gray-500'}`}
          >
            LIVE ROOM
          </button>
          <button 
            onClick={() => setActiveTab('recordings')}
            className={`flex-1 py-3 border-b-2 font-bold transition-colors ${activeTab === 'recordings' ? 'border-orange-500 text-orange-500' : 'border-gray-800 text-gray-500'}`}
          >
            RECORDINGS ({recordings.length})
          </button>
        </div>

        {activeTab === 'live' ? (
          <>
            {viewMode === 'stage' ? (
              <InteractiveStage 
                selectedInstrument={instrument}
                onSelectInstrument={setInstrument}
                isRecording={isRecording}
                onMicClick={toggleMic}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                <section>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Musical Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(GENRE_PROFILES).map(g => (
                      <button 
                        key={g} 
                        onClick={() => setGenre(g as Genre)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${genre === g ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Accompaniment</label>
                  <div className="flex flex-wrap gap-2">
                    {(['guitar', 'bass', 'piano', 'drums', 'full_band'] as Instrument[]).map(i => (
                      <button 
                        key={i} 
                        onClick={() => setInstrument(i)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${instrument === i ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      >
                        {i.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="col-span-full">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Tempo: {bpm} BPM</label>
                  <input 
                    type="range" min="60" max="180" 
                    value={bpm} 
                    onChange={e => setBpm(Number(e.target.value))}
                    className="w-full accent-orange-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                </section>

                <button 
                  onClick={toggleMic}
                  className={`col-span-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-xl ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                  {isRecording ? '⏹ STOP LIVE SESSION' : '🎤 START LIVE SESSION'}
                </button>
              </div>
            )}

            {/* Session Stats & Logs Overlay */}
            {(isRecording || logs.length > 0) && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 col-span-1">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Live Detection</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Musical Key</span>
                      <span className="text-2xl font-mono text-orange-500 font-bold">{currentKey || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Current Bar</span>
                      <div className="flex gap-1">
                        {chords.map((c, i) => (
                          <div 
                            key={i} 
                            className={`w-8 h-8 flex items-center justify-center rounded text-[10px] font-bold ${currentChordIndex === i ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 col-span-2 max-h-[200px] overflow-y-auto">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Stage Log</h3>
                  <div className="space-y-2">
                    {logs.map(log => (
                      <div key={log.id} className={`text-xs font-mono flex gap-4 ${log.error ? 'text-red-500' : 'text-gray-400'}`}>
                        <span className="opacity-40 whitespace-nowrap">{log.time}</span>
                        <span>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {recordings.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500">No recordings yet. Jump on stage and perform!</p>
              </div>
            ) : (
              recordings.map(rec => (
                <div key={rec.id} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-colors flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className="bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{rec.genre}</span>
                      <span className="bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{rec.instrument}</span>
                    </div>
                    <h4 className="font-bold text-xl mb-1">Session in {rec.key}</h4>
                    <p className="text-gray-500 text-xs font-mono">{new Date(rec.date).toLocaleString()}</p>
                  </div>
                  <div className="flex-1 max-w-md w-full">
                    {rec.rawBlob && (
                      <audio controls className="w-full h-10 accent-orange-500 opacity-80" src={URL.createObjectURL(rec.rawBlob)} />
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      const updated = recordings.filter(r => r.id !== rec.id);
                      setRecordings(updated);
                      localStorage.setItem('jampilot_recordings', JSON.stringify(updated));
                    }}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <footer className="mt-20 text-center border-t border-gray-800 pt-10">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.3em]">
            Built with Gemini 3 • 2025 • JamPilot AI
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
