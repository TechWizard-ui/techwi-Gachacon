import React, { useState } from 'react';
import { useLucid } from '../context/LucidProvider';
import { MintTokenValidator } from './MintTokenValidator';

// Types & Interfaces
type GachaRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

interface GachaGameProps {
  pullCost: number;
  onPullComplete: () => void;
  treasuryAddress?: string;
}

interface GachaResult {
  rarity: GachaRarity;
  rating: string;
  score: number;
  animation: string;
}

interface RarityConfig {
  chance: number;
  animation: string;
  color: string;
  bgGlow: string;
}

// Constants
const RARITY_CONFIGS: Record<GachaRarity, RarityConfig> = {
  Legendary: {
    chance: 1,
    animation: '🌟',
    color: 'text-yellow-400',
    bgGlow: 'shadow-[0_0_30px_rgba(255,215,0,0.5)]'
  },
  Epic: {
    chance: 9,
    animation: '💫',
    color: 'text-purple-400',
    bgGlow: 'shadow-[0_0_25px_rgba(147,112,219,0.5)]'
  },
  Rare: {
    chance: 20,
    animation: '✨',
    color: 'text-blue-400',
    bgGlow: 'shadow-[0_0_20px_rgba(65,105,225,0.5)]'
  },
  Common: {
    chance: 70,
    animation: '⭐',
    color: 'text-gray-400',
    bgGlow: 'shadow-[0_0_15px_rgba(169,169,169,0.5)]'
  }
};

const PULL_ANIMATIONS = ["🎲", "✨🎲✨", "⭐🎲⭐"];
const ANIMATION_MESSAGES = [
  "Rolling the dice...",
  "Channeling fortune...",
  "Revealing destiny..."
];

const LEVER_STATES = {
  IDLE: 'idle',
  PULLING: 'pulling',
  RELEASED: 'released'
};

