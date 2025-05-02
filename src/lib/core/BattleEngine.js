/**
 * Core Battle Engine
 * 
 * This module handles the pure state transitions for Pokémon battles.
 * It has no dependencies on UI or game mode-specific logic.
 */

import { typeEffectiveness } from './Types.js';
import { battleEvents, BATTLE_EVENTS, createEventData } from './EventSystem.js';

/**
 * Creates an initial battle state with two Pokémon
 */
export function createBattleState(pokemon1, pokemon2) {
  const battleState = {
    pokemon1: { ...pokemon1 },
    pokemon2: { ...pokemon2 },
    turn: 1,
    battleOver: false,
    winner: null
  };
  
  // Emit battle started event
  battleEvents.emit(
    BATTLE_EVENTS.BATTLE_STARTED, 
    createEventData(BATTLE_EVENTS.BATTLE_STARTED, { 
      pokemon1: battleState.pokemon1,
      pokemon2: battleState.pokemon2
    })
  );
  
  return battleState;
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
  
  const damageResult = {
    damage: Math.max(1, Math.round(finalDamage)),
    stabModifier,
    typeModifier
  };
  
  // Emit damage calculated event
  battleEvents.emit(
    BATTLE_EVENTS.DAMAGE_CALCULATED,
    createEventData(BATTLE_EVENTS.DAMAGE_CALCULATED, {
      attacker,
      defender,
      move,
      ...damageResult
    })
  );
  
  return damageResult;
}

/**
 * Apply damage to a Pokémon
 */
export function applyDamage(pokemon, amount) {
  const newPokemon = { ...pokemon };
  newPokemon.hp = Math.max(0, newPokemon.hp - amount);
  
  // Emit damage applied event
  battleEvents.emit(
    BATTLE_EVENTS.DAMAGE_APPLIED,
    createEventData(BATTLE_EVENTS.DAMAGE_APPLIED, {
      pokemon: newPokemon,
      damageAmount: amount,
      remainingHp: newPokemon.hp,
      maxHp: newPokemon.maxHp
    })
  );
  
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
    battleEvents.emit(
      BATTLE_EVENTS.MOVE_USED,
      createEventData(BATTLE_EVENTS.MOVE_USED, {
        pokemon: attacker,
        failed: true,
        reason: 'fainted'
      })
    );
    
    return newState;
  }
  
  // Get the move
  const move = attacker.moves[moveKey];
  
  // Check if move has PP left
  if (move.ppRemaining <= 0) {
    battleEvents.emit(
      BATTLE_EVENTS.MOVE_USED,
      createEventData(BATTLE_EVENTS.MOVE_USED, {
        pokemon: attacker,
        move,
        failed: true,
        reason: 'no-pp'
      })
    );
    
    return newState;
  }
  
  // Reduce PP
  move.ppRemaining--;
  
  // Emit PP updated event
  battleEvents.emit(
    BATTLE_EVENTS.PP_UPDATED,
    createEventData(BATTLE_EVENTS.PP_UPDATED, {
      pokemon: attacker,
      move,
      remainingPP: move.ppRemaining,
      maxPP: move.pp
    })
  );
  
  // Emit move used event
  battleEvents.emit(
    BATTLE_EVENTS.MOVE_USED,
    createEventData(BATTLE_EVENTS.MOVE_USED, {
      pokemon: attacker,
      target: defender,
      move,
      moveKey
    })
  );
  
  // Calculate damage
  const damageResult = calculateDamage({ attacker, defender, move });
  
  // Apply damage
  newState[defenderId] = applyDamage(defender, damageResult.damage);
  
  // Check if defender fainted
  let battleOver = newState.battleOver;
  let winner = newState.winner;
  
  if (newState[defenderId].hp <= 0) {
    // Emit pokemon fainted event
    battleEvents.emit(
      BATTLE_EVENTS.POKEMON_FAINTED,
      createEventData(BATTLE_EVENTS.POKEMON_FAINTED, {
        pokemon: newState[defenderId]
      })
    );
    
    battleOver = true;
    winner = attackerId;
    
    // Emit battle ended event
    battleEvents.emit(
      BATTLE_EVENTS.BATTLE_ENDED,
      createEventData(BATTLE_EVENTS.BATTLE_ENDED, {
        winner: newState[attackerId],
        loser: newState[defenderId]
      })
    );
  }
  
  return {
    ...newState,
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
  
  // Emit turn started event
  battleEvents.emit(
    BATTLE_EVENTS.TURN_STARTED,
    createEventData(BATTLE_EVENTS.TURN_STARTED, {
      turn: newState.turn,
      pokemon1: newState.pokemon1,
      pokemon2: newState.pokemon2
    })
  );
  
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
  
  // Emit speed comparison event
  battleEvents.emit(
    BATTLE_EVENTS.SPEED_COMPARISON,
    createEventData(BATTLE_EVENTS.SPEED_COMPARISON, {
      pokemon1: {
        name: newState.pokemon1.name,
        speed: pokemon1Speed
      },
      pokemon2: {
        name: newState.pokemon2.name,
        speed: pokemon2Speed
      },
      firstAttacker: newState[order[0][0]].name
    })
  );
  
  // Emit move selected events
  battleEvents.emit(
    BATTLE_EVENTS.MOVE_SELECTED,
    createEventData(BATTLE_EVENTS.MOVE_SELECTED, {
      pokemon: newState.pokemon1,
      moveKey: pokemon1MoveKey,
      move: newState.pokemon1.moves[pokemon1MoveKey]
    })
  );
  
  battleEvents.emit(
    BATTLE_EVENTS.MOVE_SELECTED,
    createEventData(BATTLE_EVENTS.MOVE_SELECTED, {
      pokemon: newState.pokemon2,
      moveKey: pokemon2MoveKey,
      move: newState.pokemon2.moves[pokemon2MoveKey]
    })
  );
  
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
      turn: newState.turn + 1
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
  const requiredProps = ['pokemon1', 'pokemon2', 'turn', 'battleOver'];
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