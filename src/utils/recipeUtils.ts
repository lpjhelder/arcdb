import { Item } from '../types/Item';

/**
 * Builds a reverse recipe index mapping ingredient IDs to items that use them in recipes.
 * This allows quick lookup of "what can I craft with this material?"
 *
 * @param items - Array of all items in the game
 * @returns Map where key is ingredient ID and value is array of item IDs that require it
 */
export function buildReverseRecipeIndex(items: Item[]): Map<string, string[]> {
  const reverseIndex = new Map<string, string[]>();

  for (const item of items) {
    if (!item.recipe) continue;

    // For each ingredient in this item's recipe
    for (const ingredientId of Object.keys(item.recipe)) {
      // Add this item to the list of items that use this ingredient
      const usedBy = reverseIndex.get(ingredientId) || [];
      usedBy.push(item.id);
      reverseIndex.set(ingredientId, usedBy);
    }
  }

  return reverseIndex;
}

/**
 * Gets all items that can be crafted using the specified ingredient.
 *
 * @param ingredientId - The ID of the ingredient/material
 * @param reverseIndex - The reverse recipe index map
 * @param allItems - Array of all items (to get full item objects)
 * @returns Array of items that require this ingredient in their recipe
 */
export function getItemsUsingIngredient(
  ingredientId: string,
  reverseIndex: Map<string, string[]>,
  allItems: Item[]
): Item[] {
  const itemIds = reverseIndex.get(ingredientId) || [];
  return itemIds
    .map(id => allItems.find(item => item.id === id))
    .filter((item): item is Item => item !== undefined);
}

/**
 * Gets the quantity of an ingredient needed for a specific recipe.
 *
 * @param item - The item with the recipe
 * @param ingredientId - The ingredient to look up
 * @returns Quantity needed, or 0 if not in recipe
 */
export function getRecipeQuantity(item: Item, ingredientId: string): number {
  return item.recipe?.[ingredientId] || 0;
}

/**
 * Checks if an item is a blueprint (not recyclable).
 *
 * @param item - The item to check
 * @returns true if the item is a blueprint
 */
export function isBlueprint(item: Item): boolean {
  return item.type.toLowerCase().includes('blueprint');
}
