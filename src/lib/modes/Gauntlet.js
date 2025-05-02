/**
 * Gauntlet Game Mode
 * 
 * This module handles the state and orchestration for gauntlet battles.
 */

import { createBattleState, executeTurn, selectRandomMove } from '../core/BattleEngine.js';
import { createPokemon } from '../core/PokemonFactory.js';
import { initializeBattleLog, addCustomLogMessage } from '../services/BattleLogManager.js';
import { writable } from 'svelte/store';

// Create a specific store for the gauntlet log
export const gauntletLog = writable([]);

/**
 * Create initial state for gauntlet mode
 */
export function createInitialState(playerPokemon) {
    // Initialize the battle log
    initializeBattleLog();
    
    // Reset gauntlet log
    gauntletLog.set(["Welcome to Gauntlet Mode! Defeat as many Pokémon as you can!"]);
    
    // Use provided Pokémon or create default
    const player = playerPokemon || createPokemon("Pikachu", 15);

    return {
        // Gauntlet state (persists between battles)
        gauntlet: {
            playerPokemon: player,
            defeatedCount: 0
        },

        // Current battle state (null until first battle generated)
        battle: null,

        // Mode-specific UI state
        ui: {
            selectedMove: null
        }
    };
}

/**
 * Add a message to the gauntlet log
 */
function addGauntletLogMessage(message) {
    gauntletLog.update(log => [...log, message]);
}

/**
 * Generate the next opponent for gauntlet mode
 */
export function generateNextBattle(state) {
    const { gauntlet } = state;

    // For each battle, increase the enemy level slightly
    const enemyLevel = 5 + Math.floor(gauntlet.defeatedCount / 2);

    // Randomly select enemy species from available Pokémon
    const enemyOptions = ["Bulbasaur", "Charmander", "Squirtle"];
    const enemySpecies = enemyOptions[Math.floor(Math.random() * enemyOptions.length)];

    // Create enemy Pokémon
    const enemyPokemon = createPokemon(enemySpecies, enemyLevel);

    // Create a battle state
    const battleState = createBattleState(gauntlet.playerPokemon, enemyPokemon);

    // Add custom log message
    addCustomLogMessage(`Battle started against ${enemyPokemon.name}! Select a move.`);

    // Update gauntlet log
    addGauntletLogMessage(`Battle #${gauntlet.defeatedCount + 1}: ${gauntlet.playerPokemon.name} vs ${enemyPokemon.name}`);

    return {
        ...state,
        battle: battleState,
        ui: {
            selectedMove: null
        }
    };
}

/**
 * Handle player move selection in gauntlet mode
 */
export function selectMove(state, moveKey) {
    if (!state.battle || state.battle.battleOver) {
        return state;
    }

    // Update UI state
    const newState = {
        ...state,
        ui: {
            ...state.ui,
            selectedMove: moveKey
        }
    };

    // Execute the turn immediately (AI selects move automatically)
    return executeBattleTurn(newState);
}

/**
 * Execute a battle turn in gauntlet mode
 */
function executeBattleTurn(state) {
    const { battle, ui } = state;

    // Get player's selected move
    const playerMove = ui.selectedMove;

    // AI selects a random move
    const enemyMove = selectRandomMove(battle.pokemon2);

    if (!enemyMove) {
        // No valid moves for enemy, rare case handling
        addCustomLogMessage(`${battle.pokemon2.name} has no moves with PP remaining!`);

        return {
            ...state,
            battle
        };
    }

    // Execute the turn in the core battle engine
    const newBattleState = executeTurn(
        battle,
        playerMove,
        enemyMove
    );

    // Check if battle is over
    if (newBattleState.battleOver) {
        return handleBattleEnd(state, newBattleState);
    }

    // Continue battle
    return {
        ...state,
        battle: newBattleState,
        ui: {
            selectedMove: null
        }
    };
}

/**
 * Handle the end of a battle in gauntlet mode
 */
function handleBattleEnd(state, battleState) {
    const { gauntlet } = state;

    // Check who won
    if (battleState.pokemon1.hp <= 0) {
        // Player lost - game over
        addGauntletLogMessage(`Game Over! You defeated ${gauntlet.defeatedCount} opponents.`);

        return {
            ...state,
            gauntlet: {
                ...gauntlet
            },
            battle: battleState,
            ui: {
                selectedMove: null
            }
        };
    } else {
        // Player won - prepare for next battle
        const updatedGauntlet = {
            ...gauntlet,
            defeatedCount: gauntlet.defeatedCount + 1,
            playerPokemon: healPlayerAfterVictory(battleState.pokemon1)
        };
        
        addGauntletLogMessage(`You defeated ${battleState.pokemon2.name}! Total victories: ${updatedGauntlet.defeatedCount}`);

        const newState = {
            ...state,
            gauntlet: updatedGauntlet,
            battle: battleState,
            ui: {
                selectedMove: null
            }
        };

        // Generate the next battle automatically
        return generateNextBattle(newState);
    }
}

/**
 * Heal player after victory (partial HP and PP restore)
 */
function healPlayerAfterVictory(pokemon) {
    // Partial HP restore (25% of missing HP)
    const missingHp = pokemon.maxHp - pokemon.hp;
    const healAmount = Math.ceil(missingHp * 0.25);

    const healedPokemon = {
        ...pokemon,
        hp: Math.min(pokemon.maxHp, pokemon.hp + healAmount)
    };

    // Add message about healing
    addCustomLogMessage(`${pokemon.name} recovered ${healAmount} HP!`);

    // Partial PP restore (1 PP per move)
    const refreshedMoves = {};

    for (const [key, move] of Object.entries(pokemon.moves)) {
        refreshedMoves[key] = {
            ...move,
            ppRemaining: Math.min(move.pp, move.ppRemaining + 1)
        };
    }
    
    addCustomLogMessage(`${pokemon.name}'s moves recovered 1 PP each!`);

    return {
        ...healedPokemon,
        moves: refreshedMoves
    };
}

/**
 * Reset gauntlet mode completely
 */
export function resetGauntlet(state) {
    // Keep the same player Pokémon type but fully heal and refresh
    const playerPokemon = state.gauntlet.playerPokemon;
    const freshPokemon = createPokemon(playerPokemon.name, playerPokemon.level);

    // Add message about reset
    addCustomLogMessage("Starting a new gauntlet challenge!");

    return createInitialState(freshPokemon);
}

/**
 * Check if gauntlet is over (player lost)
 */
export function isGauntletOver(state) {
    return (
        state.battle &&
        state.battle.battleOver &&
        state.battle.pokemon1.hp <= 0
    );
}