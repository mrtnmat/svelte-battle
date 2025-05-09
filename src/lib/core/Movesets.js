/**
 * Movesets System
 * 
 * This module defines the movesets available to each Pokémon species at different levels.
 */

// Defines when each Pokémon learns which moves
export const pokemonMovesets = {
  Pikachu: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Growl' },
    { level: 5, move: 'Thunder Wave' },
    { level: 10, move: 'Thundershock' },
    { level: 13, move: 'Swift' },
    { level: 18, move: 'Double-Edge' },
    { level: 25, move: 'Thunderbolt' },
  ],
  
  Bulbasaur: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Growl' },
    { level: 7, move: 'Vine Whip' },
    { level: 13, move: 'Growth' },
    { level: 20, move: 'Razor Leaf' },
    { level: 27, move: 'Giga Drain' },
  ],
  
  Charmander: [
    { level: 1, move: 'Scratch' },
    { level: 1, move: 'Growl' },
    { level: 7, move: 'Ember' },
    { level: 13, move: 'Fire Punch' },
    { level: 19, move: 'Leer' },
    { level: 25, move: 'Flamethrower' },
  ],
  
  Squirtle: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Tail Whip' },
    { level: 7, move: 'Water Gun' },
    { level: 13, move: 'Withdraw' },
    { level: 19, move: 'Bubble Beam' },
    { level: 25, move: 'Recover' },
  ],
  
  Abra: [
    { level: 1, move: 'Metronome' },
    { level: 1, move: 'Growth' },
    { level: 1, move: 'Thunder Wave' },
    { level: 16, move: 'Psyshock' },
    { level: 22, move: 'Recover' },
  ],
  
  // New Pokémon movesets
  Jigglypuff: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Growl' },
    { level: 9, move: 'Thunder Wave' },
    { level: 14, move: 'Metronome' },
    { level: 19, move: 'Double-Edge' },
    { level: 24, move: 'Recover' },
  ],
  
  Diglett: [
    { level: 1, move: 'Scratch' },
    { level: 1, move: 'Growl' },
    { level: 8, move: 'Swift' },
    { level: 15, move: 'Withdraw' },
    { level: 21, move: 'Double-Edge' },
  ],
  
  Geodude: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Leer' },
    { level: 10, move: 'Withdraw' },
    { level: 16, move: 'Double-Edge' },
    { level: 21, move: 'Counter' },
  ],
  
  Gastly: [
    { level: 1, move: 'Leer' },
    { level: 1, move: 'Growth' },
    { level: 8, move: 'Psyshock' },
    { level: 16, move: 'Thunder Wave' },
    { level: 22, move: 'Giga Drain' },
  ],
  
  Onix: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Withdraw' },
    { level: 9, move: 'Leer' },
    { level: 14, move: 'Counter' },
    { level: 19, move: 'Double-Edge' },
  ],
  
  Voltorb: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Thunder Wave' },
    { level: 9, move: 'Thundershock' },
    { level: 17, move: 'Swift' },
    { level: 25, move: 'Thunderbolt' },
  ],
  
  Exeggcute: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Growl' },
    { level: 7, move: 'Vine Whip' },
    { level: 15, move: 'Psyshock' },
    { level: 19, move: 'Growth' },
    { level: 25, move: 'Giga Drain' },
  ],
  
  Cubone: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Growl' },
    { level: 9, move: 'Leer' },
    { level: 17, move: 'Counter' },
    { level: 25, move: 'Double-Edge' },
  ],
  
  Koffing: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Thunder Wave' },
    { level: 9, move: 'Growth' },
    { level: 17, move: 'Withdraw' },
    { level: 21, move: 'Double-Edge' },
  ],
  
  Rhyhorn: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Leer' },
    { level: 10, move: 'Withdraw' },
    { level: 15, move: 'Counter' },
    { level: 25, move: 'Double-Edge' },
  ],
  
  Chansey: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Growl' },
    { level: 9, move: 'Recover' },
    { level: 17, move: 'Metronome' },
    { level: 23, move: 'Double-Edge' },
  ],
  
  Staryu: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Swift' },
    { level: 9, move: 'Water Gun' },
    { level: 17, move: 'Recover' },
    { level: 22, move: 'Bubble Beam' },
  ],
  
  Scyther: [
    { level: 1, move: 'Scratch' },
    { level: 1, move: 'Leer' },
    { level: 9, move: 'Swift' },
    { level: 17, move: 'Counter' },
    { level: 21, move: 'Pin Missile' },
    { level: 25, move: 'Double-Edge' },
  ],
  
  Magmar: [
    { level: 1, move: 'Scratch' },
    { level: 1, move: 'Leer' },
    { level: 7, move: 'Ember' },
    { level: 13, move: 'Fire Punch' },
    { level: 19, move: 'Growth' },
    { level: 25, move: 'Flamethrower' },
  ],
  
  Pinsir: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Leer' },
    { level: 9, move: 'Withdraw' },
    { level: 17, move: 'Pin Missile' },
    { level: 25, move: 'Double-Edge' },
  ],
  
  Tauros: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Leer' },
    { level: 9, move: 'Withdraw' },
    { level: 15, move: 'Counter' },
    { level: 21, move: 'Double-Edge' },
  ],
  
  Magikarp: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Leer' },
    { level: 10, move: 'Swift' },
    { level: 20, move: 'Water Gun' },
  ],
  
  Eevee: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Growl' },
    { level: 9, move: 'Swift' },
    { level: 17, move: 'Double-Edge' },
    { level: 25, move: 'Recover' },
  ],
  
  Porygon: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Thunder Wave' },
    { level: 9, move: 'Psyshock' },
    { level: 17, move: 'Thundershock' },
    { level: 25, move: 'Recover' },
  ],
  
  Dratini: [
    { level: 1, move: 'Tackle' },
    { level: 1, move: 'Leer' },
    { level: 8, move: 'Thunder Wave' },
    { level: 15, move: 'Swift' },
    { level: 22, move: 'Double-Edge' },
  ]
};

/**
 * Get all moves a Pokémon should know at a given level
 * @param {string} species - The Pokémon species
 * @param {number} level - The current level
 * @returns {string[]} - Array of move names
 */
export function getAvailableMoves(species, level) {
  // Get the moveset for this species
  const moveset = pokemonMovesets[species];
  
  if (!moveset) {
    return [];
  }
  
  // Filter moves available at or below the current level
  return moveset
    .filter(entry => entry.level <= level)
    .map(entry => entry.move);
}

/**
 * Get the best moves for a Pokémon at a given level
 * @param {string} species - The Pokémon species
 * @param {number} level - The current level
 * @param {number} count - Maximum number of moves to return
 * @returns {string[]} - Array of move names
 */
export function getBestMoves(species, level, count = 4) {
  // Get all available moves
  const allMoves = getAvailableMoves(species, level);
  
  // If we have fewer moves than requested, return all available moves
  if (allMoves.length <= count) {
    return allMoves;
  }
  
  // Otherwise, prioritize the most recently learned moves
  // Get the move entries that match our available moves
  const moveEntries = pokemonMovesets[species]
    .filter(entry => entry.level <= level && allMoves.includes(entry.move));
  
  // Sort by level in descending order (highest level first)
  moveEntries.sort((a, b) => b.level - a.level);
  
  // Take the first 'count' moves
  return moveEntries
    .slice(0, count)
    .map(entry => entry.move);
}