<script>
  import { createInitialState } from "./lib/gameState.js";
  import PokemonCard from "./lib/components/PokemonCard.svelte";
  import BattleLog from "./lib/components/BattleLog.svelte";
  import { NO_MOVE_SELECTED } from "./lib/constants.js"; // Initialize game state (mutable)
  import { executeTurn, selectMove } from "./lib/battleMechanics.js";
  let gameState = createInitialState();

  // Computed properties
  $: bothMovesSelected =
    gameState.pokemon1.selectedMove !== NO_MOVE_SELECTED &&
    gameState.pokemon2.selectedMove !== NO_MOVE_SELECTED;

  // Handle move selection
  function handleMoveSelect(pokemonId, moveIndex) {
    // The state object is mutable, but we need to trigger a UI update
    gameState = selectMove({ ...gameState }, pokemonId, moveIndex);
  }

  // Handle turn execution
  function handleExecuteTurn() {
    // Create a new state object to trigger reactivity
    gameState = executeTurn({ ...gameState });
  }
</script>

<main>
  <div class="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
    <!-- Pokémon 1 (Pikachu) -->
    <PokemonCard
      pokemon={gameState.pokemon1}
      selectedMove={gameState.pokemon1.selectedMove}
      color="blue"
      battleOver={gameState.battleOver}
      onMoveSelect={(moveIndex) => handleMoveSelect("pokemon1", moveIndex)}
    />

    <!-- Pokémon 2 (Bulbasaur) -->
    <PokemonCard
      pokemon={gameState.pokemon2}
      selectedMove={gameState.pokemon2.selectedMove}
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
        on:click={handleExecuteTurn}
      >
        Execute Turn
      </button>
    {/if}

    <!-- Battle log -->
    <BattleLog messages={gameState.log} />
  </div>
</main>

<style>
</style>
