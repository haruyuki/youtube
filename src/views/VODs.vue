<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Search and Filter Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">{{ t('vods.searchFilterTitle') }}</h2>
          
          <!-- Search Bar -->
          <div class="mb-6">
            <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ t('vods.searchVods') }}</label>
            <input 
              type="text" 
              id="search" 
              v-model="searchQuery" 
              :placeholder="t('vods.searchPlaceholder')"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            >
          </div>
          
          <!-- Game Filter Dropdown -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('vods.filterByGame') }}</label>
              <button 
                @click="isGameFilterOpen = !isGameFilterOpen"
                class="text-sm text-purple-600 dark:text-purple-400 flex items-center"
              >
                {{ isGameFilterOpen ? t('vods.hideGames') : t('vods.showGames') }}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" :class="isGameFilterOpen ? 'transform rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <!-- Selected Games Pills -->
            <div v-if="selectedGames.length > 0" class="flex flex-wrap gap-2 mb-3">
              <div 
                v-for="gameName in selectedGames" 
                :key="gameName"
                class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center"
              >
                <img :src="getGameByName(gameName).getImageUrl('micro')" :alt="gameName" class="w-4 h-4 mr-2 rounded" />
                <span>{{ gameName }}</span>
                <button @click="toggleGameSelection(gameName)" class="ml-2 text-white hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button 
                @click="selectedGames = []"
                class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150"
              >
                {{ t('vods.clearAll') }}
              </button>
            </div>
            
            <!-- Game List (Collapsible) -->
            <div v-show="isGameFilterOpen" class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 max-h-80 overflow-y-auto">
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <button 
                  v-for="game in uniqueGames" 
                  :key="game.name"
                  @click="toggleGameSelection(game.name)"
                  :class="[selectedGames.includes(game.name) ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white', 'px-3 py-2 rounded-md text-sm font-medium transition duration-150 flex items-center justify-between']"
                >
                  <div class="flex items-center">
                    <img :src="game.getImageUrl('micro')" :alt="game.name" class="w-6 h-6 mr-2 rounded" />
                    <span>{{ game.name }}</span>
                  </div>
                  <span class="ml-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs rounded-full">
                    {{ gameVodCounts[game.name] || 0 }}
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Tag Filter Removed -->
        </div>
      </div>
      
      <!-- VODs List & Pagination -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-cols-max">
        <div v-for="vod in paginatedVODs" :key="vod.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col w-auto">
          <!-- VOD Thumbnail -->
          <div class="relative w-full">
            <a :href="vod.youtubeUrl" target="_blank" rel="noopener noreferrer" class="block">
              <img :src="vod.thumbnailUrl" :alt="vod.title" class="w-full" style="object-fit: cover;">
              <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </a>
          </div>
          
          <!-- VOD Info -->
          <div class="p-4">
            <div class="flex items-center mb-3">
              <img :src="getGameByName(vod.gameId).getImageUrl('thumb')" :alt="vod.gameId" class="w-10 h-10 rounded mr-3">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ vod.gameId }}</span>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">
              <a :href="vod.youtubeUrl" target="_blank" rel="noopener noreferrer" class="hover:text-purple-600 dark:hover:text-purple-400 transition duration-150">
                {{ vod.title }}
              </a>
            </h3>
            
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">{{ vod.description }}</p>
            

            
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ new Date(vod.date).toLocaleDateString() }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center space-x-2">
        <button 
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {{ t('vods.pagination.previous') }}
        </button>
        
        <span class="text-gray-700 dark:text-gray-300">
          {{ t('vods.pagination.page') }} {{ currentPage }} {{ t('vods.pagination.of') }} {{ totalPages }}
        </span>
        
        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {{ t('vods.pagination.next') }}
        </button>
      </div>

      <!-- No Results Message -->
      <div v-if="filteredVODs.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">{{ t('vods.noVodsFound') }}</h3>
        <p class="text-gray-600 dark:text-gray-400">{{ t('vods.tryAdjusting') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  searchQuery, 
  selectedGames,
  uniqueGames, 
  filteredVODs, // Keep for totalPages calculation
  paginatedVODs, // Use for displaying VODs
  currentPage,
  itemsPerPage,
  nextPage,
  prevPage,
  goToPage, // Optional: if you want to implement direct page jumps
  vodsData
} from '../store/vods';
import { getGameByName } from '../store/vods';
import { computed, ref } from 'vue';
import { t } from '../store/language';

// Computed property for total pages
const totalPages = computed(() => {
  return Math.ceil(filteredVODs.value.length / itemsPerPage.value);
});

// Toggle state for game filter dropdown
const isGameFilterOpen = ref(false);

// Function to toggle game selection
function toggleGameSelection(gameName) {
  const index = selectedGames.value.indexOf(gameName);
  if (index === -1) {
    // Add game to selection
    selectedGames.value.push(gameName);
  } else {
    // Remove game from selection
    selectedGames.value.splice(index, 1);
  }
}

// Function to count VODs per game
const gameVodCounts = computed(() => {
  const counts = {};
  
  // Count all VODs
  counts['all'] = vodsData.value.length;
  
  // Count VODs per game
  vodsData.value.forEach(vod => {
    if (!counts[vod.gameId]) {
      counts[vod.gameId] = 0;
    }
    counts[vod.gameId]++;
  });
  
  return counts;
});
</script>