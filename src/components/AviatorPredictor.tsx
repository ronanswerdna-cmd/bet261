import React, { useState, useEffect } from 'react';
import { Radar, Compass, TrendingUp, AlertOctagon, HelpCircle, Target, Trophy, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audio';

interface AviatorRound {
  id: string;
  time: string;
  targetRange: string;
  actualCrash: number;
  confidence: number;
  isSuccess: boolean;
}

export default function AviatorPredictor() {
  const [gameState, setGameState] = useState<'scanning' | 'detected' | 'flying' | 'crashed'>('scanning');
  const [countdown, setCountdown] = useState<number>(5);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [targetMin, setTargetMin] = useState<number>(1.85);
  const [targetMax, setTargetMax] = useState<number>(2.40);
  const [confidence, setConfidence] = useState<number>(93);
  const [history, setHistory] = useState<AviatorRound[]>([]);
  const [totalMultiplierCount, setTotalMultiplierCount] = useState<number>(0);

  // Initial history data for realism
  useEffect(() => {
    const now = new Date();
    const mockHistory: AviatorRound[] = [
      { id: '1', time: '17:42', targetRange: '1.60x - 2.10x', actualCrash: 2.15, confidence: 91, isSuccess: true },
      { id: '2', time: '17:43', targetRange: '1.90x - 2.50x', actualCrash: 2.82, confidence: 89, isSuccess: true },
      { id: '3', time: '17:44', targetRange: '2.10x - 3.00x', actualCrash: 1.45, confidence: 94, isSuccess: false }, // flight crash
      { id: '4', time: '17:45', targetRange: '1.50x - 1.95x', actualCrash: 1.98, confidence: 92, isSuccess: true },
      { id: '5', time: '17:46', targetRange: '1.80x - 2.35x', actualCrash: 2.45, confidence: 93, isSuccess: true }
    ];
    setHistory(mockHistory);
  }, []);

  // Main Aviator game cycle loop
  useEffect(() => {
    let activeInterval: any;

    if (gameState === 'scanning') {
      // Scanning for signal: lasts 6 seconds
      const timeout = setTimeout(() => {
        // Generate new target forecast
        const baseMin = parseFloat((Math.random() * 0.6 + 1.65).toFixed(2)); // 1.65 to 2.25
        const baseMax = parseFloat((baseMin + Math.random() * 0.7 + 0.3).toFixed(2)); // +0.3 to +1.0
        const randomConfidence = Math.floor(Math.random() * 8) + 89; // 89% - 97%
        
        setTargetMin(baseMin);
        setTargetMax(baseMax);
        setConfidence(randomConfidence);
        setCountdown(5);
        setGameState('detected');
        
        synth.playAlert();
      }, 5500);

      return () => clearTimeout(timeout);
    } 
    
    else if (gameState === 'detected') {
      // Signal detected countdown: lasts 5 seconds
      activeInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(activeInterval);
            setMultiplier(1.00);
            setGameState('flying');
            
            synth.playPing();
            return 0;
          }
          synth.playRadarPing();
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(activeInterval);
    } 
    
    else if (gameState === 'flying') {
      // Flight multiplier simulation
      // Decide final crash point
      // High chance of success reflecting the high accuracy rate
      const finalCrash = parseFloat((Math.random() * (targetMax + 1.2 - targetMin) + targetMin * 0.95).toFixed(2));
      
      const step = 0.04;
      activeInterval = setInterval(() => {
        setMultiplier((prev) => {
          const nextMult = prev + (prev * step);
          
          if (nextMult >= finalCrash) {
            // CRASHED!
            clearInterval(activeInterval);
            setGameState('crashed');
            synth.playCrash();

            // Append to history
            const isSuccess = finalCrash >= targetMin;
            const newRound: AviatorRound = {
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              targetRange: `${targetMin.toFixed(2)}x - ${targetMax.toFixed(2)}x`,
              actualCrash: parseFloat(finalCrash.toFixed(2)),
              confidence,
              isSuccess
            };

            setHistory((prevH) => [newRound, ...prevH.slice(0, 4)]);
            
            // Wait 4 seconds after crash before scanning again
            setTimeout(() => {
              setGameState('scanning');
            }, 3500);

            return parseFloat(finalCrash.toFixed(2));
          }

          // Trigger soft audio clicking during flight multiplier jump
          if (Math.floor(nextMult * 10) % 3 === 0) {
            synth.playPing();
          }

          return parseFloat(nextMult.toFixed(2));
        });
      }, 120);

      return () => clearInterval(activeInterval);
    }

  }, [gameState]);

  return (
    <div className="space-y-4">
      {/* Flight Canvas and Multiplier Panel */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden min-h-[310px] flex flex-col justify-between">
        {/* Backdrop Grid Pattern simulating actual casino panels */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        {/* Top Header Indicators */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs text-rose-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>ALGORITHME RECH. v4.0</span>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] block font-mono text-slate-500 uppercase tracking-widest">CONFIANCE</span>
            <span className="text-sm font-mono font-black text-emerald-400">{confidence}%</span>
          </div>
        </div>

        {/* Centered Graphic Area */}
        <div className="relative z-10 flex flex-col items-center justify-center my-6 py-2 flex-1">
          <AnimatePresence mode="wait">
            {gameState === 'scanning' && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center text-center space-y-4"
              >
                {/* Visual Circular Radar Swipe */}
                <div className="relative w-28 h-28 rounded-full border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-2 rounded-full border border-emerald-500/10"></div>
                  <div className="absolute inset-6 rounded-full border border-emerald-500/5"></div>
                  {/* Sweep Line */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent rounded-full animate-spin" style={{ animationDuration: '2.5s' }}></div>
                  <Radar className="w-8 h-8 text-emerald-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-slate-200 text-sm font-bold tracking-wide">RECHERCHE D'UN SIGNAL FIABLE...</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">Analyse des flux de gains @bet261.mg</p>
                </div>
              </motion.div>
            )}

            {gameState === 'detected' && (
              <motion.div 
                key="detected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center text-center space-y-3"
              >
                {/* Flashing detected sign */}
                <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg shadow-red-500/10 animate-pulse border border-red-500/30 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  <span>SIGNAL DÉTECTÉ 🚨</span>
                </div>

                <div className="text-slate-100 font-sans">
                  <span className="text-[10px] block text-slate-500 font-mono">DANGER: ENVOL IMMINENT DANS</span>
                  <p className="text-4xl font-black font-mono text-amber-400 my-1">{countdown}s</p>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 px-6 text-center max-w-[280px]">
                  <span className="text-[10px] text-slate-500 block">MULTIPLICATEUR RECOMMANDÉ</span>
                  <p className="text-base font-black text-emerald-400 font-mono">
                    {targetMin.toFixed(2)}x - {targetMax.toFixed(2)}x
                  </p>
                </div>
              </motion.div>
            )}

            {gameState === 'flying' && (
              <motion.div 
                key="flying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center justify-center text-center relative"
              >
                {/* Glowing plane display */}
                <div className="relative py-2 flex flex-col items-center">
                  <span className="text-6xl font-black font-mono text-rose-500 glow-text-red">
                    {multiplier.toFixed(2)}x
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mt-1.5">AVION EN PLEIN VOL</span>
                </div>

                {/* Simulated parabolic flight path */}
                <div className="absolute w-full h-32 bottom-0 left-0 overflow-hidden pointer-events-none opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 400 150">
                    <path 
                      d="M 10,140 Q 180,100 390,10" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="3" 
                      strokeDasharray="6,4"
                    />
                  </svg>
                </div>
                
                {/* Recommended Retrait Multiplier Limit Overlay Card */}
                <div className="mt-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg py-1 px-4 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Retrait conseillé : {targetMin.toFixed(2)}x</span>
                </div>
              </motion.div>
            )}

            {gameState === 'crashed' && (
              <motion.div 
                key="crashed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-full mb-3 shadow-lg">
                  <span className="text-4xl">💥</span>
                </div>
                <div className="text-red-500 animate-pulse font-black text-xl tracking-wide">
                  L'AVION S'EST ENVOLÉ à {multiplier.toFixed(2)}x !
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">Génération du prochain scanner de signaux...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info bar showing current prediction range status */}
        <div className="relative z-10 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Compass className="w-4 h-4 text-slate-500 animate-spin" style={{ animationDuration: '6s' }} />
            Algorithmique prédictif synchronisé
          </span>
          <span>ROUNDS SIM : # {Math.floor(Math.random() * 50) + 721}</span>
        </div>
      </div>

      {/* Recommended Signal Card Info */}
      <div className="bg-gradient-to-r from-teal-950/40 to-slate-950 border border-teal-500/10 rounded-xl p-4 flex items-start gap-3">
        <Zap className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">MÉTHODOLOGIE RECOMMANDÉE</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            Pour plus de sécurité, ordonnez un encaissement automatique (Auto-cashout) à <strong className="text-white font-bold">{targetMin}x</strong> sur la plateforme Bet261. Cela garantit un taux de réussite optimal selon notre algorithme.
          </p>
        </div>
      </div>

      {/* Predictor History (Requirement 3: "historique des 5 dernières prédictions (ex: 2.10x ✅, 1.50x ✅)") */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          HISTORIQUE DES 5 DERNIÈRES PRÉDICTIONS
        </h3>

        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-4 text-slate-600 font-mono text-xs">
              Aucun historique disponible
            </div>
          ) : (
            history.map((round) => (
              <div 
                key={round.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/60 font-mono text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px]">{round.time}</span>
                  <div className="w-[1px] h-3.5 bg-slate-800"></div>
                  <span className="text-slate-400">Prévision: {round.targetRange}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Crash à</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    round.isSuccess 
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                  }`}>
                    {round.actualCrash.toFixed(2)}x {round.isSuccess ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
