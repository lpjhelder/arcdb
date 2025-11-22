/**
 * Inventory System Types
 * Sistema de inventário virtual que pode ser populado via OCR ou manualmente
 */

export interface InventoryItem {
  itemId: string;
  quantity: number;
  lastUpdated: number; // timestamp
  source: 'ocr' | 'manual' | 'imported'; // como foi adicionado
}

export interface Inventory {
  items: Map<string, InventoryItem>;
  lastSync: number; // última vez que foi atualizado
  totalValue: number; // valor total em moedas
  totalWeight: number; // peso total
}

export interface CraftingAnalysis {
  canCraft: CraftableItem[];
  missingMaterials: MissingMaterial[];
  safeToSell: string[]; // IDs de itens que podem ser vendidos
  keepForCrafting: KeepItem[]; // Itens que devem guardar
}

export interface CraftableItem {
  itemId: string;
  itemName: string;
  canMakeQuantity: number; // quantas vezes pode craftar
  requiredItems: { itemId: string; required: number; have: number }[];
  profitable: boolean; // se vale a pena craftar (valor final > materiais)
}

export interface MissingMaterial {
  itemId: string;
  itemName: string;
  needed: number;
  have: number;
  missing: number;
  forRecipe: string; // nome do item que quer craftar
}

export interface KeepItem {
  itemId: string;
  itemName: string;
  quantity: number;
  reasons: string[]; // por que guardar (quest, crafting, etc)
}

export interface OCRImportData {
  timestamp: number;
  screenshot?: string; // base64 da imagem (opcional)
  items: Array<{
    name: string; // nome detectado pelo OCR
    quantity: number;
    confidence?: number; // confiança do OCR (0-1)
  }>;
}
