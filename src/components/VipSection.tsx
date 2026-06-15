import React, { useState } from 'react';
import { ShieldAlert, Check, HelpCircle, MessageCircle, Star, Sparkles, CreditCard, Laptop } from 'lucide-react';
import { VipPlan } from '../types';
import { synth } from '../utils/audio';

const VIP_PLANS: VipPlan[] = [
  {
    id: 'weekly',
    title: 'FORFAIT HEBDOMADAIRE',
    description: 'Parfait pour s\'initier et faire fructifier votre capital.',
    priceMGA: 25000,
    duration: '7 JOURS',
    features: [
      'Signaux Football Virtuels 100% sans délai',
      'Alertes de vagues montantes Aviator',
      'Accès au canal privé Telegram / WhatsApp',
      'Support client prioritaire 24h/7'
    ]
  },
  {
    id: 'monthly',
    title: 'ACCEÈS ILLIMITÉ PREMIUM',
    description: 'Le choix favori de notre communauté pour maximiser les gains.',
    priceMGA: 75000,
    duration: '30 JOURS',
    features: [
      'Tout le forfait Hebdomadaire inclus',
      'Signaux VIP exclusifs (Confiance > 95%)',
      'Calculateur de mises optimisé',
      'Taux de réussite moyen garanti à 89%',
      'Conseils en gestion de capital (Bankroll)'
    ],
    isPopular: true
  }
];

