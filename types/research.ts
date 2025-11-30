export interface ResearchStage {
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp?: string;
}

export interface ResearchCost {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  totalCost: number;
  promptCost: number;
  completionCost: number;
}

export interface ResearchRequest {
  id: string;
  query: string;
  title?: string;
  userId?: string;
  username?: string;
  content?: string;
  tags?: string[];
  stars?: number;
  starredBy?: string[];
  status: 'running' | 'completed' | 'failed';
  cost?: ResearchCost;
  timestamp: string;
  updatedAt: string;
  stages: ResearchStage[];
  currentStage?: string;
  progress: number; // 0-100
  entitiesFound?: number;
  queriesExecuted?: number;
}
