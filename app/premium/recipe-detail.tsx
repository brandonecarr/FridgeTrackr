import React, { useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Alert, TouchableOpacity } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Check, ShoppingCart, Clock, Users, ChefHat, AlertCircle, Heart } from 'lucide-react-native';
import { useStore } from '@/store';
import { Recipe, RecipeIngredient } from '@/types';
import { Card } from '@/components/ui/Card';
import { getMissingIngredients } from '@/utils/recipeGenerator';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { recipeData } = useLocalSearchParams<{ recipeData: string }>();
  const { items, stores, addShoppingListItemsFromRecipe, updateItem, toggleRecipeFavorite, isRecipeFavorite } = useStore();

  // Parse recipe data from navigation params
  const recipe: Recipe | null = useMemo(() => {
    if (!recipeData) return null;
    try {
      return JSON.parse(recipeData as string);
    } catch (error) {
      console.error('Failed to parse recipe data:', error);
      return null;
    }
  }, [recipeData]);

  if (!recipe) {
    return (
      <>
        <Stack.Screen options={{ title: 'Recipe', headerBackTitle: 'Recipes' }} />
        <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center p-6">
          <Text className="text-slate-600">Recipe not found</Text>
        </SafeAreaView>
      </>
    );
  }

  const prepTimeLabels = {
    under_20: 'Under 20 minutes',
    '20_to_40': '20-40 minutes',
    over_40: 'Over 40 minutes',
  };

  const missingIngredients = getMissingIngredients(recipe);
  const availableIngredients = recipe.ingredients.filter(ing => ing.isAvailable);
  const isFavorite = isRecipeFavorite(recipe.id);

  const handleToggleFavorite = () => {
    toggleRecipeFavorite(recipe);
  };

  const handleAddMissingToShoppingList = () => {
    if (missingIngredients.length === 0) {
      Alert.alert('No Missing Ingredients', 'You have all the ingredients for this recipe!');
      return;
    }

    // Get the first store or ask user to create one
    const defaultStore = stores[0];
    if (!defaultStore) {
      Alert.alert(
        'No Stores',
        'Please add a store in Settings before adding items to your shopping list.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Add all missing ingredients to shopping list as a recipe group
    const itemsToAdd = missingIngredients.map(ingredient => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      storeId: defaultStore.id,
    }));

    addShoppingListItemsFromRecipe(recipe, itemsToAdd);

    Alert.alert(
      'Added to Shopping List',
      `${missingIngredients.length} ingredient${missingIngredients.length !== 1 ? 's' : ''} from "${recipe.title}" added to your shopping list.`,
      [
        { text: 'View List', onPress: () => router.push('/(tabs)/shopping') },
        { text: 'OK' },
      ]
    );
  };

  const handleMarkIngredientsAsUsed = () => {
    if (availableIngredients.length === 0) {
      return;
    }

    Alert.alert(
      'Mark Ingredients as Used',
      `This will remove ${availableIngredients.length} ingredient${availableIngredients.length !== 1 ? 's' : ''} from your inventory.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark as Used',
          onPress: () => {
            availableIngredients.forEach(ingredient => {
              if (ingredient.inventoryItemId) {
                // Mark item as gone with 'used' disposal reason
                const item = items.find(i => i.id === ingredient.inventoryItemId);
                if (item) {
                  updateItem(ingredient.inventoryItemId, {
                    goneAt: new Date().toISOString(),
                    disposalReason: 'used',
                  });
                }
              }
            });

            Alert.alert('Success', 'Ingredients marked as used and removed from inventory.');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: recipe.title,
          headerBackTitle: 'Recipes',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View className="bg-blue-600 px-6 pt-6 pb-8">
            <View className="flex-row items-center mb-2">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-3">
                <ChefHat size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold mb-1">{recipe.title}</Text>
                <Text className="text-blue-100 text-sm">{recipe.description}</Text>
              </View>
              <TouchableOpacity onPress={handleToggleFavorite} activeOpacity={0.7}>
                <Heart
                  size={28}
                  color="white"
                  fill={isFavorite ? 'white' : 'transparent'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mt-4">
              <View className="flex-row items-center mr-6">
                <Clock size={18} color="white" />
                <Text className="text-white text-sm ml-2">{prepTimeLabels[recipe.prepTime]}</Text>
              </View>
              <View className="flex-row items-center">
                <Users size={18} color="white" />
                <Text className="text-white text-sm ml-2">{recipe.servings} servings</Text>
              </View>
            </View>
          </View>

          <View className="px-6 -mt-4">
            {/* Ingredients */}
            <Card variant="elevated" className="mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-900">Ingredients</Text>
                <Text className="text-sm text-gray-700">
                  {availableIngredients.length}/{recipe.ingredients.length} available
                </Text>
              </View>

              {recipe.ingredients.map((ingredient, index) => (
                <IngredientRow key={index} ingredient={ingredient} />
              ))}

              {missingIngredients.length > 0 && (
                <View className="mt-4 pt-4 border-t border-gray-200">
                  <Pressable
                    onPress={handleAddMissingToShoppingList}
                    className="flex-row items-center justify-center bg-blue-600 py-3 rounded-xl active:bg-blue-700"
                  >
                    <ShoppingCart size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Add {missingIngredients.length} Missing Item{missingIngredients.length !== 1 ? 's' : ''} to List
                    </Text>
                  </Pressable>
                </View>
              )}
            </Card>

            {/* Instructions */}
            <Card variant="elevated" className="mb-4">
              <Text className="text-lg font-bold text-slate-900 mb-4">Instructions</Text>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} className="flex-row mb-3">
                  <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-sm">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-slate-700 text-base leading-6">{instruction}</Text>
                </View>
              ))}
            </Card>

            {/* Mark as Used */}
            {availableIngredients.length > 0 && (
              <Card variant="elevated" className="bg-green-50 border-green-200">
                <View className="flex-row items-start mb-3">
                  <AlertCircle size={20} color="#10B981" />
                  <View className="flex-1 ml-3">
                    <Text className="text-green-900 font-semibold mb-1">Cooked this recipe?</Text>
                    <Text className="text-green-700 text-sm">
                      Mark the ingredients you used to update your inventory and track waste reduction.
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleMarkIngredientsAsUsed}
                  className="bg-green-600 py-3 rounded-xl items-center active:bg-green-700"
                >
                  <Text className="text-white font-semibold">
                    Mark {availableIngredients.length} Ingredient{availableIngredients.length !== 1 ? 's' : ''} as Used
                  </Text>
                </Pressable>
              </Card>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function IngredientRow({ ingredient }: { ingredient: RecipeIngredient }) {
  return (
    <View className={`flex-row items-center py-2 ${!ingredient.isAvailable ? 'opacity-50' : ''}`}>
      <View
        className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
          ingredient.isAvailable ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        {ingredient.isAvailable && <Check size={14} color="white" strokeWidth={3} />}
      </View>
      <Text className="flex-1 text-slate-900">
        {ingredient.quantity} {ingredient.unit} {ingredient.name}
      </Text>
      {!ingredient.isAvailable && (
        <View className="bg-orange-100 px-2 py-1 rounded-full">
          <Text className="text-orange-700 text-xs font-medium">Need</Text>
        </View>
      )}
    </View>
  );
}
