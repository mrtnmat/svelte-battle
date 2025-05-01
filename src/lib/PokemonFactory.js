import { moveList } from "./Moves.js";

// Base stats for each Pokemon species
const pokemonBaseStats = {
  Pikachu: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 40,
    speed: 90,
    moves: ["Tackle", "Thundershock"]
  },
  Bulbasaur: {
    hp: 45,
    attack: 49,
    defense: 49,
    specialAttack: 65,
    specialDefense: 65,
    speed: 45,
    moves: ["Tackle", "Vine Whip"]
  },
  Charmander: {
    hp: 39,
    attack: 52,
    defense: 43,
    specialAttack: 60,
    specialDefense: 50,
    speed: 65,
    moves: ["Scratch", "Ember"]
  },
  Squirtle: {
    hp: 44,
    attack: 48,
    defense: 65,
    specialAttack: 50,
    specialDefense: 64,
    speed: 43,
    moves: ["Tackle", "Water Gun"]
  }
};

// Calculate the stat value based on base stat and level
function calculateStat(baseStat, level, isHP = false) {
  if (isHP) {
    // HP calculation: ((Base HP * 2) * Level / 100) + Level + 10
    return Math.floor(((baseStat * 2) * level / 100) + level + 10);
  } else {
    // Other stats: ((Base Stat * 2) * Level / 100) + 5
    return Math.floor(((baseStat * 2) * level / 100) + 5);
  }
}

// Create a new Pokemon with the given species and level
export function createPokemon(species, level) {
  // Get base stats for the species
  const baseStats = pokemonBaseStats[species];
  
  if (!baseStats) {
    throw new Error(`Unknown Pokemon species: ${species}`);
  }
  
  // Calculate stats based on level
  const hp = calculateStat(baseStats.hp, level, true);
  const attack = calculateStat(baseStats.attack, level);
  const defense = calculateStat(baseStats.defense, level);
  const specialAttack = calculateStat(baseStats.specialAttack, level);
  const specialDefense = calculateStat(baseStats.specialDefense, level);
  const speed = calculateStat(baseStats.speed, level);
  
  // Create moves object with PP
  const moves = {};
  baseStats.moves.forEach((moveName, index) => {
    const moveKey = `Move ${index + 1}`;
    const move = moveList[moveName];
    
    if (!move) {
      throw new Error(`Unknown move: ${moveName}`);
    }
    
    moves[moveKey] = {
      ...move,
      ppRemaining: move.pp
    };
  });
  
  // Return the new Pokemon object
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
    moves
  };
}

// Helper function to create a fresh team of Pokemon
export function createStarters(level = 5) {
  return {
    Pikachu: createPokemon("Pikachu", level),
    Bulbasaur: createPokemon("Bulbasaur", level),
    Charmander: createPokemon("Charmander", level),
    Squirtle: createPokemon("Squirtle", level)
  };
}