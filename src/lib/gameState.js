export function createInitialState() {
  return {
    pokemon1: {
      name: "Pikachu",
      hp: 100,
      maxHp: 100,
      speed: 90,
      moves: [
        { name: "Tackle", power: 10, pp: 35, maxPp: 35 },
        { name: "Thundershock", power: 15, pp: 10, maxPp: 10 }
      ],
      selectedMove: null
    },
    pokemon2: {
      name: "Bulbasaur",
      hp: 120,
      maxHp: 120,
      speed: 45,
      moves: [
        { name: "Tackle", power: 10, pp: 35, maxPp: 35 },
        { name: "Vine Whip", power: 13, pp: 10, maxPp: 10 }
      ],
      selectedMove: null
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

export function executeTurn(state) {
  // Check if battle is already over
  if (state.battleOver) {
    return state;
  }
  
  // Check if both Pokémon have selected moves
  const pokemon1MoveIndex = state.pokemon1.selectedMove;
  const pokemon2MoveIndex = state.pokemon2.selectedMove;
  
  if (pokemon1MoveIndex === null || pokemon2MoveIndex === null) {
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
    // Skip if attacker is already fainted
    if (state[attackerId].hp <= 0) {
      continue;
    }
    
    // Get move details
    const moveIndex = state[attackerId].selectedMove;
    const move = state[attackerId].moves[moveIndex];
    
    // Reduce PP
    move.pp--;
    
    // Log the move
    state.log.push(`${state[attackerId].name} used ${move.name}!`);
    
    // Calculate and apply damage
    const damage = move.power + Math.floor(Math.random() * 5); // Simple formula with randomness
    state[defenderId].hp = Math.max(0, state[defenderId].hp - damage);
    
    // Log damage
    state.log.push(`${state[defenderId].name} took ${damage} damage!`);
    
    // Check if defender fainted
    if (state[defenderId].hp <= 0) {
      state.log.push(`${state[defenderId].name} fainted!`);
      state.log.push(`${state[attackerId].name} won the battle!`);
      state.battleOver = true;
      break; // Exit the loop if battle is over
    }
  }
  
  // Reset for next turn if battle isn't over
  if (!state.battleOver) {
    state.pokemon1.selectedMove = null;
    state.pokemon2.selectedMove = null;
    state.turn++;
    state.log.push(`Turn ${state.turn} - Select moves for both Pokémon.`);
  }
  
  return state;
}