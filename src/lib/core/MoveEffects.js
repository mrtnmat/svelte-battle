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
 * Stat lowering move - decreases one of the target's stats
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
  
  // Apply stat reduction
  const statName = move.stat || 'attack'; // Default to attack if not specified
  const reductionFactor = move.reduction || 0.75; // Default to 75% if not specified
  
  const oldValue = newDefender[statName];
  newDefender[statName] = Math.max(Math.floor(oldValue * reductionFactor), 1);
  
  // Emit stat lowered event
  battleEvents.emit(
    BATTLE_EVENTS.STAT_LOWERED,
    createEventData(BATTLE_EVENTS.STAT_LOWERED, {
      pokemon: newDefender,
      stat: statName,
      amount: oldValue - newDefender[statName]
    })
  );
  
  return {
    hit: true,
    defender: newDefender,
    damage: 0,
    statLowered: statName
  };
}

/**
 * Metronome - randomly selects another move and executes it
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

/**
 * Double-edged attack - deals damage to opponent and recoil damage to user
 */
export function recoilAttack(params) {
  const { attacker, defender, move, battleState } = params;

  // First do a normal attack
  const result = standardAttack(params);

  if (result.hit && result.damage > 0) {
    // Apply recoil damage (usually 1/4 of damage dealt)
    const recoilDamage = Math.max(1, Math.floor(result.damage * (move.recoilPercent || 0.25)));

    // Clone attacker to add recoil damage
    let newAttacker = { ...attacker };
    newAttacker.hp = Math.max(0, newAttacker.hp - recoilDamage);

    // Emit recoil damage event
    battleEvents.emit(
      BATTLE_EVENTS.RECOIL_DAMAGE,
      createEventData(BATTLE_EVENTS.RECOIL_DAMAGE, {
        pokemon: newAttacker,
        recoilDamage: recoilDamage,
        causedByMove: move.name
      })
    );

    // Return updated state
    return {
      ...result,
      attacker: newAttacker,
      recoilDamage
    };
  }

  return result;
}

/**
 * Multi-hit attack - strikes 2-5 times
 */
export function multiHitAttack(params) {
  const { attacker, defender, move, battleState } = params;

  // Determine number of hits (2-5)
  let hits;
  const rand = Math.random();
  if (rand < 0.375) {
    hits = 2;
  } else if (rand < 0.75) {
    hits = 3;
  } else if (rand < 0.875) {
    hits = 4;
  } else {
    hits = 5;
  }

  // Check accuracy only once
  if (!accuracyCheck(params)) {
    return {
      hit: false,
      defender,
      damage: 0
    };
  }

  // Initialize results
  let totalDamage = 0;
  let newDefender = { ...defender };

  // Execute multiple hits
  for (let i = 0; i < hits; i++) {
    // Skip if defender is already fainted
    if (newDefender.hp <= 0) break;

    // Calculate damage for this hit
    const damageResult = calculateDamage({
      attacker,
      defender: newDefender,
      move
    });

    // Apply damage
    newDefender = applyDamage(newDefender, damageResult.damage);
    totalDamage += damageResult.damage;

    // Emit multi-hit event
    battleEvents.emit(
      BATTLE_EVENTS.MULTI_HIT,
      createEventData(BATTLE_EVENTS.MULTI_HIT, {
        hitNumber: i + 1,
        totalHits: hits,
        damage: damageResult.damage,
        pokemon: attacker,
        target: newDefender,
        move
      })
    );
  }

  return {
    hit: true,
    defender: newDefender,
    damage: totalDamage,
    hits
  };
}

/**
 * Move with secondary effect chance (e.g. status effect)
 */
export function secondaryEffectAttack(params) {
  const { attacker, defender, move, battleState } = params;

  // First do a normal attack
  const result = standardAttack(params);

  // If hit, check for secondary effect
  if (result.hit && move.secondaryEffectChance && Math.random() * 100 <= move.secondaryEffectChance) {
    let newDefender = result.defender;

    // Apply the secondary effect
    if (move.statusEffect) {
      newDefender = applyStatusEffect(
        newDefender,
        move.statusEffect,
        move.statusDuration
      );
    }

    // Return with secondary effect applied
    return {
      ...result,
      defender: newDefender,
      secondaryEffectTriggered: true
    };
  }

  return result;
}

