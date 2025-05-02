/**
 * Move Effects System
 * 
 * This module defines the execution logic for different move effects.
 * Each move can have its own custom behavior through these effect functions.
 */

import { battleEvents, BATTLE_EVENTS, createEventData } from './EventSystem.js';
import { calculateTypeEffectiveness } from './Types.js';

/**
 * Standard accuracy check
 * @param {Object} params - Parameters for accuracy check
 * @returns {boolean} - Whether the move hits
 */
export function accuracyCheck({ move, attacker, defender, battleState }) {
  // If accuracy is not defined or is 0, the move always hits
  if (!move.accuracy) return true;

  const accuracyValue = move.accuracy;
  const hitChance = Math.random() * 100;

  const hit = hitChance <= accuracyValue;

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
  
  // Use the correct stats based on attackStat and defenseStat properties
  const attackStat = attacker[move.attackStat || (move.category === 'Physical' ? 'attack' : 'specialAttack')];
  const defenseStat = defender[move.defenseStat || (move.category === 'Physical' ? 'defense' : 'specialDefense')];
  
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
 */
export function statBoostSelf(params) {
  const { attacker, move, battleState } = params;
  
  // Clone attacker to avoid direct mutations
  let newAttacker = { ...attacker };
  
  // Apply stat boost
  const statName = move.statToBoost;
  const boostAmount = move.boostAmount || 1;
  
  // Update stat - in a real implementation, you might want caps or diminishing returns
  newAttacker[statName] = Math.floor(newAttacker[statName] * (1 + (boostAmount * 0.5)));
  
  // Emit stat boost event
  battleEvents.emit(
    BATTLE_EVENTS.STAT_BOOSTED,
    createEventData(BATTLE_EVENTS.STAT_BOOSTED, {
      pokemon: newAttacker,
      stat: statName,
      amount: boostAmount
    })
  );
  
  return {
    hit: true,
    attacker: newAttacker,
    damage: 0,
    statBoosted: statName
  };
}

/**
 * Metronome - randomly selects another move and executes it
 * This requires access to the move database, which we'll add a parameter for
 */
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

/**
 * Healing move - restores HP to user or target
 */
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