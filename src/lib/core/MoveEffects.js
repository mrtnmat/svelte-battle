/**
 * Move Effects System
 * 
 * This module defines the execution logic for different move effects.
 * Each move can have its own custom behavior through these effect functions.
 * 
 * Modified to use the stat stage system instead of direct stat modifications.
 */

import { battleEvents, BATTLE_EVENTS, createEventData } from './EventSystem.js';
import { calculateTypeEffectiveness } from './Types.js';
import {
  applyStatStageChange,
  getEffectiveStat,
  getStatStagesSummary
} from './StatStageSystem.js';

/**
 * Standard accuracy check
 * @param {Object} params - Parameters for accuracy check
 * @returns {boolean} - Whether the move hits
 */
export function accuracyCheck({ move, attacker, defender, battleState }) {
  // If accuracy is not defined or is 0, the move always hits
  if (!move.accuracy) return true;

  // Get the base accuracy of the move
  const baseAccuracy = move.accuracy;

  // Apply accuracy and evasion stage modifiers if they exist
  let finalAccuracy = baseAccuracy;

  if (attacker.statStages && defender.statStages) {
    // Get accuracy stage modifier (attacker's accuracy)
    const accuracyStage = attacker.statStages.accuracy || 0;
    const accuracyMod = accuracyStage >= 0 ?
      (3 + accuracyStage) / 3 :
      3 / (3 - accuracyStage);

    // Get evasion stage modifier (defender's evasion)
    const evasionStage = defender.statStages.evasion || 0;
    const evasionMod = evasionStage >= 0 ?
      3 / (3 + evasionStage) :
      (3 - evasionStage) / 3;

    // Apply both modifiers
    finalAccuracy = baseAccuracy * accuracyMod * evasionMod;
  }

  // Check if the move hits
  const hitChance = Math.random() * 100;
  const hit = hitChance <= finalAccuracy;

  if (!hit) {
    battleEvents.emit(
      BATTLE_EVENTS.MOVE_MISSED,
      createEventData(BATTLE_EVENTS.MOVE_MISSED, {
        pokemon: attacker,
        move,
        target: defender
      })
    );
  }

  return hit;
}

/**
 * Standard damage calculation
 */
