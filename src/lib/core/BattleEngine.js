/**
 * Core Battle Engine
 * 
 * This module handles the pure state transitions for Pokémon battles.
 * It has no dependencies on UI or game mode-specific logic.
 */

import { typeEffectiveness } from './Types.js';

/**
 * Creates an initial battle state with two Pokémon
 */
export function createBattleState(pokemon1, pokemon2) {
  return {
    pokemon1: { ...pokemon1 },
    pokemon2: { ...pokemon2 },
    turn: 1,
    log: ["Battle started!"],
    battleOver: false,
    winner: null
  };
}

/**
 * Calculate damage for an attack
 */
export function calculateDamage({ attacker, defender, move }) {
  const levelDamage = ((attacker.level * 2 / 5) + 2);
  
  // Use the correct stats based on move category
  let attackStat, defenseStat;
  
  if (move.category === 'Physical') {
    attackStat = attacker.attack;
    defenseStat = defender.defense;
  } else if (move.category === 'Special') {
    attackStat = attacker.specialAttack;
    defenseStat = defender.specialDefense;
  }
  
  // Calculate STAB (Same Type Attack Bonus)
  let stabModifier = 1;
  if (attacker.types.includes(move.type)) {
    stabModifier = 1.5;
  }
  
  // Calculate type effectiveness
  let typeModifier = 1;
  if (typeEffectiveness[move.type]) {
    defender.types.forEach(defenderType => {
      if (typeEffectiveness[move.type][defenderType]) {
        typeModifier *= typeEffectiveness[move.type][defenderType];
      }
    });
  }
  
  const attackRatio = attackStat / defenseStat;
  const baseDamage = (levelDamage * move.power * attackRatio) / 50 + 2;
  const randomFactor = (Math.random() * 15 + 85) / 100;
  const finalDamage = baseDamage * randomFactor * stabModifier * typeModifier;
  
  return {
    damage: Math.max(1, Math.round(finalDamage)),
    stabModifier,
    typeModifier
  };
}

/**
 * Apply damage to a Pokémon
 */
export function applyDamage(pokemon, amount) {
  const newPokemon = { ...pokemon };
  newPokemon.hp = Math.max(0, newPokemon.hp - amount);
  return newPokemon;
}

/**
 * Execute an attack from one Pokémon to another
 */
export function executeAttack(state, attackerId, defenderId, moveKey) {
  // Create a deep copy of the state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state));
  const attacker = newState[attackerId];
  const defender = newState[defenderId];
  
  // Check if attacker is already fainted
  if (attacker.hp <= 0) {
    return {
      ...newState,
      log: [...newState.log, `${attacker.name} is unable to attack!`]
    };
  }
  
  // Get the move
  const move = attacker.moves[moveKey];
  
  // Check if move has PP left
  if (move.ppRemaining <= 0) {
    return {
      ...newState,
      log: [...newState.log, `${attacker.name} tried to use ${move.name}, but it has no PP left!`]
    };
  }
  
  // Reduce PP
  move.ppRemaining--;
  
  // Add log entry about the move
  const updatedLog = [...newState.log, `${attacker.name} used ${move.name}!`];
  
  // Calculate damage
  const damageResult = calculateDamage({ attacker, defender, move });
  
  // Apply damage
  newState[defenderId] = applyDamage(defender, damageResult.damage);
  
  // Update log with damage info
  const categoryLog = `${move.name} is a ${move.type}-type ${move.category} move!`;
  const statsLog = move.category === 'Physical' 
    ? `Used ${attacker.name}'s Attack (${attacker.attack}) against ${defender.name}'s Defense (${defender.defense})!`
    : `Used ${attacker.name}'s Special Attack (${attacker.specialAttack}) against ${defender.name}'s Special Defense (${defender.specialDefense})!`;
  
  updatedLog.push(categoryLog);
  updatedLog.push(statsLog);
  
  // Log STAB bonus
  if (damageResult.stabModifier > 1) {
    updatedLog.push(`It's ${attacker.name}'s same type! Attack power increased by 50%!`);
  }
  
  // Log type effectiveness
  if (damageResult.typeModifier > 1) {
    updatedLog.push(`It's super effective! (x${damageResult.typeModifier})`);
  } else if (damageResult.typeModifier < 1 && damageResult.typeModifier > 0) {
    updatedLog.push(`It's not very effective... (x${damageResult.typeModifier})`);
  } else if (damageResult.typeModifier === 0) {
    updatedLog.push(`It doesn't affect ${defender.name}...`);
  }
  
  updatedLog.push(`${defender.name} took ${damageResult.damage} damage!`);
  
  // Check if defender fainted
  let battleOver = newState.battleOver;
  let winner = newState.winner;
  
  if (newState[defenderId].hp <= 0) {
    updatedLog.push(`${defender.name} fainted!`);
    updatedLog.push(`${attacker.name} won the battle!`);
    battleOver = true;
    winner = attackerId;
  }
  
  return {
    ...newState,
    log: updatedLog,
    battleOver,
    winner
  };
}