export const GachaGame: React.FC<GachaGameProps> = ({
  pullCost,
  onPullComplete,
  treasuryAddress
}) => {
  // State
  const { lucid, address } = useLucid();
  const [isPulling, setIsPulling] = useState(false);
  const [pullResult, setPullResult] = useState<GachaResult | null>(null);
  const [animationPhase, setAnimationPhase] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [leverState, setLeverState] = useState(LEVER_STATES.IDLE);

  // Helper Functions
  const calculatePullResult = (): GachaResult => {
    const rand = Math.random() * 100;
    let currentProb = 0;

    for (const [rarity, config] of Object.entries(RARITY_CONFIGS)) {
      currentProb += config.chance;
      if (rand <= currentProb) {
        const rarityKey = rarity as GachaRarity;
        return {
          rarity: rarityKey,
          rating: getRatingForRarity(rarityKey),
          score: getScoreForRarity(rarityKey),
          animation: config.animation
        };
      }
    }

    return getDefaultResult();
  };

  const getRatingForRarity = (rarity: GachaRarity): string => {
    const ratings: Record<GachaRarity, string> = {
      Legendary: 'S',
      Epic: 'A',
      Rare: 'B',
      Common: 'C'
    };
    return ratings[rarity];
  };

  const getScoreForRarity = (rarity: GachaRarity): number => {
    const scoreRanges: Record<GachaRarity, [number, number]> = {
      Legendary: [95, 100],
      Epic: [80, 95],
      Rare: [60, 80],
      Common: [40, 60]
    };
    const [min, max] = scoreRanges[rarity];
    return min + Math.floor(Math.random() * (max - min));
  };

  const getDefaultResult = (): GachaResult => ({
    rarity: 'Common',
    rating: 'C',
    score: getScoreForRarity('Common'),
    animation: RARITY_CONFIGS.Common.animation
  });

  // Transaction Handlers
  const handlePull = async () => {
    if (!canPull()) return;

    try {
      setIsPulling(true);
      await processTransaction();
      await playAnimation();
      finalizePull();
    } catch (err) {
      handleError(err);
    } finally {
      setIsPulling(false);
    }
  };

  const canPull = (): boolean => {
    if (!lucid || !address) {
      setError("Please connect your wallet first!");
      return false;
    }
    return true;
  };

  const processTransaction = async () => {
    const utxos = await lucid?.wallet.getUtxos();
    const balance = utxos?.reduce((acc, utxo) => acc + BigInt(utxo.assets.lovelace), BigInt(0));
    const requiredLovelace = BigInt(pullCost * 1_000_000);

    if (balance || 0n < requiredLovelace) {
      throw new Error(`Insufficient balance. You need ${pullCost} ADA to pull!`);
    }

    const tx = await lucid?.newTx()
      .payToAddress(treasuryAddress || '', { lovelace: requiredLovelace })
      .complete();

    const signedTx = await tx?.sign().complete();
    const txHash = await signedTx?.submit();
    await lucid?.awaitTx(txHash || '');
  };

  const playAnimation = async () => {
    for (let phase = 1; phase <= 3; phase++) {
      setAnimationPhase(phase);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const finalizePull = () => {
    const result = calculatePullResult();
    setPullResult(result);
    onPullComplete();
  };

  const handleError = (err: any) => {
    setError("Failed to process gacha pull");
    console.error(err);
  };

  const playPullSound = () => {
    const audio = new Audio('/sounds/lever-pull.mp3');
    audio.play();
  };

  const handleLeverPull = async () => {
    if (!canPull()) return;
    
    playPullSound();
    setLeverState(LEVER_STATES.PULLING);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setLeverState(LEVER_STATES.RELEASED);
    
    await handlePull();
    
    setTimeout(() => setLeverState(LEVER_STATES.IDLE), 1000);
  };

  // Render Functions
  const renderPullAnimation = () => {
    if (!isPulling) return null;

    return (
      <div className="flex flex-col items-center justify-center h-48">
        <div className="relative w-32 h-32 bg-gradient-to-b from-[#FFD700] to-[#FFA500] rounded-full border-4 border-[#B8860B] shadow-[0_0_30px_rgba(255,215,0,0.3)] animate-spin flex items-center justify-center">
          <span className="text-5xl">{PULL_ANIMATIONS[animationPhase - 1]}</span>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 rounded-full" />
        </div>
        <p className="mt-6 text-[#FFD700] pixel-font text-xl">
          {ANIMATION_MESSAGES[animationPhase - 1]}
        </p>
      </div>
    );
  };

  const renderPullResult = () => {
    if (!pullResult) return null;

    const config = RARITY_CONFIGS[pullResult.rarity];
    return (
      <div className="w-full text-center space-y-6">
        <div className={`animate-bounce ${config.color}`}>
          <div className={`
            p-8 rounded-xl ${config.bgGlow} 
            bg-gradient-to-b from-[#2A1810] to-[#1A0F0A] 
            border-4 border-[#B8860B]
            transform transition-all duration-500
            hover:scale-105
            relative
          `}>
            <div className="absolute inset-0 bg-gradient-conic from-yellow-400/0 via-yellow-400/30 to-yellow-400/0 animate-spin" />
            
            <span className="text-6xl mb-4 block relative animate-float">
              {pullResult.animation}
            </span>
            <h3 className="text-3xl font-bold pixel-font relative z-10">
              {pullResult.rarity} NFT!
            </h3>
          </div>
        </div>
        <MintTokenValidator
          rarity={pullResult.rarity}
          rating={pullResult.rating}
          score={pullResult.score}
        />
      </div>
    );
  };



  return (
    <div className="p-8 bg-gradient-to-b from-[#2A1810] to-[#1A0F0A] rounded-2xl shadow-[0_0_40px_rgba(255,215,0,0.15)] border-4 border-[#B8860B] transform transition-all duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] pixel-font">
          NFT Gacha Machine
        </h2>
        <div className="text-lg font-semibold text-[#FFD700] bg-[#2A1810] p-3 rounded-lg border-2 border-[#B8860B] shadow-inner">
          Cost: {pullCost} ADA
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-lg text-red-500 pixel-font">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {!isPulling && !pullResult && (
          <div className="relative w-64 h-96">
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400/20 to-transparent animate-pulse" />
            
            <div className="absolute w-full h-full bg-gradient-to-b from-[#FFD700] to-[#FFA500] rounded-2xl border-4 border-[#B8860B] overflow-hidden
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-shine">
              <div className="h-1/3 bg-gradient-to-b from-[#2A1810] to-[#1A0F0A] border-b-4 border-[#B8860B] relative">
                <div 
                  className={`absolute right-6 top-4 w-12 h-32 cursor-pointer transform origin-top transition-all duration-300
                    ${leverState === LEVER_STATES.PULLING ? 'rotate-45' : ''}
                    ${leverState === LEVER_STATES.RELEASED ? '-rotate-12' : ''}
                    ${!address ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    hover:filter hover:brightness-110
                  `}
                  onClick={() => address && handleLeverPull()}
                >
                  <div className="absolute inset-0 blur-md bg-yellow-400/30" />
                  
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-4 border-[#B8860B]
                    shadow-lg shadow-red-500/50" />
                  <div className="w-4 h-28 bg-gradient-to-b from-[#FFD700] to-[#FFA500] mx-auto rounded-b-lg 
                    border-x-4 border-b-4 border-[#B8860B] shadow-xl" />
                </div>
              </div>
              
              <div className="h-2/3 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-[#2A1810] border-4 border-[#B8860B] flex items-center justify-center">
                  {isPulling ? (
                    <div className="animate-spin text-4xl">
                      {PULL_ANIMATIONS[animationPhase - 1]}
                    </div>
                  ) : (
                    <span className="text-4xl">🎁</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {renderPullAnimation()}
        {renderPullResult()}
      </div>
    </div>
  );
}; 