import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, Activity, ShieldAlert } from 'lucide-react';
import { synth } from '../utils/audio';

export default function LiveAnalysisTerminal() {
  const [logs, setLogs] = useState<string[]>([]);
  const [throughput, setThroughput] = useState<number>(142);
  const [ping, setPing] = useState<number>(45);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const logsPool = [
    "Connexion active au flux https://bet261.mg/sports...",
    "Réception du flux JSON compressé (Virtual Football & Aviator)",
    "Extraction des données de côtes du prochain match...",
    "Calcul de l'écart type des multiplicateurs sur 100 tours d'Aviator...",
    "Mise à jour de la base de données locale des vagues de gains...",
    "Optimisation du modèle Bayesien [Football Virtuel]...",
    "Vérification de l'intégrité de la session Bet261...",
    "Synchronisation des signaux avec le serveur d'intelligence artificielle...",
    "Détection d'un pic de gains progressif (coefficient de dispersion : 0.82)...",
    "Côtes validées : Victoire Domicile stable à 1.82 [Ligue Virtuelle].",
    "Téléchargement du carnet d'ordres complet en 1.5ms...",
    "Analyse de la tendance : Séquence stable d'un coef > 2.0x sur Aviator."
  ];

  useEffect(() => {
    // Initial logs
    setLogs([
      "STABLE // CHARGEMENT DE L'ANALYSEUR BET261...",
      "Tentative de connexion à https://bet261.mg/sports...",
      "Nœud de streaming établi sur SSL port 443.",
      "Analyseur temps réel opérationnel [OK]."
    ]);

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * logsPool.length);
      const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
      const newLog = `[${time}] ${logsPool[idx]}`;
      
      setLogs((prev) => {
        const next = [...prev, newLog];
        if (next.length > 40) {
          next.shift();
        }
        return next;
      });

      // Fluctuate ping and throughput
      setPing(Math.floor(Math.random() * 20) + 35);
      setThroughput(Math.floor(Math.random() * 80) + 110);
      
      // Occasionally play a soft ping sound for active scan feedback
      if (Math.random() > 0.8) {
        synth.playPing();
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-400 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="font-bold tracking-wider text-slate-300">ANALYSEUR BET261 LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
            <span>FLUX: {throughput} kb/s</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>LAG: {ping}ms</span>
          </div>
        </div>
      </div>

      <div className="h-28 overflow-y-auto space-y-1 bg-black/40 p-2 rounded border border-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
        {logs.map((log, index) => {
          let color = "text-slate-400";
          if (log.includes("[OK]") || log.includes("opérationnel")) color = "text-emerald-400 font-semibold";
          if (log.includes("flux https:") || log.includes("Bet261")) color = "text-sky-400";
          if (log.includes("Pic de gains") || log.includes("Détection")) color = "text-amber-400 font-semibold";
          
          return (
            <div key={index} className={`leading-relaxed ${color}`}>
              {log}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
          Scanner d'algorithme synchronisé à 261mg
        </span>
        <span className="text-emerald-500/70 select-none">ID: SYN_V3.8</span>
      </div>
    </div>
  );
}
