<script>
  import { createPokemon } from "../PokemonFactory.js";
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import { executeTurn } from "../BattleMechanics.js";
  import { changeScene, SCENES } from "./SceneManager.svelte.js";

  // Create initial state function
  function createInitialState() {
    return {
      pokemon1: createPokemon("Pikachu", 15),
      pokemon2: createPokemon("Bulbasaur", 5),
      turn: 1,
      log: ["Battle started! Select moves for both Pokémon."],
      battleOver: false
    };
  }

  // Main game state
  let gameState = $state(createInitialState());
  
  // UI state for selected moves (not part of game state)
  let moveSelections = $state({
    pokemon1: null,
    pokemon2: null
  });

  // Computed property for move selection status
  let bothMovesSelected = $derived(
    moveSelections.pokemon1 !== null && 
    moveSelections.pokemon2 !== null
  );

  // Handle move selection (UI state only)
  function handleMoveSelect(pokemonId, moveIndex) {
    moveSelections[pokemonId] = moveIndex;
  }

  // Handle turn execution
  function handleExecuteTurn() {
    // Execute turn with the selected moves
    const newState = executeTurn(
      { ...gameState }, 
      moveSelections.pokemon1, 
      moveSelections.pokemon2
    );
    
    // Update game state with results
    Object.assign(gameState, newState);
    
    // Reset move selections for next turn if battle continues
    if (!newState.battleOver) {
      moveSelections.pokemon1 = null;
      moveSelections.pokemon2 = null;
    }
  }
</script>

<div class="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold">Battle Mode</h2>
    <button
      class="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
      onclick={() => changeScene(SCENES.MAIN_MENU)}
    >
      Back to Menu
    </button>
  </div>

  <!-- Pokémon 1 (Pikachu) -->
  <PokemonCard
    pokemon={gameState.pokemon1}
    selectedMove={moveSelections.pokemon1}
    color="blue"
    battleOver={gameState.battleOver}
    onMoveSelect={(moveIndex) => handleMoveSelect("pokemon1", moveIndex)}
  />

  <!-- Pokémon 2 (Bulbasaur) -->
  <PokemonCard
    pokemon={gameState.pokemon2}
    selectedMove={moveSelections.pokemon2}
    color="green"
    battleOver={gameState.battleOver}
    onMoveSelect={(moveIndex) => handleMoveSelect("pokemon2", moveIndex)}
  />

  <!-- Execute button -->
  {#if !gameState.battleOver}
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

  <!-- Battle log -->
  <BattleLog messages={gameState.log} />

  {#if gameState.battleOver}
    <button
      class="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded mt-4"
      onclick={() => {
        gameState = createInitialState();
        moveSelections.pokemon1 = null;
        moveSelections.pokemon2 = null;
      }}
    >
      New Battle
    </button>
  {/if}
</div>