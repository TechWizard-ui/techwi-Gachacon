import React, { useState, useEffect } from 'react';
import { MintTokenValidator } from './MintTokenValidator';

interface GameLevelProps {
  level: number;
  requiredClicks: number;
  timeLimit: number;
  onLevelComplete: () => void;
}

export const GameLevel: React.FC<GameLevelProps> = ({
  level,
  requiredClicks,
  timeLimit,
  onLevelComplete
}) => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [buttonScale, setButtonScale] = useState(1);

  useEffect(() => {
   let interval: ReturnType<typeof setInterval>;

    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setClicks(0);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setIsActive(true);
    setTimeLeft(timeLimit);
    setClicks(0);
  };

  const handleClick = () => {
    if (!isActive || timeLeft === 0) return;
    
    setButtonScale(0.95);
    setTimeout(() => setButtonScale(1), 100);
    
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    if (newClicks >= requiredClicks) {
      setIsActive(false);
      setIsCompleted(true);
      onLevelComplete();
    }
  };

  const progress = (clicks / requiredClicks) * 100;

  return (
    <div className="p-8 bg-[#343747] rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] 
                    border-4 border-[#4A5568] transform transition-all duration-300 
                    hover:shadow-[0_0_30px_rgba(0,0,0,0.4)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#FFA07A] pixel-font">
          Level {level}
        </h2>
        <div className="text-lg font-semibold text-[#B8C0E0] bg-[#2A2D3E] p-2 rounded-lg border-2 border-[#4A5568]">
          Time: <span className="text-[#FF6B6B]">{timeLeft}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-6 bg-[#2A2D3E] rounded-lg mb-6 overflow-hidden border-2 border-[#4A5568] p-1">
        <div 
          className="h-full bg-gradient-to-r from-[#FFA07A] to-[#FF6B6B] transition-all duration-300 ease-out rounded"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-8 text-[#B8C0E0]">
        <div className="text-lg pixel-font">
          Progress: <span className="font-bold text-[#98FB98]">{clicks}/{requiredClicks}</span>
        </div>
        <div className="text-sm bg-[#2A2D3E] px-3 py-1 rounded-lg border-2 border-[#4A5568]">
          {Math.round(progress)}% Complete
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        {!isActive && !isCompleted && (
          <button
            onClick={handleStart}
            className="w-full py-4 px-8 bg-gradient-to-r from-[#FFA07A] to-[#FF6B6B] text-white font-bold 
                     rounded-xl transform transition-all duration-300 hover:scale-105 
                     hover:shadow-[0_0_15px_rgba(255,107,107,0.3)] pixel-font border-4 border-[#4A5568]
                     active:scale-95 focus:outline-none"
          >
            Start Level {level}
          </button>
        )}
        
        {isActive && (
          <button
            onClick={handleClick}
            style={{ transform: `scale(${buttonScale})` }}
            className="w-full py-4 px-8 bg-gradient-to-r from-[#98FB98] to-[#4A90E2] text-white font-bold 
                     rounded-xl transform transition-all duration-100 hover:shadow-[0_0_15px_rgba(152,251,152,0.3)]
                     pixel-font border-4 border-[#4A5568] active:from-[#7BC47F] active:to-[#357ABD]"
          >
            Click Me!
          </button>
        )}

        {timeLeft === 0 && !isCompleted && (
          <div className="text-center pixel-font">
            <p className="text-[#FF6B6B] font-bold text-2xl mb-4">Time's Up!</p>
            <button
              onClick={handleStart}
              className="py-3 px-6 bg-[#4A5568] text-white rounded-lg hover:bg-[#5A6577] 
                       transition-colors border-2 border-[#B8C0E0]"
            >
              Try Again
            </button>
          </div>
        )}

              {isCompleted && (
                  <div className="w-full text-center space-y-4">
                      <div className="animate-bounce">
                          <h3 className="text-2xl font-bold text-[#98FB98] pixel-font">
                              🎉 Level Complete! 🎉
                          </h3>
                      </div>
                      <MintTokenValidator
                          rarity="Common"
                          rating="A"
                          score={100}
                      />
                  </div>
              )}
      </div>
    </div>
  );
}; 