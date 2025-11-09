export interface QuestRequirement {
  type: string;
  itemId?: string;
  quantity?: number;
  value?: number | string;
}

export interface QuestReward {
  type: string;
  itemId?: string;
  quantity?: number;
  value?: number;
}

export interface Quest {
  id: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  requirements?: QuestRequirement[];
  rewards?: QuestReward[];
  rewardItemIds?: Array<{itemId: string; quantity: number}>;
  questGiver?: string;
  unlocks?: string[];
  xp?: number;
  updatedAt?: string;
  previousQuestIds?: string[];
  nextQuestIds?: string[];
}
