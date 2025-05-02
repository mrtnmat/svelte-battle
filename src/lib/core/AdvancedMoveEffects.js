/**
 * Advanced Move Effects System
 * 
 * This module defines the execution logic for more complex move effects.
 */

import { battleEvents, BATTLE_EVENTS, createEventData } from './EventSystem.js';
import * as MoveEffects from './MoveEffects.js';

/**
 * Double-edged attack - deals damage to opponent and recoil damage to user
 */
export function recoilAttack(params) {
    const { attacker, defender, move, battleState } = params;

    // First do a normal attack
    const result = MoveEffects.standardAttack(params);

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
    if (!MoveEffects.accuracyCheck(params)) {
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
        const damageResult = MoveEffects.calculateDamage({
            attacker,
            defender: newDefender,
            move
        });

        // Apply damage
        newDefender = MoveEffects.applyDamage(newDefender, damageResult.damage);
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
    const result = MoveEffects.standardAttack(params);

    // If hit, check for secondary effect
    if (result.hit && move.secondaryEffectChance && Math.random() * 100 <= move.secondaryEffectChance) {
        let newDefender = result.defender;

        // Apply the secondary effect
        if (move.statusEffect) {
            newDefender = MoveEffects.applyStatusEffect(
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
    const result = MoveEffects.standardAttack(params);

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
    const newDefender = MoveEffects.applyDamage(defender, counterDamage);

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