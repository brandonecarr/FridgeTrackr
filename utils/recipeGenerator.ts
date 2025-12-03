import { Item, Recipe, RecipeIngredient, RecipePreferences, MealType, PrepTime } from '@/types';
import { differenceInDays } from 'date-fns';
import { generateId } from './helpers';

/**
 * Sample recipe database
 * In a real app, this would come from an API or local database
 */
const SAMPLE_RECIPES: Omit<Recipe, 'id' | 'createdAt'>[] = [
  {
    title: 'Quick Scrambled Eggs',
    description: 'Simple and protein-rich breakfast ready in minutes',
    mealType: ['breakfast'],
    prepTime: 'under_20',
    servings: 2,
    imageUrl: undefined,
    ingredients: [
      { name: 'eggs', quantity: 4, unit: 'item', isAvailable: false },
      { name: 'butter', quantity: 1, unit: 'tbsp', isAvailable: false },
      { name: 'milk', quantity: 2, unit: 'tbsp', isAvailable: false },
      { name: 'salt', quantity: 1, unit: 'pinch', isAvailable: false },
      { name: 'pepper', quantity: 1, unit: 'pinch', isAvailable: false },
    ],
    instructions: [
      'Crack eggs into a bowl and whisk with milk, salt, and pepper',
      'Heat butter in a non-stick pan over medium heat',
      'Pour in egg mixture and gently stir with a spatula',
      'Cook for 2-3 minutes until eggs are soft and creamy',
      'Remove from heat and serve immediately',
    ],
  },
  {
    title: 'Classic Chicken Stir-Fry',
    description: 'Colorful vegetable and chicken stir-fry with savory sauce',
    mealType: ['lunch', 'dinner'],
    prepTime: '20_to_40',
    servings: 4,
    imageUrl: undefined,
    ingredients: [
      { name: 'chicken breast', quantity: 1, unit: 'lb', isAvailable: false },
      { name: 'bell pepper', quantity: 2, unit: 'item', isAvailable: false },
      { name: 'broccoli', quantity: 2, unit: 'cup', isAvailable: false },
      { name: 'soy sauce', quantity: 3, unit: 'tbsp', isAvailable: false },
      { name: 'garlic', quantity: 3, unit: 'clove', isAvailable: false },
      { name: 'ginger', quantity: 1, unit: 'tsp', isAvailable: false },
      { name: 'rice', quantity: 2, unit: 'cup', isAvailable: false },
    ],
    instructions: [
      'Cook rice according to package directions',
      'Cut chicken into bite-sized pieces',
      'Chop vegetables into similar-sized pieces',
      'Heat oil in a large wok or skillet over high heat',
      'Cook chicken until golden, about 5 minutes',
      'Add garlic and ginger, cook for 30 seconds',
      'Add vegetables and stir-fry for 3-4 minutes',
      'Add soy sauce and toss to coat',
      'Serve hot over rice',
    ],
  },
  {
    title: 'Fresh Garden Salad',
    description: 'Crisp and refreshing salad with homemade vinaigrette',
    mealType: ['lunch', 'dinner'],
    prepTime: 'under_20',
    servings: 4,
    imageUrl: undefined,
    ingredients: [
      { name: 'lettuce', quantity: 1, unit: 'head', isAvailable: false },
      { name: 'tomato', quantity: 2, unit: 'item', isAvailable: false },
      { name: 'cucumber', quantity: 1, unit: 'item', isAvailable: false },
      { name: 'carrot', quantity: 1, unit: 'item', isAvailable: false },
      { name: 'olive oil', quantity: 3, unit: 'tbsp', isAvailable: false },
      { name: 'vinegar', quantity: 1, unit: 'tbsp', isAvailable: false },
    ],
    instructions: [
      'Wash and chop all vegetables',
      'Mix olive oil and vinegar for dressing',
      'Toss vegetables together in a large bowl',
      'Drizzle with dressing just before serving',
      'Season with salt and pepper to taste',
    ],
  },
  {
    title: 'Creamy Tomato Pasta',
    description: 'Rich and comforting pasta with creamy tomato sauce',
    mealType: ['lunch', 'dinner'],
    prepTime: '20_to_40',
    servings: 4,
    imageUrl: undefined,
    ingredients: [
      { name: 'pasta', quantity: 1, unit: 'lb', isAvailable: false },
      { name: 'tomato', quantity: 4, unit: 'item', isAvailable: false },
      { name: 'heavy cream', quantity: 1, unit: 'cup', isAvailable: false },
      { name: 'garlic', quantity: 4, unit: 'clove', isAvailable: false },
      { name: 'onion', quantity: 1, unit: 'item', isAvailable: false },
      { name: 'basil', quantity: 10, unit: 'leaves', isAvailable: false },
      { name: 'parmesan cheese', quantity: 0.5, unit: 'cup', isAvailable: false },
    ],
    instructions: [
      'Cook pasta according to package directions',
      'Dice onion and mince garlic',
      'Sauté onion and garlic in olive oil until soft',
      'Add chopped tomatoes and cook until broken down',
      'Stir in heavy cream and simmer for 5 minutes',
      'Toss cooked pasta with sauce',
      'Top with fresh basil and parmesan',
    ],
  },
  {
    title: 'Grilled Cheese Sandwich',
    description: 'Classic comfort food with melted cheese',
    mealType: ['lunch', 'snack'],
    prepTime: 'under_20',
    servings: 1,
    imageUrl: undefined,
    ingredients: [
      { name: 'bread', quantity: 2, unit: 'slice', isAvailable: false },
      { name: 'cheese', quantity: 2, unit: 'slice', isAvailable: false },
      { name: 'butter', quantity: 1, unit: 'tbsp', isAvailable: false },
    ],
    instructions: [
      'Butter one side of each bread slice',
      'Place cheese between bread slices (buttered sides out)',
      'Heat pan over medium heat',
      'Cook sandwich until golden brown on both sides',
      'Cheese should be melted in the middle',
    ],
  },
  {
    title: 'Veggie Omelette',
    description: 'Fluffy egg omelette packed with fresh vegetables',
    mealType: ['breakfast', 'lunch'],
    prepTime: 'under_20',
    servings: 1,
    imageUrl: undefined,
    ingredients: [
      { name: 'eggs', quantity: 3, unit: 'item', isAvailable: false },
      { name: 'bell pepper', quantity: 0.5, unit: 'item', isAvailable: false },
      { name: 'onion', quantity: 0.25, unit: 'item', isAvailable: false },
      { name: 'mushroom', quantity: 3, unit: 'item', isAvailable: false },
      { name: 'cheese', quantity: 0.25, unit: 'cup', isAvailable: false },
      { name: 'butter', quantity: 1, unit: 'tbsp', isAvailable: false },
    ],
    instructions: [
      'Chop all vegetables into small pieces',
      'Whisk eggs with a pinch of salt',
      'Melt butter in a non-stick pan',
      'Add vegetables and sauté for 2 minutes',
      'Pour in eggs and let set around the edges',
      'Add cheese to one half and fold omelette',
      'Cook for another minute and slide onto plate',
    ],
  },
];

