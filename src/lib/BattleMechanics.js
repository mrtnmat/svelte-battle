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

// Execute a turn with specific moves for each pokemon
export function executeTurn(state, pokemon1MoveIndex, pokemon2MoveIndex) {
  // Create a copy of the state to avoid mutating the original
  const newState = { ...state };
  
  // Check if battle is already over
  if (newState.battleOver) {
    return newState;
  }

  // Get move details for both pokemon
  const pokemon1Move = newState.pokemon1.moves[pokemon1MoveIndex];
  const pokemon2Move = newState.pokemon2.moves[pokemon2MoveIndex];
  
  // Check if moves have PP left
  if (pokemon1Move.ppRemaining <= 0) {
    newState.log.push(`${newState.pokemon1.name} tried to use ${pokemon1Move.name}, but it has no PP left!`);
    return newState;
  }
  
  if (pokemon2Move.ppRemaining <= 0) {
    newState.log.push(`${newState.pokemon2.name} tried to use ${pokemon2Move.name}, but it has no PP left!`);
    return newState;
  }

  // Determine who goes first based on speed
  const pokemon1Speed = newState.pokemon1.speed;
  const pokemon2Speed = newState.pokemon2.speed;

  // If speeds are equal, randomize (50/50 chance)
  const pokemon1First = pokemon1Speed > pokemon2Speed ||
    (pokemon1Speed === pokemon2Speed && Math.random() >= 0.5);

  // Order of execution
  const order = pokemon1First
    ? [
        ['pokemon1', 'pokemon2', pokemon1MoveIndex], 
        ['pokemon2', 'pokemon1', pokemon2MoveIndex]
      ]
    : [
        ['pokemon2', 'pokemon1', pokemon2MoveIndex], 
        ['pokemon1', 'pokemon2', pokemon1MoveIndex]
      ];

  // Add log entry about turn order
  newState.log.push(`${newState[order[0][0]].name} moves first due to higher speed!`);

  // Execute moves in order
  for (const [attackerId, defenderId, moveIndex] of order) {
    let attacker = newState[attackerId]
    let defender = newState[defenderId]

    // Skip if attacker is already fainted
    if (attacker.hp <= 0) {
      continue;
    }

    // Get move details
    const move = attacker.moves[moveIndex];
    const movePower = move.power

    // Reduce PP
    move.ppRemaining--;

    // Log the move
    newState.log.push(`${attacker.name} used ${move.name}!`);

    // Calculate and apply damage
    const damage = calculateDamage({ attacker, defender, movePower })
    applyDamage(defender, damage)

    // Log damage
    newState.log.push(`${defender.name} took ${damage} damage!`);

    // Check if defender fainted
    if (defender.hp <= 0) {
      newState.log.push(`${defender.name} fainted!`);
      newState.log.push(`${attacker.name} won the battle!`);
      newState.battleOver = true;
      break; // Exit the loop if battle is over
    }
  }

  // Increment turn counter if battle isn't over
  if (!newState.battleOver) {
    newState.turn++;
    newState.log.push(`Turn ${newState.turn} - Select moves for both Pokémon.`);
  }

  return newState;
}

// Helper function to select a random move for AI
export function selectRandomMove(pokemon) {
  const moveKeys = Object.keys(pokemon.moves);
  const availableMoves = moveKeys.filter(moveKey => 
    pokemon.moves[moveKey].ppRemaining > 0
  );
  
  if (availableMoves.length === 0) {
    // No moves with PP remaining
    return null;
  }
  
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}