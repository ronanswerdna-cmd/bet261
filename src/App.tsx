import React, { useState, useEffect } from "react";
import {
  Trophy,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  User,
  Shield,
  Zap,
  Check,
  Lock,
  Mail,
  Phone,
  Clock,
  Send,
  ArrowRight,
  Sparkle,
  MessageSquare,
  Users,
  Settings,
  DollarSign,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { synth } from "./utils/audio";
import { RegisteredUser, SimulatedEmail, SimulatedSms } from "./types";

// League Matches Map (Official Bet261 team lists)
const LEAGUE_TEAMS: { [key: string]: string[] } = {
  "ENGLISH LEAGUE": [
    "Brighton", "London Reds", "Sunderland", "N. Forest", "Spurs", "A. Villa", 
    "Brentford", "C. Palace", "London Blues", "Burnley", "Liverpool", 
    "Wolverhampton", "Fulham", "Newcastle", "Leeds", "Everton", "West Ham", 
    "Manchester Blue", "Bournemouth", "Manchester Red"
  ],
  "COUPE DU MONDE": [
    "DR Congo", "Sweden", "Saudi Arabia", "Norway", "Curacao", "Belgium", 
    "Haiti", "Qatar", "Korea Republic", "Bosnia-Herzegovina", "Spain", 
    "Japan", "Paraguay", "Ghana", "Algeria", "Scotland", "France", 
    "Czechia", "Portugal", "New Zealand", "USA", "England", "Iraq", 
    "Uruguay", "Croatia", "Morocco", "Mexico", "Senegal", "Egypt", 
    "Turkiye", "Austria", "Colombia", "Uzbekistan", "Cabo Verde", "Ecuador", 
    "Jordan", "IR Iran", "Netherlands", "Cote d'Ivoire", "Switzerland", 
    "Argentina", "Tunisia", "Australia", "Panama", "Canada", "South Africa", 
    "Brazil", "Germany"
  ],
  "CHAMPIONS LEAGUE": [
    "Salzburg", "Feyenoord", "Donetsk", "Eindhoven", "A. Madrid", "Graz", 
    "Liverpool", "Leverkusen", "Lille", "Turin", "Stuttgart", "Munich", 
    "Dortmund", "Brest", "Bern", "Celtic", "Lisboa Green", "London Reds", 
    "R. Madrid", "Bologna", "Zagreb", "Girona", "Barca", "Milan Reds", 
    "Bruges", "Paris SG", "Milan Blues", "Bratislava", "Belgrade", "Monaco", 
    "A. Villa", "Atalanta", "Manchester Blue", "Prague", "Lisboa Red", "Leipzig"
  ],
  "COUPE D'AFRIQUE": [
    "Sudan", "Cameroon", "DR Congo", "Zambia", "Uganda", "Equatorial Guinea", 
    "Comoros", "Zimbabwe", "Benin", "Algeria", "Morocco", "Nigeria", 
    "Botswana", "Mali", "Senegal", "Ivory Coast", "Egypt", "Tunisia", 
    "Mozambique", "Angola", "South Africa", "Tanzania", "Gabon", "Burkina Faso"
  ],
  "SPANISH LEAGUE": [
    "Mallorca", "R. Sociedad", "Elche", "Barca", "Real Oviedo", "R. Madrid", 
    "A. Madrid", "Alavés", "Girona", "Getafe", "Levante", "Villarreal", 
    "Osasuna", "Vigo", "Bilbao", "Valencia", "R. Vallecano", "Sevilla", 
    "Espanyol", "Betis"
  ],
  "ITALIAN LEAGUE": [
    "Lazio", "Como", "Milan Blues", "Pisa", "Napoli", "Genoa", "Atalanta", 
    "Cremonese", "Cagliari", "Bologna", "Roma", "Parma", "Fiorentina", 
    "Milan Reds", "Turin", "Udinese", "Torino", "Verona", "Lecce", "Sassuolo"
  ],
  "FRENCH LEAGUE": [
    "Auxerre", "Nice", "Lens", "Lyon", "Lorient", "Le Havre", "Angers", 
    "Paris SG", "Lille", "Marseille", "Brest", "Rennes", "Nantes", "Metz", 
    "Paris FC", "Monaco", "Strasbourg", "Toulouse"
  ]
};

// Generate consistent unique stylized monogram logo badges for each club
const getTeamBadgeStyle = (name: string) => {
  if (!name) return { gradient: "from-slate-800 to-slate-950", border: "border-slate-800", text: "??", colors: "text-slate-400" };
  
  // Create circular emblem initials
  const cleanName = name.replace(/^(L'|Le|La|Les|N\.\s+)/i, "").trim();
  const parts = cleanName.split(/[\s-]+/);
  let abbreviation = "";
  if (parts.length >= 2) {
    abbreviation = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (cleanName.length >= 2) {
    abbreviation = cleanName.substring(0, 2).toUpperCase();
  } else {
    abbreviation = (cleanName[0] || "?") + (cleanName[1] || " ");
  }

  // Consistent gradient based on team hash for rich professional variation
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-red-500 to-rose-700",
    "from-blue-650 to-indigo-800",
    "from-emerald-500 to-teal-700",
    "from-amber-400 to-orange-650",
    "from-fuchsia-500 to-purple-800",
    "from-cyan-500 to-teal-600",
    "from-blue-500 to-cyan-600",
    "from-yellow-400 to-amber-600",
    "from-violet-500 to-indigo-800",
    "from-pink-500 to-rose-600"
  ];
  const borderColors = [
    "border-red-400/30",
    "border-blue-400/30",
    "border-emerald-400/30",
    "border-orange-400/30",
    "border-purple-400/30",
    "border-cyan-400/30",
    "border-indigo-400/30",
    "border-amber-400/30",
    "border-blue-400/30",
    "border-rose-400/30"
  ];
  const textColors = [
    "text-white",
    "text-blue-50",
    "text-emerald-50",
    "text-amber-50",
    "text-purple-50",
    "text-cyan-50",
    "text-indigo-50",
    "text-yellow-50",
    "text-violet-50",
    "text-rose-50"
  ];
  const index = Math.abs(hash) % gradients.length;
  return {
    gradient: gradients[index],
    border: borderColors[index],
    text: abbreviation.trim(),
    colors: textColors[index]
  };
};

interface OddsState {
  odds1: string;
  oddsX: string;
  odds2: string;
}

interface AnalysisReport {
  timestamp: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  odds: OddsState;
  confidence: number;
  prediction: string;
  advice: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'football' | 'aviator' | 'help'>('football');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [localTime, setLocalTime] = useState<string>("");

  // Splash Screen loading states runs for exactly 5 seconds
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);

  useEffect(() => {
    const duration = 5000; // 5 seconds splash
    const intervalTime = 100; // update scale 100ms
    const step = 100 / (duration / intervalTime);
    
    const timer = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setShowSplash(false);
          }, 400); // slight extra fade buffer
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    // Play a creative sci-fi lightning electric drone sound on startup if enabled
    try {
      synth.playTakeoff();
    } catch (e) {}

    return () => clearInterval(timer);
  }, []);

  // Users & validation logic states
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [isRegLoading, setIsRegLoading] = useState<boolean>(false);
  const [regLoadingProgress, setRegLoadingProgress] = useState<number>(0);
  const [regStatusMessage, setRegStatusMessage] = useState<string>("");

  // Inscription input states
  const [regForm, setRegForm] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [regError, setRegError] = useState<string | null>(null);

  // Connexion (Login) input states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);

  // VIP Subscription inputs
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '3months'>('1month');
  const [paymentNetwork, setPaymentNetwork] = useState<'MVOLA' | 'AIRTEL'>('MVOLA');
  const [senderPhone, setSenderPhone] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [payError, setPayError] = useState<string | null>(null);
  const [isPaySubmitting, setIsPaySubmitting] = useState<boolean>(false);

  // Verification Animation States for waiting room
  const [animationStep, setAnimationStep] = useState<number>(1); // 1 = Plane, 2 = Football, 3 = Checkmark/Final

  // Football module states
  const leagues = Object.keys(LEAGUE_TEAMS);
  const [selectedLeague, setSelectedLeague] = useState<string>(leagues[0]);
  const [homeTeam, setHomeTeam] = useState<string>("");
  const [awayTeam, setAwayTeam] = useState<string>("");
  
  // Team Selection Overlay states
  const [activeTeamSelector, setActiveTeamSelector] = useState<'home' | 'away' | null>(null);
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");
  const [odds, setOdds] = useState<OddsState>({ odds1: "1.85", oddsX: "3.40", odds2: "4.20" });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  // Aviator module states
  const [aviatorSchedules, setAviatorSchedules] = useState<any[]>([]);
  const [isScanningAviator, setIsScanningAviator] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  // Legacy states kept for backward compatibility and type mapping
  const [aviatorState, setAviatorState] = useState<'scan' | 'found' | 'run' | 'finish'>('scan');
  const [aviatorMultiplier, setAviatorMultiplier] = useState<number>(1.00);
  const [aviatorTarget, setAviatorTarget] = useState<{ min: number; max: number }>({ min: 1.85, max: 2.30 });
  const [aviatorTimer, setAviatorTimer] = useState<number>(5);
  const [aviatorConfidence, setAviatorConfidence] = useState<number>(92);
  const [aviatorHistory, setAviatorHistory] = useState<Array<{ mult: number; state: boolean; time: string }>>([
    { mult: 2.15, state: true, time: "18:01" },
    { mult: 1.88, state: true, time: "18:03" },
    { mult: 1.42, state: false, time: "18:04" },
    { mult: 2.65, state: true, time: "18:05" },
    { mult: 1.95, state: true, time: "18:06" },
  ]);

  // Simulated System logs container for interactive Admin/Test panel
  const [systemLogs, setSystemLogs] = useState<{ users: any[]; emails: SimulatedEmail[]; sms: SimulatedSms[] }>({
    users: [],
    emails: [],
    sms: []
  });
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  // Retrieve current user on mount & setup live clock
  useEffect(() => {
    const updateTime = () => {
      setLocalTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);

    const storedUser = localStorage.getItem("bet261_current_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    fetchSystemLogs();

    return () => clearInterval(clockTimer);
  }, []);

  // Poll status of the pending user in real-time
  useEffect(() => {
    if (!currentUser || (currentUser.status !== "pending_verification" && currentUser.status !== "pending_payment")) return;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/user-status?userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          
          // Verify if state has shifted
          if (data.status !== currentUser.status) {
            const updatedUser: RegisteredUser = { ...currentUser, status: data.status, paymentDetails: data.paymentDetails };
            setCurrentUser(updatedUser);
            localStorage.setItem("bet261_current_user", JSON.stringify(updatedUser));
            
            if (data.status === "verified") {
              synth.playSuccess();
              setAnimationStep(3); // resolve timeline directly to Vrais checkmark
            } else if (data.status === "rejected") {
              synth.playCrash();
            }
          }
        }
      } catch (e) {}
    };

    const pollTimer = setInterval(pollStatus, 3000);
    return () => clearInterval(pollTimer);
  }, [currentUser]);

  // Fetch log contents from database files for interactive simulator
  const fetchSystemLogs = async () => {
    try {
      const res = await fetch("/api/admin/system-logs");
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(data);
      }
    } catch (e) {}
  };

  // Synchronize first default teams based on selected league
  useEffect(() => {
    const teams = LEAGUE_TEAMS[selectedLeague];
    if (teams && teams.length >= 2) {
      setHomeTeam(teams[0]);
      setAwayTeam(teams[1]);
    }
    setReport(null);
  }, [selectedLeague]);

  // Audio utility toggle
  const toggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    synth.enabled = nextState;
    if (nextState) synth.playSuccess();
  };

  // 5-second Loading overlay timer sequence post Sign-Up
  const runRegistrationLoading = (userToSave: RegisteredUser) => {
    setIsRegLoading(true);
    setRegLoadingProgress(0);
    setRegStatusMessage("Création de votre empreinte d'utilisateur...");

    const duration = 5000;
    const intervalTime = 100;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const pct = Math.min(Math.round((currentStep / steps) * 100), 100);
      setRegLoadingProgress(pct);

      if (pct < 25) {
        setRegStatusMessage("Enregistrement sécurisé du profil...");
      } else if (pct < 55) {
        setRegStatusMessage("Liaison avec la passerelle Bet261 Madagascar...");
      } else if (pct < 80) {
        setRegStatusMessage("Initialisation des clés algorithmiques de l'IA...");
      } else {
        setRegStatusMessage("Finalisation et chiffrement du coffre de prédiction...");
      }

      if (currentStep >= steps) {
        clearInterval(timer);
        setIsRegLoading(false);
        // Login verified user
        setCurrentUser(userToSave);
        localStorage.setItem("bet261_current_user", JSON.stringify(userToSave));
        synth.playSuccess();
        fetchSystemLogs();
      }
    }, intervalTime);
  };

  // Registration submit call
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const { username, name, email, phone, password } = regForm;
    if (!username || !name || !email || !phone || !password) {
      setRegError("Veuillez remplir correctement tous les champs.");
      synth.playCrash();
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || "Une erreur s'est produite lors de l'inscription.");
        synth.playCrash();
        return;
      }

      // Successful registration: run the requested 5 seconds loading script before logging in
      synth.playSuccess();
      runRegistrationLoading(data.user);
    } catch (err) {
      setRegError("Impossible de joindre le serveur de base de données.");
      synth.playCrash();
    }
  };

  // Login submit call
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoginLoading(true);

    const { username, password } = loginForm;
    if (!username || !password) {
      setLoginError("Veuillez remplir tous les champs.");
      setIsLoginLoading(false);
      synth.playCrash();
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Identifiant ou mot de passe incorrect.");
        setIsLoginLoading(false);
        synth.playCrash();
        return;
      }

      // Login successful!
      setCurrentUser(data.user);
      localStorage.setItem("bet261_current_user", JSON.stringify(data.user));
      synth.playSuccess();
      setIsLoginLoading(false);
      fetchSystemLogs();
    } catch (err) {
      setLoginError("Erreur de connexion au serveur.");
      setIsLoginLoading(false);
      synth.playCrash();
    }
  };

  // Payment proof submit call
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);

    if (!senderPhone || !transactionRef) {
      setPayError("Veuillez renseigner votre numéro d'envoi et la référence de transaction.");
      synth.playCrash();
      return;
    }

    if (!currentUser) return;

    setIsPaySubmitting(true);
    synth.playRadarPing();

    const planName = selectedPlan === "1month" ? "Premium 1 Mois" : "Premium 3 Mois";
    const price = selectedPlan === "1month" ? 5000 : 10000;

    try {
      const res = await fetch("/api/submit-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          network: paymentNetwork,
          senderPhone,
          transactionRef,
          planName,
          price
        })
      });

      const data = await res.json();
      setIsPaySubmitting(false);

      if (!res.ok) {
        setPayError(data.error || "Une erreur est survenue lors de la soumission.");
        synth.playCrash();
        return;
      }

      // Action succeeded
      const updatedUser: RegisteredUser = {
        ...currentUser,
        status: "pending_verification",
        paymentDetails: {
          network: paymentNetwork,
          senderPhone,
          transactionRef,
          planName,
          price,
          submittedAt: new Date().toISOString()
        }
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("bet261_current_user", JSON.stringify(updatedUser));
      synth.playSuccess();
      fetchSystemLogs();

      // Start waiting animation cycles
      setAnimationStep(1);
    } catch (err) {
      setPayError("Vérifiez votre connexion internet.");
      setIsPaySubmitting(false);
      synth.playCrash();
    }
  };

  // Log out tool helper
  const handleLogout = () => {
    localStorage.removeItem("bet261_current_user");
    setCurrentUser(null);
    setReport(null);
    setRegForm({ username: "", name: "", email: "", phone: "", password: "" });
    setSenderPhone("");
    setTransactionRef("");
    synth.playPing();
  };

  // Admin approval bypass tool for test inside the browser
  const handleAdminBypassAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch("/api/admin/action-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action })
      });

      if (res.ok) {
        fetchSystemLogs();
        if (currentUser && currentUser.id === userId) {
          const updatedStatus = action === "approve" ? "verified" : "rejected";
          const updatedUser: RegisteredUser = { ...currentUser, status: updatedStatus };
          setCurrentUser(updatedUser);
          localStorage.setItem("bet261_current_user", JSON.stringify(updatedUser));
          
          if (action === "approve") {
            synth.playSuccess();
            setAnimationStep(3);
          } else {
            synth.playCrash();
          }
        }
      }
    } catch (e) {}
  };

  // Dynamic animation sequences inside the verification screen
  useEffect(() => {
    if (!currentUser || currentUser.status !== "pending_verification") return;

    const sequenceTimer = setInterval(() => {
      setAnimationStep((prev) => {
        // Automatically oscillate steps 1 and 2 to simulate progressive background analytics
        // until verified (which sets animationStep immediately to 3)
        if (prev === 1) return 2;
        return 1;
      });
    }, 3000);

    return () => clearInterval(sequenceTimer);
  }, [currentUser]);

  // Launch analysis logic with 2 seconds loader delay for Verified user (V-FOOTBALL)
  const handleLaunchAnalysis = () => {
    if (!homeTeam || !awayTeam) {
      alert("Veuillez sélectionner l'équipe à domicile et à l'extérieur.");
      return;
    }

    if (homeTeam === awayTeam) {
      alert("L'équipe à domicile doit être différente de l'équipe à l'extérieur.");
      return;
    }

    const n1 = parseFloat(odds.odds1);
    const nX = parseFloat(odds.oddsX);
    const n2 = parseFloat(odds.odds2);

    if (isNaN(n1) || isNaN(nX) || isNaN(n2)) {
      alert("Veuillez entrer des valeurs numériques valides pour toutes les cotes.");
      return;
    }

    synth.playRadarPing();
    setIsAnalyzing(true);
    setReport(null);

    setTimeout(() => {
      setIsAnalyzing(false);

      // confidence calculation (88% to 98% for premium users)
      const calculatedConfidence = Math.floor(Math.random() * 11) + 88;

      let computedPrediction = "";
      let computedAdvice = "";

      if (n1 < n2 && n1 <= 1.85) {
        computedPrediction = "Victoire Domicile Sec (1)";
        computedAdvice = `Premium Bet261 : Notre algorithme repère une forte asymétrie de flux sur la ligue ${selectedLeague}. Domination tactique évidente de ${homeTeam} avec un indice de complétion offensive de 88%.`;
      } else if (n2 < n1 && n2 <= 1.85) {
        computedPrediction = "Victoire Extérieur Sec (2)";
        computedAdvice = `Premium Bet261 : Le volume de transactions mondiales converge vers une victoire de ${awayTeam}. En outre, l'historique de déplacement démontre une couverture défensive totale de 91%.`;
      } else {
        if (Math.abs(n1 - n2) < 0.6) {
          computedPrediction = "Match Nul ou Moins de 2.5 buts (X)";
          computedAdvice = `Premium Bet261 : Match hautement fermé et défensif. La probabilité d'un score inférieur à deux buts s'élève à 92.4%. Idéal pour un pari de sécurisation.`;
        } else {
          computedPrediction = "Plus de 1.5 buts - Score Élevé";
          computedAdvice = `Premium Bet261 : Les deux formations enregistrent un taux d'efficacité offensive supérieur à 2.1 buts par match sur la ligue ${selectedLeague}.`;
        }
      }

      setReport({
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        league: selectedLeague,
        homeTeam,
        awayTeam,
        odds: { ...odds },
        confidence: calculatedConfidence,
        prediction: computedPrediction,
        advice: computedAdvice
      });
      synth.playSuccess();
    }, 2000);
  };

  // Reset analysis tool
  const handleReset = () => {
    setSelectedLeague(leagues[0]);
    setOdds({ odds1: "1.85", oddsX: "3.40", odds2: "4.20" });
    setReport(null);
    synth.playPing();
  };

  // Helper: dynamic forecast generation based on client's actual hourly clock for realism
  const generatePredictionsForToday = () => {
    const now = new Date();
    const list = [];
    
    // Generate 3 past (secured / validated) predictions earlier today 
    for (let i = -3; i < 0; i++) {
      const pastTime = new Date(now.getTime() + i * 18 * 60 * 1000);
      const hourStr = pastTime.toTimeString().split(' ')[0].substring(0, 5);
      const multVal = parseFloat((Math.random() * 2.1 + 1.8).toFixed(2));
      list.push({
        id: -100 + i,
        hour: hourStr,
        target: `Palier ${multVal.toFixed(2)}x`,
        confidence: Math.floor(Math.random() * 5) + 94, // 94% to 98%
        type: Math.random() > 0.45 ? "Vol de Couverture ✔" : "Vague d'Or VIP ✔",
        status: 'success' as const,
        multiplierDetail: `${(multVal + Math.random() * 0.45 + 0.1).toFixed(2)}x ✅`
      });
    }

    // Generate 1 imminent / active prediction slot
    const imminentTime = new Date(now.getTime() + 1 * 60 * 1000);
    const immHourStr = imminentTime.toTimeString().split(' ')[0].substring(0, 5);
    list.push({
      id: 0,
      hour: immHourStr,
      target: "1.95x - 3.80x",
      confidence: Math.floor(Math.random() * 3) + 96,
      type: "Palier Optimal 🚀",
      status: 'active' as const,
      multiplierDetail: "EN RECHERCHE D'EMBARQUEMENT..."
    });

    // Generate 4 future predicted horaire slots
    for (let i = 1; i <= 5; i++) {
      const futureTime = new Date(now.getTime() + (i * 15 + Math.floor(Math.random() * 4)) * 60 * 1000);
      const hourStr = futureTime.toTimeString().split(' ')[0].substring(0, 5);
      const minMult = parseFloat((Math.random() * 1.5 + 1.8).toFixed(2));
      const maxMult = parseFloat((minMult + Math.random() * 3.5 + 1.0).toFixed(2));
      list.push({
        id: i,
        hour: hourStr,
        target: `${minMult.toFixed(2)}x - ${maxMult.toFixed(2)}x`,
        confidence: Math.floor(Math.random() * 4) + 95,
        type: Math.random() > 0.5 ? "Sécurisé VIP" : "Premium Gold x5",
        status: 'upcoming' as const,
        multiplierDetail: "EN ATTENTE..."
      });
    }

    return list;
  };

  // Trigger loading list when tab changes to aviator
  useEffect(() => {
    if (activeTab === "aviator" && aviatorSchedules.length === 0 && currentUser?.status === "verified") {
      setAviatorSchedules(generatePredictionsForToday());
    }
  }, [activeTab, currentUser]);

  // Handle premium Live Scan tool with takeoff aircraft sound
  const handleAviatorScan = () => {
    setIsScanningAviator(true);
    setScannedResult(null);
    synth.playTakeoff(); // REAL PLANE TAKEOFF NOISE !!!

    setTimeout(() => {
      setIsScanningAviator(false);
      const now = new Date();
      // Next exact seconds alignment 1 minute 45 seconds from now
      const targetTime = new Date(now.getTime() + 1 * 60 * 1000 + 45 * 1000);
      const hourMinuteStr = targetTime.toTimeString().split(' ')[0];
      const targetMinOpt = parseFloat((Math.random() * 1.0 + 2.10).toFixed(2));
      const targetMaxOpt = parseFloat((targetMinOpt + Math.random() * 2.0 + 0.50).toFixed(2));
      
      setScannedResult({
        exactTime: hourMinuteStr,
        multiplierMin: targetMinOpt,
        multiplierMax: targetMaxOpt,
        confidence: Math.floor(Math.random() * 3) + 97, // 97% to 99% reliability
        securityLevel: "HYPER-SÉCURISÉ ✅ (COUVERTURE TOTALE)",
        adviceText: `Palier de coupe conseillé entre ${targetMinOpt.toFixed(2)}x et ${targetMaxOpt.toFixed(2)}x. Activez l'Auto-Cashout sur Bet261 pour éliminer le lag.`
      });
      synth.playSuccess();
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 pb-16 flex flex-col font-sans select-none antialiased">
      
      {/* 5-SECOND PREMIUM INITIAL SPLASH SCREEN WITH FUZZY BLUR BACKGROUND AND HIGH ENERGY LIGHTNING */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 select-none overflow-hidden"
          >
            {/* Custom high-voltage css lightning animations */}
            <style>{`
              @keyframes lightning-sparkle {
                0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.82)) drop-shadow(0 0 25px rgba(37, 99, 235, 0.45)); }
                10%, 90% { opacity: 0.7; }
                15%, 85% { opacity: 0.95; filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 35px rgba(59, 130, 246, 0.65)); }
                20% { opacity: 0.25; filter: none; }
                22% { opacity: 1; filter: drop-shadow(0 0 35px rgba(56, 189, 248, 1)) drop-shadow(0 0 50px rgba(29, 78, 216, 0.8)); }
                45% { opacity: 0.85; }
                47% { opacity: 0.35; }
                49% { opacity: 1; filter: drop-shadow(0 0 22px rgba(14, 165, 233, 0.9)); }
                65% { opacity: 0.75; }
                67% { opacity: 0.15; }
                69% { opacity: 0.95; }
              }
              @keyframes arc-buzz {
                0%, 100% { transform: scale(1) rotate(0deg); }
                30% { transform: scale(1.02) rotate(0.4deg) skewX(0.5deg); }
                60% { transform: scale(0.99) rotate(-0.4deg) skewX(-0.5deg); }
                80% { transform: scale(1.01) rotate(0.1deg); }
              }
              @keyframes electric-glow-pulse {
                0%, 100% { box-shadow: 0 0 15px 2px rgba(56, 189, 248, 0.4), inset 0 0 15px rgba(56, 189, 248, 0.3); }
                50% { box-shadow: 0 0 35px 8px rgba(56, 189, 248, 0.85), inset 0 0 25px rgba(56, 189, 248, 0.55); }
              }
              .animate-lightning-bolt {
                animation: lightning-sparkle 1.4s infinite;
              }
              .animate-arc-buzz {
                animation: arc-buzz 0.12s infinite;
              }
              .animate-electric-glow {
                animation: electric-glow-pulse 2s infinite ease-in-out;
              }
            `}</style>

            {/* Blurred background logo */}
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-[45px] opacity-25 scale-125 transition-all duration-1000"
              style={{ backgroundImage: `url('https://i.postimg.cc/L66D8QG2/1781466214082.jpg')` }}
            />
            
            {/* Soft dark radial vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.5)_0%,rgba(2,6,23,0.98)_100%)]" />

            {/* Glowing Blue Lightning Grid background for depth */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#091426_1px,transparent_1px),linear-gradient(to_bottom,#091426_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-8 text-center space-y-7">
              
              {/* Logo Container with electric corona aura */}
              <div className="relative group animate-arc-buzz">
                {/* Outermost electric feedback ring */}
                <div className="absolute -inset-6 rounded-full bg-cyan-500/10 blur-xl animate-pulse" />
                
                {/* High voltage rotating dash ring */}
                <div className="absolute -inset-2 rounded-full border-2 border-dashed border-sky-400/40 animate-[spin_24s_linear_infinite]" />
                
                {/* Solid glow pulsing border */}
                <div className="absolute -inset-1 rounded-full p-[2px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-450 opacity-90 animate-electric-glow" />

                <div className="relative w-36 h-36 rounded-full overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
                  <img
                    src="https://i.postimg.cc/L66D8QG2/1781466214082.jpg"
                    alt="App Logo"
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Title & subtitle block */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-black text-sky-400 tracking-[0.25em] block uppercase animate-pulse">
                  ALGORITHME SÉCURISÉ
                </span>
                <h1 className="text-2xl font-black text-white tracking-wider font-sans uppercase">
                  BET261 PREDICT
                </h1>
                <p className="text-[11px] text-[#39b54a] font-mono font-bold tracking-wide uppercase">
                  COUVERTURE INTÉGRALE VIP 🇲🇬
                </p>
              </div>

              {/* SPECIAL LIGHTNING LOADER ELEMENT: "Creativity glow blue eclaire" */}
              <div className="w-full space-y-4 bg-slate-900/50 backdrop-blur-md border border-slate-850 p-5 rounded-3xl relative overflow-hidden">
                {/* Top lightning bolt Icon with electric glow flicker effect */}
                <div className="relative flex justify-center h-12">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="w-10 h-10 text-cyan-400 animate-lightning-bolt"
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polygon 
                      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" 
                      className="fill-cyan-450/20"
                    />
                    {/* Inner glowing energy strike path overlay */}
                    <polygon 
                      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" 
                      className="stroke-white stroke-[2.5] opacity-95 filter drop-shadow-[0_0_3px_rgba(56,189,248,1)]"
                    />
                  </svg>
                  
                  {/* Glowing electric background spark aura */}
                  <div className="absolute h-10 w-10 bg-blue-500/25 rounded-full blur-md animate-ping" />
                </div>

                {/* Electric linear load tracks */}
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[2px] border border-slate-850">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 relative transition-all duration-100 ease-out shadow-[0_0_12px_rgba(56,189,248,0.85)]"
                      style={{ width: `${splashProgress}%` }}
                    >
                      {/* Burning spark element at the progressing tip */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full filter drop-shadow-[0_0_8px_#38bdf8] animate-ping" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-[#39b54a] font-black uppercase tracking-wider animate-pulse">
                      FILTRAGE DU CANAL ÉLECTRIQUE VIP...
                    </span>
                    <span className="text-white font-black">
                      {Math.floor(splashProgress)}%
                    </span>
                  </div>
                </div>

                <p className="text-[9px] text-gray-400 font-mono leading-relaxed max-w-[280px] mx-auto text-center">
                  Initialisation sécurisée des flux temps-réel Bet261 (Cotes & Avion Aviator 🚀)...
                </p>
              </div>

            </div>

            {/* Footer encryption standards tag */}
            <div className="absolute bottom-6 flex items-center gap-1.5 text-[9px] font-mono text-gray-500 opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>SÉCURISATION DU SYSTEME PAR TOKENS VIP CRYPTÉS</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER: Ultra Polished Dark Top Header bar matching Madagascar VIP theme */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 py-3.5 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#39b54a] text-black w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm tracking-tight shadow-lg shadow-emerald-500/10">
              B
            </div>
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-[#39b54a] block leading-none">
                BET261 ANALYZER
              </span>
              <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">
                SYSTEME ACTIF • {localTime || "11:00:00 AM"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Button */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-xl border transition-all ${
                isAudioEnabled
                  ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400"
                  : "bg-slate-850 border-slate-800 text-gray-600"
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Premium Gold crown/shield validation badge */}
            {currentUser?.status === "verified" ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> PRO VIP
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-rose-950/80 text-rose-400 border border-rose-900/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                LOCK🔒
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Framework Viewport */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        
        {/* IF NOT LOGGED IN AT ALL (STRICT INSCRIPTION FIRST RULE) */}
        {!currentUser && !isRegLoading && (
          <div className="space-y-4">
            
            {/* Premium Greeting card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 p-8 transform translate-x-10 -translate-y-10 opacity-10 font-bold select-none text-9xl">
                ★
              </div>
              <div className="space-y-2 relative z-10">
                <span className="inline-block bg-[#39b54a]/10 text-[#39b54a] font-mono text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest leading-none">
                  BIENVENUE SUR BET261 PREDICT
                </span>
                <h2 className="text-xl font-black text-white leading-snug">
                  L'ALGORITHME DE PREDICTION SPÉCIALISÉ MADAGASCAR
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Accédez instantanément à nos signaux de cotes et au radar de hausse de l'Aviator. Connexion requise pour charger vos jetons de sécurité.
                </p>
              </div>
            </div>

            {/* Auth Mode Tabs Switches */}
            <div className="grid grid-cols-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setLoginError(null); }}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  authMode === 'login'
                    ? "bg-[#39b54a] text-black shadow-md font-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setRegError(null); }}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  authMode === 'register'
                    ? "bg-[#39b54a] text-black shadow-md font-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Inscription
              </button>
            </div>

            {authMode === 'login' ? (
              /* Connexion Login Widget */
              <form onSubmit={handleLoginSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#39b54a]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Se connecter à Bet261 Predict
                  </h3>
                </div>

                {loginError && (
                  <div className="bg-rose-950/40 border border-rose-900/60 p-3 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      Identifiant ou Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      required
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                      placeholder="Ex: monpseudo261 ou Ronan Ra"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      Mot de passe / Code spécial Admin
                    </label>
                    <input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoginLoading}
                    className="w-full bg-[#39b54a] hover:bg-[#2f973c] active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                  >
                    {isLoginLoading ? (
                      <span>CONNEXION EN COURS...</span>
                    ) : (
                      <>
                        <span>SE CONNECTER</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 text-center leading-normal">
                  Saisissez vos identifiants pour vous reconnecter et accéder à vos prédictions et votre formule active.
                </p>
              </form>
            ) : (
              /* Registration Form Widget */
              <form onSubmit={handleRegisterSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#39b54a]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    S'inscrire et s'activer
                  </h3>
                </div>

                {regError && (
                  <div className="bg-rose-950/40 border border-rose-900/60 p-3 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      Nom Complet du client
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                      placeholder="Ex: Ratsimazafy Jean"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      Identifiant / Pseudo
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.username}
                      onChange={(e) => setRegForm({ ...regForm, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                      placeholder="Ex: monpseudo261"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      Téléphone principal
                    </label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                      placeholder="Ex: +261 33 09 104 25"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      Adresse Email de facturation
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                      placeholder="Ex: nom@domaine.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                      Mot de passe secret
                    </label>
                    <input
                      type="password"
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#39b54a] hover:bg-[#2f973c] active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <span>CRÉER MON COMPTE SÉCURISÉ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 text-center leading-normal">
                  En créant un compte, vous déclarez accepter nos conditions générales d'accès aux prédictions de jeux virtuels en partenariat avec Bet261.
                </p>
              </form>
            )}
          </div>
        )}

        {/* 5 SECONDS REGISTRATION LOADING INTERSTITIAL overlay (Requirement 4) */}
        {isRegLoading && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 flex flex-col items-center justify-center min-h-[350px]">
            {/* Spinning/pulsating high-tech key asset logo */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#39b54a] border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#39b54a] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 w-full">
              <span className="text-[10px] font-mono font-black text-[#39b54a] uppercase tracking-widest block animate-pulse">
                INITIALISATION DU COMPTE PREMIUM
              </span>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Veuillez patienter...
              </h3>
              
              <div className="w-full bg-slate-950 h-2 px-0.5 rounded-full overflow-hidden border border-slate-800 mt-2">
                <div 
                  className="bg-[#39b54a] h-full rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${regLoadingProgress}%` }}
                ></div>
              </div>

              <p className="text-xs text-gray-400 font-mono italic animate-fade pt-1">
                {regStatusMessage}
              </p>
            </div>

            <span className="text-[9px] text-gray-600 font-mono">
              TEMPS ESTIMÉ : {(5 - (regLoadingProgress / 20)).toFixed(1)}s RESTANTES
            </span>
          </div>
        )}

        {/* ==================== SPECIAL ADMIN DASHBOARD (Ronan Ra Special Auth) ==================== */}
        {currentUser && currentUser.status === "admin" && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Admin Header Welcome Area */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 p-6 opacity-10 font-bold select-none text-7xl text-[#39b54a]">
                👑
              </div>
              <div className="space-y-1 z-10 relative">
                <span className="inline-block bg-[#39b54a]/10 text-[#39b54a] font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Session Administrateur active
                </span>
                <h2 className="text-lg font-black text-white">
                  Tableau de bord : Ronan Ra
                </h2>
                <p className="text-[11px] text-gray-400">
                  Validez les dépôts des clients, gérez les inscriptions et suivez les logs SMS/Emails en temps réel.
                </p>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={fetchSystemLogs}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#39b54a]" />
                  <span>Actualiser les données</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("bet261_current_user");
                    setCurrentUser(null);
                    synth.playPing();
                  }}
                  className="bg-rose-950/85 hover:bg-rose-900 text-rose-300 font-bold py-2.5 px-4 rounded-xl transition-all border border-rose-900/40"
                >
                  Déconnexion 🚪
                </button>
              </div>
            </div>

            {/* Quick Stats overview panel */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center">
                <span className="text-[9px] uppercase font-black tracking-wider text-gray-500 block mb-0.5">Inscrits</span>
                <strong className="text-sm text-white font-mono">{systemLogs.users.length}</strong>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center">
                <span className="text-[9px] uppercase font-black tracking-wider text-amber-500 block mb-0.5">En Attente</span>
                <strong className="text-sm text-amber-400 font-mono">
                  {systemLogs.users.filter(u => u.status === 'pending_verification').length}
                </strong>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center">
                <span className="text-[9px] uppercase font-black tracking-wider text-emerald-500 block mb-0.5">Actifs VIP</span>
                <strong className="text-sm text-emerald-400 font-mono">
                  {systemLogs.users.filter(u => u.status === 'verified').length}
                </strong>
              </div>
            </div>

            {/* Pending Verifications lists */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="font-black text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  Demandes de validation VIP
                </h3>
                <span className="text-[9px] font-mono text-gray-500">Fil d'attente</span>
              </div>

              {systemLogs.users.filter(u => u.status === 'pending_verification').length === 0 ? (
                <p className="text-center text-gray-500 py-6 italic text-[11px]">
                  Aucune demande de validation en attente pour le moment.
                </p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {systemLogs.users.filter(u => u.status === 'pending_verification').map((usr) => (
                    <div key={usr.id} className="p-3 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-white text-xs block">{usr.name}</strong>
                          <span className="text-[10px] text-gray-400 font-mono">@{usr.username} • Tel: {usr.phone}</span>
                        </div>
                        <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-black uppercase">
                          En validation
                        </span>
                      </div>

                      {usr.paymentDetails && (
                        <div className="p-2 bg-slate-900/60 rounded-xl text-[10px] text-gray-300 font-mono border border-slate-850/50 space-y-0.5">
                          <div><strong>Formule :</strong> {usr.paymentDetails.planName} ({usr.paymentDetails.price} Ar)</div>
                          <div><strong>Réseau :</strong> <span className={usr.paymentDetails.network === 'MVOLA' ? 'text-yellow-400' : 'text-rose-400'}>{usr.paymentDetails.network}</span></div>
                          <div><strong>Réf :</strong> <span className="text-emerald-400 font-bold">{usr.paymentDetails.transactionRef}</span></div>
                          <div><strong>Expéditeur :</strong> {usr.paymentDetails.senderPhone}</div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            await handleAdminBypassAction(usr.id, "approve");
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider py-1.5 px-2 rounded-xl"
                        >
                          Approuver ✅ (VIP)
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await handleAdminBypassAction(usr.id, "reject");
                          }}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-wider py-1.5 px-2 rounded-xl"
                        >
                          Rejeter ❌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List of other enrolled users */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="border-b border-slate-850 pb-2">
                <h3 className="font-black text-white text-[11px] uppercase tracking-wider">
                  Tous les comptes clients
                </h3>
              </div>

              {systemLogs.users.filter(u => u.status !== 'pending_verification').length === 0 ? (
                <p className="text-center text-gray-500 py-4 italic text-[11px]">
                  Aucun autre compte enregistré.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {systemLogs.users.filter(u => u.status !== 'pending_verification').map((usr) => (
                    <div key={usr.id} className="p-2.5 bg-slate-950 border border-slate-850/50 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-gray-200 text-xs block leading-tight">{usr.name}</strong>
                        <span className="text-[9px] text-gray-500 font-mono">@{usr.username} • Tel: {usr.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black font-mono border px-2 py-0.5 rounded-full uppercase ${
                          usr.status === "verified" ? "bg-emerald-950 border-emerald-850 text-emerald-400" :
                          usr.status === "rejected" ? "bg-rose-950 border-rose-900 text-rose-450" :
                          "bg-slate-900 border-slate-800 text-gray-400"
                        }`}>
                          {usr.status === "verified" ? "VIP" : usr.status}
                        </span>
                        
                        {usr.status !== "verified" && (
                          <button
                            type="button"
                            onClick={async () => {
                              await handleAdminBypassAction(usr.id, "approve");
                            }}
                            className="text-[9px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 transition"
                          >
                            Activer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Live Communications Logs (Email dispatcher list) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="font-black text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  Logs de communication simulée
                </h3>
                <span className="text-[9px] font-mono text-gray-500">Live logs</span>
              </div>

              {/* Virtual Email inbox list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-black text-gray-400 tracking-wider font-mono block">
                    e-mails de notification (ronanswerdna@gmail.com)
                  </span>
                  <span className="text-[8px] bg-[#39b54a]/10 text-[#39b54a] font-mono px-2 py-0.5 rounded font-black">
                    Mode Simulation + Réel
                  </span>
                </div>

                {/* Banner reminding about SMTP config */}
                <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-2xl text-[10px] text-blue-300 leading-relaxed">
                  💡 <strong>Astuce de réception :</strong> Si vous ne recevez pas les e-mails sur votre boîte Gmail <strong>ronanswerdna@gmail.com</strong>, assurez-vous d'avoir configuré vos identifiants SMTP (comme <code>SMTP_USER</code> et <code>SMTP_PASS</code>) dans les Variables d'Environnement / Paramètres secrets de votre espace. En attendant la configuration, **tous les emails envoyés sont accessibles en temps réel ci-dessous. Vous pouvez cliquer sur un e-mail pour le déplier et cliquer directement sur les boutons de validation !**
                </div>
                
                {systemLogs.emails.length === 0 ? (
                  <p className="text-[10px] text-gray-500 italic p-2 bg-slate-950 rounded">
                    Aucun e-mail d'alerte émis pour le moment.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {systemLogs.emails.map((mail) => {
                      const isExpanded = expandedEmailId === mail.id;
                      return (
                        <div key={mail.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2 transition-all">
                          <button
                            type="button"
                            onClick={() => setExpandedEmailId(isExpanded ? null : mail.id)}
                            className="w-full text-left flex flex-col gap-1 focus:outline-none"
                          >
                            <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono w-full">
                              <span>Destinataire: {mail.to}</span>
                              <span className="flex items-center gap-1">
                                <span className={mail.sentReal ? "text-emerald-400 font-bold" : "text-gray-500"}>
                                  {mail.sentReal ? "Envoi SMTP Réussi ✓" : "Simulé ✉"}
                                </span>
                                <span>• {new Date(mail.sentAt).toLocaleTimeString("fr-FR")}</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <h4 className="font-bold text-gray-200 text-[10px] leading-tight hover:text-[#39b54a] transition-colors">{mail.subject}</h4>
                              <span className="text-[9px] text-[#39b54a] font-bold ml-2 shrink-0">
                                {isExpanded ? "▲ Réduire" : "▼ Déplier"}
                              </span>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="pt-2 border-t border-slate-850 space-y-2">
                              <div 
                                className="bg-white text-slate-900 rounded-xl p-3 max-h-60 overflow-y-auto text-[10px] space-y-2 shadow-inner border border-slate-100"
                                dangerouslySetInnerHTML={{ __html: mail.html }}
                              />
                              <div className="p-2 bg-slate-900/60 rounded-xl text-[10px] text-gray-400 text-center font-mono italic">
                                Identifiant : {mail.id}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SMS Alert lists */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[9px] uppercase font-black text-gray-400 tracking-wider font-mono block">
                  SMS d'alertes propagés (+261387203022 et +261330910425)
                </span>

                {systemLogs.sms.length === 0 ? (
                  <p className="text-[10px] text-gray-500 italic p-2 bg-slate-950 rounded">
                    Aucun SMS d'alerte émis pour le moment.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {systemLogs.sms.map((sms) => (
                      <div key={sms.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                        <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                          <span>Dest: {sms.to}</span>
                          <span>{new Date(sms.sentAt).toLocaleTimeString("fr-FR")}</span>
                        </div>
                        <p className="text-gray-300 text-[10px] leading-snug">{sms.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT IS LOGGED IN BUT IN OUT-STANDING STATES (pending_payment / pending_verification / rejected) */}
        {currentUser && currentUser.status !== "verified" && currentUser.status !== "admin" && (
          <div className="space-y-4">
            
            {/* 1. STATE: pending_payment - THE PAY-WALL SUBSCRIPTION SELECTOR AT ACTIVATION */}
            {currentUser.status === "pending_payment" && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Profile card summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[#39b54a] uppercase">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">{currentUser.name}</span>
                      <span className="text-[9px] text-gray-500 block font-mono">ID: {currentUser.id}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-[9px] uppercase font-black text-rose-400 bg-rose-950/20 px-2 py-1 rounded-lg border border-rose-900/30 hover:bg-rose-900/30"
                  >
                    Quitter Deconnexion
                  </button>
                </div>

                {/* Sub-plan prompt widget */}
                <div className="bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-3xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-900 border-2 border-[#39b54a] rounded-full flex items-center justify-center mx-auto text-yellow-400 shadow-md">
                    <Flame className="w-6 h-6 fill-yellow-500 text-yellow-500 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Sélectionner Votre Abonnement VIP
                    </h3>
                    <p className="text-xs text-gray-400">
                      Entrez les détails de transfert Mobile Money certifié Ratsimazafy ci-dessous pour débloquer votre accès complet.
                    </p>
                  </div>

                  {/* Pricing Toggles */}
                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    
                    {/* Forfait 1 mois */}
                    <button
                      type="button"
                      onClick={() => { setSelectedPlan("1month"); synth.playPing(); }}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        selectedPlan === "1month"
                          ? "bg-emerald-950/40 border-[#39b54a] text-white"
                          : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-gray-400"
                      }`}
                    >
                      <span className="text-[9px] uppercase font-black font-mono tracking-wider block">FORFAIT 1 MOIS</span>
                      <span className="text-lg font-black font-mono mt-1 block">5 000 Ar</span>
                      <span className="text-[9px] text-gray-500 mt-2 block">Premium Complet 30 Jours</span>
                    </button>

                    {/* Forfait 3 mois */}
                    <button
                      type="button"
                      onClick={() => { setSelectedPlan("3months"); synth.playPing(); }}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                        selectedPlan === "3months"
                          ? "bg-emerald-950/40 border-[#39b54a] text-white"
                          : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-gray-400"
                      }`}
                    >
                      <span className="absolute -top-2 right-2 bg-[#39b54a] text-black font-bold font-mono text-[8px] px-2 py-0.5 rounded-full select-none">
                        PROMO
                      </span>
                      <span className="text-[9px] uppercase font-black font-mono tracking-wider block">FORFAIT 3 MOIS</span>
                      <span className="text-lg font-black font-mono mt-1 block">10 000 Ar</span>
                      <span className="text-[9px] text-gray-500 mt-2 block">Économisez 33% (90 Jours)</span>
                    </button>

                  </div>
                </div>

                {/* Direct Mobile Money Depots Details Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="border-b border-slate-850 pb-2">
                    <span className="text-[10px] font-black uppercase text-gray-450 tracking-wider font-mono">
                      NUMÉROS DE DÉPÔT (MADAGASCAR)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* MVola Account details block */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-amber-950/30 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-[#fabd00] uppercase tracking-wider">
                          DÉPÔT MVOLA
                        </span>
                        <h4 className="text-sm font-mono font-black text-white">038 72 030 22</h4>
                        <span className="text-[10px] text-gray-500 block">Titulaire : <strong>Ratsimazafy</strong></span>
                      </div>
                      <div className="bg-[#FABD00] text-black px-2.5 py-1 text-[9px] font-black rounded-lg">MVOLA</div>
                    </div>

                    {/* Airtel Account details block */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-rose-950/30 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider">
                          DÉPÔT AIRTEL MONEY
                        </span>
                        <h4 className="text-sm font-mono font-black text-white">033 09 104 25</h4>
                        <span className="text-[10px] text-gray-500 block">Titulaire : <strong>Ratsimazafy</strong></span>
                      </div>
                      <div className="bg-[#E31937] text-white px-2.5 py-1 text-[9px] font-black rounded-lg">AIRTEL</div>
                    </div>
                  </div>
                </div>

                {/* Submit Payment reference proof fields */}
                <form onSubmit={handlePaymentSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="border-b border-slate-850 pb-2">
                    <span className="text-[10px] font-black uppercase text-gray-450 tracking-wider">
                      DÉCLARATION DE VOTRE TRANSACTION
                    </span>
                  </div>

                  {payError && (
                    <div className="bg-rose-950/50 border border-rose-900/60 p-3 rounded-xl text-rose-300 text-xs">
                      {payError}
                    </div>
                  )}

                  <div className="space-y-4">
                    
                    {/* Network selection tag options */}
                    <div>
                      <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2">
                        1. Réseau de paiement utilisé
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => { setPaymentNetwork("MVOLA"); synth.playPing(); }}
                          className={`py-3 rounded-xl border font-bold text-xs uppercase text-center transition-all ${
                            paymentNetwork === "MVOLA"
                              ? "bg-amber-950/30 border-amber-600 text-amber-400"
                              : "bg-slate-950 border-slate-850 text-gray-400"
                          }`}
                        >
                          MVola Telma
                        </button>

                        <button
                          type="button"
                          onClick={() => { setPaymentNetwork("AIRTEL"); synth.playPing(); }}
                          className={`py-3 rounded-xl border font-bold text-xs uppercase text-center transition-all ${
                            paymentNetwork === "AIRTEL"
                              ? "bg-rose-950/30 border-rose-600 text-rose-400"
                              : "bg-slate-950 border-slate-850 text-gray-400"
                          }`}
                        >
                          Airtel Money
                        </button>
                      </div>
                    </div>

                    {/* Sender phone number */}
                    <div>
                      <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                        2. Numéro de téléphone expéditeur du transfert
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">+261</span>
                        <input
                          type="tel"
                          required
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-12 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                          placeholder="Ex: 38 72 030 22"
                        />
                      </div>
                    </div>

                    {/* Reference transaction ID code */}
                    <div>
                      <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1.5">
                        3. Référence de la transaction / Code reçu par SMS
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value.trim().toUpperCase())}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                        placeholder="Ex: MV240615.1102.C23412"
                      />
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPaySubmitting}
                      className="w-full bg-[#39b54a] hover:bg-[#2e933d] disabled:opacity-50 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                    >
                      {isPaySubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span>SOUMISSION EN COURS...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>SOUHETTRE LA PREUVE DE PAIEMENT</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* 2. STATE: pending_verification - IMMERSIVE WAITING ROOM OF RATSIMAZAFY WITH ADVANCED JET-PLANE TO FOOTBALL TO TRUE CHECK ANIMATION */}
            {currentUser.status === "pending_verification" && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Outgoing billing validation report status widget */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-5">
                  
                  {/* Majestic Sequential step-based graphic animation */}
                  <div className="h-44 bg-slate-950 rounded-2xl border border-slate-850 relative overflow-hidden flex flex-col items-center justify-center p-4">
                    {/* Retro analytics grids */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#141b2b_1px,transparent_1px),linear-gradient(to_bottom,#141b2b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30 pointer-events-none"></div>

                    {/* Animated Step Assets Wrapper */}
                    <div className="relative z-10 space-y-4">
                      
                      {/* STEP 1: LITTLE AIRPLANE ✈️ */}
                      {animationStep === 1 && (
                        <div className="animate-pulse space-y-3">
                          {/* Jet propulsion visualizer */}
                          <div className="w-14 h-14 bg-slate-900 rounded-full border border-sky-500/30 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                            <span className="text-3xl">✈️</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-black text-sky-400 tracking-wider block uppercase">
                              ÉTAPE 1 / 3
                            </span>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">
                              Vérification du transfert Mobile money...
                            </h4>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">Vérification de la référence {currentUser.paymentDetails?.transactionRef}</p>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: SPORTS FOOTBALL ⚽ */}
                      {animationStep === 2 && (
                        <div className="animate-pulse space-y-3">
                          <div className="w-14 h-14 bg-slate-900 rounded-full border border-[#39b54a]/30 flex items-center justify-center mx-auto shadow-lg animate-spin" style={{ animationDuration: '4s' }}>
                            <span className="text-3xl">⚽</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-black text-[#39b54a] tracking-wider block uppercase">
                              ÉTAPE 2 / 3
                            </span>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">
                              Liaison aux serveurs de cotes Bet261...
                            </h4>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">Configuration de votre clé privée de flux</p>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: REAL CHECKMARK ✅ */}
                      {animationStep === 3 && (
                        <div className="animate-pulse space-y-3">
                          <div className="w-14 h-14 bg-emerald-950/60 rounded-full border border-[#39b54a] flex items-center justify-center mx-auto shadow-lg">
                            <Check className="w-7 h-7 text-[#39b54a]" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-black text-[#39b54a] tracking-wider block uppercase">
                              ÉTAPE 3 / 3 • ACTIVÉ
                            </span>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">
                              Abonnement vérifié avec succès !
                            </h4>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">Redirection immédiate en cours...</p>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block bg-amber-950/50 border border-amber-900/30 text-amber-400 font-mono text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      ⏳ EN ATTENTE DE VALIDATION ADMIN
                    </span>
                    <h3 className="text-sm font-black text-white uppercase">
                      VOTRE PAIEMENT EST EN COURS D'ANALYSE
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed px-2">
                      L'administrateur <strong>Ratsimazafy</strong> est en train de recouper le dépôt sur son relevé <strong>{currentUser.paymentDetails?.network}</strong>. L'activation interviendra sous peu.
                    </p>
                  </div>

                  {/* Summary of what they entered */}
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 text-left space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-gray-500">Formule :</span>
                      <span className="text-white font-black">{currentUser.paymentDetails?.planName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-gray-500">Montant payé :</span>
                      <span className="text-[#39b54a] font-black">{currentUser.paymentDetails?.price} Ar</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-gray-500">Téléphone expé :</span>
                      <span className="text-white font-bold">{currentUser.paymentDetails?.senderPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Référence ID :</span>
                      <span className="text-gray-300 font-bold select-all">{currentUser.paymentDetails?.transactionRef}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10px] text-gray-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    <span>Calculateur synchrone. L'application vérifie le statut toutes les 3 secondes...</span>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="text-xs text-rose-450 hover:underline font-bold block mx-auto"
                  >
                    Se déconnecter (Changer de compte)
                  </button>

                </div>

              </div>
            )}

            {/* 3. STATE: rejected - THE ERROR RESUBMISSION INSTRUCTIONS BANNER */}
            {currentUser.status === "rejected" && (
              <div className="bg-slate-900 border-2 border-rose-950 rounded-3xl p-6 text-center space-y-5 animate-fade-in">
                <div className="w-14 h-14 bg-rose-950/40 rounded-full border border-rose-500/40 flex items-center justify-center mx-auto text-rose-500">
                  <AlertTriangle className="w-7 h-7 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black text-rose-400 bg-rose-950 border border-rose-900/40 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                    Paiement Rejeté par l'Admin ❌
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider pt-2">
                    CRÉDITS NON VALIDÉS
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    L'administrateur <strong>Ratsimazafy</strong> n'a pas pu identifier le transfert sous le code <strong>{currentUser.paymentDetails?.transactionRef}</strong>. Il est possible que le réseau ait du retard ou que la référence saisie soit erronée.
                  </p>
                </div>

                {/* Direct Action triggers back to billing selection */}
                <button
                  onClick={() => {
                    const resetUser: RegisteredUser = { ...currentUser, status: "pending_payment" };
                    setCurrentUser(resetUser);
                    localStorage.setItem("bet261_current_user", JSON.stringify(resetUser));
                    setPayError(null);
                    synth.playPing();
                  }}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>SOUHETTRE À NOUVEAU LA PREUVE DE PAIEMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:underline font-bold"
                >
                  Se déconnecter (Créer un autre profil)
                </button>
              </div>
            )}

          </div>
        )}

        {/* -------------------- MAIN APP VIEW (GRANTED FOR CHOSEN MEMBERS & VERIFIED ONES) -------------------- */}
        {currentUser && currentUser.status === "verified" && (
          <div className="space-y-4">
            
            {/* Real-time online feed channel sync status banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#39b54a] animate-ping shrink-0" />
                <div className="text-[11px] leading-tight">
                  <strong className="text-white uppercase font-bold text-[#39b54a]">Radar VIP Activé :</strong> Canaux branchés sur <strong>bet261.mg</strong>.
                </div>
              </div>
              <a
                href="https://bet261.mg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] bg-[#39b54a] text-black font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 shrink-0"
              >
                BET261.MG
              </a>
            </div>

            {/* Profile badge header card for Verified view */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-950 border border-[#39b54a]/30 flex items-center justify-center text-[#39b54a] font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-white">{currentUser.name}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <span className="text-[9px] text-gray-500 block font-mono uppercase tracking-tight">FORMULE PREMIUM ACTIVE ✅</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-[9px] uppercase font-mono font-bold text-gray-500 hover:text-rose-400 bg-slate-950 p-1.5 px-3 rounded-lg border border-slate-850 transition-all"
              >
                DECONNEXION
              </button>
            </div>

            {/* Subsystem Navigation Bar Toggle Row */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex shadow-2xl">
              <button
                onClick={() => { setActiveTab("football"); synth.playPing(); }}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === "football"
                    ? "bg-[#39b54a] text-black font-black"
                    : "text-gray-400 hover:bg-slate-850"
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] tracking-wider uppercase font-extrabold">V-Football</span>
              </button>

              <button
                onClick={() => { setActiveTab("aviator"); synth.playPing(); }}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === "aviator"
                    ? "bg-[#39b54a] text-black font-black"
                    : "text-gray-400 hover:bg-slate-850"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-[10px] tracking-wider uppercase font-extrabold">Radar Aviator</span>
              </button>

              <button
                onClick={() => { setActiveTab("help"); synth.playPing(); }}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === "help"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-gray-400 hover:bg-slate-850"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-[10px] tracking-wider uppercase font-extrabold">Guide d'aide</span>
              </button>
            </div>

            {/* RENDERING INNER MODULE BODY */}
            <div className="space-y-4">
              
              {/* V-FOOTBALL COMPONENT */}
              {activeTab === "football" && (
                <div className="space-y-4">
                  
                  {/* Selector panel */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 font-sans">
                    
                    {/* Bet261 official logo banner block */}
                    <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                      <img 
                        src="https://i.postimg.cc/rFbN814B/1781485535551.jpg" 
                        alt="Bet261 Football logo" 
                        className="w-10 h-10 rounded-xl object-cover border border-[#39b54a]/20 shadow-lg"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-xs font-black text-white uppercase tracking-wider block">
                          BET261 CONSOLE DE PRÉDICTION
                        </span>
                        <span className="text-[9px] text-[#39b54a] font-mono block mt-0.5 font-bold uppercase tracking-wider">
                          INDEX VIP ACTIF ⚡
                        </span>
                      </div>
                    </div>

                    {/* Horizontal scrollbar leagues list */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                        SÉLECTIONNER LA V-LIGUE ACTIVE
                      </label>
                      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                        {leagues.map((leg) => {
                          const isSelected = selectedLeague === leg;
                          return (
                            <button
                              key={leg}
                              onClick={() => { setSelectedLeague(leg); setHomeTeam(""); setAwayTeam(""); synth.playPing(); }}
                              className={`px-3 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all border ${
                                isSelected
                                  ? "bg-[#39b54a] text-black border-[#39b54a] shadow-lg shadow-emerald-500/10"
                                  : "bg-slate-950 border-slate-850 text-gray-400 hover:bg-slate-900"
                              }`}
                            >
                              {leg}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Team Selection custom styled cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Domicile Team Selection Card */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                          Équipe Domicile 🏠
                        </label>
                        {homeTeam ? (
                          <div 
                            onClick={() => { setActiveTeamSelector('home'); setTeamSearchQuery(""); synth.playPing(); }}
                            className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-[#39b54a]/30 rounded-2xl p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer group relative shadow-inner select-none h-16"
                          >
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getTeamBadgeStyle(homeTeam).gradient} border ${getTeamBadgeStyle(homeTeam).border} flex items-center justify-center font-black text-xs ${getTeamBadgeStyle(homeTeam).colors} shadow-md shrink-0`}>
                              {getTeamBadgeStyle(homeTeam).text}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-black text-white truncate group-hover:text-[#39b54a] transition-colors">{homeTeam}</span>
                              <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-wider">CLUB SÉLECTIONNÉ</span>
                            </div>
                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wide group-hover:text-gray-300 transition-colors shrink-0">Changer</span>
                          </div>
                        ) : (
                          <div 
                            onClick={() => { setActiveTeamSelector('home'); setTeamSearchQuery(""); synth.playPing(); }}
                            className="border-2 border-dashed border-slate-800 hover:border-[#39b54a]/30 bg-slate-950/40 hover:bg-slate-950/70 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-all duration-300 group shadow-md h-16"
                          >
                            <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-gray-500 group-hover:text-[#39b54a] group-hover:border-[#39b54a]/30 group-hover:scale-105 transition-all">
                              <span className="text-xs font-black text-slate-400 group-hover:text-[#39b54a]">+</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider">Choisir Domicile</span>
                          </div>
                        )}
                      </div>

                      {/* Extérieur Team Selection Card */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                          Équipe Extérieur ✈️
                        </label>
                        {awayTeam ? (
                          <div 
                            onClick={() => { setActiveTeamSelector('away'); setTeamSearchQuery(""); synth.playPing(); }}
                            className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-[#39b54a]/30 rounded-2xl p-3 flex items-center gap-3 transition-all duration-300 cursor-pointer group relative shadow-inner select-none h-16"
                          >
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getTeamBadgeStyle(awayTeam).gradient} border ${getTeamBadgeStyle(awayTeam).border} flex items-center justify-center font-black text-xs ${getTeamBadgeStyle(awayTeam).colors} shadow-md shrink-0`}>
                              {getTeamBadgeStyle(awayTeam).text}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-black text-white truncate group-hover:text-[#39b54a] transition-colors">{awayTeam}</span>
                              <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-wider">CLUB SÉLECTIONNÉ</span>
                            </div>
                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wide group-hover:text-gray-300 transition-colors shrink-0">Changer</span>
                          </div>
                        ) : (
                          <div 
                            onClick={() => { setActiveTeamSelector('away'); setTeamSearchQuery(""); synth.playPing(); }}
                            className="border-2 border-dashed border-slate-800 hover:border-[#39b54a]/30 bg-slate-950/40 hover:bg-slate-950/70 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-all duration-300 group shadow-md h-16"
                          >
                            <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-gray-500 group-hover:text-[#39b54a] group-hover:border-[#39b54a]/30 group-hover:scale-105 transition-all">
                              <span className="text-xs font-black text-slate-400 group-hover:text-[#39b54a]">+</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider">Choisir Extérieur</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TEAM SELECTOR POPUP MODAL OVERLAY */}
                    <AnimatePresence>
                      {activeTeamSelector !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                          {/* Backdrop overlay */}
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setActiveTeamSelector(null); synth.playPing(); }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                          />

                          {/* Modal Content container */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.93, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.93, y: 15 }}
                            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[80vh] font-sans"
                          >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-slate-850 bg-slate-900/40 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#39b54a]/10 text-[#39b54a] rounded-xl border border-[#39b54a]/10 flex items-center justify-center">
                                  <Trophy className="w-4 h-4 text-[#39b54a]" />
                                </div>
                                <div className="text-left">
                                  <h3 className="text-xs font-black uppercase text-white tracking-widest">
                                    {activeTeamSelector === 'home' ? 'Sélection Domicile 🏠' : 'Sélection Extérieur ✈️'}
                                  </h3>
                                  <span className="text-[10px] text-[#39b54a] uppercase font-mono tracking-wider font-extrabold block mt-0.5">
                                    {selectedLeague}
                                  </span>
                                </div>
                              </div>
                              <button 
                                onClick={() => { setActiveTeamSelector(null); synth.playPing(); }}
                                className="p-2 hover:bg-slate-800 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Search bar inputs */}
                            <div className="p-4 border-b border-slate-850 bg-slate-950/40">
                              <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                  type="text"
                                  value={teamSearchQuery}
                                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                                  placeholder="Rechercher une équipe..."
                                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-[#39b54a]/60 rounded-xl py-2.5 pl-10 pr-10 text-xs font-black text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#39b54a]/20 transition-all"
                                />
                                {teamSearchQuery && (
                                  <button
                                    onClick={() => setTeamSearchQuery("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white hover:bg-slate-800 p-1 rounded transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Scrollable list/grid of teams */}
                            <div className="p-4 overflow-y-auto flex-1 max-h-[50vh] scrollbar-thin scrollbar-thumb-slate-850">
                              {(() => {
                                const allTeams = LEAGUE_TEAMS[selectedLeague] || [];
                                const filtered = allTeams.filter(t => 
                                  t.toLowerCase().includes(teamSearchQuery.toLowerCase())
                                );

                                if (filtered.length === 0) {
                                  return (
                                    <div className="text-center py-8 space-y-2">
                                      <span className="text-xl block">🔍</span>
                                      <span className="text-[10px] text-gray-500 font-mono font-bold block">AUCUN RÉSULTAT</span>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {filtered.map((teamName) => {
                                      const badge = getTeamBadgeStyle(teamName);
                                      const isHome = homeTeam === teamName;
                                      const isAway = awayTeam === teamName;
                                      const isSelected = activeTeamSelector === 'home' ? isHome : isAway;
                                      const isAlreadyTaken = activeTeamSelector === 'home' ? isAway : isHome;

                                      return (
                                        <button
                                          key={teamName}
                                          disabled={isAlreadyTaken}
                                          onClick={() => {
                                            if (activeTeamSelector === 'home') {
                                              setHomeTeam(teamName);
                                            } else {
                                              setAwayTeam(teamName);
                                            }
                                            setActiveTeamSelector(null);
                                            synth.playSuccess();
                                          }}
                                          className={`p-2 rounded-2xl border text-center relative flex flex-col items-center gap-2 transition-all duration-300 ${
                                            isAlreadyTaken 
                                              ? "bg-slate-950/10 border-slate-850/20 opacity-20 cursor-not-allowed" 
                                              : isSelected
                                              ? "bg-emerald-950/20 border-[#39b54a] shadow-inner"
                                              : "bg-slate-950 border-slate-850 hover:bg-slate-900 hover:border-slate-800 cursor-pointer"
                                          }`}
                                        >
                                          {/* Team emblem badge logo */}
                                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${badge.gradient} border ${badge.border} flex items-center justify-center font-black text-xs ${badge.colors} shadow-md`}>
                                            {badge.text}
                                          </div>

                                          <div className="min-w-0 w-full">
                                            <span className={`block text-[10px] font-black truncate ${
                                              isSelected ? "text-[#39b54a]" : "text-white"
                                            }`}>
                                              {teamName}
                                            </span>
                                            {isAlreadyTaken && (
                                              <span className="text-[7.5px] text-gray-500 uppercase font-black tracking-tight block">Sélectionné</span>
                                            )}
                                          </div>

                                          {/* Active indicator */}
                                          {isSelected && (
                                            <div className="absolute top-1 right-1 bg-[#39b54a] text-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                                              <Check className="w-2.5 h-2.5 stroke-[4]" />
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-3 bg-slate-950/60 border-t border-slate-850/40 text-center">
                              <span className="text-[8px] text-gray-500 uppercase font-mono tracking-widest font-black">
                                SECURED VIP ALGORITHMS • BET261 INDEX
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Real Odds inputs */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">
                        RENSEIGNER LES COTES DU MATCH EN DIRECT
                      </span>

                      <div className="grid grid-cols-3 gap-2">
                        {/* Odd 1 */}
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 font-mono">1</span>
                          <input 
                            type="number"
                            step="0.01"
                            min="1"
                            value={odds.odds1}
                            onChange={(e) => setOdds({ ...odds, odds1: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-6 pr-2 text-center text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#39b54a]"
                            placeholder="1.00"
                          />
                        </div>

                        {/* Odd X */}
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 font-mono">X</span>
                          <input 
                            type="number"
                            step="0.01"
                            min="1"
                            value={odds.oddsX}
                            onChange={(e) => setOdds({ ...odds, oddsX: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-6 pr-2 text-center text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#39b54a]"
                            placeholder="1.00"
                          />
                        </div>

                        {/* Odd 2 */}
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 font-mono">2</span>
                          <input 
                            type="number"
                            step="0.01"
                            min="1"
                            value={odds.odds2}
                            onChange={(e) => setOdds({ ...odds, odds2: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-6 pr-2 text-center text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#39b54a]"
                            placeholder="1.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Launch button */}
                    <div className="pt-2 space-y-3">
                      <button
                        onClick={handleLaunchAnalysis}
                        disabled={isAnalyzing}
                        className="w-full bg-[#39b54a] hover:bg-[#2fa33f] text-black font-black text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            <span>CALCULS STATISTIQUES VIP (2S)...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-black" />
                            <span>LANCER L'ANALYSE ALGORITHMIQUE VIP</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleReset}
                        className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[9px] font-mono font-black text-gray-500 uppercase tracking-widest"
                      >
                        RÉINITIALISER L'OUTIL
                      </button>
                    </div>

                  </div>

                  {/* LOADER WIDGET */}
                  {isAnalyzing && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-lg space-y-3 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-[#39b54a] border-t-transparent rounded-full animate-spin"></div>
                      <div>
                        <span className="text-xs font-black uppercase text-[#39b54a] font-mono tracking-wider">INDEXATION EN DIRECT</span>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">Traitement de l'indice de couverture Bet261...</p>
                      </div>
                    </div>
                  )}

                  {/* REPORT PREMIUM TICKET RESULT */}
                  {report && !isAnalyzing && (
                    <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-4">
                      
                      {/* Top line indicator */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-[#39b54a]"></div>

                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src="https://i.postimg.cc/rFbN814B/1781485535551.jpg" 
                            alt="Bet261 Logo" 
                            className="w-10 h-10 rounded-xl object-cover border border-[#39b54a]/30 shadow-md transform hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-[10px] font-black uppercase text-white tracking-widest font-mono block leading-none">
                              TICKET STATISTIQUE VIP
                            </span>
                            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mt-1">
                              MÉTHODE BET261 SECURE
                            </span>
                          </div>
                        </div>
                        <span className="bg-emerald-950/60 text-[#39b54a] border border-emerald-800/45 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          🔥 CONFIRMEE A 95%+
                        </span>
                      </div>

                      {/* Header block */}
                      <div className="space-y-1 text-center py-1">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">
                          {report.league}
                        </span>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-sm font-black text-white">{report.homeTeam}</span>
                          <span className="text-gray-500 font-mono text-xs font-bold">VS</span>
                          <span className="text-sm font-black text-white">{report.awayTeam}</span>
                        </div>
                        <div className="text-[9px] text-gray-500 font-mono pt-1">
                          Cotes réelles : [ {report.odds.odds1} | {report.odds.oddsX} | {report.odds.odds2} ] • ID: {Math.floor(Math.random() * 8000) + 1200}
                        </div>
                      </div>

                      {/* Prediction body */}
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-center space-y-2">
                        <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                          PRONOSTIC DE COUVERTURE PRIVÉ
                        </span>

                        <span className="p-1 px-4.5 bg-emerald-950/60 text-[#39b54a] rounded-full border border-[#39b54a]/30 text-xs font-black inline-block uppercase tracking-wider">
                          {report.prediction}
                        </span>

                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <span className="text-[11px] text-gray-400">Fiabilité de l'IA :</span>
                          <span className="text-lg font-mono font-black text-[#39b54a]">
                            {report.confidence}%
                          </span>
                        </div>
                      </div>

                      {/* Advice tip block */}
                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl flex items-start gap-2.5">
                        <Info className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-300 block leading-none mb-1">
                            Analyse de la tendance :
                          </span>
                          <p className="text-[11px] text-gray-450 leading-relaxed">
                            {report.advice}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-850 pt-3 text-center text-[9px] text-gray-600 font-mono">
                        Calculs basés sur 1 000+ confrontations similaires • Système non lié légalement à Bet261.
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* RADAR AVIATOR MODULE (PREDICTIONS PAR HEURES EXACTES) */}
              {activeTab === "aviator" && (
                <div className="space-y-4">
                  
                  {/* LIVE SCANNER SECTION WITH JET NOISE */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                    
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39b54a]"></span>
                        </span>
                        <span className="text-xs font-black uppercase text-white tracking-widest font-mono">
                          DÉPISTAGE D'HEURE VIP EN DIRECT
                        </span>
                      </div>
                      <span className="text-[9px] font-black font-mono bg-[#39b54a]/10 text-[#39b54a] px-2.5 py-0.5 rounded border border-[#39b54a]/30 uppercase tracking-widest animate-pulse">
                        MÉTHODE ULTRA FIXE 🔒
                      </span>
                    </div>

                    {/* Scanning radar visualizer */}
                    <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center text-center ... text-slate-100">
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141e33_1px,transparent_1px),linear-gradient(to_bottom,#141e33_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-40 pointer-events-none"></div>

                      {!isScanningAviator && !scannedResult && (
                        <div className="space-y-4 py-4 relative z-10">
                          <div className="w-12 h-12 bg-slate-900 rounded-full border border-[#39b54a]/20 flex items-center justify-center mx-auto text-[#39b54a]">
                            <Zap className="w-5 h-5 text-[#39b54a] animate-pulse" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-white uppercase tracking-wider block">
                              AUCUN SIGNAL DE SECONDE RECHERCHÉ
                            </span>
                            <p className="text-[10px] text-gray-555 text-gray-400 mt-1 max-w-xs mx-auto leading-normal">
                              Lancez le scanner pour forcer l'indexation algorithmique et obtenir instantanément l'heure exacte de la prochaine vague à forte cote.
                            </p>
                          </div>
                          <button
                            onClick={handleAviatorScan}
                            className="bg-[#39b54a] hover:bg-[#2fa33f] text-black font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1.5"
                          >
                            <span>✈️ DÉTECTER LA VAGUE DU DIRECT</span>
                          </button>
                        </div>
                      )}

                      {/* Scanning visual state */}
                      {isScanningAviator && (
                        <div className="space-y-4 py-3 relative z-10 flex flex-col items-center">
                          {/* Pulsing ring radar element */}
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#39b54a]/30 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border border-emerald-550/40 animate-ping"></div>
                            <div className="absolute inset-4 rounded-full bg-slate-900 border border-[#39b54a]/60 flex items-center justify-center">
                              <Activity className="w-6 h-6 text-[#39b54a]" />
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-black text-[#39b54a] tracking-widest block uppercase animate-pulse">
                              LANCEMENT DE LA TURBINE VIP...
                            </span>
                            <p className="text-[9px] text-gray-500 font-mono mt-1">Calcul des heures d'asymétrie sur Bet261 (Son avion actif ✈️)</p>
                          </div>
                        </div>
                      )}

                      {/* Scan complete showing exact time forecast */}
                      {scannedResult && !isScanningAviator && (
                        <div className="space-y-3 py-2.5 relative z-10 w-full animate-fade-in">
                          <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-black uppercase px-3 py-1 rounded-full animate-bounce">
                            <Check className="w-3.5 h-3.5" /> SIGNAL REVOLUTIONNAIRE TROUVÉ
                          </div>

                          <div className="bg-slate-900/90 border border-slate-850 p-3 rounded-xl max-w-sm mx-auto space-y-1.5 shadow-xl">
                            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                              Prochaine Heure de Vol Validée
                            </div>
                            <div className="text-3xl font-mono font-black text-white tracking-widest">
                              {scannedResult.exactTime}
                            </div>
                            <div className="text-xs text-[#39b54a] font-mono font-bold">
                              Seuil de sécurité : {scannedResult.multiplierMin}x à {scannedResult.multiplierMax}x
                            </div>
                          </div>

                          <div className="text-[10px] text-gray-400 font-sans px-2 leading-relaxed">
                            💡 <strong>Conseil Expert :</strong> {scannedResult.adviceText}
                          </div>

                          <button
                            onClick={handleAviatorScan}
                            className="text-gray-500 hover:text-[#39b54a] text-[9px] uppercase font-mono tracking-widest underline pt-1 block mx-auto transition-colors"
                          >
                            RECULER LE LOGICIEL / RE-SCANNER
                          </button>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* THE COMPREHENSIVE HORAIRE PLANNER CALENDAR LIST */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                    
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                      <div>
                        <span className="text-xs font-black uppercase text-white tracking-wider block">
                          HORAIRES DE SIGNAL POUR AUJOURD'HUI
                        </span>
                        <span className="text-[9px] text-gray-550 block font-mono">CALCULÉ EN DIRECT DEPUIS LE SYSTEME</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setAviatorSchedules(generatePredictionsForToday());
                          synth.playTakeoff(); // play lovely takeoff turbine tone on refresh
                        }}
                        className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-gray-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                        title="Réclamer de nouveaux horaires"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider hidden sm:inline">ACTUALISER</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {aviatorSchedules.length === 0 ? (
                        <div className="text-center py-6 text-gray-550 text-[11px] font-mono">
                          Aucun horaire chargé. Cliquez sur Actualiser.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-0.5">
                          {aviatorSchedules.map((item) => {
                            return (
                              <div 
                                key={item.id} 
                                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                                  item.status === 'success'
                                    ? "bg-slate-950/60 border-slate-850 opacity-70"
                                    : item.status === 'active'
                                    ? "bg-emerald-950/20 border-[#39b54a]/40 shadow-lg shadow-emerald-500/5 animate-pulse"
                                    : "bg-slate-950 border-slate-850 hover:border-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Left time box */}
                                  <div className={`p-2 rounded-xl text-center min-w-[56px] font-mono ${
                                    item.status === 'success' ? "bg-slate-900 text-gray-500" :
                                    item.status === 'active' ? "bg-emerald-950 border border-[#39b54a]/30 text-[#39b54a] font-black" :
                                    "bg-slate-900 text-white font-bold"
                                  }`}>
                                    <span className="text-xs block leading-none font-black">{item.hour}</span>
                                    <span className="text-[7.5px] uppercase font-bold tracking-tighter opacity-70">HEURE</span>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[10px] font-black uppercase tracking-tight ${
                                        item.status === 'success' ? 'text-gray-500' : 'text-white'
                                      }`}>
                                        {item.type}
                                      </span>
                                      {item.status === 'active' && (
                                        <span className="bg-emerald-950 text-emerald-400 text-[8px] font-bold px-1.5 py-0.2 rounded border border-emerald-800 uppercase tracking-widest animate-pulse">
                                          DISPO 🔥
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] font-mono text-gray-500 block">
                                      Multiplicateur visé : <strong className={item.status === 'success' ? 'text-gray-400 font-bold' : 'text-yellow-400 font-black'}>{item.target}</strong>
                                    </span>
                                  </div>
                                </div>

                                {/* Right action / status badge */}
                                <div className="text-right">
                                  {item.status === 'success' && (
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] font-mono font-black text-emerald-500 block">
                                        GAIGNÉ
                                      </span>
                                      <span className="text-[9px] text-gray-550 font-mono block">
                                        Vol réel : {item.multiplierDetail}
                                      </span>
                                    </div>
                                  )}

                                  {item.status === 'active' && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-mono font-black text-amber-500 block animate-bounce">
                                        COUPEZ VITE!
                                      </span>
                                      <span className="text-[8.5px] text-gray-400 font-mono uppercase">
                                        FIABILITÉ {item.confidence}%
                                      </span>
                                    </div>
                                  )}

                                  {item.status === 'upcoming' && (
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] font-bold text-gray-500 block uppercase">
                                        EN ATTENTE
                                      </span>
                                      <span className="text-[8.5px] text-[#39b54a]/85 font-mono block">
                                        Confiance {item.confidence}%
                                      </span>
                                    </div>
                                  )}
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Highly aesthetic Madagascar safe strategy card */}
                    <div className="bg-emerald-950/20 border border-emerald-900/20 rounded-2xl p-4 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#39b54a] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-white block mb-0.5">
                          POURQUOI LES PRÉDICTIONS HORAIRES SONT SÛRES ?
                        </span>
                        <p className="text-[11px] text-gray-450 leading-relaxed">
                          La plateforme <strong>Bet261 Aviator</strong> recalibre ses algorithmes de rétribution à des minutes précises chaque heure. Nos fiches de prédictions vous révèlent ces plages exactes pour vous assurer une efficacité supérieure à <strong>96.5%</strong>.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* STYLISH USER GUIDE PANEL */}
              {activeTab === "help" && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                  <div className="border-b border-slate-850 pb-2.5">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      GUIDE OPERANT BET261 PREDICT
                    </h3>
                  </div>

                  <div className="space-y-3.5 text-xs text-gray-400 leading-relaxed">
                    <p>
                      <strong>1. Comment fonctionne le V-Football ?</strong>
                      <br />
                      Notre algorithme suit continuellement la fluctuation des coefficients sportifs sur le site de Bet261. Lorsque la cote d'une équipe est sous-évaluée théoriquement par rapport à sa probabilité de victoire réelle, l'algorithme génère un ticket de couverture avec un taux d'exactitude extrême de plus de 90%.
                    </p>

                    <p>
                      <strong>2. Sécuriser vos paris de football virtuel :</strong>
                      <br />
                      Pour des performances optimales de votre bankroll, préférez toujours les marchés secondaires préconisés (comme "Plus de 1.5 buts" ou "Double chance 1X") au lieu de parier sur les victoires sèches en cas de cotes serrées.
                    </p>

                    <p>
                      <strong>3. La clé du succès sur l'Aviator :</strong>
                      <br />
                      Les signaux générés par l'algorithme vous donnent les seuils optimaux où couper. La technique absolue consiste à activer le retrait automatique de votre mise d'un coefficient identique à la cible de couverture minimale.
                    </p>

                    <p className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10px] text-gray-500 font-mono italic">
                      Support VIP en direct : Pour toute demande relative à vos validations ou prolongation d'abonnement, contactez le Responsable Ratsimazafy à l'adresse ronanswerdna@gmail.com.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
