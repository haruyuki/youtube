// This file manages the game data dictionary for the application

import { ref, computed } from 'vue'
import gamesDataRaw from '../data/games.json'

// IGDB image size constants
const IMAGE_SIZES = {
  COVER_BIG: 'cover_big',  // 264x374 - For featured games
  THUMB: 'thumb',          // Smaller size for VOD listings
  MICRO: 'micro'           // Tiny size for filter buttons
}

// Default images for games not in the database
const DEFAULT_GAME_IMAGES = {
  [IMAGE_SIZES.COVER_BIG]: '/images/game-icon-cover.svg',
  [IMAGE_SIZES.THUMB]: '/images/game-icon-thumb.svg',
  [IMAGE_SIZES.MICRO]: '/images/game-icon-micro.svg'
}

// Default game image for direct use
const DEFAULT_GAME_IMAGE = '/images/game-icon-cover.svg'

// Twitch-specific categories that don't have IGDB hashes
const TWITCH_CATEGORIES = {
  'Art': '/images/twitch-categories/art.svg',
  'Just Chatting': '/images/twitch-categories/just-chatting.svg',
  'Software and Game Development': '/images/twitch-categories/software-development.svg'
}

// Game dictionary data structure
// Maps game names directly to their image hash for simpler reference
const gamesData = ref(gamesDataRaw);


/**
 * Generate IGDB image URL with specified size
 * @param {string} imageHash - The image hash
 * @param {string} size - The image size (from IMAGE_SIZES)
 * @param {string} gameName - Optional game name to check for Twitch categories
 * @returns {string} - The complete image URL
 */
function generateImageUrl(imageHash, size = IMAGE_SIZES.COVER_BIG, gameName = null) {
  // Check if this is a Twitch category with a custom SVG image
  if (gameName && TWITCH_CATEGORIES[gameName]) {
    return TWITCH_CATEGORIES[gameName];
  }
  
  // Otherwise use IGDB image hash if available
  if (!imageHash) return DEFAULT_GAME_IMAGES[size] || DEFAULT_GAME_IMAGES[IMAGE_SIZES.COVER_BIG];
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageHash}.jpg`;
}

/**
 * Add or update a game in the dictionary
 * @param {Object} game - The game object with id, name, and imageHash or imageUrl
 */
function addOrUpdateGame(game) {
  if (!game || !game.id || !game.name) return
  
  // Extract hash from imageUrl if provided instead of imageHash
  let imageHash = game.imageHash;
  if (!imageHash && game.imageUrl) {
    const match = game.imageUrl.match(/\/([^\/]+)\.[^\.]+$/); // Extract hash from URL
    if (match && match[1]) {
      imageHash = match[1];
    }
  }
  
  gamesData.value[game.name] = {
    id: game.id,
    imageHash: imageHash || null
  }
}
computed(() => {
  return Object.values(gamesData.value)
});
export {
  addOrUpdateGame,
  generateImageUrl,
  IMAGE_SIZES,
  gamesData,
  DEFAULT_GAME_IMAGES,
  DEFAULT_GAME_IMAGE
}