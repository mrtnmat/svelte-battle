import { NO_MOVE_SELECTED } from "./constants";
import { moveList } from "./moves";

export function createInitialState() {
  return {
    pokemon1: {
      name: "Pikachu",
      hp: 100,
      maxHp: 100,
      speed: 90,
      moves: {
        'Move 1': {
          ...moveList.Tackle,
          ppRemaining: 10,
        },
        'Move 2': {
          ...moveList.Thundershock,
          ppRemaining: 20,
        },
      },
      selectedMove: NO_MOVE_SELECTED,
    },
    pokemon2: {
      name: "Bulbasaur",
      hp: 120,
      maxHp: 120,
      speed: 45,
      moves: {
        'Move 1': {
          ...moveList.Tackle,
          ppRemaining: 20,
        },
        'Move 2': {
          ...moveList.Tackle,
          ppRemaining: 20,
        },
      },
      selectedMove: NO_MOVE_SELECTED,
    },
    turn: 1,
    log: ["Battle started! Select moves for both Pokémon."],
    battleOver: false
  };
}

// Select a move for a specific Pokémon
export function selectMove(state, pokemonId, moveIndex) {
  // Check if battle is already over
  if (state.battleOver) {
    return state;
  }

  // Check if move has PP left
  const move = state[pokemonId].moves[moveIndex];
  if (move.pp <= 0) {
    state.log.push(`${state[pokemonId].name} tried to use ${move.name}, but it has no PP left!`);
    return state;
  }

  // Store the selected move (allow changing selection)
  state[pokemonId].selectedMove = moveIndex;

  return state;
}

function applyDamage(pokemon, amount) {
  pokemon.hp = Math.max(0, pokemon.hp - amount)
}

function calculateDamage(power) {
  const damage = power + Math.floor(Math.random() * 5)
  return damage
}

export function executeTurn(state) {
  // Check if battle is already over
  if (state.battleOver) {
    return state;
  }

  // Check if both Pokémon have selected moves
  const pokemon1MoveIndex = state.pokemon1.selectedMove;
  const pokemon2MoveIndex = state.pokemon2.selectedMove;

  if (pokemon1MoveIndex === NO_MOVE_SELECTED || pokemon2MoveIndex === NO_MOVE_SELECTED) {
    state.log.push("Cannot execute turn: moves not selected for both Pokémon.");
    return state;
  }

  // Determine who goes first based on speed
  const pokemon1Speed = state.pokemon1.speed;
  const pokemon2Speed = state.pokemon2.speed;

  // If speeds are equal, randomize (50/50 chance)
  const pokemon1First = pokemon1Speed > pokemon2Speed ||
    (pokemon1Speed === pokemon2Speed && Math.random() >= 0.5);

  // Order of execution
  const order = pokemon1First
    ? [['pokemon1', 'pokemon2'], ['pokemon2', 'pokemon1']]
    : [['pokemon2', 'pokemon1'], ['pokemon1', 'pokemon2']];

  // Add log entry about turn order
  state.log.push(`${state[order[0][0]].name} moves first due to higher speed!`);

  // Execute moves in order
  for (const [attackerId, defenderId] of order) {
    let attacker = state[attackerId]
    let defender = state[defenderId]

    // Skip if attacker is already fainted
    if (attacker.hp <= 0) {
      continue;
    }

    // Get move details
    const moveIndex = attacker.selectedMove;
    const move = attacker.moves[moveIndex];

    // Reduce PP
    move.ppRemaining--;

    // Log the move
    state.log.push(`${attacker.name} used ${move.name}!`);

    // Calculate and apply damage
    const damage = calculateDamage(move.power)
    applyDamage(defender, damage)

    // Log damage
    state.log.push(`${defender.name} took ${damage} damage!`);

    // Check if defender fainted
    if (defender.hp <= 0) {
      state.log.push(`${defender.name} fainted!`);
      state.log.push(`${defender.name} won the battle!`);
      state.battleOver = true;
      break; // Exit the loop if battle is over
    }
  }

  // Reset for next turn if battle isn't over
  if (!state.battleOver) {
    state.pokemon1.selectedMove = NO_MOVE_SELECTED;
    state.pokemon2.selectedMove = NO_MOVE_SELECTED;
    state.turn++;
    state.log.push(`Turn ${state.turn} - Select moves for both Pokémon.`);
  }

  return state;
}