/**
 * Match ingredient names (fuzzy matching)
 */
function matchIngredient(recipeName: string, itemName: string): boolean {
  const recipe = recipeName.toLowerCase().trim();
  const item = itemName.toLowerCase().trim();

  // Direct match
  if (recipe === item) return true;

  // Partial match (e.g., "chicken" matches "chicken breast")
  if (item.includes(recipe) || recipe.includes(item)) return true;

  // Common variations
  const variations: { [key: string]: string[] } = {
    'egg': ['eggs'],
    'tomato': ['tomatoes'],
    'potato': ['potatoes'],
    'onion': ['onions'],
    'pepper': ['bell pepper', 'peppers'],
    'milk': ['whole milk', '2% milk', 'skim milk'],
    'cheese': ['cheddar', 'mozzarella', 'parmesan', 'swiss'],
    'chicken': ['chicken breast', 'chicken thigh'],
  };

  for (const [key, values] of Object.entries(variations)) {
    if (recipe.includes(key) && values.some(v => item.includes(v))) return true;
    if (item.includes(key) && values.some(v => recipe.includes(v))) return true;
  }

  return false;
}

/**
 * Check ingredient availability in inventory
 */
function checkIngredientAvailability(
  ingredient: RecipeIngredient,
  inventory: Item[]
): { isAvailable: boolean; inventoryItemId?: string; daysUntilExpiration?: number } {
  const matchedItem = inventory.find(item => matchIngredient(ingredient.name, item.name));

  if (!matchedItem) {
    return { isAvailable: false };
  }

  const daysUntilExpiration = matchedItem.expirationDate
    ? differenceInDays(new Date(matchedItem.expirationDate), new Date())
    : undefined;

  return {
    isAvailable: true,
    inventoryItemId: matchedItem.id,
    daysUntilExpiration,
  };
}

