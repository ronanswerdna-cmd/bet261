import React, { useState, useEffect } from 'react';
import { MatchPrediction } from '../types';
import { Clock, Trophy, TrendingUp, AlertTriangle, CheckCircle2, Play, Users, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audio';

// Database of Malagasy favorite football teams and general power houses for Bet261 MG vibes
const TEAMS = [
  { name: "Paris SG", flag: "🇫🇷" },
  { name: "Marseille", flag: "🇫🇷" },
  { name: "Barea Mada", flag: "🇲🇬" },
  { name: "Man City", flag: "🇬🇧" },
  { name: "Arsenal", flag: "🇬🇧" },
  { name: "Real Madrid", flag: "🇪🇸" },
  { name: "FC Barcelone", flag: "🇪🇸" },
  { name: "Bayern Munich", flag: "🇩🇪" },
  { name: "Liverpool", flag: "🇬🇧" },
  { name: "Chelsea", flag: "🇬🇧" },
  { name: "Juventus", flag: "🇮🇹" },
  { name: "AC Milan", flag: "🇮🇹" }
];

const PREDICTIONS_TEMPLATE = [
  { text: "Plus de 1.5 buts", minOdds: 1.30, maxOdds: 1.60 },
  { text: "Les deux équipes marquent", minOdds: 1.62, maxOdds: 1.95 },
  { text: "Victoire Équipe Domicile (1)", minOdds: 1.75, maxOdds: 2.30 },
  { text: "Plus de 2.5 buts", minOdds: 1.80, maxOdds: 2.20 },
  { text: "Double Chance (1X)", minOdds: 1.25, maxOdds: 1.48 }
];

export default function FootballPredictor() {
  const [timeLeft, setTimeLeft] = useState<number>(120); // 120s master timer (2 min)
  const [matches, setMatches] = useState<MatchPrediction[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchPrediction | null>(null);
  const [goalAlert, setGoalAlert] = useState<{ team: string; matchId: string } | null>(null);

  // Generate a set of 3 dynamic matches
  const generateNewRound = () => {
    const shuffledTeams = [...TEAMS].sort(() => 0.5 - Math.random());
    const leagues = ["Virtual Ligue 1", "Virtual Premier League", "Virtual La Liga"];
    const now = new Date();
    
    const newMatches: MatchPrediction[] = Array.from({ length: 3 }).map((_, i) => {
      const matchTime = new Date(now.getTime() + 120 * 1000)
        .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      const teamHomeObj = shuffledTeams[i * 2];
      const teamAwayObj = shuffledTeams[i * 2 + 1];
      
      const predTemplate = PREDICTIONS_TEMPLATE[Math.floor(Math.random() * PREDICTIONS_TEMPLATE.length)];
      const odds = parseFloat((Math.random() * (predTemplate.maxOdds - predTemplate.minOdds) + predTemplate.minOdds).toFixed(2));
      const confidence = Math.floor(Math.random() * 8) + 87; // high confidence (87% - 94%)

      return {
        id: `fb-match-${i}-${Date.now()}`,
        league: leagues[i],
        matchTime,
        teamHome: teamHomeObj.name,
        teamAway: teamAwayObj.name,
        teamHomeFlag: teamHomeObj.flag,
        teamAwayFlag: teamAwayObj.flag,
        prediction: predTemplate.text,
        odds,
        confidence,
        status: 'upcoming',
        score: '0-0',
        timeLabel: 'À venir'
      };
    });

    setMatches(newMatches);
    setSelectedMatch(newMatches[0]);
  };

  // On mount, generate the first round of matches
  useEffect(() => {
    generateNewRound();
  }, []);

  // Timer simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;
        
        if (nextTime <= 0) {
          // Reset cycle & generate new round!
          generateNewRound();
          return 120;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sync state & live score updates based on the timer value
  useEffect(() => {
    if (matches.length === 0) return;

    // States division:
    // 120s down to 90s (30s): "upcoming"
    // 90s down to 10s (80s): "live"
    // 10s down to 0s (10s): "finished"
    const currentStatus = 
      timeLeft > 90 ? 'upcoming' :
      timeLeft > 10 ? 'live' : 'finished';

    const updatedMatches = matches.map((match) => {
      let score = match.score || '0-0';
      let timeLabel = match.timeLabel;

      if (currentStatus === 'upcoming') {
        score = '0-0';
        timeLabel = 'Kick-off';
      } else if (currentStatus === 'live') {
        // Map 90s..10s left to 0'..90' match minutes
        const elapsedPercent = (90 - timeLeft) / 80;
        const matchMinute = Math.min(Math.floor(elapsedPercent * 90), 90);
        timeLabel = `${matchMinute}'`;

        // Randomized score additions based on match id so we get consistent scores back
        // We simulate goals at specific clock moments
        const goalMoments = [70, 50, 35, 20];
        const [homeS, awayS] = score.split('-').map(Number);
        
        goalMoments.forEach((moment) => {
          // If master time is exactly at this moment, trigger score progression
          if (timeLeft === moment) {
            const isHomeGoal = Math.random() > 0.45;
            const newHome = isHomeGoal ? homeS + 1 : homeS;
            const newAway = !isHomeGoal ? awayS + 1 : awayS;
            score = `${newHome}-${newAway}`;
            
            // Set Goal Alert Notification popup
            const scoringTeam = isHomeGoal ? match.teamHome : match.teamAway;
            setGoalAlert({ team: scoringTeam, matchId: match.id });
            synth.playGoal();
            setTimeout(() => setGoalAlert(null), 3500);
          }
        });
      } else if (currentStatus === 'finished') {
        timeLabel = 'FT';
        // Make sure the scores looks like a complete match if they're still 0-0 so it's interesting
        if (score === '0-0' && timeLeft <= 10) {
          // Ensure a realistic final score matching the prediction most of the time
          if (match.prediction.includes("Plus de 1.5 buts") || match.prediction.includes("Les deux équipes marquent")) {
            score = '2-1';
          } else if (match.prediction.includes("Victoire")) {
            score = '2-0';
          } else {
            score = '1-0';
          }
        }
      }

      return {
        ...match,
        status: currentStatus,
        score,
        timeLabel
      };
    });

    // Check if score changed before updating so we don't trigger unnecessary re-renders
    const hasChanged = JSON.stringify(matches) !== JSON.stringify(updatedMatches);
    if (hasChanged) {
      setMatches(updatedMatches);
      // Sync selected match visual data details
      if (selectedMatch) {
        const currentSelected = updatedMatches.find(m => m.id === selectedMatch.id);
        if (currentSelected) {
          setSelectedMatch(currentSelected);
        }
      }
    }
  }, [timeLeft, matches.length]);

  // Evaluate if the local prediction won for visual validation tag
  const isPredictionWinning = (match: MatchPrediction): boolean => {
    if (match.status !== 'finished') return false;
    const [h, a] = match.score ? match.score.split('-').map(Number) : [0, 0];
    const totalGoals = h + a;

    if (match.prediction.includes("Plus de 1.5 buts") && totalGoals >= 2) return true;
    if (match.prediction.includes("Plus de 2.5 buts") && totalGoals >= 3) return true;
    if (match.prediction.includes("Les deux équipes marquent") && h > 0 && a > 0) return true;
    if (match.prediction.includes("Victoire Équipe Domicile") && h > a) return true;
    if (match.prediction.includes("Double Chance") && h >= a) return true;

    // Default high success rate, simulate yes
    return Math.random() < 0.89; 
  };

  return (
    <div className="space-y-4">
      {/* Master Countdown Board */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-400">SESSION DE JEU VIRTUEL</h2>
              <p className="text-xs text-slate-500">Cycle de calcul de 2 min d'intervalle</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/40 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">ÉTATE DU CYCLE</span>
              <span className={`text-xs font-bold ${
                timeLeft > 90 ? 'text-amber-400' :
                timeLeft > 10 ? 'text-emerald-400 animate-pulse' : 'text-rose-400'
              }`}>
                {timeLeft > 90 ? 'ANALYSE EN COURS' :
                 timeLeft > 10 ? 'SCORE LIVE DIRECT' : 'CLÔTURE DU SIGNAL'}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800"></div>
            <div className="text-center font-mono text-2xl font-black text-white glow-text-green w-16">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Dynamic status progress bar */}
        <div className="mt-4">
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: timeLeft > 90 ? `${((timeLeft - 90) / 30) * 100}%` : '0%' }}
            />
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000"
              style={{ width: timeLeft <= 90 && timeLeft > 10 ? `${((timeLeft - 10) / 80) * 100}%` : timeLeft <= 10 ? '0%' : '100%' }}
            />
            <div 
              className="h-full bg-rose-500 transition-all duration-1000"
              style={{ width: timeLeft <= 10 ? `${(timeLeft / 10) * 100}%` : '100%' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>En attente (30s)</span>
            <span>Live Action (80s)</span>
            <span>Résultats (10s)</span>
          </div>
        </div>
      </div>

      {/* Goal Alert Toast Overlay */}
      <AnimatePresence>
        {goalAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="fixed top-20 left-4 right-4 z-50 bg-emerald-600 border border-emerald-400 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-bounce">⚽</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-150">BUT VIRTUEL!</span>
                <p className="text-sm font-black text-white">{goalAlert.team} marque !</p>
              </div>
            </div>
            <span className="backdrop-blur bg-white/10 text-white font-mono text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              LIVE SCORE
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Selection Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              MATCHES EN COURS (BET261)
            </h3>
            <span className="text-[10px] text-slate-500">Auto-rafraîchissement actif</span>
          </div>

          <div className="space-y-3">
            {matches.map((match) => {
              const isSelected = selectedMatch?.id === match.id;
              const hasWon = isPredictionWinning(match);

              return (
                <div 
                  key={match.id}
                  onClick={() => {
                    setSelectedMatch(match);
                    synth.playPing();
                  }}
                  className={`relative p-4 rounded-2xl bg-slate-900 border transition-all duration-300 cursor-pointer ${
                    isSelected ? 'border-emerald-500 bg-slate-900 shadow-emerald-900/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                      {match.league}
                    </span>
                    <div className="flex items-center gap-2">
                      {match.status === 'live' && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          LIVE: {match.timeLabel}
                        </span>
                      )}
                      {match.status === 'upcoming' && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                          ANALYSE: {timeLeft > 90 ? `${timeLeft - 90}s` : 'Prêt'}
                        </span>
                      )}
                      {match.status === 'finished' && (
                        <span className="text-[10px] text-rose-400 bg-rose-950/40 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                          TERMINE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Core Match Row Design */}
                  <div className="flex items-center justify-between gap-2 py-2">
                    <div className="flex flex-col items-center flex-1 text-center">
                      <span className="text-2xl mb-1">{match.teamHomeFlag}</span>
                      <span className="text-xs font-bold text-slate-300 truncate w-24">{match.teamHome}</span>
                    </div>

                    <div className="bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-800 flex items-center justify-center font-mono font-black text-lg min-w-[70px] text-white">
                      {match.status === 'upcoming' ? (
                        <span className="text-xs text-slate-600 font-sans tracking-tight">VIRTUAL</span>
                      ) : (
                        <span className="text-emerald-400">{match.score}</span>
                      )}
                    </div>

                    <div className="flex flex-col items-center flex-1 text-center">
                      <span className="text-2xl mb-1">{match.teamAwayFlag}</span>
                      <span className="text-xs font-bold text-slate-300 truncate w-24">{match.teamAway}</span>
                    </div>
                  </div>

                  {/* Prediction Widget inside Card */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] block text-slate-500 uppercase tracking-widest">PRONOSTIC</span>
                      <span className="text-xs font-semibold text-white">{match.prediction}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-500">CÔTE</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/10">
                          {match.odds.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-500">CONFIANCE</span>
                        <span className="text-xs font-mono font-black text-amber-500">{match.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator Bar */}
                  {match.status === 'finished' && (
                    <div className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400">RÉSULTAT SÉJOURNÉ</span>
                        <p className="text-xs font-black text-emerald-400">PRÉDICTION VALIDÉE ✅ ({match.score})</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Match Analytics Column */}
        {selectedMatch && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-500" />
              STATISTIQUES DE {selectedMatch.teamHome.toUpperCase()}
            </h3>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 space-y-3">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{selectedMatch.teamHome}</span>
                <span className="text-emerald-500">Possession</span>
                <span>{selectedMatch.teamAway}</span>
              </div>
              
              {/* Fake animated sliders */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Possession</span>
                    <span>{selectedMatch.status === 'upcoming' ? '50% - 50%' : '54% - 46%'}</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: selectedMatch.status === 'upcoming' ? '50%' : '54%' }}></div>
                    <div className="h-full bg-slate-700" style={{ width: selectedMatch.status === 'upcoming' ? '50%' : '46%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Tirs Cadrés</span>
                    <span>{selectedMatch.status === 'upcoming' ? '0 - 0' : selectedMatch.status === 'live' ? '4 - 2' : '7 - 4'}</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden flex">
                    <div className="h-full bg-amber-500" style={{ width: selectedMatch.status === 'upcoming' ? '0%' : '60%' }}></div>
                    <div className="h-full bg-slate-700" style={{ width: selectedMatch.status === 'upcoming' ? '0%' : '40%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Attaques Dangereuses</span>
                    <span>{selectedMatch.status === 'upcoming' ? '0 - 0' : selectedMatch.status === 'live' ? '28 - 22' : '48 - 41'}</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden flex">
                    <div className="h-full bg-rose-500" style={{ width: selectedMatch.status === 'upcoming' ? '0%' : '53%' }}></div>
                    <div className="h-full bg-slate-700" style={{ width: selectedMatch.status === 'upcoming' ? '0%' : '47%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live Probability Multiplier Chart */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">HISTORIQUE PROBABILISTE DU MARCHÉ</span>
              <div className="flex items-end justify-center gap-1.5 h-14 pt-2">
                <div className="w-4 bg-emerald-500/40 rounded-t h-1/2"></div>
                <div className="w-4 bg-emerald-500/60 rounded-t h-2/3"></div>
                <div className="w-4 bg-emerald-500/50 rounded-t h-3/5"></div>
                <div className="w-4 bg-emerald-500/80 rounded-t h-[80%] animate-pulse"></div>
                <div className="w-4 bg-emerald-400 rounded-t h-[95%] shadow-glow"></div>
              </div>
              <p className="text-[11px] text-slate-400">
                La variance de l'indice est en hausse. Idéal pour investir sur 
                <strong className="text-emerald-400 font-bold"> {selectedMatch.prediction}</strong> (Cote {selectedMatch.odds.toFixed(2)}).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
