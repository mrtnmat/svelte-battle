/**
 * Trainer Gauntlet Game Mode
 * 
 * This module handles the state and orchestration for trainer gauntlet battles.
 * Players face an endless series of trainers with progressively increasing difficulty.
 * The player has a team of 6 Pokémon at level 25, while opponents start at level 5.
 */

import { createBattleState, executeTurn, selectRandomMove } from '../core/BattleEngine.js';
import { createPokemon, getAllSpecies } from '../core/PokemonFactory.js';
import { initializeBattleLog, addCustomLogMessage } from '../services/BattleLogManager.js';
import { battleEvents, BATTLE_EVENTS, createEventData } from '../core/EventSystem.js';

/**
 * Create a team of random Pokémon
 */
function createRandomTeam(size, level, excluded = []) {
  const allSpecies = getAllSpecies().filter(species => !excluded.includes(species));
  const team = [];

  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * allSpecies.length);
    const species = allSpecies[randomIndex];

    // Remove selected species to avoid duplicates
    allSpecies.splice(randomIndex, 1);

    team.push(createPokemon(species, level));
  }

  return team;
}

/**
 * Create a trainer with a team of Pokémon
 */
function createTrainer(name, level, teamSize = 3) {
  return {
    name,
    team: createRandomTeam(teamSize, level),
    activePokemonIndex: 0 // Index of currently active Pokémon
  };
}

/**
 * Create initial state for trainer gauntlet mode
 */
