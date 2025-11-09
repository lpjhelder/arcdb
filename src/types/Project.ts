export interface ProjectRequirement {
  itemId: string;
  quantity: number;
}

export interface ProjectPhase {
  phase: number;
  name?: Record<string, string>;
  requirementItemIds?: ProjectRequirement[];
}

export interface Project {
  id: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  requirements?: ProjectRequirement[];  // Legacy format
  phases?: ProjectPhase[];  // Actual format from data
  unlocks?: string[];
}