/**
 * Vampiric attack - heals attacker for a portion of damage dealt
 */
export function vampiricAttack(params) {
  const { attacker, defender, move, battleState } = params;

  // First do a normal attack
  const result = standardAttack(params);

  if (result.hit && result.damage > 0) {
    // Calculate healing (default 50% of damage dealt)
    const healPercent = move.healPercent || 50;
    const healAmount = Math.floor(result.damage * (healPercent / 100));

    // Clone attacker to apply healing
    let newAttacker = { ...attacker };
    const oldHp = newAttacker.hp;
    newAttacker.hp = Math.min(newAttacker.maxHp, newAttacker.hp + healAmount);
    const actualHealAmount = newAttacker.hp - oldHp;

    // Emit healing event
    battleEvents.emit(
      BATTLE_EVENTS.HEALING_APPLIED,
      createEventData(BATTLE_EVENTS.HEALING_APPLIED, {
        pokemon: newAttacker,
        healAmount: actualHealAmount,
        source: 'vampiric',
        move: move.name
      })
    );

    // Return updated state
    return {
      ...result,
      attacker: newAttacker,
      healAmount: actualHealAmount
    };
  }

  return result;
}

/**
 * Combo move - execute two effects sequentially
 */
export function comboMove(params) {
  const { attacker, defender, move, battleState } = params;

  // Execute first effect
  const firstResult = move.firstEffect(params);

  // Check if battle is over after first effect
  if (firstResult.defender && firstResult.defender.hp <= 0) {
    return firstResult;
  }

  // Execute second effect with updated state
  const updatedParams = {
    ...params,
    attacker: firstResult.attacker || attacker,
    defender: firstResult.defender || defender
  };

  const secondResult = move.secondEffect(updatedParams);

  // Combine results
  return {
    hit: firstResult.hit || secondResult.hit,
    attacker: secondResult.attacker || firstResult.attacker || attacker,
    defender: secondResult.defender || firstResult.defender || defender,
    damage: (firstResult.damage || 0) + (secondResult.damage || 0)
  };
}

/**
 * Weather-dependent move - effect changes based on weather
 */
export function weatherDependentMove(params) {
  const { battleState, move } = params;

  // Get current weather from battle state
  const weather = battleState.weather || 'Clear';

  // Choose effect based on weather
  if (move.weatherEffects && move.weatherEffects[weather]) {
    return move.weatherEffects[weather](params);
  }

  // Default effect if no specific weather effect
  return move.defaultEffect(params);
}

/**
 * Counter move - returns double the damage received from last physical attack
 */
export function counterMove(params) {
  const { attacker, defender, battleState, move } = params;

  // Check if attacker has received physical damage this battle
  if (!attacker.lastReceivedPhysicalDamage) {
    battleEvents.emit(
      BATTLE_EVENTS.MOVE_FAILED,
      createEventData(BATTLE_EVENTS.MOVE_FAILED, {
        pokemon: attacker,
        move,
        reason: 'no-damage-to-counter'
      })
    );

    return {
      hit: false,
      defender,
      damage: 0
    };
  }

  // Calculate counter damage (double the last received damage)
  const counterDamage = attacker.lastReceivedPhysicalDamage * 2;

  // Apply damage to defender
  const newDefender = applyDamage(defender, counterDamage);

  // Emit counter event
  battleEvents.emit(
    BATTLE_EVENTS.COUNTER_TRIGGERED,
    createEventData(BATTLE_EVENTS.COUNTER_TRIGGERED, {
      pokemon: attacker,
      target: defender,
      originalDamage: attacker.lastReceivedPhysicalDamage,
      counterDamage: counterDamage
    })
  );

  return {
    hit: true,
    defender: newDefender,
    damage: counterDamage
  };
}