export function calculateDamage({ attacker, defender, move }) {
  const levelDamage = ((attacker.level * 2 / 5) + 2);

  // Determine which stat to use for attack and defense
  const attackStatName = move.attackStat || (move.category === 'Physical' ? 'attack' : 'specialAttack');
  const defenseStatName = move.defenseStat || (move.category === 'Physical' ? 'defense' : 'specialDefense');

  // Get effective stats with stage modifiers applied
  const attackStat = getEffectiveStat(attacker, attackStatName);
  const defenseStat = getEffectiveStat(defender, defenseStatName);

  // Calculate STAB (Same Type Attack Bonus)
  let stabModifier = 1;
  if (attacker.types.includes(move.type)) {
    stabModifier = 1.5;
  }

  // Calculate type effectiveness
  const typeModifier = calculateTypeEffectiveness(move.type, defender.types);

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
 * Apply status effect to a Pokémon
 */
export function applyStatusEffect(pokemon, statusEffect, duration = 3) {
  const newPokemon = { ...pokemon };

  // Add status effect if not already present
  if (!newPokemon.statusEffects) {
    newPokemon.statusEffects = {};
  }

  newPokemon.statusEffects[statusEffect] = {
    name: statusEffect,
    duration: duration,
    applied: true
  };

  // Emit status effect applied event
  battleEvents.emit(
    BATTLE_EVENTS.STATUS_EFFECT_APPLIED,
    createEventData(BATTLE_EVENTS.STATUS_EFFECT_APPLIED, {
      pokemon: newPokemon,
      statusEffect: statusEffect
    })
  );

  return newPokemon;
}

/**
 * Standard attack execution - checks accuracy and deals damage if hit
 */
export function standardAttack(params) {
  const { attacker, defender, move, battleState } = params;

  // Clone defender to avoid direct mutations
  let newDefender = { ...defender };

  // Check if the move hits
  if (!accuracyCheck(params)) {
    return {
      hit: false,
      defender: newDefender,
      damage: 0
    };
  }

  // Calculate and apply damage
  const damageResult = calculateDamage({ attacker, defender: newDefender, move });
  newDefender = applyDamage(newDefender, damageResult.damage);

  return {
    hit: true,
    defender: newDefender,
    damage: damageResult.damage,
    typeEffectiveness: damageResult.typeModifier
  };
}

/**
 * Always hit attack - skips accuracy check
 */
export function alwaysHitAttack(params) {
  const { attacker, defender, move, battleState } = params;

  // Clone defender to avoid direct mutations
  let newDefender = { ...defender };

  // Calculate and apply damage
  const damageResult = calculateDamage({ attacker, defender: newDefender, move });
  newDefender = applyDamage(newDefender, damageResult.damage);

  return {
    hit: true,
    defender: newDefender,
    damage: damageResult.damage,
    typeEffectiveness: damageResult.typeModifier
  };
}

/**
 * Status move execution - applies a status effect
 */
export function statusMove(params) {
  const { attacker, defender, move, battleState } = params;

  // Clone defender to avoid direct mutations
  let newDefender = { ...defender };

  // Check if the move hits
  if (!accuracyCheck(params)) {
    return {
      hit: false,
      defender: newDefender,
      damage: 0
    };
  }

  // Apply status effect
  newDefender = applyStatusEffect(newDefender, move.statusEffect, move.statusDuration);

  return {
    hit: true,
    defender: newDefender,
    damage: 0,
    statusEffectApplied: move.statusEffect
  };
}

/**
 * Self stat boost - increases one of the user's stats
 * Modified to use the stat stage system
 */
export function statBoostSelf(params) {
  const { attacker, move, battleState } = params;

  // Apply stat stage change
  const statName = move.statToBoost;
  const stageChange = move.stageChange || 1;

  const result = applyStatStageChange(attacker, statName, stageChange);

  // Emit stat boost event
  battleEvents.emit(
    BATTLE_EVENTS.STAT_BOOSTED,
    createEventData(BATTLE_EVENTS.STAT_BOOSTED, {
      pokemon: result.pokemon,
      stat: statName,
      stageChange: stageChange,
      message: result.message
    })
  );

  return {
    hit: true,
    attacker: result.pokemon,
    damage: 0,
    message: result.message
  };
}

/**
 * Stat lowering move - decreases one of the target's stats
 * Modified to use the stat stage system
 */
export function statLowerTarget(params) {
  const { attacker, defender, move, battleState } = params;

  // Clone defender to avoid direct mutations
  let newDefender = { ...defender };

  // Check if the move hits
  if (!accuracyCheck(params)) {
    return {
      hit: false,
      defender: newDefender,
      damage: 0
    };
  }

  // Apply stat stage change
  const statName = move.stat || 'attack'; // Default to attack if not specified
  const stageChange = -(move.stageChange || 1); // Negate for lowering

  const result = applyStatStageChange(newDefender, statName, stageChange);

  // Emit stat lowered event
  battleEvents.emit(
    BATTLE_EVENTS.STAT_LOWERED,
    createEventData(BATTLE_EVENTS.STAT_LOWERED, {
      pokemon: result.pokemon,
      stat: statName,
      stageChange: stageChange,
      message: result.message
    })
  );

  return {
    hit: true,
    defender: result.pokemon,
    damage: 0,
    message: result.message
  };
}

// Other move effect functions remain the same as they don't directly modify stats
// ...

// Metronome
export function metronome(params) {
  const { attacker, defender, moveList, battleState } = params;

  // Get all available moves except Metronome itself
  const availableMoves = Object.values(moveList).filter(move => move.name !== 'Metronome');

  // Select a random move
  const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];

  // Log the selected move
  battleEvents.emit(
    BATTLE_EVENTS.METRONOME_SELECTED,
    createEventData(BATTLE_EVENTS.METRONOME_SELECTED, {
      selectedMove: randomMove.name
    })
  );

  // Execute the selected move's effect
  return randomMove.execute({
    attacker,
    defender,
    move: randomMove,
    battleState,
    moveList
  });
}

// Healing move
export function healingMove(params) {
  const { attacker, move, battleState } = params;

  // Clone attacker to avoid direct mutations
  let target = { ...attacker }; // By default heals self

  // Calculate healing amount (percentage of max HP)
  const healPercent = move.healPercent || 50;
  const healAmount = Math.floor(target.maxHp * (healPercent / 100));

  // Apply healing (don't exceed max HP)
  const oldHp = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + healAmount);
  const actualHealAmount = target.hp - oldHp;

  // Emit healing event
  battleEvents.emit(
    BATTLE_EVENTS.HEALING_APPLIED,
    createEventData(BATTLE_EVENTS.HEALING_APPLIED, {
      pokemon: target,
      healAmount: actualHealAmount
    })
  );

  return {
    hit: true,
    attacker: target, // Return updated attacker
    damage: 0,
    healAmount: actualHealAmount
  };
}

// Export all the move effect functions
export {
  recoilAttack,
  multiHitAttack,
  secondaryEffectAttack,
  vampiricAttack,
  comboMove,
  weatherDependentMove,
  counterMove
} from './AdvancedMoveEffects.js';