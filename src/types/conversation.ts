export type ConversationState = 'setup' | 'conversation' | 'evaluation';

export type ScenarioType =
  | 'airport'
  | 'coffee-shop'
  | 'restaurant'
  | 'tourist-info'
  | 'hotel-checkin'
  | 'shopping';

export interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: number;
  audioUrl?: string;
}

export interface Scenario {
  id: ScenarioType;
  title: string;
  titleKr: string;
  icon: string;
  description: string;
  aiPrompt: string;
  backgroundColor: string;
}

export interface ConversationEvaluation {
  pronunciationScore: number;
  grammarScore: number;
  vocabularyScore: number;
  communicationScore: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
}

export interface ConversationSession {
  id: string;
  scenario: ScenarioType;
  messages: Message[];
  turnCount: number;
  startTime: number;
  endTime?: number;
  evaluation?: ConversationEvaluation;
}
