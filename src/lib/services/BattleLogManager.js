/**
 * Battle Log Manager
 * 
 * This service listens to battle events and generates appropriate log messages.
 * Updated to handle stat stage messages.
 */

import { writable } from 'svelte/store';
import { battleEvents, BATTLE_EVENTS } from '../core/EventSystem.js';

// Create a store for the log messages
export const battleLog = writable([]);

// Store all unsubscribe functions
let unsubscribeFunctions = [];

// Initialize the battle log
export function initializeBattleLog() {
  // Clean up existing subscriptions first to prevent duplicates
  cleanupEventListeners();

  // Reset log messages
  battleLog.set([]);

  // Set up fresh event listeners
  setupEventListeners();
}

// Remove all event listeners
export function cleanupEventListeners() {
  // Call each unsubscribe function
  unsubscribeFunctions.forEach(unsubscribe => unsubscribe());

  // Reset the array
  unsubscribeFunctions = [];
}

// Setup all event listeners
function setupEventListeners() {
  // Battle started
  const unsubBattleStart = battleEvents.on(BATTLE_EVENTS.BATTLE_STARTED, (event) => {
    // Support both naming conventions (pokemon1/pokemon2 and playerPokemon/enemyPokemon)
    const pokemon1 = event.pokemon1 || event.playerPokemon;
    const pokemon2 = event.pokemon2 || event.enemyPokemon;

    if (pokemon1 && pokemon2) {
      addLogMessage(`Battle started between ${pokemon1.name} and ${pokemon2.name}!`);
      addLogMessage(`Select moves for both Pokémon.`);
    } else {
      addLogMessage(`Battle started!`);
    }
  });
  unsubscribeFunctions.push(unsubBattleStart);

  // Turn started
  const unsubTurnStart = battleEvents.on(BATTLE_EVENTS.TURN_STARTED, (event) => {
    if (event.turn > 1) { // Don't show for the first turn
      addLogMessage(`Turn ${event.turn} begins!`);
    }
  });
  unsubscribeFunctions.push(unsubTurnStart);

  // Speed comparison
  const unsubSpeedComp = battleEvents.on(BATTLE_EVENTS.SPEED_COMPARISON, (event) => {
    addLogMessage(`${event.firstAttacker} moves first due to higher speed!`);
  });
  unsubscribeFunctions.push(unsubSpeedComp);

  // Move used
  const unsubMoveUsed = battleEvents.on(BATTLE_EVENTS.MOVE_USED, (event) => {
    if (event.failed) {
      if (event.reason === 'fainted') {
        addLogMessage(`${event.pokemon.name} is unable to attack!`);
      } else if (event.reason === 'no-pp') {
        addLogMessage(`${event.pokemon.name} tried to use ${event.move.name}, but it has no PP left!`);
      } else if (event.reason === 'status-effect') {
        addLogMessage(`${event.pokemon.name} is unable to move due to status!`);
      }
    } else {
      addLogMessage(`${event.pokemon.name} used ${event.move.name}!`);
    }
  });
  unsubscribeFunctions.push(unsubMoveUsed);

  // Move missed
  const unsubMoveMissed = battleEvents.on(BATTLE_EVENTS.MOVE_MISSED, (event) => {
    addLogMessage(`${event.pokemon.name}'s attack missed!`);
  });
  unsubscribeFunctions.push(unsubMoveMissed);

  // Move failed
  const unsubMoveFailed = battleEvents.on(BATTLE_EVENTS.MOVE_FAILED, (event) => {
    if (event.reason === 'no-damage-to-counter') {
      addLogMessage(`${event.pokemon.name}'s Counter failed! It hasn't taken damage yet.`);
    } else if (event.reason === 'execute-function-missing') {
      addLogMessage(`${event.pokemon.name}'s ${event.move.name} failed to execute!`);
    } else {
      addLogMessage(`${event.pokemon.name}'s move failed!`);
    }
  });
  unsubscribeFunctions.push(unsubMoveFailed);

  // Metronome selected
  const unsubMetronomeSelected = battleEvents.on(BATTLE_EVENTS.METRONOME_SELECTED, (event) => {
    addLogMessage(`Metronome selected ${event.selectedMove}!`);
  });
  unsubscribeFunctions.push(unsubMetronomeSelected);

  // Damage calculated
  const unsubDamageCalc = battleEvents.on(BATTLE_EVENTS.DAMAGE_CALCULATED, (event) => {
    // Log move details
    addLogMessage(`${event.move.name} is a ${event.move.type}-type ${event.move.category} move!`);

    // Log stat usage
    if (event.move.category === 'Physical') {
      addLogMessage(`Used ${event.attacker.name}'s Attack against ${event.defender.name}'s Defense!`);
    } else if (event.move.category === 'Special') {
      addLogMessage(`Used ${event.attacker.name}'s Special Attack against ${event.defender.name}'s Special Defense!`);
    }

    // Log STAB bonus
    if (event.stabModifier > 1) {
      addLogMessage(`It's ${event.attacker.name}'s same type! Attack power increased by 50%!`);
    }

    // Log type effectiveness
    if (event.typeModifier > 1) {
      addLogMessage(`It's super effective! (x${event.typeModifier})`);
    } else if (event.typeModifier < 1 && event.typeModifier > 0) {
      addLogMessage(`It's not very effective... (x${event.typeModifier})`);
    } else if (event.typeModifier === 0) {
      addLogMessage(`It doesn't affect ${event.defender.name}...`);
    }
  });
  unsubscribeFunctions.push(unsubDamageCalc);

  // Damage applied
  const unsubDamageApplied = battleEvents.on(BATTLE_EVENTS.DAMAGE_APPLIED, (event) => {
    addLogMessage(`${event.pokemon.name} took ${event.damageAmount} damage!`);
  });
  unsubscribeFunctions.push(unsubDamageApplied);

  // Healing applied
  const unsubHealingApplied = battleEvents.on(BATTLE_EVENTS.HEALING_APPLIED, (event) => {
    if (event.source === 'vampiric') {
      addLogMessage(`${event.pokemon.name} drained ${event.healAmount} HP!`);
    } else {
      addLogMessage(`${event.pokemon.name} recovered ${event.healAmount} HP!`);
    }
  });
  unsubscribeFunctions.push(unsubHealingApplied);

  // Recoil damage
  const unsubRecoilDamage = battleEvents.on(BATTLE_EVENTS.RECOIL_DAMAGE, (event) => {
    addLogMessage(`${event.pokemon.name} was hit with ${event.recoilDamage} recoil damage!`);
  });
  unsubscribeFunctions.push(unsubRecoilDamage);

  // Multi-hit
  const unsubMultiHit = battleEvents.on(BATTLE_EVENTS.MULTI_HIT, (event) => {
    if (event.hitNumber === 1) {
      addLogMessage(`${event.pokemon.name}'s attack hits multiple times!`);
    }
    addLogMessage(`Hit ${event.hitNumber}: ${event.damage} damage!`);
    if (event.hitNumber === event.totalHits) {
      addLogMessage(`Hit ${event.totalHits} times in total!`);
    }
  });
  unsubscribeFunctions.push(unsubMultiHit);

  // Counter triggered
  const unsubCounterTriggered = battleEvents.on(BATTLE_EVENTS.COUNTER_TRIGGERED, (event) => {
    addLogMessage(`${event.pokemon.name}'s Counter returned ${event.counterDamage} damage!`);
  });
  unsubscribeFunctions.push(unsubCounterTriggered);

  // Status effect applied
  const unsubStatusApplied = battleEvents.on(BATTLE_EVENTS.STATUS_EFFECT_APPLIED, (event) => {
    addLogMessage(`${event.pokemon.name} was afflicted with ${event.statusEffect}!`);
  });
  unsubscribeFunctions.push(unsubStatusApplied);

  // Status effect removed
  const unsubStatusRemoved = battleEvents.on(BATTLE_EVENTS.STATUS_EFFECT_REMOVED, (event) => {
    addLogMessage(`${event.pokemon.name} recovered from ${event.statusEffect}!`);
  });
  unsubscribeFunctions.push(unsubStatusRemoved);

  // Status effect triggered
  const unsubStatusTriggered = battleEvents.on(BATTLE_EVENTS.STATUS_EFFECT_TRIGGERED, (event) => {
    addLogMessage(`${event.pokemon.name} is affected by ${event.statusEffect}!`);
    if (event.effect === 'Skip Turn') {
      addLogMessage(`${event.pokemon.name} is paralyzed and can't move!`);
    }
  });
  unsubscribeFunctions.push(unsubStatusTriggered);

  // Stat boosted - Updated for stat stages
  const unsubStatBoosted = battleEvents.on(BATTLE_EVENTS.STAT_BOOSTED, (event) => {
    // If there's a custom message from the stat stage system, use it
    if (event.message) {
      addLogMessage(event.message);
    } else {
      // Convert stat name to display name
      const statDisplayNames = {
        'attack': 'Attack',
        'defense': 'Defense',
        'specialAttack': 'Special Attack',
        'specialDefense': 'Special Defense',
        'speed': 'Speed',
        'accuracy': 'Accuracy',
        'evasion': 'Evasion'
      };
      const displayName = statDisplayNames[event.stat] || event.stat;

      // Create a message based on the stage change
      const absChange = Math.abs(event.stageChange || 1);
      let changeText = '';

      if (absChange >= 3) {
        changeText = 'drastically';
      } else if (absChange === 2) {
        changeText = 'sharply';
      }

      addLogMessage(`${event.pokemon.name}'s ${displayName} ${changeText} rose!`);
    }
  });
  unsubscribeFunctions.push(unsubStatBoosted);

  // Stat lowered - Updated for stat stages
  const unsubStatLowered = battleEvents.on(BATTLE_EVENTS.STAT_LOWERED, (event) => {
    // If there's a custom message from the stat stage system, use it
    if (event.message) {
      addLogMessage(event.message);
    } else {
      // Convert stat name to display name
      const statDisplayNames = {
        'attack': 'Attack',
        'defense': 'Defense',
        'specialAttack': 'Special Attack',
        'specialDefense': 'Special Defense',
        'speed': 'Speed',
        'accuracy': 'Accuracy',
        'evasion': 'Evasion'
      };
      const displayName = statDisplayNames[event.stat] || event.stat;

      // Create a message based on the stage change
      const absChange = Math.abs(event.stageChange || 1);
      let changeText = '';

      if (absChange >= 3) {
        changeText = 'severely';
      } else if (absChange === 2) {
        changeText = 'harshly';
      }

      addLogMessage(`${event.pokemon.name}'s ${displayName} ${changeText} fell!`);
    }
  });
  unsubscribeFunctions.push(unsubStatLowered);

  // Pokémon fainted
  const unsubPokemonFainted = battleEvents.on(BATTLE_EVENTS.POKEMON_FAINTED, (event) => {
    addLogMessage(`${event.pokemon.name} fainted!`);
  });
  unsubscribeFunctions.push(unsubPokemonFainted);

  // Battle ended
  const unsubBattleEnded = battleEvents.on(BATTLE_EVENTS.BATTLE_ENDED, (event) => {
    addLogMessage(`${event.winner.name} won the battle!`);
  });
  unsubscribeFunctions.push(unsubBattleEnded);
}

// Helper function to add a message to the log
function addLogMessage(message) {
  battleLog.update(log => [...log, message]);
}

// Export function to manually add messages (for use in game modes)
export function addCustomLogMessage(message) {
  addLogMessage(message);
}

// Reset the battle log
export function resetBattleLog() {
  battleLog.set([]);
}