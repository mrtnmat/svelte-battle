import { NO_MOVE_SELECTED } from "./constants"

function applyDamage(pokemon, amount) {
  pokemon.hp = Math.max(0, pokemon.hp - amount)
}

function calculateDamage({ attacker, defender, movePower }) {
  const levelDamage = ((attacker.level * 2 / 5) + 2)
  const attackRatio = attacker.attack / defender.defense
  const baseDamage = (levelDamage * movePower * attackRatio) / 50 + 2
  const randomFactor = (Math.random() * 15 + 85) / 100
  const finalDamage = baseDamage * randomFactor
  return Math.round(finalDamage)
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
    const movePower = move.power

    // Reduce PP
    move.ppRemaining--;

    // Log the move
    state.log.push(`${attacker.name} used ${move.name}!`);

    // Calculate and apply damage
    const damage = calculateDamage({ attacker, defender, movePower })
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