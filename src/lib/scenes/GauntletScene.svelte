<script>
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import { changeScene, SCENES } from "./SceneManager.svelte.js";
  import * as Gauntlet from "../modes/Gauntlet.js";
  import {
    battleLog,
    cleanupEventListeners,
  } from "../services/BattleLogManager.js";
  import { gauntletLog } from "../modes/Gauntlet.js";
  import { onDestroy } from "svelte";

  // Create initial game state
  let gameState = $state(Gauntlet.createInitialState());

  // Track gauntlet and battle state with $derived
  let gauntletState = $derived(gameState.gauntlet);
  let battleState = $derived(gameState.battle);
  let uiState = $derived(gameState.ui);

  // Generate first battle on component initialization
  $effect(() => {
    if (!battleState) {
      gameState = Gauntlet.generateNextBattle(gameState);
    }
  });

  // Handle player move selection
  function handleMoveSelect(moveKey) {
    gameState = Gauntlet.selectMove(gameState, moveKey);
  }

  // Reset gauntlet
  function handleReset() {
    gameState = Gauntlet.resetGauntlet(gameState);
  }

  // Computed property for gauntlet over state
  let gauntletOver = $derived(Gauntlet.isGauntletOver(gameState));

  // Clean up event listeners when component is destroyed
  onDestroy(() => {
    cleanupEventListeners();
  });
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
    <!-- Player Pokémon (showing clickable moves) -->
    <PokemonCard
      pokemon={battleState.pokemon1}
      color="blue"
      battleOver={battleState.battleOver}
      highlightedMove={uiState.selectedMove}
      onMoveSelect={handleMoveSelect}
    />

    <!-- Enemy Pokémon (no clickable moves) -->
    <PokemonCard
      pokemon={battleState.pokemon2}
      color="red"
      battleOver={true}
      onMoveSelect={() => {}}
    />

    <!-- Current battle log -->
    <div class="mb-4">
      <h3 class="font-bold mb-1">Current Battle:</h3>
      <BattleLog />
    </div>
  {/if}

  <!-- Gauntlet history log -->
  <div>
    <h3 class="font-bold mb-1">Gauntlet History:</h3>
    <BattleLog customMessages={$gauntletLog} />
  </div>

  {#if gauntletOver}
    <button
      class="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded mt-4"
      onclick={handleReset}
    >
      Restart Gauntlet
    </button>
  {/if}
</div>
