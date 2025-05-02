<script>
  import { createPokemon } from "../core/PokemonFactory.js";
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import MoveDetail from "../components/MoveDetail.svelte";
  import { changeScene, SCENES } from "./SceneManager.svelte.js";
  import * as SingleBattle from "../modes/SingleBattle.js";
  import {
    battleLog,
    cleanupEventListeners,
  } from "../services/BattleLogManager.js";
  import { onDestroy } from "svelte";

  // Create initial state with custom Pokémon that showcase special moves
  let gameState = $state(
    SingleBattle.createInitialState(
      createPokemon("Pikachu", 15, {
        moveKeys: ["Thundershock", "Swift", "Thunder Wave", "Metronome"]
      }),
      createPokemon("Abra", 15, {
        moveKeys: ["Psyshock", "Recover", "Growth", "Metronome"]
      })
    )
  );

  // Track battle state and UI state with $derived
  let battleState = $derived(gameState.battle);
  let uiState = $derived(gameState.ui);

  // Selected move for detailed view
  let selectedMoveDetails = $state(null);

  // Computed property for move selection status
  let bothMovesSelected = $derived(
    SingleBattle.areBothMovesSelected(gameState)
  );

  // Handle move selection
  function handleMoveSelect(pokemonId, moveKey) {
    gameState = SingleBattle.selectMove(gameState, pokemonId, moveKey);
  }

  // Handle showing move details
  function showMoveDetails(pokemonId, moveKey) {
    const pokemon = battleState[pokemonId];
    const move = pokemon.moves[moveKey];
    selectedMoveDetails = move;
  }

  // Reset battle
  function handleReset() {
    gameState = SingleBattle.resetBattle(gameState);
  }

  // Clean up event listeners when component is destroyed
  onDestroy(() => {
    cleanupEventListeners();
  });
</script>

<div class="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold">Advanced Battle Mode</h2>
    <button
      class="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
      onclick={() => changeScene(SCENES.MAIN_MENU)}
    >
      Back to Menu
    </button>
  </div>

  <div class="mb-4 text-sm bg-yellow-50 p-2 rounded-md">
    <p>This battle features Pokémon with advanced moves!</p>
    <p class="mt-1">
      <strong>Pikachu:</strong> Swift (always hits), Thunder Wave (status), Metronome (random)
    </p>
    <p class="mt-1">
      <strong>Abra:</strong> Psyshock (uses Sp.Atk vs Def), Recover (healing), Growth (stat boost)
    </p>
  </div>

  <!-- Pokémon 1 (Player) -->
  <PokemonCard
    pokemon={battleState.pokemon1}
    highlightedMove={uiState.selectedMoves.pokemon1}
    color="blue"
    battleOver={battleState.battleOver}
    onMoveSelect={(moveKey) => {
      handleMoveSelect("pokemon1", moveKey);
      showMoveDetails("pokemon1", moveKey);
    }}
  />

  <!-- Pokémon 2 (Opponent) -->
  <PokemonCard
    pokemon={battleState.pokemon2}
    highlightedMove={uiState.selectedMoves.pokemon2}
    color="green"
    battleOver={battleState.battleOver}
    onMoveSelect={(moveKey) => {
      handleMoveSelect("pokemon2", moveKey);
      showMoveDetails("pokemon2", moveKey);
    }}
  />

  <!-- Move details display -->
  {#if selectedMoveDetails}
    <div class="mb-4 mt-4">
      <h3 class="text-md font-bold mb-2">Move Details:</h3>
      <MoveDetail move={selectedMoveDetails} />
    </div>
  {/if}

  <!-- Battle log -->
  <div class="mt-4">
    <h3 class="text-md font-bold mb-2">Battle Log:</h3>
    <BattleLog />
  </div>

  {#if battleState.battleOver}
    <button
      class="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded mt-4"
      onclick={handleReset}
    >
      New Battle
    </button>
  {/if}
</div>