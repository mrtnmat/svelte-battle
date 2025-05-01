<script>
  import { createInitialState } from "../GameState.js";
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import { NO_MOVE_SELECTED } from "../constants.js";
  import { executeTurn, selectMove } from "../BattleMechanics.js";
  import { changeScene, SCENES } from "./SceneManager.svelte.js";

  let gameState = $state(createInitialState());

  let bothMovesSelected = $derived(
    gameState.pokemon1.selectedMove !== NO_MOVE_SELECTED &&
      gameState.pokemon2.selectedMove !== NO_MOVE_SELECTED,
  );

  // Handle move selection
  function handleMoveSelect(pokemonId, moveIndex) {
    // Update state directly with the result of selectMove
    const newState = selectMove({ ...gameState }, pokemonId, moveIndex);
    Object.assign(gameState, newState);
  }

  // Handle turn execution
  function handleExecuteTurn() {
    // Update state directly with the result of executeTurn
    const newState = executeTurn({ ...gameState });
    Object.assign(gameState, newState);
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
      }}
    >
      New Battle
    </button>
  {/if}
</div>
