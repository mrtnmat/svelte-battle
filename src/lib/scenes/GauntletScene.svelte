<script>
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import GauntletSidebar from "../components/GauntletSidebar.svelte";
  import { changeScene, SCENES } from "./SceneManager.svelte.js";
  import * as Gauntlet from "../modes/Gauntlet.js";
  import {
    battleLog,
    cleanupEventListeners,
  } from "../services/BattleLogManager.js";
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

<div class="flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto">
  <!-- Main Battle Area -->
  <div class="lg:w-2/3 bg-white p-4 rounded-lg shadow-md">
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
      <p class="text-sm">XP Progress: {gauntletState.totalXP} / {battleState ? battleState.pokemon1.level * 5 : 0} 
        {#if battleState}
          <span class="inline-block w-full h-2 bg-gray-200 rounded-full mt-1">
            <span 
              class="inline-block h-2 bg-green-500 rounded-full"
              style="width: {Math.min(100, (gauntletState.totalXP / (battleState.pokemon1.level * 5)) * 100)}%"
            ></span>
          </span>
        {/if}
      </p>
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
        <h3 class="font-bold mb-1">Current Battle Log:</h3>
        <BattleLog />
      </div>
    {/if}

    {#if gauntletOver}
      <div class="p-4 bg-red-100 border border-red-300 rounded-md mb-4">
        <h3 class="font-bold text-red-700">Game Over!</h3>
        <p>Your {gauntletState.playerPokemon.name} was defeated after winning {gauntletState.defeatedCount} battles.</p>
        <button
          class="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded mt-4"
          onclick={handleReset}
        >
          Restart Gauntlet
        </button>
      </div>
    {/if}
  </div>

  <!-- Sidebar using our component -->
  <div class="lg:w-1/3">
    <GauntletSidebar
      battleHistory={gauntletState.battleHistory}
      playerPokemon={battleState ? battleState.pokemon1 : null}
      defeatedCount={gauntletState.defeatedCount}
      totalXP={gauntletState.totalXP}
      onReset={handleReset}
      gauntletOver={gauntletOver}
    />
  </div>
</div>