import React, { useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Alert } from 'react-native';
import { Plus, ShoppingCart, Trash2, Share2, Package } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/store';
import { StoreGroup } from '@/components/shopping/StoreGroup';
import { ShoppingListItem } from '@/components/shopping/ShoppingListItem';
import { RecipeGroup } from '@/components/shopping/RecipeGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';

export default function ShoppingListScreen() {
  const {
    shoppingList,
    shoppingListRecipeGroups,
    stores,
    toggleShoppingListItem,
    deleteShoppingListItem,
    clearCompletedItems,
    toggleRecipeGroupExpanded,
    deleteRecipeGroup,
  } = useStore();

  const router = useRouter();

  // Separate items into recipe-grouped and non-recipe items
  const { recipeGroupedItems, nonRecipeItems } = useMemo(() => {
    const recipeGrouped: { [groupId: string]: typeof shoppingList } = {};
    const nonRecipe: typeof shoppingList = [];

    shoppingList.forEach((item) => {
      if (item.recipeGroupId) {
        if (!recipeGrouped[item.recipeGroupId]) {
          recipeGrouped[item.recipeGroupId] = [];
        }
        recipeGrouped[item.recipeGroupId].push(item);
      } else {
        nonRecipe.push(item);
      }
    });

    return { recipeGroupedItems: recipeGrouped, nonRecipeItems: nonRecipe };
  }, [shoppingList]);

  // Group non-recipe items by store
  const groupedItems = useMemo(() => {
    const groups: { [storeId: string]: typeof shoppingList } = {};
    const uncategorized: typeof shoppingList = [];

    nonRecipeItems.forEach((item) => {
      const storeExists = stores.find((s) => s.id === item.storeId);
      if (storeExists) {
        if (!groups[item.storeId]) {
          groups[item.storeId] = [];
        }
        groups[item.storeId].push(item);
      } else {
        uncategorized.push(item);
      }
    });

    return { groups, uncategorized };
  }, [nonRecipeItems, stores]);

  const completedCount = shoppingList.filter((i) => i.isCompleted).length;
  const totalCount = shoppingList.length;

  const handleAddToInventory = (itemId: string) => {
    router.push(`/add-to-inventory?itemId=${itemId}`);
  };

  const handleChangeStore = (itemId: string) => {
    router.push(`/change-store?itemId=${itemId}`);
  };

  const handleClearCompleted = () => {
    if (completedCount === 0) return;

    Alert.alert(
      'Clear Completed Items',
      `Remove ${completedCount} completed item${completedCount === 1 ? '' : 's'}? These won't be added to inventory.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearCompletedItems,
        },
      ]
    );
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Remove this item from your shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteShoppingListItem(itemId),
        },
      ]
    );
  };

  const handleDeleteRecipeGroup = (groupId: string, recipeTitle: string) => {
    Alert.alert(
      'Delete Recipe Group',
      `Remove all items from "${recipeTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecipeGroup(groupId),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <View className="px-5 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-slate-800">Shopping List</Text>
            <View className="flex-row gap-2">
              {totalCount > 0 && (
                <Pressable
                  onPress={() => router.push('/premium/share-lists')}
                  className="flex-row items-center px-3 py-1.5 bg-blue-50 rounded-lg active:bg-blue-100"
                >
                  <Share2 size={16} color="#3B82F6" />
                  <Text className="text-sm text-blue-600 font-medium ml-1">
                    Share
                  </Text>
                </Pressable>
              )}
              {completedCount > 0 && (
                <Pressable
                  onPress={handleClearCompleted}
                  className="flex-row items-center px-3 py-1.5 bg-red-50 rounded-lg active:bg-red-100"
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text className="text-sm text-red-600 font-medium ml-1">
                    Clear ({completedCount})
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {totalCount > 0 && (
            <View className="flex-row items-center gap-4">
              <View className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                {completedCount > 0 && (
                  <View
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, Math.round((completedCount / totalCount) * 100))}%` }}
                  />
                )}
              </View>
              <Text className="text-sm text-slate-600 font-medium">
                {completedCount}/{totalCount}
              </Text>
            </View>
          )}
        </View>

        {/* Shopping List Content */}
        <View className="px-5 py-4">
          {totalCount === 0 ? (
            <EmptyState
              icon={<ShoppingCart size={48} color="#9CA3AF" />}
              title="No Items Yet"
              description="Items will appear here when marked as gone from your inventory, or add them manually."
              action={
                <Pressable
                  onPress={() => router.push('/add-shopping-item')}
                  className="flex-row items-center px-4 py-2.5 bg-blue-500 rounded-lg active:bg-blue-600"
                >
                  <Plus size={18} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">Add Item</Text>
                </Pressable>
              }
            />
          ) : (
            <>
              {/* Recipe Groups */}
              {shoppingListRecipeGroups.map((group) => {
                const groupItems = recipeGroupedItems[group.id] || [];
                if (groupItems.length === 0) return null;

                return (
                  <RecipeGroup
                    key={group.id}
                    group={group}
                    items={groupItems}
                    onToggleExpanded={() => toggleRecipeGroupExpanded(group.id)}
                    onToggleItem={toggleShoppingListItem}
                    onDeleteItem={handleDeleteItem}
                    onAddToInventory={handleAddToInventory}
                    onChangeStore={handleChangeStore}
                    onDeleteGroup={() => handleDeleteRecipeGroup(group.id, group.recipeTitle)}
                  />
                );
              })}

              {/* Store Groups (for non-recipe items) */}
              {stores
                .filter((store) => {
                  const storeItems = groupedItems.groups[store.id];
                  return storeItems && storeItems.length > 0;
                })
                .map((store) => {
                  const storeItems = groupedItems.groups[store.id];
                  return (
                    <StoreGroup
                      key={store.id}
                      store={store}
                      items={storeItems}
                      onToggleItem={toggleShoppingListItem}
                      onDeleteItem={handleDeleteItem}
                      onAddToInventory={handleAddToInventory}
                      onChangeStore={handleChangeStore}
                    />
                  );
                })}

              {/* Uncategorized Items */}
              {groupedItems.uncategorized.length > 0 && (
                <Card variant="elevated" className="mb-4 overflow-hidden" padding="none">
                  <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
                    <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                      <Package size={20} color="#64748B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-slate-800">Other</Text>
                      <Text className="text-sm text-slate-500">
                        {groupedItems.uncategorized.length} item{groupedItems.uncategorized.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <View>
                    {groupedItems.uncategorized.map((item) => (
                      <ShoppingListItem
                        key={item.id}
                        item={item}
                        onToggle={() => toggleShoppingListItem(item.id)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onAddToInventory={() => handleAddToInventory(item.id)}
                        onChangeStore={() => handleChangeStore(item.id)}
                      />
                    ))}
                  </View>
                </Card>
              )}

              {/* Quick tip */}
              {completedCount > 0 && completedCount < totalCount && (
                <View className="bg-blue-50 rounded-xl p-4 mt-2">
                  <Text className="text-sm text-blue-800 font-medium">
                    Tip: Tap the refresh icon on completed items to add them to your inventory.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <Pressable
        onPress={() => router.push('/add-shopping-item')}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg active:bg-blue-600"
        style={{
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>

    </SafeAreaView>
  );
}
