export type NetworkMode = 'CLOUD' | 'EDGE_LIQUID';

export enum ReportCategory {
  SAFETY = 'SAFETY',
  MEDICAL = 'MEDICAL',
  VIBE = 'VIBE',
  LOGISTICS = 'LOGISTICS',
  UNKNOWN = 'UNKNOWN'
}

export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Report {
  id: string;
  timestamp: number;
  text: string;
  location: string; // e.g., "Section 102"
  category: ReportCategory;
  threatLevel: ThreatLevel;
  status: 'pending' | 'analyzed' | 'broadcasted';
  author: string;
  upvotes: number;
  tips: number; // Amount tipped to this reporter
}

export interface Alert {
  id: string;
  message: string;
  level: ThreatLevel;
  timestamp: number;
  audioUrl?: string; // Blob URL for TTS
}

export interface StadiumZone {
  id: string;
  name: string;
  reports: number;
  threatLevel: ThreatLevel;
}