// This file manages the VOD data and provides functions for filtering and searching

import { ref, computed } from 'vue'
import { addOrUpdateGame, generateImageUrl } from './games.js'
import { gamesData } from './games.js'
import vodsDataRaw from '../data/vods.json'

// Default values for fallbacks
const DEFAULT_THUMBNAIL = '/images/default-thumbnail.svg' // Path to a default thumbnail image
const DEFAULT_GAME_NAME = 'Unknown Game'
import { DEFAULT_GAME_IMAGE } from './games' // Import from games.js instead of redefining

// Initialize VOD data from the imported JSON file
const vodsData = ref(vodsDataRaw);

// Helper function to get game data directly from gamesData
function getGameByName(gameName) {
  // Import TWITCH_CATEGORIES from games.js
  const TWITCH_CATEGORIES = {
    'Art': '/images/twitch-categories/art.svg',
    'Just Chatting': '/images/twitch-categories/just-chatting.svg',
    'Software and Game Development': '/images/twitch-categories/software-development.svg'
  };
  
  // Check if this is a Twitch category
  if (gameName && TWITCH_CATEGORIES[gameName]) {
    return {
      name: gameName,
      imageHash: null,
      imageUrl: TWITCH_CATEGORIES[gameName],
      getImageUrl: (size) => TWITCH_CATEGORIES[gameName]
    };
  }
  
  // If not a Twitch category, check in gamesData
  if (!gameName || !gamesData.value[gameName]) {
    return {
      name: gameName || DEFAULT_GAME_NAME, // Use the actual game name instead of 'Unknown Game'
      imageHash: null,
      imageUrl: DEFAULT_GAME_IMAGE,
      getImageUrl: () => DEFAULT_GAME_IMAGE
    };
  }
  
  const imageHash = gamesData.value[gameName];
  return {
    name: gameName,
    imageHash: imageHash,
    imageUrl: generateImageUrl(imageHash, undefined, gameName),
    getImageUrl: (size) => generateImageUrl(imageHash, size, gameName)
  };
}

// Computed properties for VOD display data
const vodsWithGameData = computed(() => {
  return vodsData.value.map(vod => {
    // Get thumbnail URL from YouTube video ID or use unavailable image for null URLs
    const videoId = extractYoutubeVideoId(vod.youtubeUrl);
    const thumbnailUrl = vod.youtubeUrl === null ? '/images/vod-unavailable.svg' : 
                         (videoId ? generateYoutubeThumbnailUrl(videoId) : DEFAULT_THUMBNAIL);
    
    // Get game data from games store using the game name
    // Use gameId as gameName since that's how the data is structured
    const game = getGameByName(vod.gameId);
    
    // Return VOD with computed properties
    return {
      ...vod,
      thumbnailUrl,
      gameName: vod.gameId // Add gameName property based on gameId
    };
  });
});

// Search and filter state
const searchQuery = ref('');
const selectedGames = ref([]);

// For backward compatibility with Home.vue
const selectedGame = computed({
  get: () => selectedGames.value.length === 1 ? selectedGames.value[0] : null,
  set: (value) => {
    if (value === null) {
      selectedGames.value = [];
    } else {
      selectedGames.value = [value];
    }
  }
});

// Get unique games for filtering, sorted by VOD count
const uniqueGames = computed(() => {
  // First, count VODs per game
  const gameCounts = {};
  vodsData.value.forEach(vod => {
    if (!gameCounts[vod.gameId]) {
      gameCounts[vod.gameId] = 0;
    }
    gameCounts[vod.gameId]++;
  });
  
  // Then create the games map
  const games = new Map();
  vodsData.value.forEach(vod => {
    if (!games.has(vod.gameId)) {
      // Use the complete game object from getGameByName which includes the getImageUrl method
      const game = getGameByName(vod.gameId);
      games.set(vod.gameId, game);
    }
  });
  
  // Convert to array and sort by VOD count (descending)
  return Array.from(games.values())
    .sort((a, b) => (gameCounts[b.name] || 0) - (gameCounts[a.name] || 0));
});

// Filtered VODs based on search and game
const filteredVODs = computed(() => {
  return vodsWithGameData.value.filter(vod => {
    // Filter by search query
    const matchesSearch = searchQuery.value === '' || 
      vod.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      (vod.description && vod.description.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    // Filter by selected games
    const matchesGame = selectedGames.value.length === 0 || 
      selectedGames.value.includes(vod.gameId);
    
    return matchesSearch && matchesGame;
  });
});

// Function to add a new VOD
async function addVOD(vod) {
  // Generate a new ID based on the highest existing ID
  const newId = Math.max(0, ...vodsData.value.map(v => v.id)) + 1;
  
  // If game details were provided with the VOD, update our dictionary
  if (vod.gameName && vod.gameImageUrl) {
    addOrUpdateGame({
      id: Date.now(), // Generate a unique ID
      name: vod.gameName,
      imageUrl: vod.gameImageUrl
    });
  }
  
  // Add the new VOD without redundant properties
  vodsData.value.push({
    id: newId,
    title: vod.title,
    description: vod.description,
    youtubeUrl: vod.youtubeUrl,
    gameName: vod.gameName,
    date: vod.date || new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
}

// Function to update an existing VOD
async function updateVOD(updatedVod) {
  const index = vodsData.value.findIndex(vod => vod.id === updatedVod.id);
  if (index !== -1) {
    // If game details were provided with the VOD, update our dictionary
    if (updatedVod.gameName && updatedVod.gameImageUrl) {
      addOrUpdateGame({
        id: Date.now(), // Generate a unique ID
        name: updatedVod.gameName,
        imageUrl: updatedVod.gameImageUrl
      });
    }
    
    // Update the VOD without redundant properties
    vodsData.value[index] = {
      id: updatedVod.id,
      title: updatedVod.title || vodsData.value[index].title,
      description: updatedVod.description || vodsData.value[index].description,
      youtubeUrl: updatedVod.youtubeUrl || vodsData.value[index].youtubeUrl,
      gameName: updatedVod.gameName || vodsData.value[index].gameName,
      date: updatedVod.date || vodsData.value[index].date
    };
  }
}

// Function to delete a VOD
// Utility function to extract YouTube video ID from URL
function extractYoutubeVideoId(url) {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
}

// Utility function to generate YouTube thumbnail URL from video ID
function generateYoutubeThumbnailUrl(videoId) {
  if (!videoId) return null;
  
  // Use maxresdefault for highest quality
  // Note: In a production environment, you might want to check if the maxresdefault image exists
  // and fallback to mqdefault if it doesn't, but that would require an additional HTTP request
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  
  // If you want to implement a more robust solution, you could use an image onError handler in your Vue component
  // to fallback to mqdefault or the DEFAULT_THUMBNAIL if the maxresdefault image fails to load
}

export {
  vodsData,
  vodsWithGameData,
  searchQuery,
  selectedGame,
  selectedGames,
  uniqueGames,
  filteredVODs,
  addVOD,
  updateVOD,
  extractYoutubeVideoId,
  generateYoutubeThumbnailUrl,
  getGameByName
}