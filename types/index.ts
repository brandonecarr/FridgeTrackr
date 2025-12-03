// Storage Area Types
export type StorageAreaType = 'fridge' | 'freezer' | 'pantry' | 'cabinet' | 'custom';

export interface StorageArea {
  id: string;
  name: string;
  type: StorageAreaType;
  customTypeLabel?: string; // Used when type is 'custom'
  icon: string;
  locationZones: LocationZone[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationZone {
  id: string;
  name: string;
  storageAreaId: string;
  order: number;
}

// Item Types
export type ExpirationStatus = 'safe' | 'expiring' | 'expired';
export type DisposalReason = 'used' | 'expired' | 'thrown_away' | 'unknown';

export interface Item {
  id: string;
  name: string;
  barcode?: string;
  photoUri?: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  storageAreaId: string;
  locationZoneId?: string;
  defaultStoreId?: string;
  aisle?: string;
  notes?: string;
  category?: string; // For analytics grouping
  approximateCost?: number; // Premium: For waste analytics
  goneAt?: string; // Premium: When item was removed
  disposalReason?: DisposalReason; // Premium: How item was disposed
  createdAt: string;
  updatedAt: string;
}

// Barcode Catalog
export interface BarcodeCatalogEntry {
  barcode: string;
  name: string;
  defaultUnit: string;
  defaultQuantity: number;
  photoUri?: string;
  category?: string;
  aisle?: string;
  createdAt: string;
  updatedAt: string;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Shopping List Types
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  storeId: string;
  barcode?: string;
  aisle?: string;
  linkedItemId?: string;
  lastStorageAreaId?: string;
  lastLocationZoneId?: string;
  isCompleted: boolean;
  recipeGroupId?: string; // Links item to a recipe group
  createdAt: string;
  updatedAt: string;
}

// Recipe Group in Shopping List
export interface ShoppingListRecipeGroup {
  id: string;
  recipeId: string;
  recipeTitle: string;
  isExpanded: boolean;
  createdAt: string;
}

// Notification Settings
export interface NotificationSettings {
  // General
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // Expiration Notifications
  expirationEnabled: boolean;
  daysBeforeExpiration: number;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string; // Format: "HH:mm"

  // Shopping List Notifications
  shoppingReminderEnabled: boolean;
  shoppingReminderTime: string; // Format: "HH:mm"

  // Low Stock Notifications
  lowStockEnabled: boolean;
  lowStockThreshold: number;
}

// App Settings
export interface AppSettings {
  notifications: NotificationSettings;
  defaultExpirationDays: number;
  theme: 'light' | 'dark' | 'system';
}

// Helper Types
export interface ItemWithStatus extends Item {
  expirationStatus: ExpirationStatus;
  daysUntilExpiration: number | null;
}

// Premium Types
export interface UserAccount {
  id: string;
  email?: string;
  name?: string;
  isPremium: boolean;
  premiumExpiresAt?: string;
  householdId?: string;
  createdAt: string;
}

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  members: HouseholdMember[];
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  userId: string;
  name: string;
  email?: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

// Premium: AI Recipe Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type PrepTime = 'under_20' | '20_to_40' | 'over_40';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  mealType: MealType[];
  prepTime: PrepTime;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl?: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  isAvailable: boolean; // Whether user has this in inventory
  inventoryItemId?: string; // Link to inventory item if available
}

export interface RecipePreferences {
  isVegetarian: boolean;
  excludedIngredients: string[];
  favoriteCuisines: string[];
}

export interface MealPlan {
  id: string;
  startDate: string;
  endDate: string;
  meals: PlannedMeal[];
  createdAt: string;
}

export interface PlannedMeal {
  id: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  recipe: Recipe;
}

// Premium: Receipt Scanning Types
export interface ScannedReceipt {
  id: string;
  imageUri: string;
  storeName?: string;
  storeId?: string;
  scannedAt: string;
  items: ScannedReceiptItem[];
  totalAmount?: number;
}

export interface ScannedReceiptItem {
  text: string; // Raw OCR text
  suggestedName: string;
  quantity: number;
  unit: string;
  price?: number;
  matched: boolean; // Whether matched to existing catalog
  catalogItemId?: string;
  isConfirmed: boolean;
  suggestedStorageAreaId?: string;
  suggestedExpirationDays?: number;
}

// Premium: Analytics Types
export interface WasteAnalytics {
  period: 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
  totalItemsAdded: number;
  itemsUsed: number;
  itemsExpired: number;
  itemsThrown: number;
  estimatedSavings: number;
  estimatedWaste: number;
  wasteByCategory: { [category: string]: number };
  topWastedItems: { name: string; count: number; value: number }[];
}

// Premium: Delivery Integration Types
export type DeliveryProvider = 'instacart' | 'walmart' | 'amazon_fresh' | 'other';

export interface DeliveryServiceConfig {
  provider: DeliveryProvider;
  isConnected: boolean;
  accountName?: string;
  connectedAt?: string;
}

export interface DeliveryExportRequest {
  provider: DeliveryProvider;
  items: ShoppingListItem[];
  storeMapping: { [itemId: string]: string };
}