export default function VipSection() {
  const [whatsappNumber, setWhatsappNumber] = useState<string>('261385419914');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  
  const originalMessage = "Bonjour, je souhaite acheter l'accès VIP pour le logiciel de prédiction Bet261.";
  const encodedMsg = encodeURIComponent(originalMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

  const formatCurrency = (mga: number) => {
    return new Intl.NumberFormat('fr-FR').format(mga) + ' Ar';
  };

  const handleLinkClick = () => {
    synth.playSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Premium Hero Invitation Panel */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-black border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-44 h-44 text-indigo-400 rotate-12" />
        </div>

        <div className="relative z-10 max-w-xl">
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            ACCÈS VIP RECOMMANDÉ
          </span>

          <h2 className="text-xl sm:text-2xl font-display font-black text-white leading-tight">
            Débloquez les Signaux 100% Fiables &amp; Sans Délai
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            Les algorithmes de prédictions gratuites ont un délai de calcul de 5 secondes. L'abonnement VIP vous donne un accès direct, instantané, sans latence au flux temps réel synchronisé de <strong className="text-white font-bold">https://bet261.mg/sports</strong>.
          </p>
        </div>
      </div>

      {/* Target WhatsApp Config Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Laptop className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">CONFIGURATION DU NUMÉRO WHATSAPP DU VENDEUR</h3>
        </div>
        <p className="text-xs text-slate-400 leading-normal">
          Vous pouvez modifier ce champ pour tester directement le bouton avec votre propre numéro WhatsApp ! 
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">NUMÉRO DE DESTINATION (FORMAT AVEC CODE EX: 26138...)</label>
            <input 
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 261385419914"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">PREVISUALISATION DU MESSAGE PRÉ-REMPLI</label>
            <div className="w-full bg-slate-950 border border-slate-800/80 text-slate-500 rounded-lg p-2 text-xs select-none italic text-ellipsis overflow-hidden whitespace-nowrap">
              "{originalMessage}"
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {VIP_PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={`relative rounded-3xl p-5 sm:p-6 bg-slate-900 border flex flex-col justify-between transition-all duration-300 ${
              plan.isPopular 
                ? 'border-indigo-500 shadow-xl shadow-indigo-500/5 bg-slate-900/90' 
                : 'border-slate-800'
            }`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                🏆 LE PLUS CHOISI
              </span>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wide text-slate-200">{plan.title}</h3>
                <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-500/10">
                  {plan.duration}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2">{plan.description}</p>
              
              <div className="my-5 border-y border-slate-800/80 py-4">
                <span className="text-[10px] block text-slate-500 font-bold uppercase font-mono">TARIF VIP SPECIAL</span>
                <span className="text-3xl font-display font-black text-white tracking-tight">
                  {formatCurrency(plan.priceMGA)}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION DIRECT LINK WHATSAPP BUTTON (Requirement 4) */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 shadow-lg ${
                plan.isPopular 
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 focus:ring-indigo-500' 
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 hover:bg-slate-800 focus:ring-slate-700'
              }`}
            >
              <MessageCircle className="w-4.5 h-4.5 text-white animate-bounce" />
              Activer mon accès VIP sur WhatsApp
            </a>
          </div>
        ))}
      </div>

      {/* Vector Logos of Malagasy Payment platforms (Requirement 4: MVola, Orange Money & Airtel Money) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center">
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block mb-4">
          MOYENS DE PAIEMENT DISPONIBLES À MADAGASCAR
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* MVOLA LOGO CARD */}
          <div className="bg-[#FABD00] text-black p-3.5 rounded-xl flex flex-col items-center justify-center text-center font-bold shadow-md transition-shadow hover:shadow-lg border border-[#FABD00]">
            <span className="text-sm font-black tracking-tighter uppercase font-display select-none">MVOLA</span>
            <span className="text-[10px] text-black/75 tracking-normal uppercase font-mono leading-none mt-1">
              Par Telma Madagascar
            </span>
          </div>

          {/* ORANGE MONEY LOGO CARD */}
          <div className="bg-black border border-slate-800 p-3.5 rounded-xl flex flex-col items-center justify-center text-center font-bold shadow-md transition-shadow hover:shadow-lg relative overflow-hidden">
            <div className="absolute top-2 left-2 w-3.5 h-3.5 bg-[#FF6600]"></div>
            <span className="text-sm font-black tracking-tighter uppercase font-display text-white select-none">ORANGE MONEY</span>
            <span className="text-[10px] text-slate-400 tracking-normal uppercase font-mono leading-none mt-1">
              Réseau Orange Madagascar
            </span>
          </div>

          {/* AIRTEL MONEY LOGO CARD */}
          <div className="bg-[#E31937] text-white p-3.5 rounded-xl flex flex-col items-center justify-center text-center font-bold shadow-md transition-shadow hover:shadow-lg border border-[#E31937]">
            <span className="text-sm font-black tracking-tighter uppercase font-display select-none">airtel MONEY</span>
            <span className="text-[10px] text-white/80 tracking-normal uppercase font-mono leading-none mt-1">
              Réseau Airtel Madagascar
            </span>
          </div>
        </div>
        
        <p className="text-[10px] text-slate-500 font-mono mt-4 leading-relaxed">
          Paiements instantanés et sécurisés. Les coordonnées de transfert vous seront transmises directement sur WhatsApp par l'administrateur.
        </p>
      </div>

      {/* Malagasy Testimonials for high authenticity */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          RÉSULTATS DE NOS ABONNÉS VIP EN DIRECT
        </h3>

        <div className="space-y-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/40">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-slate-300">Rindra (Analamanga, Tana)</span>
              <span className="text-emerald-500 font-bold">+180,000 Ar</span>
            </div>
            <p className="text-[11px] text-slate-500">
              "Logiciel incroyable. J'ai configuré l'auto-cashout à 1.90x comme conseillé sur l'onglet Aviator de Bet261 et ça passe à coup sûr ! Accès rentabilisé le premier jour."
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/40">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-slate-300">Hariniaina (Tamatave)</span>
              <span className="text-emerald-500 font-bold">+450,000 Ar</span>
            </div>
            <p className="text-[11px] text-slate-500">
              "Sur le Football Virtuel, c'est génial. Les scores en direct et les cotes de plus de 1.5 buts se valident à 91% d'après mon cahier de gains. Je recommande le forfait premium à 100%."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
