/**
 * Factory for creating Pokémon instances
 * 
 * This module handles creating and manipulating Pokémon objects.
 */

import { moveList, createMoveInstance } from './Moves.js';
import { getBestMoves } from './Movesets.js';

// Base stats for each Pokémon species
const pokemonBaseStats = {
  Pikachu: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 40,
    speed: 90,
    types: ["Electric"]
  },
  Bulbasaur: {
    hp: 45,
    attack: 49,
    defense: 49,
    specialAttack: 65,
    specialDefense: 65,
    speed: 45,
    types: ["Grass", "Poison"]
  },
  Charmander: {
    hp: 39,
    attack: 52,
    defense: 43,
    specialAttack: 60,
    specialDefense: 50,
    speed: 65,
    types: ["Fire"]
  },
  Squirtle: {
    hp: 44,
    attack: 48,
    defense: 65,
    specialAttack: 50,
    specialDefense: 64,
    speed: 43,
    types: ["Water"]
  },
  Abra: {
    hp: 25,
    attack: 20,
    defense: 15,
    specialAttack: 105,
    specialDefense: 55,
    speed: 90,
    types: ["Psychic"]
  },
  // Added more species for variety
  Jigglypuff: {
    hp: 115,
    attack: 45,
    defense: 20,
    specialAttack: 45,
    specialDefense: 25,
    speed: 20,
    types: ["Normal"]
  },
  Diglett: {
    hp: 10,
    attack: 55,
    defense: 25,
    specialAttack: 35,
    specialDefense: 45,
    speed: 95,
    types: ["Ground"]
  },
  Geodude: {
    hp: 40,
    attack: 80,
    defense: 100,
    specialAttack: 30,
    specialDefense: 30,
    speed: 20,
    types: ["Rock", "Ground"]
  },
  Gastly: {
    hp: 30,
    attack: 35,
    defense: 30,
    specialAttack: 100,
    specialDefense: 35,
    speed: 80,
    types: ["Ghost", "Poison"]
  },
  Onix: {
    hp: 35,
    attack: 45,
    defense: 160,
    specialAttack: 30,
    specialDefense: 45,
    speed: 70,
    types: ["Rock", "Ground"]
  },
  Voltorb: {
    hp: 40,
    attack: 30,
    defense: 50,
    specialAttack: 55,
    specialDefense: 55,
    speed: 100,
    types: ["Electric"]
  },
  Exeggcute: {
    hp: 60,
    attack: 40,
    defense: 80,
    specialAttack: 60,
    specialDefense: 45,
    speed: 40,
    types: ["Grass", "Psychic"]
  },
  Cubone: {
    hp: 50,
    attack: 50,
    defense: 95,
    specialAttack: 40,
    specialDefense: 50,
    speed: 35,
    types: ["Ground"]
  },
  Koffing: {
    hp: 40,
    attack: 65,
    defense: 95,
    specialAttack: 60,
    specialDefense: 45,
    speed: 35,
    types: ["Poison"]
  },
  Rhyhorn: {
    hp: 80,
    attack: 85,
    defense: 95,
    specialAttack: 30,
    specialDefense: 30,
    speed: 25,
    types: ["Ground", "Rock"]
  },
  Chansey: {
    hp: 250,
    attack: 5,
    defense: 5,
    specialAttack: 35,
    specialDefense: 105,
    speed: 50,
    types: ["Normal"]
  },
  Staryu: {
    hp: 30,
    attack: 45,
    defense: 55,
    specialAttack: 70,
    specialDefense: 55,
    speed: 85,
    types: ["Water"]
  },
  Scyther: {
    hp: 70,
    attack: 110,
    defense: 80,
    specialAttack: 55,
    specialDefense: 80,
    speed: 105,
    types: ["Bug", "Flying"]
  },
  Magmar: {
    hp: 65,
    attack: 95,
    defense: 57,
    specialAttack: 100,
    specialDefense: 85,
    speed: 93,
    types: ["Fire"]
  },
  Pinsir: {
    hp: 65,
    attack: 125,
    defense: 100,
    specialAttack: 55,
    specialDefense: 70,
    speed: 85,
    types: ["Bug"]
  },
  Tauros: {
    hp: 75,
    attack: 100,
    defense: 95,
    specialAttack: 40,
    specialDefense: 70,
    speed: 110,
    types: ["Normal"]
  },
  Magikarp: {
    hp: 20,
    attack: 10,
    defense: 55,
    specialAttack: 15,
    specialDefense: 20,
    speed: 80,
    types: ["Water"]
  },
  Eevee: {
    hp: 55,
    attack: 55,
    defense: 50,
    specialAttack: 45,
    specialDefense: 65,
    speed: 55,
    types: ["Normal"]
  },
  Porygon: {
    hp: 65,
    attack: 60,
    defense: 70,
    specialAttack: 85,
    specialDefense: 75,
    speed: 40,
    types: ["Normal"]
  },
  Dratini: {
    hp: 41,
    attack: 64,
    defense: 45,
    specialAttack: 50,
    specialDefense: 50,
    speed: 50,
    types: ["Dragon"]
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
  const moveKeys = options.moveKeys;

  // Use provided moves, or get level-appropriate moves if none provided
  const moveNames = moveKeys || getBestMoves(species, level);

  // Create moves object with PP
  const moves = {};
  moveNames.forEach((moveName, index) => {
    const moveKey = `Move ${index + 1}`;
    const move = moveList[moveName];

    if (!move) {
      console.warn(`Unknown move: ${moveName} for ${species}`);
      return;
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
    statusEffects: {},  // Initialize with empty status effects
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
    Squirtle: createPokemon("Squirtle", level),
    Eevee: createPokemon("Eevee", level)
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
 * Clear all status effects from a Pokémon
 */
export function cureStatusEffects(pokemon) {
  return {
    ...pokemon,
    statusEffects: {}
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

  // Get new moves for the level
  const currentMoveNames = Object.values(pokemon.moves).map(move => move.name);
  const availableMoveNames = getBestMoves(species, newLevel);

  // Keep track of new moves learned
  const newMovesLearned = availableMoveNames.filter(move => !currentMoveNames.includes(move));

  // Create updated moves object
  const updatedMoves = {};
  let moveCount = 0;

  // First add existing moves
  for (const [key, move] of Object.entries(pokemon.moves)) {
    if (moveCount < 4) {
      updatedMoves[key] = { ...move };
      moveCount++;
    }
  }

  // Then add new moves, replacing oldest if needed
  for (const moveName of newMovesLearned) {
    if (moveCount < 4) {
      // Add new move to an empty slot
      updatedMoves[`Move ${moveCount + 1}`] = createMoveInstance(moveList[moveName]);
      moveCount++;
    } else {
      // Replace the oldest move (Move 1) and shift others
      for (let i = 1; i < 4; i++) {
        updatedMoves[`Move ${i}`] = updatedMoves[`Move ${i + 1}`];
      }
      updatedMoves['Move 4'] = createMoveInstance(moveList[moveName]);
    }
  }

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
    speed: newSpeed,
    moves: updatedMoves
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