/**
 * Execute a turn with moves from both Pokémon
 */
export function executeTurn(state, pokemon1MoveKey, pokemon2MoveKey) {
  let newState = { ...state };
  
  // Check if battle is already over
  if (newState.battleOver) {
    return newState;
  }
  
  // Determine who goes first based on speed
  const pokemon1Speed = newState.pokemon1.speed;
  const pokemon2Speed = newState.pokemon2.speed;
  
  // If speeds are equal, randomize (50/50 chance)
  const pokemon1First = pokemon1Speed > pokemon2Speed ||
    (pokemon1Speed === pokemon2Speed && Math.random() >= 0.5);
  
  // Order of execution
  const order = pokemon1First
    ? [
        ['pokemon1', 'pokemon2', pokemon1MoveKey], 
        ['pokemon2', 'pokemon1', pokemon2MoveKey]
      ]
    : [
        ['pokemon2', 'pokemon1', pokemon2MoveKey], 
        ['pokemon1', 'pokemon2', pokemon1MoveKey]
      ];
  
  // Add log entry about turn order
  newState = {
    ...newState,
    log: [...newState.log, `${newState[order[0][0]].name} moves first due to higher speed!`]
  };
  
  // Execute first attack
  newState = executeAttack(
    newState, 
    order[0][0], // attacker
    order[0][1], // defender
    order[0][2]  // move key
  );
  
  // Only execute second attack if battle isn't over
  if (!newState.battleOver) {
    newState = executeAttack(
      newState,
      order[1][0], // attacker
      order[1][1], // defender
      order[1][2]  // move key
    );
  }
  
  // Increment turn counter if battle isn't over
  if (!newState.battleOver) {
    newState = {
      ...newState,
      turn: newState.turn + 1,
      log: [...newState.log, `Turn ${newState.turn + 1} begins!`]
    };
  }
  
  return newState;
}

/**
 * Get valid moves for a Pokémon (moves with PP remaining)
 */
export function getValidMoves(pokemon) {
  return Object.entries(pokemon.moves)
    .filter(([_, move]) => move.ppRemaining > 0)
    .map(([key, _]) => key);
}

/**
 * Select a random valid move for a Pokémon (for AI)
 */
export function selectRandomMove(pokemon) {
  const validMoves = getValidMoves(pokemon);
  
  if (validMoves.length === 0) {
    return null; // No valid moves
  }
  
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

/**
 * Check if a battle state is valid
 */
export function isValidBattleState(state) {
  // Check if all required properties exist
  const requiredProps = ['pokemon1', 'pokemon2', 'turn', 'log', 'battleOver'];
  for (const prop of requiredProps) {
    if (!(prop in state)) {
      return false;
    }
  }
  
  // Check Pokémon structure
  for (const pokemonKey of ['pokemon1', 'pokemon2']) {
    const pokemon = state[pokemonKey];
    
    // Check required Pokémon properties
    const pokemonProps = ['name', 'hp', 'maxHp', 'moves', 'types'];
    for (const prop of pokemonProps) {
      if (!(prop in pokemon)) {
        return false;
      }
    }
    
    // Check moves
    if (typeof pokemon.moves !== 'object' || Object.keys(pokemon.moves).length === 0) {
      return false;
    }
  }
  
  return true;
}