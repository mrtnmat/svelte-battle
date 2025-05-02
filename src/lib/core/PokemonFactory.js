/**
 * Factory for creating Pokémon instances
 * 
 * This module handles creating and manipulating Pokémon objects.
 */

import { moveList, createMoveInstance } from './Moves.js';

// Base stats for each Pokémon species
const pokemonBaseStats = {
  Pikachu: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 40,
    speed: 90,
    types: ["Electric"],
    availableMoves: ["Tackle", "Thundershock", "Thunderbolt"]
  },
  Bulbasaur: {
    hp: 45,
    attack: 49,
    defense: 49,
    specialAttack: 65,
    specialDefense: 65,
    speed: 45,
    types: ["Grass", "Poison"],
    availableMoves: ["Tackle", "Vine Whip", "Razor Leaf"]
  },
  Charmander: {
    hp: 39,
    attack: 52,
    defense: 43,
    specialAttack: 60,
    specialDefense: 50,
    speed: 65,
    types: ["Fire"],
    availableMoves: ["Scratch", "Ember", "Flamethrower"]
  },
  Squirtle: {
    hp: 44,
    attack: 48,
    defense: 65,
    specialAttack: 50,
    specialDefense: 64,
    speed: 43,
    types: ["Water"],
    availableMoves: ["Tackle", "Water Gun", "Bubble Beam"]
  }
};

/**
 * Calculate the stat value based on base stat and level
 */
function calculateStat(baseStat, level, isHP = false) {
  if (isHP) {
    // HP calculation: ((Base HP * 2) * Level / 100) + Level + 10
    return Math.floor(((baseStat * 2) * level / 100) + level + 10);
  } else {
    // Other stats: ((Base Stat * 2) * Level / 100) + 5
    return Math.floor(((baseStat * 2) * level / 100) + 5);
  }
}

/**
 * Create a new Pokémon with the given species and level
 */
export function createPokemon(species, level, options = {}) {
  // Get base stats for the species
  const baseStats = pokemonBaseStats[species];
  
  if (!baseStats) {
    throw new Error(`Unknown Pokémon species: ${species}`);
  }
  
  // Calculate stats based on level
  const hp = calculateStat(baseStats.hp, level, true);
  const attack = calculateStat(baseStats.attack, level);
  const defense = calculateStat(baseStats.defense, level);
  const specialAttack = calculateStat(baseStats.specialAttack, level);
  const specialDefense = calculateStat(baseStats.specialDefense, level);
  const speed = calculateStat(baseStats.speed, level);
  
  // Determine which moves to include
  const moveKeys = options.moveKeys || baseStats.availableMoves.slice(0, 4);
  
  // Create moves object with PP
  const moves = {};
  moveKeys.forEach((moveName, index) => {
    const moveKey = `Move ${index + 1}`;
    const move = moveList[moveName];
    
    if (!move) {
      throw new Error(`Unknown move: ${moveName}`);
    }
    
    moves[moveKey] = createMoveInstance(move);
  });
  
  // Return the new Pokémon object
  return {
    name: species,
    level,
    hp,
    maxHp: hp,
    attack,
    defense,
    specialAttack,
    specialDefense,
    speed,
    moves,
    types: baseStats.types,
  };
}

/**
 * Create a team of starter Pokémon
 */
export function createStarters(level = 5) {
  return {
    Pikachu: createPokemon("Pikachu", level),
    Bulbasaur: createPokemon("Bulbasaur", level),
    Charmander: createPokemon("Charmander", level),
    Squirtle: createPokemon("Squirtle", level)
  };
}

/**
 * Heal a Pokémon to full HP
 */
export function healPokemon(pokemon) {
  return {
    ...pokemon,
    hp: pokemon.maxHp
  };
}

/**
 * Restore PP for all of a Pokémon's moves
 */
export function restorePP(pokemon) {
  const updatedMoves = {};
  
  for (const [key, move] of Object.entries(pokemon.moves)) {
    updatedMoves[key] = {
      ...move,
      ppRemaining: move.pp
    };
  }
  
  return {
    ...pokemon,
    moves: updatedMoves
  };
}

/**
 * Level up a Pokémon
 */
export function levelUp(pokemon, levels = 1) {
  const newLevel = pokemon.level + levels;
  
  // Get base stats for this species
  const species = pokemon.name;
  const baseStats = pokemonBaseStats[species];
  
  if (!baseStats) {
    throw new Error(`Unknown Pokémon species: ${species}`);
  }
  
  // Calculate new stats
  const newHp = calculateStat(baseStats.hp, newLevel, true);
  const newAttack = calculateStat(baseStats.attack, newLevel);
  const newDefense = calculateStat(baseStats.defense, newLevel);
  const newSpecialAttack = calculateStat(baseStats.specialAttack, newLevel);
  const newSpecialDefense = calculateStat(baseStats.specialDefense, newLevel);
  const newSpeed = calculateStat(baseStats.speed, newLevel);
  
  // Return upgraded Pokémon
  return {
    ...pokemon,
    level: newLevel,
    hp: newHp,
    maxHp: newHp,
    attack: newAttack,
    defense: newDefense,
    specialAttack: newSpecialAttack,
    specialDefense: newSpecialDefense,
    speed: newSpeed
  };
}

/**
 * Get all available Pokémon species
 */
export function getAllSpecies() {
  return Object.keys(pokemonBaseStats);
}

/**
 * Clone a Pokémon
 */
export function clonePokemon(pokemon) {
  return JSON.parse(JSON.stringify(pokemon));
}