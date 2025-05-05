/**
 * Stat Stage System
 * 
 * This module implements the Pokémon stat stage system where stats are modified
 * by stages (-6 to +6) rather than directly changing the stat values.
 */

// Define stat stage multipliers (identical to the original Pokémon games)
// Index 0 represents stage -6, index 6 represents stage 0 (neutral), index 12 represents stage +6
export const STAT_STAGE_MULTIPLIERS = {
    // For Attack, Defense, Sp.Attack, Sp.Defense
    normalStats: [
        2 / 8, 2 / 7, 2 / 6, 2 / 5, 2 / 4, 2 / 3, 2 / 2, // -6 to 0
        3 / 2, 4 / 2, 5 / 2, 6 / 2, 7 / 2, 8 / 2        // +1 to +6
    ],
    // For Speed (slightly different multipliers)
    speed: [
        2 / 8, 2 / 7, 2 / 6, 2 / 5, 2 / 4, 2 / 3, 2 / 2, // -6 to 0
        3 / 2, 4 / 2, 5 / 2, 6 / 2, 7 / 2, 8 / 2        // +1 to +6
    ],
    // For Accuracy and Evasion
    accuracyEvasion: [
        3 / 9, 3 / 8, 3 / 7, 3 / 6, 3 / 5, 3 / 4, 3 / 3, // -6 to 0
        4 / 3, 5 / 3, 6 / 3, 7 / 3, 8 / 3, 9 / 3        // +1 to +6
    ]
};

/**
 * Initialize stat stages for a Pokémon
 * @returns {Object} - Object with all stat stages set to 0
 */
export function initializeStatStages() {
    return {
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
        accuracy: 0,
        evasion: 0
    };
}

/**
 * Apply a stage boost to a stat
 * @param {Object} pokemon - The Pokémon to modify
 * @param {string} statName - The name of the stat to boost
 * @param {number} stageChange - The number of stages to change (+/-)
 * @returns {Object} - Updated Pokémon with new stat stage and text message
 */
export function applyStatStageChange(pokemon, statName, stageChange) {
    // Initialize stat stages if they don't exist
    if (!pokemon.statStages) {
        pokemon.statStages = initializeStatStages();
    }

    // Create a copy of the Pokémon to avoid direct mutations
    const newPokemon = { ...pokemon };

    // Create a deep copy of stat stages
    newPokemon.statStages = { ...pokemon.statStages };

    // Get current stage
    const currentStage = newPokemon.statStages[statName] || 0;

    // Calculate new stage (clamped between -6 and +6)
    const newStage = Math.max(-6, Math.min(6, currentStage + stageChange));

    // Update stat stage
    newPokemon.statStages[statName] = newStage;

    // Prepare result message
    let resultMessage = "";
    const statDisplayNames = {
        attack: "Attack",
        defense: "Defense",
        specialAttack: "Special Attack",
        specialDefense: "Special Defense",
        speed: "Speed",
        accuracy: "Accuracy",
        evasion: "Evasion"
    };

    // If there was no change, the stat can't go any higher/lower
    if (newStage === currentStage) {
        if (stageChange > 0) {
            resultMessage = `${newPokemon.name}'s ${statDisplayNames[statName]} won't go any higher!`;
        } else {
            resultMessage = `${newPokemon.name}'s ${statDisplayNames[statName]} won't go any lower!`;
        }
    } else {
        // Describe the amount of change
        let changeDescription = "";
        const absChange = Math.abs(newStage - currentStage);

        if (absChange >= 3) {
            changeDescription = "drastically";
        } else if (absChange === 2) {
            changeDescription = "sharply";
        }

        if (newStage > currentStage) {
            resultMessage = `${newPokemon.name}'s ${statDisplayNames[statName]} ${changeDescription} rose!`;
        } else {
            resultMessage = `${newPokemon.name}'s ${statDisplayNames[statName]} ${changeDescription} fell!`;
        }
    }

    return {
        pokemon: newPokemon,
        message: resultMessage
    };
}

/**
 * Get the actual multiplier for a stat based on its stage
 * @param {string} statName - The name of the stat
 * @param {number} stage - The current stage (-6 to +6)
 * @returns {number} - The multiplier to apply to the stat
 */
export function getStatMultiplier(statName, stage) {
    // Convert stage to array index (0-12)
    const index = stage + 6;

    // Choose the appropriate multiplier array
    let multiplierArray;
    if (statName === 'speed') {
        multiplierArray = STAT_STAGE_MULTIPLIERS.speed;
    } else if (statName === 'accuracy' || statName === 'evasion') {
        multiplierArray = STAT_STAGE_MULTIPLIERS.accuracyEvasion;
    } else {
        // For attack, defense, specialAttack, specialDefense
        multiplierArray = STAT_STAGE_MULTIPLIERS.normalStats;
    }

    return multiplierArray[index];
}

/**
 * Calculate the effective stat value with stage modifiers applied
 * @param {Object} pokemon - The Pokémon to calculate stats for
 * @param {string} statName - The name of the stat to calculate
 * @returns {number} - The effective stat value after applying stage multipliers
 */
export function getEffectiveStat(pokemon, statName) {
    // If the Pokémon doesn't have stat stages, return the base stat
    if (!pokemon.statStages) {
        return pokemon[statName];
    }

    // Get the stage for this stat (default to 0 if not set)
    const stage = pokemon.statStages[statName] || 0;

    // If stage is 0, return the base stat
    if (stage === 0) {
        return pokemon[statName];
    }

    // Get the multiplier for this stage
    const multiplier = getStatMultiplier(statName, stage);

    // Calculate the effective stat value
    const effectiveValue = Math.floor(pokemon[statName] * multiplier);

    // Ensure stats never go below 1
    return Math.max(1, effectiveValue);
}

/**
 * Reset all stat stages to 0
 * @param {Object} pokemon - The Pokémon to reset
 * @returns {Object} - Updated Pokémon with reset stat stages
 */
export function resetStatStages(pokemon) {
    // Create a copy of the Pokémon
    const newPokemon = { ...pokemon };

    // Reset stat stages
    newPokemon.statStages = initializeStatStages();

    return newPokemon;
}

/**
 * Create a text summary of all active stat stages
 * @param {Object} pokemon - The Pokémon to summarize
 * @returns {string} - Text summary of all non-zero stat stages
 */
export function getStatStagesSummary(pokemon) {
    if (!pokemon.statStages) {
        return "No stat changes";
    }

    const statDisplayNames = {
        attack: "Attack",
        defense: "Defense",
        specialAttack: "Sp.Atk",
        specialDefense: "Sp.Def",
        speed: "Speed",
        accuracy: "Accuracy",
        evasion: "Evasion"
    };

    const changedStats = Object.entries(pokemon.statStages)
        .filter(([_, stage]) => stage !== 0)
        .map(([statName, stage]) => {
            const symbol = stage > 0 ? "+" : "";
            return `${statDisplayNames[statName]} ${symbol}${stage}`;
        });

    if (changedStats.length === 0) {
        return "No stat changes";
    }

    return changedStats.join(", ");
}