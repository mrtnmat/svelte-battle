/**
 * Single Battle Game Mode
 * 
 * This module handles the state and orchestration for single battles.
 */

import { createBattleState, executeTurn } from '../core/BattleEngine.js';
import { createPokemon } from '../core/PokemonFactory.js';

/**
 * Create initial state for a single battle
 */
export function createInitialState(pokemon1, pokemon2) {
  // Default Pokémon if not provided
  const player = pokemon1 || createPokemon("Pikachu", 15);
  const opponent = pokemon2 || createPokemon("Bulbasaur", 5);
  
  // Create the battle state
  const battleState = createBattleState(player, opponent);
  
  // Add welcome message
  battleState.log = ["Battle started! Select moves for both Pokémon."];
  
  return {
    // Battle state from the core engine
    battle: battleState,
    
    // Mode-specific UI state (not part of core battle state)
    ui: {
      selectedMoves: {
        pokemon1: null,
        pokemon2: null
      }
    }
  };
}

/**
 * Handle move selection
 */
export function selectMove(state, pokemonId, moveKey) {
  // Update the UI state for selected moves
  const newState = {
    ...state,
    ui: {
      ...state.ui,
      selectedMoves: {
        ...state.ui.selectedMoves,
        [pokemonId]: moveKey
      }
    }
  };
  
  // Check if both moves are selected
  const pokemon1Move = newState.ui.selectedMoves.pokemon1;
  const pokemon2Move = newState.ui.selectedMoves.pokemon2;
  
  if (pokemon1Move !== null && pokemon2Move !== null) {
    // Execute the turn if both moves are selected
    return executeBattleTurn(newState);
  }
  
  return newState;
}

/**
 * Execute a battle turn when both moves are selected
 */
function executeBattleTurn(state) {
  // Get the selected moves
  const pokemon1Move = state.ui.selectedMoves.pokemon1;
  const pokemon2Move = state.ui.selectedMoves.pokemon2;
  
  // Execute the turn in the core battle engine
  const newBattleState = executeTurn(
    state.battle,
    pokemon1Move,
    pokemon2Move
  );
  
  // Reset selected moves for the next turn
  return {
    battle: newBattleState,
    ui: {
      ...state.ui,
      selectedMoves: {
        pokemon1: null,
        pokemon2: null
      }
    }
  };
}

/**
 * Check if both moves are selected
 */
export function areBothMovesSelected(state) {
  return (
    state.ui.selectedMoves.pokemon1 !== null &&
    state.ui.selectedMoves.pokemon2 !== null
  );
}

/**
 * Reset the battle with the same Pokémon
 */
export function resetBattle(state) {
  // Create a fresh battle state with the same Pokémon
  const player = state.battle.pokemon1;
  const opponent = state.battle.pokemon2;
  
  // Reset HP and PP
  const refreshedPlayer = {
    ...player,
    hp: player.maxHp,
    moves: Object.entries(player.moves).reduce((acc, [key, move]) => {
      return {
        ...acc,
        [key]: {
          ...move,
          ppRemaining: move.pp
        }
      };
    }, {})
  };
  
  const refreshedOpponent = {
    ...opponent,
    hp: opponent.maxHp,
    moves: Object.entries(opponent.moves).reduce((acc, [key, move]) => {
      return {
        ...acc,
        [key]: {
          ...move,
          ppRemaining: move.pp
        }
      };
    }, {})
  };
  
  // Create a new battle state
  return createInitialState(refreshedPlayer, refreshedOpponent);
}