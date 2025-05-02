/**
 * Core Battle Engine
 * 
 * This module handles the pure state transitions for Pokémon battles.
 * It has no dependencies on UI or game mode-specific logic.
 */

import { moveList } from './Moves.js';
import { battleEvents, BATTLE_EVENTS, createEventData } from './EventSystem.js';

/**
 * Performs a deep clone of an object while preserving functions
 * @param {Object} obj - The object to clone
 * @returns {Object} A deep clone with functions preserved
 */
function deepCloneWithFunctions(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date, RegExp, etc.
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // Create a new object/array
  const clone = Array.isArray(obj) ? [] : {};
  
  // Copy each property
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'function') {
        // Preserve functions
        clone[key] = obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively clone nested objects
        clone[key] = deepCloneWithFunctions(obj[key]);
      } else {
        // Copy primitive values
        clone[key] = obj[key];
      }
    }
  }
  
  return clone;
}

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
 * Apply status effect processing
 * This handles the status effects at the beginning of a turn
 */
export function processStatusEffects(state) {
  // Create a deep copy of the state to avoid mutations
  const newState = deepCloneWithFunctions(state);
  
  // Process status effects for both Pokémon
  ['pokemon1', 'pokemon2'].forEach(pokemonKey => {
    const pokemon = newState[pokemonKey];
    
    // Skip if Pokémon has no status effects
    if (!pokemon.statusEffects) return;
    
    // Process each status effect
    Object.keys(pokemon.statusEffects).forEach(effectName => {
      const effect = pokemon.statusEffects[effectName];
      
      // Skip if effect is not active
      if (!effect.applied) return;
      
      // Process effect based on type
      switch (effectName) {
        case 'Paralysis':
          // 25% chance to skip turn
          if (Math.random() < 0.25) {
            pokemon.skipTurn = true;
            
            // Emit event
            battleEvents.emit(
              BATTLE_EVENTS.STATUS_EFFECT_TRIGGERED,
              createEventData(BATTLE_EVENTS.STATUS_EFFECT_TRIGGERED, {
                pokemon,
                statusEffect: effectName,
                effect: 'Skip Turn'
              })
            );
          }
          break;
          
        // Add more status effects as needed
      }
      
      // Reduce duration
      effect.duration--;
      
      // Remove effect if duration is over
      if (effect.duration <= 0) {
        delete pokemon.statusEffects[effectName];
        
        // Emit status effect removed event
        battleEvents.emit(
          BATTLE_EVENTS.STATUS_EFFECT_REMOVED,
          createEventData(BATTLE_EVENTS.STATUS_EFFECT_REMOVED, {
            pokemon,
            statusEffect: effectName
          })
        );
      }
    });
  });
  
  return newState;
}

/**
 * Execute an attack from one Pokémon to another
 */
export function executeAttack(state, attackerId, defenderId, moveKey) {
  // Create a deep copy of the state to avoid mutations
  const newState = deepCloneWithFunctions(state);
  const attacker = newState[attackerId];
  const defender = newState[defenderId];
  
  // Check if attacker is set to skip turn due to status effect
  if (attacker.skipTurn) {
    // Reset skip turn flag
    attacker.skipTurn = false;
    
    battleEvents.emit(
      BATTLE_EVENTS.MOVE_USED,
      createEventData(BATTLE_EVENTS.MOVE_USED, {
        pokemon: attacker,
        failed: true,
        reason: 'status-effect'
      })
    );
    
    return newState;
  }
  
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
  
  // Check if move.execute exists before calling it
  if (typeof move.execute !== 'function') {
    console.error(`Move ${move.name} does not have an execute function!`, move);
    
    // If execute is missing, try to restore it from the moveList
    if (moveList[move.name] && typeof moveList[move.name].execute === 'function') {
      move.execute = moveList[move.name].execute;
      console.log(`Restored execute function for ${move.name} from moveList`);
    } else {
      // Fallback to a no-op
      battleEvents.emit(
        BATTLE_EVENTS.MOVE_FAILED,
        createEventData(BATTLE_EVENTS.MOVE_FAILED, {
          pokemon: attacker,
          move,
          reason: 'execute-function-missing'
        })
      );
      
      return newState;
    }
  }
  
  // Execute the move's custom code
  const result = move.execute({
    attacker,
    defender,
    move,
    battleState: newState,
    moveList  // Pass the move list for metronome
  });
  
  // Update the state with the result
  if (result) {
    // Update defender if the result includes defender
    if (result.defender) {
      newState[defenderId] = result.defender;
    }
    
    // Update attacker if the result includes attacker
    if (result.attacker) {
      newState[attackerId] = result.attacker;
    }
  }
  
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
  let newState = deepCloneWithFunctions(state);
  
  // Check if battle is already over
  if (newState.battleOver) {
    return newState;
  }
  
  // Process status effects at the beginning of the turn
  newState = processStatusEffects(newState);
  
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