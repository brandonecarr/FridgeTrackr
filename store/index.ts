import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StorageArea,
  LocationZone,
  Item,
  Store,
  ShoppingListItem,
  ShoppingListRecipeGroup,
  BarcodeCatalogEntry,
  AppSettings,
  UserAccount,
  RecipePreferences,
  Recipe,
  Household,
  HouseholdMember,
  DeliveryServiceConfig,
} from '@/types';
import { generateId } from '@/utils/helpers';
import {
  scheduleExpirationNotification,
  cancelItemNotifications,
  scheduleLowStockNotification,
  rescheduleAllNotifications,
} from '@/utils/notifications';

// Default storage areas
const defaultStorageAreas: StorageArea[] = [
  {
    id: 'fridge-1',
    name: 'Main Fridge',
    type: 'fridge',
    icon: 'refrigerator',
    locationZones: [
      { id: 'zone-1', name: 'Top Shelf', storageAreaId: 'fridge-1', order: 0 },
      { id: 'zone-2', name: 'Middle Shelf', storageAreaId: 'fridge-1', order: 1 },
      { id: 'zone-3', name: 'Bottom Shelf', storageAreaId: 'fridge-1', order: 2 },
      { id: 'zone-4', name: 'Door', storageAreaId: 'fridge-1', order: 3 },
      { id: 'zone-5', name: 'Drawer', storageAreaId: 'fridge-1', order: 4 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'freezer-1',
    name: 'Freezer',
    type: 'freezer',
    icon: 'snowflake',
    locationZones: [
      { id: 'zone-6', name: 'Top Shelf', storageAreaId: 'freezer-1', order: 0 },
      { id: 'zone-7', name: 'Bottom Shelf', storageAreaId: 'freezer-1', order: 1 },
      { id: 'zone-8', name: 'Door', storageAreaId: 'freezer-1', order: 2 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-1',
    name: 'Pantry',
    type: 'pantry',
    icon: 'warehouse',
    locationZones: [
      { id: 'zone-9', name: 'Top Shelf', storageAreaId: 'pantry-1', order: 0 },
      { id: 'zone-10', name: 'Middle Shelf', storageAreaId: 'pantry-1', order: 1 },
      { id: 'zone-11', name: 'Bottom Shelf', storageAreaId: 'pantry-1', order: 2 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Default stores
const defaultStores: Store[] = [
  {
    id: 'store-1',
    name: 'Grocery Store',
    icon: 'shopping-cart',
    color: '#3B82F6',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'store-2',
    name: 'Costco',
    icon: 'package',
    color: '#EF4444',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// No sample items - app starts clean

// Default settings
const defaultSettings: AppSettings = {
  notifications: {
    // General
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,

    // Expiration Notifications
    expirationEnabled: true,
    daysBeforeExpiration: 3,
    dailySummaryEnabled: true,
    dailySummaryTime: '09:00',

    // Shopping List Notifications
    shoppingReminderEnabled: true,
    shoppingReminderTime: '18:00',

    // Low Stock Notifications
    lowStockEnabled: true,
    lowStockThreshold: 1,
  },
  defaultExpirationDays: 7,
  theme: 'system',
};

interface AppState {
  // Storage Areas
  storageAreas: StorageArea[];
  addStorageArea: (area: Omit<StorageArea, 'id' | 'createdAt' | 'updatedAt' | 'locationZones'>) => void;
  updateStorageArea: (id: string, updates: Partial<StorageArea>) => void;
  deleteStorageArea: (id: string) => void;
  addLocationZone: (storageAreaId: string, name: string) => void;
  updateLocationZone: (storageAreaId: string, zoneId: string, name: string) => void;
  deleteLocationZone: (storageAreaId: string, zoneId: string) => void;

  // Items
  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  decrementItemQuantity: (id: string) => void;
  markItemAsGone: (id: string, storeId?: string, disposalReason?: Item['disposalReason']) => void;

  // Stores
  stores: Store[];
  addStore: (store: Omit<Store, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateStore: (id: string, updates: Partial<Store>) => void;
  deleteStore: (id: string) => void;

  // Shopping List
  shoppingList: ShoppingListItem[];
  shoppingListRecipeGroups: ShoppingListRecipeGroup[];
  addShoppingListItem: (item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => void;
  addShoppingListItemsFromRecipe: (recipe: Recipe, items: Array<Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'recipeGroupId'>>) => void;
  updateShoppingListItem: (id: string, updates: Partial<ShoppingListItem>) => void;
  deleteShoppingListItem: (id: string) => void;
  toggleShoppingListItem: (id: string) => void;
  toggleRecipeGroupExpanded: (groupId: string) => void;
  deleteRecipeGroup: (groupId: string) => void;
  clearCompletedItems: () => void;
  addCompletedItemToInventory: (shoppingItemId: string, storageAreaId: string, locationZoneId?: string, expirationDate?: string) => void;

  // Barcode Catalog
  barcodeCatalog: BarcodeCatalogEntry[];
  addBarcodeCatalogEntry: (entry: Omit<BarcodeCatalogEntry, 'createdAt' | 'updatedAt'>) => void;
  updateBarcodeCatalogEntry: (barcode: string, updates: Partial<BarcodeCatalogEntry>) => void;
  getBarcodeCatalogEntry: (barcode: string) => BarcodeCatalogEntry | undefined;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNotificationSettings: (updates: Partial<AppSettings['notifications']>) => void;

  // Premium: User Account
  userAccount: UserAccount;
  togglePremium: () => void; // For demo purposes
  updateUserAccount: (updates: Partial<UserAccount>) => void;

  // Premium: Recipe Preferences
  recipePreferences: RecipePreferences;
  updateRecipePreferences: (updates: Partial<RecipePreferences>) => void;

  // Premium: Saved Recipes (user's favorites/custom)
  savedRecipes: Recipe[];
  addSavedRecipe: (recipe: Recipe) => void;
  removeSavedRecipe: (recipeId: string) => void;
  toggleRecipeFavorite: (recipe: Recipe) => void;
  isRecipeFavorite: (recipeId: string) => boolean;

  // Premium: Household & Sharing
  household: Household | null;
  createHousehold: (name: string) => void;
  updateHousehold: (updates: Partial<Household>) => void;
  addHouseholdMember: (member: Omit<HouseholdMember, 'joinedAt'>) => void;
  removeHouseholdMember: (userId: string) => void;
  leaveHousehold: () => void;
  joinHousehold: (household: Household) => void;

  // Premium: Delivery Services
  deliveryServices: DeliveryServiceConfig[];
  connectDeliveryService: (config: DeliveryServiceConfig) => void;
  disconnectDeliveryService: (provider: DeliveryServiceConfig['provider']) => void;
  updateDeliveryService: (provider: DeliveryServiceConfig['provider'], updates: Partial<DeliveryServiceConfig>) => void;
}

// Helper to persist state to AsyncStorage
const persistState = async (state: AppState) => {
  try {
    await AsyncStorage.setItem('fridge-pantry-storage', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist state:', error);
  }
};

// Helper to load state from AsyncStorage
const loadPersistedState = async (): Promise<Partial<AppState> | null> => {
  try {
    const stored = await AsyncStorage.getItem('fridge-pantry-storage');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load persisted state:', error);
    return null;
  }
};

export const useStore = create<AppState>()((set, get) => ({
  // Storage Areas
  storageAreas: [],

  addStorageArea: (area) => {
    const newArea: StorageArea = {
      ...area,
      id: generateId(),
      locationZones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      storageAreas: [...state.storageAreas, newArea],
    }));
    persistState(get());
  },

  updateStorageArea: (id, updates) => {
    set((state) => ({
      storageAreas: state.storageAreas.map((area) =>
        area.id === id
          ? { ...area, ...updates, updatedAt: new Date().toISOString() }
          : area
      ),
    }));
    persistState(get());
  },

  deleteStorageArea: (id) => {
    set((state) => ({
      storageAreas: state.storageAreas.filter((area) => area.id !== id),
      items: state.items.filter((item) => item.storageAreaId !== id),
    }));
    persistState(get());
  },

  addLocationZone: (storageAreaId, name) => {
    const zone: LocationZone = {
      id: generateId(),
      name,
      storageAreaId,
      order: get().storageAreas.find((a) => a.id === storageAreaId)?.locationZones.length || 0,
    };
    set((state) => ({
      storageAreas: state.storageAreas.map((area) =>
        area.id === storageAreaId
          ? {
              ...area,
              locationZones: [...area.locationZones, zone],
              updatedAt: new Date().toISOString(),
            }
          : area
      ),
    }));
    persistState(get());
  },

  updateLocationZone: (storageAreaId, zoneId, name) => {
    set((state) => ({
      storageAreas: state.storageAreas.map((area) =>
        area.id === storageAreaId
          ? {
              ...area,
              locationZones: area.locationZones.map((zone) =>
                zone.id === zoneId ? { ...zone, name } : zone
              ),
              updatedAt: new Date().toISOString(),
            }
          : area
      ),
    }));
    persistState(get());
  },

  deleteLocationZone: (storageAreaId, zoneId) => {
    set((state) => ({
      storageAreas: state.storageAreas.map((area) =>
        area.id === storageAreaId
          ? {
              ...area,
              locationZones: area.locationZones.filter((zone) => zone.id !== zoneId),
              updatedAt: new Date().toISOString(),
            }
          : area
      ),
    }));
    persistState(get());
  },

  // Items
  items: [],

  addItem: (item) => {
    const id = generateId();
    const newItem: Item = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      items: [...state.items, newItem],
    }));

    // Add to barcode catalog if barcode exists
    if (item.barcode) {
      const existingCatalogEntry = get().barcodeCatalog.find((e) => e.barcode === item.barcode);
      if (!existingCatalogEntry) {
        // Create new catalog entry
        get().addBarcodeCatalogEntry({
          barcode: item.barcode,
          name: item.name,
          defaultUnit: item.unit,
          defaultQuantity: item.quantity,
          photoUri: item.photoUri,
          aisle: item.aisle,
        });
      } else if (item.aisle && !existingCatalogEntry.aisle) {
        // Update existing entry with aisle if it doesn't have one
        get().updateBarcodeCatalogEntry(item.barcode, { aisle: item.aisle });
      }
    }

    persistState(get());

    // Schedule expiration notification if enabled
    const settings = get().settings;
    if (newItem.expirationDate && settings?.notifications?.enabled && settings.notifications.expirationEnabled) {
      scheduleExpirationNotification(newItem, settings.notifications.daysBeforeExpiration).catch((error) => {
        console.error('Failed to schedule expiration notification:', error);
      });
    }

    return id;
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      ),
    }));
    persistState(get());

    // Reschedule notification if expiration date was updated
    const updatedItem = get().items.find((i) => i.id === id);
    const settings = get().settings;
    if (updatedItem && settings?.notifications?.enabled && settings.notifications.expirationEnabled) {
      if (updates.expirationDate !== undefined) {
        cancelItemNotifications(id).catch((error) => {
          console.error('Failed to cancel item notifications:', error);
        });
        if (updatedItem.expirationDate) {
          scheduleExpirationNotification(updatedItem, settings.notifications.daysBeforeExpiration).catch((error) => {
            console.error('Failed to schedule expiration notification:', error);
          });
        }
      }
    }

    // Check for low stock
    if (updatedItem && updates.quantity !== undefined && settings?.notifications?.enabled && settings.notifications.lowStockEnabled) {
      if (updatedItem.quantity <= settings.notifications.lowStockThreshold) {
        scheduleLowStockNotification(updatedItem).catch((error) => {
          console.error('Failed to schedule low stock notification:', error);
        });
      }
    }
  },

  deleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
    persistState(get());

    // Cancel notifications for this item
    cancelItemNotifications(id).catch((error) => {
      console.error('Failed to cancel item notifications:', error);
    });
  },

  decrementItemQuantity: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      set((state) => ({
        items: state.items.map((i) =>
          i.id === id
            ? { ...i, quantity: newQuantity, updatedAt: new Date().toISOString() }
            : i
        ),
      }));
      persistState(get());

      // Check for low stock after decrement
      const settings = get().settings;
      if (settings?.notifications?.enabled && settings.notifications.lowStockEnabled) {
        if (newQuantity <= settings.notifications.lowStockThreshold) {
          scheduleLowStockNotification({ ...item, quantity: newQuantity }).catch((error) => {
            console.error('Failed to schedule low stock notification:', error);
          });
        }
      }
    } else if (item && item.quantity === 1) {
      get().markItemAsGone(id);
    }
  },

  markItemAsGone: (id, storeId, disposalReason = 'used') => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      // Use provided storeId, or fall back to item's default store, or first available store
      const targetStoreId = storeId || item.defaultStoreId || get().stores[0]?.id || '';

      // Get aisle from item first, then fallback to barcode catalog
      const catalogEntry = item.barcode ? get().barcodeCatalog.find((e) => e.barcode === item.barcode) : undefined;
      const aisleValue = item.aisle || catalogEntry?.aisle;

      // Create new shopping list item
      const newShoppingItem: ShoppingListItem = {
        id: generateId(),
        name: item.name,
        quantity: 1,
        unit: item.unit,
        storeId: targetStoreId,
        barcode: item.barcode,
        aisle: aisleValue,
        linkedItemId: id,
        lastStorageAreaId: item.storageAreaId,
        lastLocationZoneId: item.locationZoneId,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mark item as gone with disposal tracking (Premium feature)
      const updatedItem: Item = {
        ...item,
        goneAt: new Date().toISOString(),
        disposalReason,
        updatedAt: new Date().toISOString(),
      };

      // Update both items and shopping list in a single state update
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        shoppingList: [...state.shoppingList, newShoppingItem],
      }));
      persistState(get());

      // Cancel item notifications and reschedule shopping reminder
      cancelItemNotifications(id).catch((error) => {
        console.error('Failed to cancel item notifications:', error);
      });
      const settings = get().settings;
      if (settings?.notifications?.enabled && settings.notifications.shoppingReminderEnabled) {
        rescheduleAllNotifications(get().items, get().shoppingList, settings.notifications).catch((error) => {
          console.error('Failed to reschedule notifications:', error);
        });
      }
    }
  },

  // Stores
  stores: [],

  addStore: (store) => {
    const newStore: Store = {
      ...store,
      id: generateId(),
      order: get().stores.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      stores: [...state.stores, newStore],
    }));
    persistState(get());
  },

  updateStore: (id, updates) => {
    set((state) => ({
      stores: state.stores.map((store) =>
        store.id === id
          ? { ...store, ...updates, updatedAt: new Date().toISOString() }
          : store
      ),
    }));
    persistState(get());
  },

  deleteStore: (id) => {
    set((state) => {
      // Filter out the deleted store
      const remainingStores = state.stores.filter((store) => store.id !== id);

      // Reassign shopping list items to the first available store, or keep them with empty storeId
      const defaultStoreId = remainingStores[0]?.id || '';
      const updatedShoppingList = state.shoppingList.map((item) =>
        item.storeId === id
          ? { ...item, storeId: defaultStoreId, updatedAt: new Date().toISOString() }
          : item
      );

      return {
        stores: remainingStores,
        shoppingList: updatedShoppingList,
      };
    });
    persistState(get());
  },

  // Shopping List
  shoppingList: [],
  shoppingListRecipeGroups: [],

  addShoppingListItem: (item) => {
    const newItem: ShoppingListItem = {
      ...item,
      id: generateId(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      shoppingList: [...state.shoppingList, newItem],
    }));
    persistState(get());

    // Reschedule shopping reminder
    const settings = get().settings;
    if (settings?.notifications?.enabled && settings.notifications.shoppingReminderEnabled) {
      rescheduleAllNotifications(get().items, get().shoppingList, settings.notifications).catch((error) => {
        console.error('Failed to reschedule notifications:', error);
      });
    }
  },

  addShoppingListItemsFromRecipe: (recipe, items) => {
    // Create a new recipe group
    const groupId = generateId();
    const newGroup: ShoppingListRecipeGroup = {
      id: groupId,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      isExpanded: true,
      createdAt: new Date().toISOString(),
    };

    // Create shopping list items with the recipe group ID
    const newItems: ShoppingListItem[] = items.map((item) => ({
      ...item,
      id: generateId(),
      isCompleted: false,
      recipeGroupId: groupId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    set((state) => ({
      shoppingListRecipeGroups: [...state.shoppingListRecipeGroups, newGroup],
      shoppingList: [...state.shoppingList, ...newItems],
    }));
    persistState(get());

    // Reschedule shopping reminder
    const settings = get().settings;
    if (settings?.notifications?.enabled && settings.notifications.shoppingReminderEnabled) {
      rescheduleAllNotifications(get().items, get().shoppingList, settings.notifications).catch((error) => {
        console.error('Failed to reschedule notifications:', error);
      });
    }
  },

  updateShoppingListItem: (id, updates) => {
    set((state) => ({
      shoppingList: state.shoppingList.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      ),
    }));
    persistState(get());
  },

  deleteShoppingListItem: (id) => {
    set((state) => ({
      shoppingList: state.shoppingList.filter((item) => item.id !== id),
    }));
    persistState(get());

    // Reschedule shopping reminder
    const settings = get().settings;
    if (settings?.notifications?.enabled && settings.notifications.shoppingReminderEnabled) {
      rescheduleAllNotifications(get().items, get().shoppingList, settings.notifications).catch((error) => {
        console.error('Failed to reschedule notifications:', error);
      });
    }
  },

  toggleShoppingListItem: (id) => {
    set((state) => ({
      shoppingList: state.shoppingList.map((item) =>
        item.id === id
          ? { ...item, isCompleted: !item.isCompleted, updatedAt: new Date().toISOString() }
          : item
      ),
    }));
    persistState(get());
  },

  toggleRecipeGroupExpanded: (groupId) => {
    set((state) => ({
      shoppingListRecipeGroups: state.shoppingListRecipeGroups.map((group) =>
        group.id === groupId
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      ),
    }));
    persistState(get());
  },

  deleteRecipeGroup: (groupId) => {
    set((state) => ({
      shoppingListRecipeGroups: state.shoppingListRecipeGroups.filter((group) => group.id !== groupId),
      shoppingList: state.shoppingList.filter((item) => item.recipeGroupId !== groupId),
    }));
    persistState(get());

    // Reschedule shopping reminder
    const settings = get().settings;
    if (settings?.notifications?.enabled && settings.notifications.shoppingReminderEnabled) {
      rescheduleAllNotifications(get().items, get().shoppingList, settings.notifications).catch((error) => {
        console.error('Failed to reschedule notifications:', error);
      });
    }
  },

  clearCompletedItems: () => {
    const remainingItems = get().shoppingList.filter((item) => !item.isCompleted);

    // Find recipe groups that would have no remaining items
    const activeGroupIds = new Set(remainingItems.map(item => item.recipeGroupId).filter(Boolean));

    set((state) => ({
      shoppingList: remainingItems,
      // Remove recipe groups that have no remaining items
      shoppingListRecipeGroups: state.shoppingListRecipeGroups.filter(
        (group) => activeGroupIds.has(group.id)
      ),
    }));
    persistState(get());
  },

  addCompletedItemToInventory: (shoppingItemId, storageAreaId, locationZoneId, expirationDate) => {
    const shoppingItem = get().shoppingList.find((i) => i.id === shoppingItemId);
    if (shoppingItem) {
      get().addItem({
        name: shoppingItem.name,
        barcode: shoppingItem.barcode,
        quantity: shoppingItem.quantity,
        unit: shoppingItem.unit,
        storageAreaId,
        locationZoneId,
        expirationDate,
        defaultStoreId: shoppingItem.storeId,
        aisle: shoppingItem.aisle,
      });

      get().deleteShoppingListItem(shoppingItemId);
      // Note: persistState is called in both addItem and deleteShoppingListItem
    }
  },

  // Barcode Catalog
  barcodeCatalog: [],

  addBarcodeCatalogEntry: (entry) => {
    const newEntry: BarcodeCatalogEntry = {
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      barcodeCatalog: [...state.barcodeCatalog, newEntry],
    }));
    persistState(get());
  },

  updateBarcodeCatalogEntry: (barcode, updates) => {
    set((state) => ({
      barcodeCatalog: state.barcodeCatalog.map((entry) =>
        entry.barcode === barcode
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      ),
    }));
    persistState(get());
  },

  getBarcodeCatalogEntry: (barcode) => {
    return get().barcodeCatalog.find((entry) => entry.barcode === barcode);
  },

  // Settings
  settings: defaultSettings,

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
    persistState(get());
  },

  updateNotificationSettings: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: { ...state.settings.notifications, ...updates },
      },
    }));
    persistState(get());
  },

  // Premium: User Account
  userAccount: {
    id: 'user-1',
    isPremium: false, // Default to free tier
    createdAt: new Date().toISOString(),
  },

  togglePremium: () => {
    set((state) => ({
      userAccount: {
        ...state.userAccount,
        isPremium: !state.userAccount.isPremium,
        premiumExpiresAt: !state.userAccount.isPremium
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          : undefined,
      },
    }));
    persistState(get());
  },

  updateUserAccount: (updates) => {
    set((state) => ({
      userAccount: { ...state.userAccount, ...updates },
    }));
    persistState(get());
  },

  // Premium: Recipe Preferences
  recipePreferences: {
    isVegetarian: false,
    excludedIngredients: [],
    favoriteCuisines: [],
  },

  updateRecipePreferences: (updates) => {
    set((state) => ({
      recipePreferences: { ...state.recipePreferences, ...updates },
    }));
    persistState(get());
  },

  // Premium: Saved Recipes
  savedRecipes: [],

  addSavedRecipe: (recipe) => {
    set((state) => ({
      savedRecipes: [...state.savedRecipes, recipe],
    }));
    persistState(get());
  },

  removeSavedRecipe: (recipeId) => {
    set((state) => ({
      savedRecipes: state.savedRecipes.filter((r) => r.id !== recipeId),
    }));
    persistState(get());
  },

  toggleRecipeFavorite: (recipe) => {
    const state = get();
    const existingRecipe = state.savedRecipes.find((r) => r.id === recipe.id);

    if (existingRecipe) {
      // Recipe is already favorited, remove it
      set((state) => ({
        savedRecipes: state.savedRecipes.filter((r) => r.id !== recipe.id),
      }));
    } else {
      // Add recipe to favorites with isFavorite flag
      set((state) => ({
        savedRecipes: [...state.savedRecipes, { ...recipe, isFavorite: true }],
      }));
    }
    persistState(get());
  },

  isRecipeFavorite: (recipeId) => {
    return get().savedRecipes.some((r) => r.id === recipeId);
  },

  // Premium: Household & Sharing
  household: null,

  createHousehold: (name) => {
    const userAccount = get().userAccount;
    const household: Household = {
      id: generateId(),
      name,
      ownerId: userAccount.id,
      members: [
        {
          userId: userAccount.id,
          name: userAccount.name || 'You',
          email: userAccount.email,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      household,
      userAccount: {
        ...state.userAccount,
        householdId: household.id,
      },
    }));
    persistState(get());
  },

  updateHousehold: (updates) => {
    set((state) => {
      if (!state.household) return state;
      return {
        household: {
          ...state.household,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      };
    });
    persistState(get());
  },

  addHouseholdMember: (member) => {
    set((state) => {
      if (!state.household) return state;
      return {
        household: {
          ...state.household,
          members: [
            ...state.household.members,
            {
              ...member,
              joinedAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        },
      };
    });
    persistState(get());
  },

  removeHouseholdMember: (userId) => {
    set((state) => {
      if (!state.household) return state;
      // Can't remove owner
      if (userId === state.household.ownerId) return state;

      return {
        household: {
          ...state.household,
          members: state.household.members.filter((m) => m.userId !== userId),
          updatedAt: new Date().toISOString(),
        },
      };
    });
    persistState(get());
  },

  leaveHousehold: () => {
    set((state) => ({
      household: null,
      userAccount: {
        ...state.userAccount,
        householdId: undefined,
      },
    }));
    persistState(get());
  },

  joinHousehold: (household) => {
    const userAccount = get().userAccount;
    const updatedHousehold: Household = {
      ...household,
      members: [
        ...household.members,
        {
          userId: userAccount.id,
          name: userAccount.name || 'Member',
          email: userAccount.email,
          role: 'member',
          joinedAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      household: updatedHousehold,
      userAccount: {
        ...state.userAccount,
        householdId: household.id,
      },
    }));
    persistState(get());
  },

  // Premium: Delivery Services
  deliveryServices: [],

  connectDeliveryService: (config) => {
    set((state) => {
      // Check if already connected
      const existingIndex = state.deliveryServices.findIndex(
        (s) => s.provider === config.provider
      );

      if (existingIndex >= 0) {
        // Update existing
        const updated = [...state.deliveryServices];
        updated[existingIndex] = {
          ...config,
          isConnected: true,
          connectedAt: new Date().toISOString(),
        };
        return { deliveryServices: updated };
      } else {
        // Add new
        return {
          deliveryServices: [
            ...state.deliveryServices,
            {
              ...config,
              isConnected: true,
              connectedAt: new Date().toISOString(),
            },
          ],
        };
      }
    });
    persistState(get());
  },

  disconnectDeliveryService: (provider) => {
    set((state) => ({
      deliveryServices: state.deliveryServices.map((s) =>
        s.provider === provider ? { ...s, isConnected: false } : s
      ),
    }));
    persistState(get());
  },

  updateDeliveryService: (provider, updates) => {
    set((state) => ({
      deliveryServices: state.deliveryServices.map((s) =>
        s.provider === provider ? { ...s, ...updates } : s
      ),
    }));
    persistState(get());
  },
}));

// Initialize store with persisted state (only on client side)
if (typeof window !== 'undefined') {
  loadPersistedState().then((persisted) => {
    if (persisted) {
      // Load persisted state
      useStore.setState(persisted);
    } else {
      // First time setup - use defaults (no sample items)
      useStore.setState({
        storageAreas: defaultStorageAreas,
        stores: defaultStores,
        items: [],
      });
    }
  });
}
