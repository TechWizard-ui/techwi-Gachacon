import React, { useState } from 'react';
import { GameLevel } from './GameLevel';


const LEVELS = [
  { requiredClicks: 10, timeLimit: 5 },
  { requiredClicks: 20, timeLimit: 8 },
  { requiredClicks: 30, timeLimit: 10 },
];

export const GameContainer: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0);

  const handleLevelComplete = () => {
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#2A2D3E] bg-opacity-95 py-12 relative">
      {/* Pixel Art Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABdJREFUeNpi+P//PwMTAwMDEwMQAAQYABnCA+R9RQQmAAAAAElFTkSuQmCC')] bg-repeat"></div>
      
      <div className="container mx-auto px-4 max-w-4xl relative">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFA07A] to-[#FF6B6B] mb-4 
                         pixel-font transform hover:scale-105 transition-transform duration-300
                         border-b-4 border-[#FF6B6B] pb-4 inline-block">
            Click Challenge Game
          </h1>
          <p className="text-[#B8C0E0] text-lg mt-4 pixel-font">
            Complete each level by clicking fast enough before time runs out!
          </p>
        </div>

        {/* Level Progress Indicator */}
        <div className="flex justify-center gap-3 mb-8">
          {LEVELS.map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 transform transition-all duration-300 
                         ${index === currentLevel
                           ? 'bg-[#FF6B6B] scale-125 rotate-45'
                           : index < currentLevel
                           ? 'bg-[#98FB98] rotate-45'
                           : 'bg-[#4A5568] rotate-45'
                         } 
                         border-2 border-opacity-20 border-white
                         shadow-lg hover:scale-110`}
            />
          ))}
        </div>

        {currentLevel < LEVELS.length ? (
          <GameLevel
            level={currentLevel + 1}
            requiredClicks={LEVELS[currentLevel].requiredClicks}
            timeLimit={LEVELS[currentLevel].timeLimit}
            onLevelComplete={handleLevelComplete}
          />
        ) : (
          <div className="text-center p-8 bg-[#343747] rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.3)] border-4 border-[#FF6B6B]">
            <div className="animate-bounce mb-6">
              <span className="text-7xl pixel-font">🏆</span>
            </div>
            <h2 className="text-4xl font-bold text-[#98FB98] mb-4 pixel-font">
              Game Complete!
            </h2>
            <p className="text-[#B8C0E0] text-xl pixel-font">
              You've mastered all levels! You're a clicking champion!
            </p>
            <div className="mt-6 pixel-art-border p-4 inline-block bg-[#2A2D3E]">
              <span className="text-[#FFD700] text-2xl">★★★</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 