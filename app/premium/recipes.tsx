import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Search, ChefHat, Clock, Users, Filter, X, Heart } from 'lucide-react-native';
import { useStore } from '@/store';
import { usePremium } from '@/hooks/usePremium';
import { PremiumFeatureLock } from '@/components/premium/PremiumFeatureLock';
import { generateRecipeSuggestions, getAvailableIngredientsCount } from '@/utils/recipeGenerator';
import { MealType, PrepTime, Recipe } from '@/types';
import { Card } from '@/components/ui/Card';

export default function RecipesScreen() {
  const router = useRouter();
  const { isPremium } = usePremium();
  const { items, recipePreferences, isRecipeFavorite, savedRecipes } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType | undefined>();
  const [selectedPrepTime, setSelectedPrepTime] = useState<PrepTime | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Generate recipe suggestions
  const recipes = useMemo(() => {
    if (!isPremium) return [];

    return generateRecipeSuggestions(items, recipePreferences, {
      mealType: selectedMealType,
      prepTime: selectedPrepTime,
    });
  }, [items, recipePreferences, selectedMealType, selectedPrepTime, isPremium]);

  // Filter by search and favorites
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(recipe => isRecipeFavorite(recipe.id));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [recipes, searchQuery, showFavoritesOnly, isRecipeFavorite]);

  if (!isPremium) {
    return (
      <>
        <Stack.Screen options={{ title: 'AI Recipes', headerBackTitle: 'Premium' }} />
        <SafeAreaView className="flex-1 bg-gray-50 p-6">
          <PremiumFeatureLock
            featureName="AI Recipe Suggestions"
            description="Get personalized recipe ideas using ingredients you already have, with priority given to items expiring soon"
          >
            <View className="bg-white rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <ChefHat size={20} color="#3B82F6" />
                <Text className="text-slate-900 font-semibold ml-2">What you'll get:</Text>
              </View>
              <Text className="text-slate-600 text-sm leading-5">
                • Smart recipe matching based on your inventory{'\n'}
                • Prioritizes ingredients expiring soon{'\n'}
                • Filter by meal type and prep time{'\n'}
                • One-tap to add missing ingredients to shopping list{'\n'}
                • Track ingredient usage automatically
              </Text>
            </View>
          </PremiumFeatureLock>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'AI Recipes', headerBackTitle: 'Premium' }} />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-3">
                <ChefHat size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">What's for dinner?</Text>
                <Text className="text-sm text-gray-700">
                  {showFavoritesOnly
                    ? `${savedRecipes.length} favorite recipe${savedRecipes.length !== 1 ? 's' : ''}`
                    : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} based on your inventory`}
                </Text>
              </View>
            </View>

            {/* Search Bar */}
            <View className="bg-white rounded-xl flex-row items-center px-4 py-3 border border-gray-200">
              <Search size={20} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search recipes..."
                className="flex-1 ml-3 text-base text-slate-900"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>

            {/* Filter and Favorites Toggles */}
            <View className="flex-row items-center justify-between mt-3">
              <Pressable
                onPress={() => setShowFilters(!showFilters)}
                className="flex-row items-center py-2"
              >
                <Filter size={16} color="#3B82F6" />
                <Text className="text-blue-600 font-medium ml-2">
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex-row items-center py-2 px-3 rounded-lg ${
                  showFavoritesOnly ? 'bg-red-50' : ''
                }`}
              >
                <Heart
                  size={16}
                  color={showFavoritesOnly ? '#EF4444' : '#9CA3AF'}
                  fill={showFavoritesOnly ? '#EF4444' : 'transparent'}
                />
                <Text className={`font-medium ml-2 ${
                  showFavoritesOnly ? 'text-red-600' : 'text-gray-600'
                }`}>
                  Favorites Only
                </Text>
              </Pressable>
            </View>

            {/* Filters */}
            {showFilters && (
              <View className="mt-4">
                <Text className="text-sm font-semibold text-slate-700 mb-2">Meal Type</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => (
                    <Pressable
                      key={type}
                      onPress={() => setSelectedMealType(selectedMealType === type ? undefined : type)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedMealType === type ? 'bg-blue-600' : 'bg-white border border-gray-300'
                      }`}
                    >
                      <Text
                        className={`font-medium capitalize ${
                          selectedMealType === type ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text className="text-sm font-semibold text-slate-700 mb-2">Prep Time</Text>
                <View className="flex-row flex-wrap gap-2">
                  <FilterChip
                    label="Under 20 min"
                    selected={selectedPrepTime === 'under_20'}
                    onPress={() => setSelectedPrepTime(selectedPrepTime === 'under_20' ? undefined : 'under_20')}
                  />
                  <FilterChip
                    label="20-40 min"
                    selected={selectedPrepTime === '20_to_40'}
                    onPress={() => setSelectedPrepTime(selectedPrepTime === '20_to_40' ? undefined : '20_to_40')}
                  />
                  <FilterChip
                    label="Over 40 min"
                    selected={selectedPrepTime === 'over_40'}
                    onPress={() => setSelectedPrepTime(selectedPrepTime === 'over_40' ? undefined : 'over_40')}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Recipe List */}
          <View className="px-6">
            {filteredRecipes.length === 0 ? (
              <Card variant="elevated" className="p-6 items-center">
                <ChefHat size={48} color="#9CA3AF" />
                <Text className="text-slate-700 font-semibold text-lg mt-4 mb-2">
                  No recipes found
                </Text>
                <Text className="text-slate-500 text-center">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Add some items to your inventory to get recipe suggestions'}
                </Text>
              </Card>
            ) : (
              filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() => router.push({
                    pathname: '/premium/recipe-detail',
                    params: { recipeData: JSON.stringify(recipe) }
                  })}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// Helper Components
function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-lg ${
        selected ? 'bg-blue-600' : 'bg-white border border-gray-300'
      }`}
    >
      <Text className={`font-medium ${selected ? 'text-white' : 'text-slate-700'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  const { toggleRecipeFavorite, isRecipeFavorite } = useStore();
  const isFavorite = isRecipeFavorite(recipe.id);
  const stats = getAvailableIngredientsCount(recipe);
  const prepTimeLabels: { [key in PrepTime]: string } = {
    under_20: 'Under 20 min',
    '20_to_40': '20-40 min',
    over_40: 'Over 40 min',
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleRecipeFavorite(recipe);
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:bg-gray-50 shadow-sm"
    >
      {/* Header */}
      <View className="flex-row items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900 mb-1">{recipe.title}</Text>
          <Text className="text-sm text-slate-600 leading-5">{recipe.description}</Text>
        </View>
        <Pressable
          onPress={handleFavoritePress}
          className="ml-2"
        >
          <Heart
            size={24}
            color={isFavorite ? '#EF4444' : '#9CA3AF'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      {/* Stats */}
      <View className="flex-row items-center mb-3">
        <View className="flex-row items-center mr-4">
          <Clock size={16} color="#64748B" />
          <Text className="text-xs text-slate-600 ml-1">{prepTimeLabels[recipe.prepTime]}</Text>
        </View>
        <View className="flex-row items-center">
          <Users size={16} color="#64748B" />
          <Text className="text-xs text-slate-600 ml-1">{recipe.servings} servings</Text>
        </View>
      </View>

      {/* Availability Badge */}
      <View className="flex-row items-center">
        <View
          className={`flex-1 h-2 rounded-full overflow-hidden ${
            stats.percentage >= 75 ? 'bg-green-100' : stats.percentage >= 50 ? 'bg-yellow-100' : 'bg-orange-100'
          }`}
        >
          <View
            className={`h-full ${
              stats.percentage >= 75 ? 'bg-green-500' : stats.percentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
            }`}
            style={{ width: `${stats.percentage}%` }}
          />
        </View>
        <Text className="text-xs font-semibold text-slate-700 ml-3">
          {stats.available}/{stats.total} ingredients
        </Text>
      </View>
    </Pressable>
  );
}
