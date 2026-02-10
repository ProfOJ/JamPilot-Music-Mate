
import React from 'react';
import { Instrument } from '../types';

interface InteractiveStageProps {
  selectedInstrument: Instrument;
  onSelectInstrument: (instr: Instrument) => void;
  isRecording: boolean;
  onMicClick: () => void;
}

const InteractiveStage: React.FC<InteractiveStageProps> = ({
  selectedInstrument,
  onSelectInstrument,
  isRecording,
  onMicClick
}) => {
  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Background with Stage Lighting */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-indigo-950 opacity-80"></div>
      
      {/* Lights - Flashing when recording */}
      <div className="absolute top-0 left-0 right-0 h-40 flex justify-around pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1 h-full bg-gradient-to-b from-white to-transparent opacity-20 transform -rotate-${(i-2.5)*10} ${isRecording ? 'animate-stage-pulse' : ''}`}
            style={{ 
              filter: 'blur(10px)',
              animationDelay: `${i * 0.3}s`,
              backgroundColor: isRecording ? (i % 2 === 0 ? '#f97316' : '#7c3aed') : 'white'
            }}
          />
        ))}
      </div>

      {/* Stage Elements */}
      <div className="absolute bottom-10 left-0 right-0 h-1/2 flex justify-center items-end px-10 gap-12">
        
        {/* Guitar Left */}
        <button 
          onClick={() => onSelectInstrument('guitar')}
          className={`transition-all duration-300 transform hover:scale-110 flex flex-col items-center ${selectedInstrument === 'guitar' ? 'glow-orange scale-105' : 'opacity-70 grayscale hover:grayscale-0'}`}
        >
          <span className="text-6xl mb-2">🎸</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Guitar</span>
        </button>

        {/* Bass Left */}
        <button 
          onClick={() => onSelectInstrument('bass')}
          className={`transition-all duration-300 transform hover:scale-110 flex flex-col items-center ${selectedInstrument === 'bass' ? 'glow-orange scale-105' : 'opacity-70 grayscale hover:grayscale-0'}`}
        >
          <span className="text-6xl mb-2 grayscale brightness-75">🎸</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bass</span>
        </button>

        {/* Big Mic Center */}
        <button 
          onClick={onMicClick}
          className={`relative z-20 group transition-all duration-500 transform ${isRecording ? 'scale-125' : 'hover:scale-110'}`}
        >
          <div className={`absolute inset-0 bg-orange-500 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity ${isRecording ? 'opacity-60 animate-pulse' : ''}`}></div>
          <div className={`p-8 rounded-full border-4 ${isRecording ? 'bg-red-600 border-red-400' : 'bg-gray-800 border-gray-600'} shadow-2xl relative`}>
            <span className="text-7xl">🎙️</span>
          </div>
          <p className={`mt-4 font-bold tracking-widest uppercase text-sm ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
            {isRecording ? 'Recording...' : 'Tap to Start'}
          </p>
        </button>

        {/* Drums Back Center (ish) */}
        <button 
          onClick={() => onSelectInstrument('drums')}
          className={`transition-all duration-300 transform hover:scale-110 flex flex-col items-center ${selectedInstrument === 'drums' ? 'glow-orange scale-105' : 'opacity-70 grayscale hover:grayscale-0'}`}
        >
          <span className="text-6xl mb-2">🥁</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Drums</span>
        </button>

        {/* Keyboard Right */}
        <button 
          onClick={() => onSelectInstrument('piano')}
          className={`transition-all duration-300 transform hover:scale-110 flex flex-col items-center ${selectedInstrument === 'piano' ? 'glow-orange scale-105' : 'opacity-70 grayscale hover:grayscale-0'}`}
        >
          <span className="text-6xl mb-2">🎹</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Piano</span>
        </button>

      </div>

      {/* Speakers Far Sides */}
      <div className="absolute bottom-5 left-4 opacity-40">
        <div className="w-16 h-40 bg-gray-800 rounded border border-gray-700 flex flex-col items-center justify-around py-2">
          <div className="w-12 h-12 bg-gray-900 rounded-full border border-gray-700"></div>
          <div className="w-12 h-12 bg-gray-900 rounded-full border border-gray-700"></div>
        </div>
      </div>
      <div className="absolute bottom-5 right-4 opacity-40">
        <div className="w-16 h-40 bg-gray-800 rounded border border-gray-700 flex flex-col items-center justify-around py-2">
          <div className="w-12 h-12 bg-gray-900 rounded-full border border-gray-700"></div>
          <div className="w-12 h-12 bg-gray-900 rounded-full border border-gray-700"></div>
        </div>
      </div>

      {/* Visualizer overlay (Stage floor vibe) */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
    </div>
  );
};

export default InteractiveStage;