/**
 * Score a recipe based on inventory availability and expiring items
 */
function scoreRecipe(recipe: Recipe, inventory: Item[]): number {
  let score = 0;
  let availableCount = 0;
  let expiringBonus = 0;

  recipe.ingredients.forEach(ingredient => {
    if (ingredient.isAvailable) {
      availableCount++;
      score += 10; // Base points for having ingredient

      // Bonus points for expiring ingredients
      const matchedItem = inventory.find(item => item.id === ingredient.inventoryItemId);
      if (matchedItem?.expirationDate) {
        const days = differenceInDays(new Date(matchedItem.expirationDate), new Date());
        if (days <= 2) {
          expiringBonus += 20; // High priority
        } else if (days <= 5) {
          expiringBonus += 10; // Medium priority
        } else if (days <= 7) {
          expiringBonus += 5; // Low priority
        }
      }
    }
  });

  // Percentage of available ingredients
  const availabilityPercentage = availableCount / recipe.ingredients.length;
  score += availabilityPercentage * 50;
  score += expiringBonus;

  return score;
}

/**
 * Generate recipe suggestions based on current inventory
 */
export function generateRecipeSuggestions(
  inventory: Item[],
  preferences: RecipePreferences,
  filters?: {
    mealType?: MealType;
    prepTime?: PrepTime;
  }
): Recipe[] {
  // Create recipes with availability info
  let recipes = SAMPLE_RECIPES.map(recipe => {
    const ingredientsWithAvailability = recipe.ingredients.map(ingredient => {
      const availability = checkIngredientAvailability(ingredient, inventory);
      return {
        ...ingredient,
        isAvailable: availability.isAvailable,
        inventoryItemId: availability.inventoryItemId,
      };
    });

    return {
      ...recipe,
      id: generateId(),
      createdAt: new Date().toISOString(),
      ingredients: ingredientsWithAvailability,
    };
  });

  // Apply filters
  if (filters?.mealType) {
    recipes = recipes.filter(r => r.mealType.includes(filters.mealType!));
  }

  if (filters?.prepTime) {
    recipes = recipes.filter(r => r.prepTime === filters.prepTime);
  }

  // Apply preferences
  if (preferences.isVegetarian) {
    recipes = recipes.filter(r => {
      const meatIngredients = ['chicken', 'beef', 'pork', 'fish', 'meat'];
      return !r.ingredients.some(ing =>
        meatIngredients.some(meat => ing.name.toLowerCase().includes(meat))
      );
    });
  }

  if (preferences.excludedIngredients.length > 0) {
    recipes = recipes.filter(r => {
      return !r.ingredients.some(ing =>
        preferences.excludedIngredients.some(excluded =>
          ing.name.toLowerCase().includes(excluded.toLowerCase())
        )
      );
    });
  }

  // Score and sort recipes
  const scoredRecipes = recipes.map(recipe => ({
    recipe,
    score: scoreRecipe(recipe, inventory),
  }));

  scoredRecipes.sort((a, b) => b.score - a.score);

  return scoredRecipes.map(sr => sr.recipe);
}

/**
 * Get missing ingredients for a recipe
 */
export function getMissingIngredients(recipe: Recipe): RecipeIngredient[] {
  return recipe.ingredients.filter(ing => !ing.isAvailable);
}

/**
 * Get available ingredients count
 */
export function getAvailableIngredientsCount(recipe: Recipe): {
  available: number;
  total: number;
  percentage: number;
} {
  const available = recipe.ingredients.filter(ing => ing.isAvailable).length;
  const total = recipe.ingredients.length;
  const percentage = Math.round((available / total) * 100);

  return { available, total, percentage };
}
