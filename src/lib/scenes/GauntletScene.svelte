<script>
  import { createInitialState } from "../gameState.js";
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import { NO_MOVE_SELECTED } from "../constants.js";
  import { executeTurn, selectMove } from "../battleMechanics.js";
  import { changeScene, SCENES } from './SceneManager.svelte.js';
  
  // Gauntlet state keeps track of progress across battles
  let gauntletState = $state({
    playerPokemon: null,
    defeatedCount: 0,
    log: ["Welcome to Gauntlet Mode! Defeat as many Pokémon as you can!"]
  });
  
  // Battle state tracks the current battle
  let battleState = $state(null);
  
  // Initialize the gauntlet
  initGauntlet();
  
  function initGauntlet() {
    // Create initial player Pokémon from initial state
    const initialState = createInitialState();
    gauntletState.playerPokemon = structuredClone(initialState.pokemon1);
    gauntletState.defeatedCount = 0;
    
    // Start the first battle
    generateNextBattle();
  }
  
  function generateNextBattle() {
    // Create the same enemy for each battle (Bulbasaur from initial state)
    const initialState = createInitialState();
    const enemyPokemon = structuredClone(initialState.pokemon2);
    
    // Set up battle state
    battleState = {
      pokemon1: gauntletState.playerPokemon,
      pokemon2: enemyPokemon,
      turn: 1,
      log: [`Battle started against ${enemyPokemon.name}! Select a move.`],
      battleOver: false
    };
    
    gauntletState.log.push(`Battle #${gauntletState.defeatedCount + 1}: ${gauntletState.playerPokemon.name} vs ${enemyPokemon.name}`);
  }
  
  // Computed property for move selection status
  let bothMovesSelected = $derived(
    battleState && 
    battleState.pokemon1.selectedMove !== NO_MOVE_SELECTED &&
    battleState.pokemon2.selectedMove !== NO_MOVE_SELECTED
  );
  
  // Handle player move selection
  function handleMoveSelect(moveIndex) {
    if (!battleState) return;
    
    // Player selects move
    const newState = selectMove({ ...battleState }, "pokemon1", moveIndex);
    Object.assign(battleState, newState);
    
    // Simple AI for enemy move selection
    const enemyMoves = Object.keys(battleState.pokemon2.moves);
    const availableMoves = enemyMoves.filter(move => 
      battleState.pokemon2.moves[move].ppRemaining > 0
    );
    
    if (availableMoves.length > 0) {
      const randomMove = availableMoves[Math.floor(Math.random() * (availableMoves.length))];
      const finalState = selectMove({ ...battleState }, "pokemon2", randomMove);
      console.log(finalState)
      Object.assign(battleState, finalState);
    }
  }
  
  // Handle turn execution
  function handleExecuteTurn() {
    if (!battleState) return;
    
    // Execute turn
    const newState = executeTurn({ ...battleState });
    Object.assign(battleState, newState);
    
    // Check if battle is over
    if (newState.battleOver) {
      // Check who won
      if (newState.pokemon1.hp <= 0) {
        // Player lost
        gauntletState.log.push(`Game Over! You defeated ${gauntletState.defeatedCount} opponents.`);
      } else {
        // Player won
        gauntletState.defeatedCount++;
        gauntletState.log.push(`You defeated ${newState.pokemon2.name}! Total victories: ${gauntletState.defeatedCount}`);
        
        // Generate next battle
        generateNextBattle();
      }
    }
  }
</script>

<div class="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold">Gauntlet Mode</h2>
    <button 
      class="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
      onclick={() => changeScene(SCENES.MAIN_MENU)}
    >
      Back to Menu
    </button>
  </div>
  
  <div class="mb-4 p-2 bg-blue-100 rounded-md">
    <p class="font-bold">Pokémon Defeated: {gauntletState.defeatedCount}</p>
  </div>
  
  {#if battleState}
    <!-- Player Pokémon -->
    <PokemonCard
      pokemon={battleState.pokemon1}
      selectedMove={battleState.pokemon1.selectedMove}
      color="blue"
      battleOver={battleState.battleOver}
      onMoveSelect={(moveIndex) => handleMoveSelect(moveIndex)}
    />

    <!-- Enemy Pokémon -->
    <PokemonCard
      pokemon={battleState.pokemon2}
      selectedMove={battleState.pokemon2.selectedMove}
      color="red"
      battleOver={true}
      onMoveSelect={() => {}}
    />

    <!-- Execute button -->
    {#if !battleState.battleOver}
      <button
        class="w-full p-2 text-white rounded mb-6 {bothMovesSelected
          ? 'bg-yellow-500 hover:bg-yellow-600'
          : 'bg-gray-300 cursor-not-allowed'}"
        disabled={!bothMovesSelected}
        onclick={handleExecuteTurn}
      >
        Execute Turn
      </button>
    {/if}
    
    <!-- Current battle log -->
    <div class="mb-4">
      <h3 class="font-bold mb-1">Current Battle:</h3>
      <BattleLog messages={battleState.log} />
    </div>
  {/if}

  <!-- Gauntlet history log -->
  <div>
    <h3 class="font-bold mb-1">Gauntlet History:</h3>
    <BattleLog messages={gauntletState.log} />
  </div>
  
  {#if battleState && battleState.battleOver && battleState.pokemon1.hp <= 0}
    <button
      class="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded mt-4"
      onclick={initGauntlet}
    >
      Restart Gauntlet
    </button>
  {/if}
</div>