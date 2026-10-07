export type FormationType = '4-3-3' | '3-2-4-1' | '4-2-3-1' | '5-3-2' | '4-4-2 Diamond' | '3-4-2-1';

export type TeamSide = 'home' | 'away';

export interface PlayerNode {
  id: string;
  number: number;
  name: string;
  role: string;
  team: TeamSide;
  x: number; // 0 to 100% of pitch width
  y: number; // 0 to 100% of pitch height
  velocity?: { vx: number; vy: number };
  fatigue?: number; // 0 - 100
  pressRating?: number; // 0 - 100
}

export type OverlayMode = 'voronoi' | 'passing-lanes' | 'pressing-heat' | 'compactness' | 'none';

export interface TacticalScenario {
  id: string;
  title: string;
  year: number;
  competition: string;
  matchContext: string;
  homeTeam: string;
  awayTeam: string;
  homeFormation: FormationType;
  awayFormation: FormationType;
  homeScore: number;
  awayScore: number;
  minute: number;
  keyTacticalChallenge: string;
  initialHomePlayers: PlayerNode[];
  initialAwayPlayers: PlayerNode[];
}

export interface BiomechanicalLandmark {
  name: string;
  currentValue: number;
  optimalValue: number;
  unit: string;
  status: 'optimal' | 'suboptimal' | 'critical';
  description: string;
}

export interface DrillPlan {
  id: string;
  title: string;
  category: 'High-Press Resistance' | 'Biomechanic Strike Calibration' | 'Rest-Defense Stabilization' | 'Half-Space Overload';
  duration: string;
  intensity: 'High' | 'Extreme' | 'Moderate';
  isaacSimCycles: string;
  focusKinematic: string;
  setupDimensions: string;
  coachingPoints: string[];
  equipmentNeeded: string[];
  biomechanicalBenefits: string[];
}

export interface SimulationResult {
  runs: number;
  simulatedVirtualYears: number;
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  metrics: {
    xGHome: number;
    xGAway: number;
    ppdaHome: number;
    ppdaAway: number;
    cuOptPassingEfficiency: number;
    restDefenseRating: string;
  };
  agentDebate: {
    agent: string;
    stance: string;
    argument: string;
  }[];
  nexusSynthesis: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  source?: string;
  metricsTable?: boolean;
}

export interface AudioBlendshapes {
  jawOpen: number;
  mouthPucker: number;
  browInnerUp: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  smileLeft: number;
  smileRight: number;
  cheekPuff: number;
}
