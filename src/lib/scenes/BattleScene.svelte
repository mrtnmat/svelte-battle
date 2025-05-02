<script>
  import { createPokemon } from "../core/PokemonFactory.js";
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import { changeScene, SCENES } from "./SceneManager.svelte.js";
  import * as SingleBattle from "../modes/SingleBattle.js";

  // Create initial state with default Pokémon
  let gameState = $state(
    SingleBattle.createInitialState(
      createPokemon("Pikachu", 15),
      createPokemon("Bulbasaur", 5),
    ),
  );

  // Track battle state and UI state with $derived
  let battleState = $derived(gameState.battle);
  let uiState = $derived(gameState.ui);

  // Computed property for move selection status
  let bothMovesSelected = $derived(
    SingleBattle.areBothMovesSelected(gameState),
  );

  // Handle move selection
  function handleMoveSelect(pokemonId, moveKey) {
    gameState = SingleBattle.selectMove(gameState, pokemonId, moveKey);
  }

  // Reset battle
  function handleReset() {
    gameState = SingleBattle.resetBattle(gameState);
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

  <!-- Pokémon 1 (Player) -->
  <PokemonCard
    pokemon={battleState.pokemon1}
    highlightedMove={uiState.selectedMoves.pokemon1}
    color="blue"
    battleOver={battleState.battleOver}
    onMoveSelect={(moveKey) => handleMoveSelect("pokemon1", moveKey)}
  />

  <!-- Pokémon 2 (Opponent) -->
  <PokemonCard
    pokemon={battleState.pokemon2}
    highlightedMove={uiState.selectedMoves.pokemon2}
    color="green"
    battleOver={battleState.battleOver}
    onMoveSelect={(moveKey) => handleMoveSelect("pokemon2", moveKey)}
  />

  <!-- Battle log -->
  <BattleLog messages={battleState.log} />

  {#if battleState.battleOver}
    <button
      class="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded mt-4"
      onclick={handleReset}
    >
      New Battle
    </button>
  {/if}
</div>