export function createInitialState() {
  // Initialize the battle log
  initializeBattleLog();

  // Create player's team (6 random Pokémon at level 25)
  const playerTeam = createRandomTeam(6, 25);

  // Create player trainer
  const player = {
    name: "Player",
    team: playerTeam,
    activePokemonIndex: 0 // Index of currently active Pokémon
  };

  return {
    // Gauntlet state (persists between battles)
    gauntlet: {
      player: player,
      trainersDefeated: 0,
      difficulty: 1, // Starts easy, gradually increases
      battleHistory: [
        { message: `Gauntlet challenge started with a team of 6 Pokémon!` }
      ],
      currentTrainer: null,
      currentBattleIndex: 0 // Index of the current battle within the trainer
    },

    // Current battle state (null until first battle generated)
    battle: null,

    // Mode-specific UI state
    ui: {
      selectedMove: null,
      showingTeamSelect: false,
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
 * Generate the next trainer for gauntlet mode
 */
export function generateNextTrainer(state) {
  const { gauntlet } = state;

  // Calculate trainer level based on difficulty
  // Start at level 5 and gradually increase
  const trainerLevel = Math.max(5, Math.min(50, Math.floor(5 + gauntlet.trainersDefeated * 1.5)));

  // Increase team size as difficulty increases
  const teamSize = Math.min(6, 1 + Math.floor(gauntlet.trainersDefeated / 3));

  // Generate trainer names
  const trainerTypes = [
    'Youngster', 'Bug Catcher', 'Lass', 'Hiker', 'Beauty', 'Fisherman',
    'Psychic', 'Swimmer', 'Camper', 'Picnicker', 'Rocker', 'Juggler',
    'Engineer', 'Scientist', 'Blackbelt', 'Rocket Grunt', 'Channeler'
  ];

  const trainerNames = [
    'Joey', 'Jimmy', 'Billy', 'Sally', 'Jane', 'Tom', 'Kate', 'Mike',
    'Alice', 'Bob', 'Rick', 'Liz', 'Sam', 'Fiona', 'Greg', 'Tina',
    'Dan', 'Zoey', 'Mark', 'Lily', 'Ben', 'Emma', 'Jack', 'Mia'
  ];

  const trainerType = trainerTypes[Math.floor(Math.random() * trainerTypes.length)];
  const trainerName = trainerNames[Math.floor(Math.random() * trainerNames.length)];
  const fullName = `${trainerType} ${trainerName}`;

  // Create new trainer
  const newTrainer = createTrainer(fullName, trainerLevel, teamSize);

  // Set current trainer and reset battle index
  const updatedState = {
    ...state,
    gauntlet: {
      ...gauntlet,
      currentTrainer: newTrainer,
      currentBattleIndex: 0
    }
  };

  // Add to battle history
  const battleRecord = {
    type: 'new-trainer',
    message: `Trainer ${fullName} appears! They have ${teamSize} Pokémon with them.`
  };

  // Generate first battle of this trainer
  return generateNextBattle(addBattleRecord(updatedState, battleRecord));
}

/**
 * Generate the next battle in the current trainer encounter
 */
export function generateNextBattle(state) {
  const { gauntlet } = state;
  const { player, currentTrainer, currentBattleIndex } = gauntlet;

  // Check if we need a new trainer
  if (!currentTrainer || currentBattleIndex >= currentTrainer.team.length) {
    return generateNextTrainer(state);
  }

  // Get the active Pokémon for both sides
  const playerPokemon = player.team[player.activePokemonIndex];
  const trainerPokemon = currentTrainer.team[currentBattleIndex];

  // Create a battle state
  const battleState = createBattleState(playerPokemon, trainerPokemon);

  // Add custom log message
  addCustomLogMessage(`Battle: ${playerPokemon.name} (Lv. ${playerPokemon.level}) vs ${trainerPokemon.name} (Lv. ${trainerPokemon.level})!`);
  addCustomLogMessage(`Select a move to attack or switch to another Pokémon.`);

  // Add to battle history
  const updatedState = addBattleRecord(state, {
    type: 'new-battle',
    message: `${currentTrainer.name} sends out ${trainerPokemon.name} (Lv. ${trainerPokemon.level})!`
  });

  // Emit battle started event with trainer context
  battleEvents.emit(
    BATTLE_EVENTS.BATTLE_STARTED,
    createEventData(BATTLE_EVENTS.BATTLE_STARTED, {
      pokemon1: playerPokemon,
      pokemon2: trainerPokemon,
      playerTrainer: player,
      enemyTrainer: currentTrainer,
      battleIndex: currentBattleIndex
    })
  );

  return {
    ...updatedState,
    battle: battleState,
    ui: {
      selectedMove: null,
      showingTeamSelect: false
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
      selectedMove: moveKey,
      showingTeamSelect: false
    }
  };

  // Execute the turn immediately (AI selects move automatically)
  return executeBattleTurn(newState);
}

/**
 * Handle Pokémon switching
 */
export function switchPokemon(state, newPokemonIndex) {
  if (!state.battle || state.ui.showingTeamSelect === false) {
    return state;
  }

  const { gauntlet } = state;
  const currentActiveIndex = gauntlet.player.activePokemonIndex;

  // Don't do anything if it's the same Pokémon or if it's fainted
  if (newPokemonIndex === currentActiveIndex || gauntlet.player.team[newPokemonIndex].hp <= 0) {
    return {
      ...state,
      ui: {
        ...state.ui,
        showingTeamSelect: false
      }
    };
  }

  // Update the player's active Pokémon
  const updatedPlayer = {
    ...gauntlet.player,
    activePokemonIndex: newPokemonIndex
  };

  // Add message about switch
  const switchingFrom = gauntlet.player.team[currentActiveIndex].name;
  const switchingTo = gauntlet.player.team[newPokemonIndex].name;
  addCustomLogMessage(`${switchingFrom} was withdrawn! Go ${switchingTo}!`);

  // Add to battle history
  const updatedState = addBattleRecord(state, {
    type: 'switch',
    message: `Switched from ${switchingFrom} to ${switchingTo}!`
  });

  // Create new battle state with the switched Pokémon
  const newBattle = createBattleState(
    gauntlet.player.team[newPokemonIndex],
    state.battle.pokemon2
  );

  // After switching, the opponent gets a free move
  const enemyMove = selectRandomMove(state.battle.pokemon2);

  const enemyTurnState = {
    ...updatedState,
    gauntlet: {
      ...updatedState.gauntlet,
      player: updatedPlayer
    },
    battle: newBattle,
    ui: {
      selectedMove: null,
      showingTeamSelect: false
    }
  };

  // Execute enemy's turn if they have valid moves
  if (enemyMove) {
    // Create a temporary state with a fake player move (that won't execute)
    const tempState = {
      ...enemyTurnState,
      ui: {
        ...enemyTurnState.ui,
        selectedMove: 'NO_MOVE' // This is a placeholder
      }
    };

    // Execute only the enemy's turn
    return executeEnemyTurnAfterSwitch(tempState, enemyMove);
  }

  return enemyTurnState;
}

/**
 * Show the team selection UI
 */
export function showTeamSelect(state) {
  if (!state.battle || state.battle.battleOver) {
    return state;
  }

  return {
    ...state,
    ui: {
      ...state.ui,
      showingTeamSelect: true
    }
  };
}

/**
 * Execute a battle turn in gauntlet mode
 */
function executeBattleTurn(state) {
  const { battle, ui, gauntlet } = state;

  // Get player's selected move
  const playerMove = ui.selectedMove;

  // AI selects a random move
  const enemyMove = selectRandomMove(battle.pokemon2);

  if (!enemyMove) {
    // No valid moves for enemy, rare case handling
    addCustomLogMessage(`${battle.pokemon2.name} has no moves with PP remaining!`);
    return state;
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
      selectedMove: null,
      showingTeamSelect: false
    }
  };
}

/**
 * Execute just the enemy turn after a switch
 */
function executeEnemyTurnAfterSwitch(state, enemyMove) {
  const { battle } = state;

  // Add message about enemy attacking
  addCustomLogMessage(`${battle.pokemon2.name} used ${battle.pokemon2.moves[enemyMove].name}!`);

  // No move for player (they switched instead)
  const playerPokemon = { ...battle.pokemon1 };

  // Execute just the enemy's attack
  const enemyAttackResult = battle.pokemon2.moves[enemyMove].execute({
    attacker: battle.pokemon2,
    defender: playerPokemon,
    move: battle.pokemon2.moves[enemyMove],
    battleState: battle
  });

  // Update battle state with results
  const updatedBattle = {
    ...battle,
    pokemon1: enemyAttackResult.defender || playerPokemon,
    battleOver: playerPokemon.hp <= 0,
    winner: playerPokemon.hp <= 0 ? 'pokemon2' : null
  };

  // Check if battle is over
  if (updatedBattle.battleOver) {
    return handleBattleEnd(state, updatedBattle);
  }

  // Continue battle
  return {
    ...state,
    battle: updatedBattle,
    ui: {
      selectedMove: null,
      showingTeamSelect: false
    }
  };
}

/**
 * Handle the end of a battle in trainer gauntlet mode
 */
function handleBattleEnd(state, battleState) {
  const { gauntlet } = state;

  // Determine which Pokémon fainted
  const playerFainted = battleState.pokemon1.hp <= 0;
  const enemyFainted = battleState.pokemon2.hp <= 0;

  // Update internal team state with current HP and PP
  const updatedPlayerTeam = [...gauntlet.player.team];
  updatedPlayerTeam[gauntlet.player.activePokemonIndex] = battleState.pokemon1;

  const updatedPlayer = {
    ...gauntlet.player,
    team: updatedPlayerTeam
  };

  // Handle enemy fainting
  if (enemyFainted) {
    // Add victory message
    addCustomLogMessage(`${battleState.pokemon2.name} fainted!`);

    // Move to next battle in trainer sequence
    const nextBattleIndex = gauntlet.currentBattleIndex + 1;

    // Check if trainer has been defeated
    if (nextBattleIndex >= gauntlet.currentTrainer.team.length) {
      // Trainer defeated!
      addCustomLogMessage(`${gauntlet.currentTrainer.name} was defeated!`);

      // Add to battle history
      const updatedState = addBattleRecord(state, {
        type: 'trainer-defeated',
        message: `Defeated ${gauntlet.currentTrainer.name}!`
      });

      // Increase difficulty and trainers defeated count
      const newGauntletState = {
        ...updatedState.gauntlet,
        player: updatedPlayer,
        trainersDefeated: gauntlet.trainersDefeated + 1,
        difficulty: gauntlet.difficulty + 0.5,
        currentTrainer: null
      };

      // Generate next trainer
      return generateNextTrainer({
        ...updatedState,
        gauntlet: newGauntletState,
        battle: null
      });
    } else {
      // Trainer still has more Pokémon
      const updatedState = addBattleRecord(state, {
        type: 'victory',
        message: `${battleState.pokemon2.name} fainted!`
      });

      // Continue to next Pokémon in trainer's team
      return generateNextBattle({
        ...updatedState,
        gauntlet: {
          ...updatedState.gauntlet,
          player: updatedPlayer,
          currentBattleIndex: nextBattleIndex
        },
        battle: null
      });
    }
  }

  // Handle player fainting
  if (playerFainted) {
    // Add defeat message
    addCustomLogMessage(`${battleState.pokemon1.name} fainted!`);

    // Check if player has any Pokémon left
    const remainingPokemon = updatedPlayerTeam.filter(pokemon => pokemon.hp > 0).length;

    if (remainingPokemon === 0) {
      // Game over - all player's Pokémon fainted
      addCustomLogMessage(`All your Pokémon have fainted! Game Over!`);

      // Add to battle history
      const updatedState = addBattleRecord(state, {
        type: 'game-over',
        message: `Defeated by ${gauntlet.currentTrainer.name} after defeating ${gauntlet.trainersDefeated} trainers.`,
        finalScore: gauntlet.trainersDefeated
      });

      return {
        ...updatedState,
        gauntlet: {
          ...updatedState.gauntlet,
          player: updatedPlayer
        },
        battle: battleState,
        ui: {
          selectedMove: null,
          showingTeamSelect: false
        }
      };
    } else {
      // Player still has Pokémon left - force switch
      addCustomLogMessage(`Choose your next Pokémon!`);

      // Add to battle history
      const updatedState = addBattleRecord(state, {
        type: 'pokemon-fainted',
        message: `${battleState.pokemon1.name} fainted!`
      });

      return {
        ...updatedState,
        gauntlet: {
          ...updatedState.gauntlet,
          player: updatedPlayer
        },
        battle: battleState,
        ui: {
          selectedMove: null,
          showingTeamSelect: true // Force team selection
        }
      };
    }
  }

  // Shouldn't reach here, but just in case
  return {
    ...state,
    gauntlet: {
      ...state.gauntlet,
      player: updatedPlayer
    },
    battle: battleState,
    ui: {
      selectedMove: null,
      showingTeamSelect: false
    }
  };
}

/**
 * Reset gauntlet mode completely
 */
export function resetGauntlet() {
  // Add message about reset
  addCustomLogMessage("Starting a new trainer gauntlet challenge!");

  return createInitialState();
}

/**
 * Check if gauntlet is over (all player's Pokémon fainted)
 */
export function isGauntletOver(state) {
  if (!state.gauntlet || !state.gauntlet.player) return false;

  const remainingPokemon = state.gauntlet.player.team.filter(pokemon => pokemon.hp > 0).length;
  return remainingPokemon === 0;
}

/**
 * Get the number of remaining Pokémon for a team
 */
export function getRemainingPokemonCount(team) {
  if (!team) return 0;
  return team.filter(pokemon => pokemon.hp > 0).length;
}