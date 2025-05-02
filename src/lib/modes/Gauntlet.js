/**
 * Gauntlet Game Mode
 * 
 * This module handles the state and orchestration for gauntlet battles.
 */

import { createBattleState, executeTurn, selectRandomMove } from '../core/BattleEngine.js';
import { createPokemon, levelUp } from '../core/PokemonFactory.js';
import { initializeBattleLog, addCustomLogMessage } from '../services/BattleLogManager.js';
import { writable } from 'svelte/store';

/**
 * Create initial state for gauntlet mode
 */
export function createInitialState(playerPokemon) {
    // Initialize the battle log
    initializeBattleLog();
    
    // Use provided Pokémon or create default
    const player = playerPokemon || createPokemon("Pikachu", 5);

    return {
        // Gauntlet state (persists between battles)
        gauntlet: {
            playerPokemon: player,
            defeatedCount: 0,
            totalXP: 0,
            battleHistory: [
                { message: `Gauntlet challenge started with ${player.name} (Lv. ${player.level})!` }
            ],
            rewards: []
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
 * Add a battle record to the history
 */
function addBattleRecord(state, record) {
    const newState = {
        ...state,
        gauntlet: {
            ...state.gauntlet,
            battleHistory: [...state.gauntlet.battleHistory, record]
        }
    };
    
    return newState;
}

/**
 * Generate the next opponent for gauntlet mode
 */
export function generateNextBattle(state) {
    const { gauntlet } = state;

    // For each battle, increase the enemy level slightly
    const baseLevel = Math.max(5, Math.floor(gauntlet.playerPokemon.level * 0.8));
    const levelVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
    const enemyLevel = baseLevel + levelVariation;

    // Randomly select enemy species from available Pokémon
    const enemyOptions = ["Bulbasaur", "Charmander", "Squirtle", "Abra"];
    const enemySpecies = enemyOptions[Math.floor(Math.random() * enemyOptions.length)];

    // Create enemy Pokémon
    const enemyPokemon = createPokemon(enemySpecies, enemyLevel);

    // Create a battle state
    const battleState = createBattleState(gauntlet.playerPokemon, enemyPokemon);

    // Add custom log message
    addCustomLogMessage(`Battle #${gauntlet.defeatedCount + 1}: ${gauntlet.playerPokemon.name} (Lv. ${gauntlet.playerPokemon.level}) vs ${enemyPokemon.name} (Lv. ${enemyPokemon.level})!`);
    addCustomLogMessage(`Select a move to attack.`);

    // Add to battle history
    const updatedState = addBattleRecord(state, {
        battleNumber: gauntlet.defeatedCount + 1,
        enemy: {
            name: enemyPokemon.name,
            level: enemyPokemon.level
        },
        message: `Battle #${gauntlet.defeatedCount + 1}: vs ${enemyPokemon.name} (Lv. ${enemyPokemon.level})`
    });

    return {
        ...updatedState,
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
 * Calculate XP gained from defeating an opponent
 */
function calculateXPGain(winnerLevel, defenderLevel) {
    // Base XP is defender's level
    const baseXP = defenderLevel;
    
    // Apply a level difference modifier
    const levelDifference = defenderLevel - winnerLevel;
    let modifier = 1.0;
    
    if (levelDifference > 0) {
        // Bonus for defeating higher level Pokémon
        modifier = 1.0 + (levelDifference * 0.1);
    } else if (levelDifference < 0) {
        // Reduced XP for defeating lower level Pokémon
        modifier = Math.max(0.5, 1.0 + (levelDifference * 0.05));
    }
    
    // Calculate final XP
    return Math.max(1, Math.round(baseXP * modifier));
}

/**
 * Handle the end of a battle in gauntlet mode
 */
function handleBattleEnd(state, battleState) {
    const { gauntlet } = state;

    // Check who won
    if (battleState.pokemon1.hp <= 0) {
        // Player lost - game over
        addCustomLogMessage(`Game Over! ${battleState.pokemon1.name} was defeated after winning ${gauntlet.defeatedCount} battles.`);

        // Add to battle history
        const updatedState = addBattleRecord(state, {
            result: 'defeat',
            message: `${battleState.pokemon1.name} was defeated by ${battleState.pokemon2.name}.`,
            finalScore: gauntlet.defeatedCount
        });

        return {
            ...updatedState,
            battle: battleState,
            ui: {
                selectedMove: null
            }
        };
    } else {
        // Player won - prepare for next battle
        const xpGained = calculateXPGain(
            battleState.pokemon1.level, 
            battleState.pokemon2.level
        );

        const totalXP = gauntlet.totalXP + xpGained;
        
        // Determine if leveling up
        const shouldLevelUp = battleState.pokemon1.level < 100 && 
            (totalXP >= battleState.pokemon1.level * 5);
        
        let updatedPokemon = healPlayerAfterVictory(battleState.pokemon1);
        let levelUpMessage = null;
        
        if (shouldLevelUp) {
            // Level up the Pokémon
            const oldLevel = updatedPokemon.level;
            updatedPokemon = levelUp(updatedPokemon);
            levelUpMessage = `${updatedPokemon.name} grew to level ${updatedPokemon.level}!`;
            
            // Add message about level up
            addCustomLogMessage(levelUpMessage);
        }
        
        // Add victory message to log
        addCustomLogMessage(`${updatedPokemon.name} defeated ${battleState.pokemon2.name} and gained ${xpGained} XP!`);

        // Update gauntlet state
        const updatedGauntlet = {
            ...gauntlet,
            defeatedCount: gauntlet.defeatedCount + 1,
            totalXP: shouldLevelUp ? 0 : totalXP, // Reset XP after level up
            playerPokemon: updatedPokemon,
            rewards: [...gauntlet.rewards, {
                type: 'xp',
                amount: xpGained
            }]
        };
        
        // Add to battle history
        let updatedState = addBattleRecord(state, {
            result: 'victory',
            enemy: {
                name: battleState.pokemon2.name,
                level: battleState.pokemon2.level
            },
            rewards: {
                xp: xpGained,
                levelUp: shouldLevelUp
            },
            message: `Defeated ${battleState.pokemon2.name} (Lv. ${battleState.pokemon2.level})! XP: +${xpGained}`
        });

        if (levelUpMessage) {
            updatedState = addBattleRecord(updatedState, {
                type: 'level-up',
                message: levelUpMessage
            });
        }

        const newState = {
            ...updatedState,
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
    if (healAmount > 0) {
        addCustomLogMessage(`${pokemon.name} recovered ${healAmount} HP!`);
    }

    // Partial PP restore (1 PP per move)
    const refreshedMoves = {};

    for (const [key, move] of Object.entries(pokemon.moves)) {
        const ppRestored = Math.min(1, move.pp - move.ppRemaining);
        refreshedMoves[key] = {
            ...move,
            ppRemaining: Math.min(move.pp, move.ppRemaining + ppRestored)
        };
    }
    
    if (Object.values(pokemon.moves).some(move => move.ppRemaining < move.pp)) {
        addCustomLogMessage(`${pokemon.name}'s moves recovered 1 PP each!`);
    }

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
    const freshPokemon = createPokemon(playerPokemon.name, 5);

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