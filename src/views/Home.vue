<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 md:p-8 text-center">
          <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-4">{{ t('home.title') }}</h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {{ t('home.welcome') }}
          </p>
          
          <div class="prose prose-lg dark:prose-invert max-w-none mb-8 text-left">
            <h2 class="text-2xl font-bold mt-6 mb-3 text-gray-800 dark:text-white">{{ t('home.howToUseTitle') }}</h2>
            <p class="text-gray-600 dark:text-gray-300">
              {{ t('home.howToUseDesc') }}
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300">
              <li>{{ t('home.searchByTitle') }}</li>
              <li>{{ t('home.filterByGame') }}</li>
              <li>{{ t('home.filterByTags') }}</li>
            </ul>
            
            <h2 class="text-2xl font-bold mt-6 mb-3 text-gray-800 dark:text-white">{{ t('home.contactTitle') }}</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-8">
              {{ t('home.contactDesc') }}
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <router-link to="/vods" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              {{ t('home.browseAllVods') }}
            </router-link>
          </div>
          
          <div class="mt-12">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">{{ t('home.featuredGames') }}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="game in featuredGames" :key="game.id" class="group">
                <router-link to="/vods" @click="selectGame(game.name)" class="block">                  
                  <div class="relative overflow-hidden rounded-lg shadow-md" style="width: 264px; height: 374px;">
                    <img :src="game.getImageUrl('cover_big')" :alt="game.name" class="w-full h-full object-contain transition duration-300 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end p-3">
                      <h3 class="text-white font-bold">{{ game.name }}</h3>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { uniqueGames, selectedGame } from '../store/vods';
import { t } from '../store/language';

// Get 4 random games for the featured section
const featuredGames = computed(() => {
  // Create a copy of the games array to avoid modifying the original
  const gamesCopy = [...uniqueGames.value];
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = gamesCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gamesCopy[i], gamesCopy[j]] = [gamesCopy[j], gamesCopy[i]];
  }
  // Return the first 4 games from the shuffled array
  return gamesCopy.slice(0, 4);
});

// Function to select a game and navigate to the VODs page
function selectGame(gameName) {
  selectedGame.value = gameName;
}
</script>