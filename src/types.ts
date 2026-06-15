export interface RegisteredUser {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending_payment' | 'pending_verification' | 'verified' | 'rejected';
  paymentDetails?: {
    network: 'MVOLA' | 'AIRTEL';
    senderPhone: string;
    transactionRef: string;
    planName: string;
    price: number;
    submittedAt: string;
  };
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
  sentReal: boolean;
}

export interface SimulatedSms {
  id: string;
  to: string;
  text: string;
  sentAt: string;
}

export interface MatchPrediction {
  id: string;
  league: string;
  matchTime: string;
  teamHome: string;
  teamAway: string;
  teamHomeFlag: string;
  teamAwayFlag: string;
  prediction: string;
  odds: number;
  confidence: number;
  status: 'upcoming' | 'live' | 'finished';
  score?: string;
  timeLabel?: string; // e.g. "1ère Mi-temps"
}

export interface AviatorSignal {
  id: string;
  timestamp: string;
  targetMin: number;
  targetMax: number;
  confidence: number;
  status: 'success' | 'failed' | 'pending';
  actualMultiplier?: number;
}

export interface VipPlan {
  id: string;
  title: string;
  description: string;
  priceMGA: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
}
