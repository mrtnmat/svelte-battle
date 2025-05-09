/**
 * Move system for Pokémon battles
 * 
 * This module contains move definitions and creation functions.
 * Modified to use the stat stage system.
 */

import * as MoveEffects from './MoveEffects.js';
import { battleEvents, BATTLE_EVENTS, createEventData } from './EventSystem.js';

/**
 * Create a new move
 */
function createMove({
  name,
  power = 0,
  pp,
  accuracy = 100,
  category,
  type,
  execute,
  attackStat = null,
  defenseStat = null,
  description = '',
  // Additional move properties
  statusEffect = null,
  statusDuration = 3,
  statToBoost = null,
  stageChange = 1, // Changed from boostAmount to stageChange for clarity
  healPercent = 0,
  // Any other custom properties
  ...otherProps
}) {
  return {
    name,
    power,
    pp,
    accuracy,
    category,
    type,
    execute,
    attackStat,
    defenseStat,
    description,
    statusEffect,
    statusDuration,
    statToBoost,
    stageChange,
    healPercent,
    ...otherProps
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
  'Tackle': createMove({
    name: 'Tackle',
    power: 40,
    pp: 35,
    category: 'Physical',
    type: 'Normal',
    description: 'A physical attack in which the user charges and slams into the target with its whole body.',
    execute: MoveEffects.standardAttack
  }),

  'Scratch': createMove({
    name: 'Scratch',
    power: 40,
    pp: 35,
    category: 'Physical',
    type: 'Normal',
    description: 'Hard, pointed, sharp claws rake the target to inflict damage.',
    execute: MoveEffects.standardAttack
  }),

  // Elemental special moves
  'Thundershock': createMove({
    name: 'Thundershock',
    power: 40,
    pp: 30,
    category: 'Special',
    type: 'Electric',
    description: 'A jolt of electricity is hurled at the target to inflict damage.',
    execute: MoveEffects.standardAttack
  }),

  'Vine Whip': createMove({
    name: 'Vine Whip',
    power: 45,
    pp: 25,
    category: 'Special',
    type: 'Grass',
    description: 'The target is struck with slender, whiplike vines to inflict damage.',
    execute: MoveEffects.standardAttack
  }),

  'Ember': createMove({
    name: 'Ember',
    power: 40,
    pp: 25,
    category: 'Special',
    type: 'Fire',
    description: 'The target is attacked with small flames. This may also leave the target with a burn.',
    execute: MoveEffects.standardAttack
  }),

  'Water Gun': createMove({
    name: 'Water Gun',
    power: 40,
    pp: 25,
    category: 'Special',
    type: 'Water',
    description: 'The target is blasted with a forceful shot of water.',
    execute: MoveEffects.standardAttack
  }),

  // Stronger moves
  'Thunderbolt': createMove({
    name: 'Thunderbolt',
    power: 90,
    pp: 15,
    category: 'Special',
    type: 'Electric',
    description: 'A strong electric blast is loosed at the target. This may also leave the target with paralysis.',
    execute: MoveEffects.standardAttack
  }),

  'Razor Leaf': createMove({
    name: 'Razor Leaf',
    power: 55,
    pp: 25,
    category: 'Special',
    type: 'Grass',
    description: 'Sharp-edged leaves are launched to slash at opposing Pokémon.',
    execute: MoveEffects.standardAttack
  }),

  'Flamethrower': createMove({
    name: 'Flamethrower',
    power: 90,
    pp: 15,
    category: 'Special',
    type: 'Fire',
    description: 'The target is scorched with an intense blast of fire. This may also leave the target with a burn.',
    execute: MoveEffects.standardAttack
  }),

  'Bubble Beam': createMove({
    name: 'Bubble Beam',
    power: 65,
    pp: 20,
    category: 'Special',
    type: 'Water',
    description: 'A spray of bubbles is forcefully ejected at the target. This may also lower the target\'s Speed stat.',
    execute: MoveEffects.secondaryEffectAttack,
    secondaryEffectChance: 10,
    stat: 'speed',
    stageChange: 1
  }),

  // Special case moves with custom effects
  'Swift': createMove({
    name: 'Swift',
    power: 60,
    pp: 20,
    accuracy: null, // Always hits
    category: 'Special',
    type: 'Normal',
    description: 'Star-shaped rays are shot at the opposing Pokémon. This attack never misses.',
    execute: MoveEffects.alwaysHitAttack
  }),

  'Growl': createMove({
    name: 'Growl',
    power: 0,
    pp: 40,
    category: 'Status',
    type: 'Normal',
    description: 'The user growls in an endearing way, making opposing Pokémon less wary. This lowers their Attack stats.',
    stat: 'attack',
    stageChange: 1, // Lower by 1 stage
    execute: MoveEffects.statLowerTarget
  }),

  'Growth': createMove({
    name: 'Growth',
    power: 0,
    pp: 20,
    category: 'Status',
    type: 'Normal',
    description: 'The user\'s body grows all at once. This raises the Attack and Sp. Atk stats.',
    statToBoost: 'specialAttack',
    stageChange: 1, // Raise by 1 stage
    execute: MoveEffects.statBoostSelf
  }),

  'Recover': createMove({
    name: 'Recover',
    power: 0,
    pp: 10,
    category: 'Status',
    type: 'Normal',
    description: 'Restoring its own cells, the user restores its own HP by half of its max HP.',
    healPercent: 50,
    execute: MoveEffects.healingMove
  }),

  'Metronome': createMove({
    name: 'Metronome',
    power: 0,
    pp: 10,
    category: 'Status',
    type: 'Normal',
    description: 'The user waggles a finger and stimulates its brain into randomly using nearly any move.',
    execute: MoveEffects.metronome
  }),

  // Custom moves with special stat interactions
  'Psyshock': createMove({
    name: 'Psyshock',
    power: 80,
    pp: 10,
    category: 'Special',
    type: 'Psychic',
    description: 'The user materializes a special psychic wave to attack. This attack does physical damage.',
    attackStat: 'specialAttack',  // Uses special attack
    defenseStat: 'defense',       // But targets physical defense!
    execute: MoveEffects.standardAttack
  }),

  // Status inducing moves
  'Thunder Wave': createMove({
    name: 'Thunder Wave',
    power: 0,
    pp: 20,
    accuracy: 90,
    category: 'Status',
    type: 'Electric',
    description: 'The user launches a weak jolt of electricity that paralyzes the target.',
    statusEffect: 'Paralysis',
    execute: MoveEffects.statusMove
  }),

  'Withdraw': createMove({
    name: 'Withdraw',
    power: 0,
    pp: 15,
    category: 'Status',
    type: 'Water',
    description: 'The user withdraws into its shell, raising its Defense stat.',
    statToBoost: 'defense',
    stageChange: 1, // Raise by 1 stage
    execute: MoveEffects.statBoostSelf
  }),

  // Moves with recoil damage
  'Double-Edge': createMove({
    name: 'Double-Edge',
    power: 120,
    pp: 15,
    accuracy: 100,
    category: 'Physical',
    type: 'Normal',
    description: 'A reckless, life-risking tackle that also hurts the user.',
    recoilPercent: 0.33, // 1/3 of damage dealt
    execute: MoveEffects.recoilAttack
  }),

  // Multi-hit moves
  'Pin Missile': createMove({
    name: 'Pin Missile',
    power: 25, // Power per hit
    pp: 20,
    accuracy: 95,
    category: 'Physical',
    type: 'Bug',
    description: 'Sharp spikes are shot at the target in rapid succession. Hits 2-5 times.',
    execute: MoveEffects.multiHitAttack
  }),

  // Moves with secondary effects
  'Fire Punch': createMove({
    name: 'Fire Punch',
    power: 75,
    pp: 15,
    accuracy: 100,
    category: 'Physical',
    type: 'Fire',
    description: 'The target is punched with a fiery fist. This may leave the target with a burn.',
    statusEffect: 'Burn',
    statusDuration: 3,
    secondaryEffectChance: 10, // 10% chance to burn
    execute: MoveEffects.secondaryEffectAttack
  }),

  // Vampiric moves
  'Giga Drain': createMove({
    name: 'Giga Drain',
    power: 75,
    pp: 10,
    accuracy: 100,
    category: 'Special',
    type: 'Grass',
    description: 'A nutrient-draining attack. The user\'s HP is restored by half the damage taken by the target.',
    healPercent: 50, // 50% of damage dealt
    execute: MoveEffects.vampiricAttack
  }),

  // Combo moves
  'Swords Dance': createMove({
    name: 'Swords Dance',
    power: 0,
    pp: 20,
    category: 'Status',
    type: 'Normal',
    description: 'A frenetic dance to uplift the fighting spirit. Sharply raises the user\'s Attack stat.',
    firstEffect: (params) => {
      // Boost attack by 2 stages
      const result = { ...params };
      result.move = {
        ...result.move,
        statToBoost: 'attack',
        stageChange: 2
      };
      return MoveEffects.statBoostSelf(result);
    },
    secondEffect: (params) => {
      // Small self-healing
      const result = { ...params };
      result.move = {
        ...result.move,
        healPercent: 10
      };
      return MoveEffects.healingMove(result);
    },
    execute: MoveEffects.comboMove
  }),

  // Counter move
  'Counter': createMove({
    name: 'Counter',
    power: 0, // Power is dynamically calculated
    pp: 20,
    accuracy: 100,
    category: 'Physical',
    type: 'Fighting',
    description: 'A retaliation move that counters any physical attack, inflicting double the damage taken.',
    execute: MoveEffects.counterMove
  }),

  // Additional stat-lowering moves using our new function
  'Tail Whip': createMove({
    name: 'Tail Whip',
    power: 0,
    pp: 30,
    category: 'Status',
    type: 'Normal',
    description: 'The user wags its tail cutely, making opposing Pokémon less wary and lowering their Defense stat.',
    stat: 'defense',
    stageChange: 1, // Lower by 1 stage
    execute: MoveEffects.statLowerTarget
  }),

  'Leer': createMove({
    name: 'Leer',
    power: 0,
    pp: 30,
    category: 'Status',
    type: 'Normal',
    description: 'The user gives opposing Pokémon an intimidating leer that lowers the Defense stat.',
    stat: 'defense',
    stageChange: 1, // Lower by 1 stage
    execute: MoveEffects.statLowerTarget
  }),

  'String Shot': createMove({
    name: 'String Shot',
    power: 0,
    pp: 40,
    category: 'Status',
    type: 'Bug',
    description: 'The user binds the target with silk blown from its mouth. This lowers the target\'s Speed stat.',
    stat: 'speed',
    stageChange: 2, // Lower by 2 stages
    execute: MoveEffects.statLowerTarget
  }),

  // New moves that use stat stages more explicitly
  'Howl': createMove({
    name: 'Howl',
    power: 0,
    pp: 40,
    category: 'Status',
    type: 'Normal',
    description: 'The user howls loudly to raise its spirit, which raises its Attack stat.',
    statToBoost: 'attack',
    stageChange: 1,
    execute: MoveEffects.statBoostSelf
  }),

  'Meditate': createMove({
    name: 'Meditate',
    power: 0,
    pp: 40,
    category: 'Status',
    type: 'Psychic',
    description: 'The user meditates to awaken the power deep within its body and raise its Attack stat.',
    statToBoost: 'attack',
    stageChange: 1,
    execute: MoveEffects.statBoostSelf
  }),

  'Defense Curl': createMove({
    name: 'Defense Curl',
    power: 0,
    pp: 40,
    category: 'Status',
    type: 'Normal',
    description: 'The user curls up to conceal weak spots and raise its Defense stat.',
    statToBoost: 'defense',
    stageChange: 1,
    execute: MoveEffects.statBoostSelf
  }),

  'Harden': createMove({
    name: 'Harden',
    power: 0,
    pp: 30,
    category: 'Status',
    type: 'Normal',
    description: 'The user stiffens all the muscles in its body to raise its Defense stat.',
    statToBoost: 'defense',
    stageChange: 1,
    execute: MoveEffects.statBoostSelf
  }),

  // Stronger stat modifier moves (2 stages)
  'Cosmic Power': createMove({
    name: 'Cosmic Power',
    power: 0,
    pp: 20,
    category: 'Status',
    type: 'Psychic',
    description: 'The user absorbs a mystical power from space to raise its Defense and Sp. Def stats.',
    firstEffect: (params) => {
      // Boost defense by 1 stage
      const result = { ...params };
      result.move = {
        ...result.move,
        statToBoost: 'defense',
        stageChange: 1
      };
      return MoveEffects.statBoostSelf(result);
    },
    secondEffect: (params) => {
      // Boost special defense by 1 stage
      const result = { ...params };
      result.move = {
        ...result.move,
        statToBoost: 'specialDefense',
        stageChange: 1
      };
      return MoveEffects.statBoostSelf(result);
    },
    execute: MoveEffects.comboMove
  }),

  'Nasty Plot': createMove({
    name: 'Nasty Plot',
    power: 0,
    pp: 20,
    category: 'Status',
    type: 'Dark',
    description: 'The user stimulates its brain by thinking bad thoughts. This sharply raises the user\'s Sp. Atk stat.',
    statToBoost: 'specialAttack',
    stageChange: 2, // Raise by 2 stages (sharply)
    execute: MoveEffects.statBoostSelf
  }),

  'Dragon Dance': createMove({
    name: 'Dragon Dance',
    power: 0,
    pp: 20,
    category: 'Status',
    type: 'Dragon',
    description: 'The user vigorously performs a mystic, powerful dance that raises its Attack and Speed stats.',
    firstEffect: (params) => {
      // Boost attack by 1 stage
      const result = { ...params };
      result.move = {
        ...result.move,
        statToBoost: 'attack',
        stageChange: 1
      };
      return MoveEffects.statBoostSelf(result);
    },
    secondEffect: (params) => {
      // Boost speed by 1 stage
      const result = { ...params };
      result.move = {
        ...result.move,
        statToBoost: 'speed',
        stageChange: 1
      };
      return MoveEffects.statBoostSelf(result);
    },
    execute: MoveEffects.comboMove
  }),

  // Accuracy/Evasion modifiers
  'Sand Attack': createMove({
    name: 'Sand Attack',
    power: 0,
    pp: 15,
    category: 'Status',
    type: 'Ground',
    description: 'Sand is hurled in the target\'s face, reducing its accuracy.',
    stat: 'accuracy',
    stageChange: 1, // Lower accuracy by 1 stage
    execute: MoveEffects.statLowerTarget
  }),

  'Double Team': createMove({
    name: 'Double Team',
    power: 0,
    pp: 15,
    category: 'Status',
    type: 'Normal',
    description: 'By moving rapidly, the user makes illusory copies of itself to raise its evasiveness.',
    statToBoost: 'evasion',
    stageChange: 1, // Raise evasion by 1 stage
    execute: MoveEffects.statBoostSelf
  })
}