/**
 * Types system for Pokémon battles
 * 
 * This module contains type definitions and effectiveness calculations.
 */

// Define type effectiveness chart
export const typeEffectiveness = {
  Normal: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1,
    Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 0.5, Ghost: 0, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 1
  },
  Fire: {
    Normal: 1, Fire: 0.5, Water: 0.5, Electric: 1, Grass: 2, Ice: 2, Fighting: 1, Poison: 1,
    Ground: 1, Flying: 1, Psychic: 1, Bug: 2, Rock: 0.5, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 2, Fairy: 1
  },
  Water: {
    Normal: 1, Fire: 2, Water: 0.5, Electric: 1, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 1,
    Ground: 2, Flying: 1, Psychic: 1, Bug: 1, Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1, Fairy: 1
  },
  Electric: {
    Normal: 1, Fire: 1, Water: 2, Electric: 0.5, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 1,
    Ground: 0, Flying: 2, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1, Fairy: 1
  },
  Grass: {
    Normal: 1, Fire: 0.5, Water: 2, Electric: 1, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 0.5,
    Ground: 2, Flying: 0.5, Psychic: 1, Bug: 0.5, Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 0.5, Fairy: 1
  },
  Poison: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 2, Ice: 1, Fighting: 1, Poison: 0.5,
    Ground: 0.5, Flying: 1, Psychic: 1, Bug: 1, Rock: 0.5, Ghost: 0.5, Dragon: 1, Dark: 1, Steel: 0, Fairy: 2
  }
};

/**
 * Calculate the effectiveness multiplier of a move against a defender
 */
export function calculateTypeEffectiveness(moveType, defenderTypes) {
  if (!typeEffectiveness[moveType]) {
    return 1; // Default to neutral if move type not found
  }
  
  let multiplier = 1;
  
  for (const defenderType of defenderTypes) {
    if (typeEffectiveness[moveType][defenderType]) {
      multiplier *= typeEffectiveness[moveType][defenderType];
    }
  }
  
  return multiplier;
}

/**
 * Get a descriptive string for type effectiveness
 */
export function getTypeEffectivenessDescription(effectiveness) {
  if (effectiveness > 1) {
    return "super effective";
  } else if (effectiveness < 1 && effectiveness > 0) {
    return "not very effective";
  } else if (effectiveness === 0) {
    return "no effect";
  } else {
    return "effective"; // neutral
  }
}

/**
 * Get all available types
 */
export function getAllTypes() {
  return Object.keys(typeEffectiveness);
}

/**
 * Check if a type is valid
 */
export function isValidType(type) {
  return type in typeEffectiveness;
}