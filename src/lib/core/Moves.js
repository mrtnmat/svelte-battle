/**
 * Move system for Pokémon battles
 * 
 * This module contains move definitions and creation functions.
 */

/**
 * Create a new move
 */
function createMove({name, power, pp, category, type}) {
    return {
        name,
        power,
        pp,
        category,
        type
    };
}

/**
 * Create a move instance with remaining PP
 */
export function createMoveInstance(move) {
    return {
        ...move,
        ppRemaining: move.pp
    };
}

/**
 * All available moves in the game
 */
export const moveList = {
    // Basic physical moves (Normal type)
    'Tackle': createMove({name: 'Tackle', power: 40, pp: 35, category: 'Physical', type: 'Normal'}),
    'Scratch': createMove({name: 'Scratch', power: 40, pp: 35, category: 'Physical', type: 'Normal'}),
    
    // Elemental special moves
    'Thundershock': createMove({name: 'Thundershock', power: 40, pp: 30, category: 'Special', type: 'Electric'}),
    'Vine Whip': createMove({name: 'Vine Whip', power: 45, pp: 25, category: 'Special', type: 'Grass'}),
    'Ember': createMove({name: 'Ember', power: 40, pp: 25, category: 'Special', type: 'Fire'}),
    'Water Gun': createMove({name: 'Water Gun', power: 40, pp: 25, category: 'Special', type: 'Water'}),

    // Stronger moves
    'Thunderbolt': createMove({name: 'Thunderbolt', power: 90, pp: 15, category: 'Special', type: 'Electric'}),
    'Razor Leaf': createMove({name: 'Razor Leaf', power: 55, pp: 25, category: 'Special', type: 'Grass'}),
    'Flamethrower': createMove({name: 'Flamethrower', power: 90, pp: 15, category: 'Special', type: 'Fire'}),
    'Bubble Beam': createMove({name: 'Bubble Beam', power: 65, pp: 20, category: 'Special', type: 'Water'})
};

/**
 * Get moves by type
 */
export function getMovesByType(type) {
    return Object.values(moveList).filter(move => move.type === type);
}

/**
 * Get moves by category
 */
export function getMovesByCategory(category) {
    return Object.values(moveList).filter(move => move.category === category);
}

/**
 * Check if a move has enough PP
 */
export function hasEnoughPP(move) {
    return move.ppRemaining > 0;
}

/**
 * Use a move (reduce PP)
 */
export function useMove(move) {
    if (!hasEnoughPP(move)) {
        return move; // Cannot use move without PP
    }
    
    return {
        ...move,
        ppRemaining: move.ppRemaining - 1
    };
}

/**
 * Restore PP for a move
 */
export function restorePP(move, amount = 1) {
    return {
        ...move,
        ppRemaining: Math.min(move.pp, move.ppRemaining + amount)
    };
}

/**
 * Clone a move
 */
export function cloneMove(move) {
    return { ...move };
}