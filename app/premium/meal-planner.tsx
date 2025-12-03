import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Calendar,
  ChefHat,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import { useStore } from '@/store';
import { generateRecipeSuggestions } from '@/utils/recipeGenerator';
import { Recipe } from '@/types';
import * as haptics from '@/utils/haptics';
import { format, addDays, startOfWeek } from 'date-fns';

interface MealPlan {
  date: Date;
  meal: 'breakfast' | 'lunch' | 'dinner';
  recipe: Recipe | null;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEAL_TYPES: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner'];

export default function MealPlannerScreen() {
  const { items, addShoppingListItem, recipePreferences } = useStore();
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);

  // Get week dates
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(selectedWeekStart, i));
  }, [selectedWeekStart]);

  // Get available recipes
  const availableRecipes = useMemo(() => {
    return generateRecipeSuggestions(items, recipePreferences, 20);
  }, [items, recipePreferences]);

  const handleAddMeal = (date: Date, meal: 'breakfast' | 'lunch' | 'dinner') => {
    haptics.light();
    // Show recipe picker
    Alert.alert(
      'Select Recipe',
      'Choose a recipe for this meal',
      [
        ...availableRecipes.slice(0, 5).map(recipe => ({
          text: recipe.title,
          onPress: () => {
            haptics.success();
            setMealPlan([...mealPlan, { date, meal, recipe }]);
          },
        })),
        {
          text: 'Browse All Recipes',
          onPress: () => router.push('/premium/recipes'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRemoveMeal = (date: Date, meal: 'breakfast' | 'lunch' | 'dinner') => {
    haptics.light();
    setMealPlan(mealPlan.filter(m =>
      !(m.date.toDateString() === date.toDateString() && m.meal === meal)
    ));
  };

  const getMealForSlot = (date: Date, meal: 'breakfast' | 'lunch' | 'dinner') => {
    return mealPlan.find(m =>
      m.date.toDateString() === date.toDateString() && m.meal === meal
    );
  };

  const handleGenerateShoppingList = () => {
    haptics.success();
    const allIngredients = new Set<string>();

    mealPlan.forEach(({ recipe }) => {
      if (recipe) {
        recipe.ingredients.forEach(ingredient => {
          // Check if ingredient is not in inventory
          const hasIngredient = items.some(item =>
            item.name.toLowerCase().includes(ingredient.name.toLowerCase())
          );
          if (!hasIngredient) {
            allIngredients.add(ingredient.name);
          }
        });
      }
    });

    // Add to shopping list
    let addedCount = 0;
    allIngredients.forEach(ingredient => {
      addShoppingListItem({
        name: ingredient,
        quantity: 1,
        unit: 'item',
        category: 'Groceries',
      });
      addedCount++;
    });

    Alert.alert(
      'Shopping List Generated!',
      `${addedCount} missing ingredients added to your shopping list.`,
      [
        { text: 'View List', onPress: () => router.push('/(tabs)/shopping') },
        { text: 'OK' },
      ]
    );
  };

  const totalMeals = mealPlan.length;
  const missingIngredients = useMemo(() => {
    const missing = new Set<string>();
    mealPlan.forEach(({ recipe }) => {
      if (recipe) {
        recipe.ingredients.forEach(ingredient => {
          const hasIngredient = items.some(item =>
            item.name.toLowerCase().includes(ingredient.name.toLowerCase())
          );
          if (!hasIngredient) {
            missing.add(ingredient.name);
          }
        });
      }
    });
    return missing.size;
  }, [mealPlan, items]);

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Meal Planner',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-blue-600 px-6 pt-6 pb-8">
          <Text className="text-white text-2xl font-bold mb-2">
            Weekly Meal Planner
          </Text>
          <Text className="text-blue-100 text-sm">
            Plan your meals and generate shopping lists
          </Text>
        </View>

        {/* Stats */}
        <View className="px-5 py-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Text className="text-3xl font-bold text-gray-900">{totalMeals}</Text>
              <Text className="text-sm text-gray-600">Meals Planned</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Text className="text-3xl font-bold text-orange-600">{missingIngredients}</Text>
              <Text className="text-sm text-gray-600">To Buy</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Text className="text-3xl font-bold text-green-600">{availableRecipes.length}</Text>
              <Text className="text-sm text-gray-600">Recipes</Text>
            </View>
          </View>
        </View>

        {/* Week Selector */}
        <View className="px-5 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => {
                haptics.light();
                setSelectedWeekStart(addDays(selectedWeekStart, -7));
              }}
              className="bg-white rounded-lg px-4 py-2 border border-gray-200"
            >
              <Text className="text-blue-600 font-semibold">← Previous</Text>
            </Pressable>
            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-gray-700 font-semibold ml-2">
                {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d')}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                haptics.light();
                setSelectedWeekStart(addDays(selectedWeekStart, 7));
              }}
              className="bg-white rounded-lg px-4 py-2 border border-gray-200"
            >
              <Text className="text-blue-600 font-semibold">Next →</Text>
            </Pressable>
          </View>
        </View>

        {/* Meal Grid */}
        <View className="px-5 pb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: 850 }}>
              {/* Headers */}
              <View className="flex-row mb-3">
                <View style={{ width: 100 }} className="pr-2">
                  <Text className="text-sm font-semibold text-gray-600">Meal</Text>
                </View>
                {weekDates.map((date, index) => (
                  <View key={date.toISOString()} style={{ width: 100 }} className="px-1">
                    <Text className="text-xs font-semibold text-gray-900 text-center">
                      {DAYS_OF_WEEK[index]}
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      {format(date, 'MMM d')}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Meal Rows */}
              {MEAL_TYPES.map(mealType => (
                <View key={mealType} className="mb-4">
                  <View className="flex-row">
                    <View style={{ width: 100 }} className="pr-2 justify-center">
                      <Text className="text-sm font-semibold text-gray-700 capitalize">
                        {mealType}
                      </Text>
                    </View>
                    {weekDates.map(date => {
                      const meal = getMealForSlot(date, mealType);
                      return (
                        <View key={date.toISOString()} style={{ width: 100 }} className="px-1">
                          {meal?.recipe ? (
                            <Pressable
                              onPress={() => handleRemoveMeal(date, mealType)}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-2 min-h-16"
                            >
                              <View className="flex-row items-start justify-between mb-1">
                                <ChefHat size={12} color="#3B82F6" />
                                <Trash2 size={10} color="#EF4444" />
                              </View>
                              <Text className="text-xs font-medium text-gray-900" numberOfLines={2}>
                                {meal.recipe.title}
                              </Text>
                            </Pressable>
                          ) : (
                            <Pressable
                              onPress={() => handleAddMeal(date, mealType)}
                              className="bg-white border border-dashed border-gray-300 rounded-lg p-2 min-h-16 items-center justify-center"
                            >
                              <Plus size={16} color="#9CA3AF" />
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Actions */}
        {totalMeals > 0 && (
          <View className="px-5 pb-6">
            <Pressable
              onPress={handleGenerateShoppingList}
              className="bg-green-500 rounded-xl p-4 flex-row items-center justify-center shadow-sm active:bg-green-600"
            >
              <ShoppingCart size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">
                Generate Shopping List
              </Text>
            </Pressable>
          </View>
        )}

        {/* Quick Add Recipes */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Quick Add Recipes
          </Text>
          <View className="gap-3">
            {availableRecipes.slice(0, 4).map(recipe => {
              const availableIngredients = recipe.ingredients.filter(ingredient =>
                items.some(item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()))
              );
              const availabilityPercent = (availableIngredients.length / recipe.ingredients.length) * 100;

              return (
                <Pressable
                  key={recipe.id}
                  onPress={() => router.push(`/premium/recipe-detail?id=${recipe.id}`)}
                  className="bg-white rounded-xl p-4 border border-gray-200 active:bg-gray-50"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-bold text-gray-900 flex-1">
                      {recipe.title}
                    </Text>
                    <View className="flex-row items-center">
                      <Check size={14} color={availabilityPercent === 100 ? '#10B981' : '#F59E0B'} />
                      <Text className={`text-xs font-semibold ml-1 ${
                        availabilityPercent === 100 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {Math.round(availabilityPercent)}%
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500">
                      {recipe.prepTime} • {recipe.servings} servings
                    </Text>
                    <Text className="text-xs text-gray-400 ml-auto">
                      {availableIngredients.length}/{recipe.ingredients.length} ingredients
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => router.push('/premium/recipes')}
            className="bg-blue-50 rounded-xl p-4 mt-3 items-center border border-blue-200 active:bg-blue-100"
          >
            <Text className="text-blue-600 font-semibold">Browse All Recipes</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
