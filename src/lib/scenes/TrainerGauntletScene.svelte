<script>
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import { changeScene, SCENES } from "./SceneManager.svelte.js";
  import * as TrainerGauntlet from "../modes/TrainerGauntlet.js";
  import {
    battleLog,
    cleanupEventListeners,
  } from "../services/BattleLogManager.js";
  import { onDestroy, onMount } from "svelte";

  // Create initial game state
  let gameState = $state(TrainerGauntlet.createInitialState());

  // Track gauntlet and battle state with $derived
  let gauntletState = $derived(gameState.gauntlet);
  let battleState = $derived(gameState.battle);
  let uiState = $derived(gameState.ui);

  // Generate first battle on component initialization
  $effect(() => {
    if (!battleState) {
      gameState = TrainerGauntlet.generateNextTrainer(gameState);
    }
  });

  // Handle player move selection
  function handleMoveSelect(moveKey) {
    gameState = TrainerGauntlet.selectMove(gameState, moveKey);
  }

  // Handle showing team selection
  function handleShowTeamSelect() {
    gameState = TrainerGauntlet.showTeamSelect(gameState);
  }

  // Handle Pokémon switching
  function handleSwitchPokemon(pokemonIndex) {
    gameState = TrainerGauntlet.switchPokemon(gameState, pokemonIndex);
  }

  // Reset gauntlet
  function handleReset() {
    gameState = TrainerGauntlet.resetGauntlet();
  }

  // Computed property for gauntlet over state
  let gauntletOver = $derived(TrainerGauntlet.isGauntletOver(gameState));

  // Computed property for surviving Pokémon count
  let activePokemonCount = $derived(
    gauntletState?.player?.team
      ? TrainerGauntlet.getRemainingPokemonCount(gauntletState.player.team)
      : 0,
  );

  // Clean up event listeners when component is destroyed
  onDestroy(() => {
    cleanupEventListeners();
  });
</script>

<div class="flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto">
  <!-- Main Battle Area -->
  <div class="lg:w-2/3 bg-white p-4 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Trainer Gauntlet Mode</h2>
      <button
        class="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
        onclick={() => changeScene(SCENES.MAIN_MENU)}
      >
        Back to Menu
      </button>
    </div>

    <!-- Trainer Info -->
    {#if gauntletState?.currentTrainer}
      <div class="mb-4 p-2 bg-blue-100 rounded-md">
        <p class="font-bold">
          Current Trainer: {gauntletState.currentTrainer.name}
        </p>
        <p class="text-sm">
          Pokémon: {gauntletState.currentBattleIndex + 1} / {gauntletState
            .currentTrainer.team.length}
        </p>
        <p class="text-sm">
          Trainers Defeated: {gauntletState.trainersDefeated}
        </p>
      </div>
    {/if}

    {#if battleState}
      <!-- Enemy Pokémon (no clickable moves) -->
      <div class="mb-4">
        <PokemonCard
          pokemon={battleState.pokemon2}
          color="red"
          battleOver={true}
          onMoveSelect={() => {}}
        />
      </div>

      <!-- Player Pokémon (showing clickable moves) -->
      <div class="mb-4">
        <PokemonCard
          pokemon={battleState.pokemon1}
          color="blue"
          battleOver={battleState.battleOver}
          highlightedMove={uiState.selectedMove}
          onMoveSelect={handleMoveSelect}
        />
      </div>

      <!-- Switch Pokémon Button -->
      {#if !battleState.battleOver && !uiState.showingTeamSelect}
        <button
          class="w-full p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded mb-4"
          onclick={handleShowTeamSelect}
        >
          Switch Pokémon
        </button>
      {/if}

      <!-- Team Selection (when switching) -->
      {#if uiState.showingTeamSelect && gauntletState?.player?.team}
        <div class="mb-4 p-2 border rounded-md bg-gray-50">
          <h3 class="font-bold mb-2">Choose a Pokémon</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            {#each gauntletState.player.team as pokemon, index}
              <button
                class="p-2 border rounded-md {pokemon.hp <= 0
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-white hover:bg-blue-50'} {index ===
                gauntletState.player.activePokemonIndex
                  ? 'border-2 border-blue-500'
                  : ''}"
                disabled={pokemon.hp <= 0 ||
                  index === gauntletState.player.activePokemonIndex}
                onclick={() => handleSwitchPokemon(index)}
              >
                <div class="flex justify-between items-center">
                  <span class="font-bold">{pokemon.name}</span>
                  <span>Lv.{pokemon.level}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span>HP: {pokemon.hp}/{pokemon.maxHp}</span>
                  {#if pokemon.hp <= 0}
                    <span class="text-red-600">Fainted</span>
                  {/if}
                  {#if index === gauntletState.player.activePokemonIndex}
                    <span class="text-blue-600">Active</span>
                  {/if}
                </div>
                <div class="w-full bg-gray-200 h-2 mt-1 rounded-full">
                  <div
                    class="bg-green-500 h-2 rounded-full"
                    style="width: {Math.max(
                      0,
                      Math.min(100, (pokemon.hp / pokemon.maxHp) * 100),
                    )}%"
                  ></div>
                </div>
              </button>
            {/each}
          </div>
          <button
            class="w-full p-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded mt-2"
            onclick={() =>
              (gameState = {
                ...gameState,
                ui: { ...gameState.ui, showingTeamSelect: false },
              })}
          >
            Cancel
          </button>
        </div>
      {/if}

      <!-- Current battle log -->
      <div class="mb-4">
        <h3 class="font-bold mb-1">Battle Log:</h3>
        <BattleLog />
      </div>
    {/if}

    {#if gauntletOver}
      <div class="p-4 bg-red-100 border border-red-300 rounded-md mb-4">
        <h3 class="font-bold text-red-700">Game Over!</h3>
        <p>
          All your Pokémon have fainted after defeating {gauntletState.trainersDefeated}
          trainers.
        </p>
        <button
          class="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded mt-4"
          onclick={handleReset}
        >
          Start New Gauntlet
        </button>
      </div>
    {/if}
  </div>

  <!-- Sidebar -->
  <div class="lg:w-1/3 bg-white p-4 rounded-lg shadow-md">
    <h3 class="text-lg font-bold mb-2">Your Team</h3>

    {#if gauntletState?.player?.team}
      <div class="mb-4">
        <p class="font-bold">
          Pokémon: {activePokemonCount} / {gauntletState.player.team.length} remaining
        </p>
        <p class="text-sm">
          Trainers Defeated: {gauntletState.trainersDefeated}
        </p>
      </div>

      <div class="divide-y">
        {#each gauntletState.player.team as pokemon, index}
          <div
            class="py-2 {index === gauntletState.player.activePokemonIndex
              ? 'bg-blue-50 px-2 rounded'
              : ''}"
          >
            <div class="flex justify-between">
              <div>
                <span class="font-bold">{pokemon.name}</span>
                {#if index === gauntletState.player.activePokemonIndex}
                  <span
                    class="ml-2 text-xs bg-blue-500 text-white px-1 py-0.5 rounded"
                    >Active</span
                  >
                {/if}
              </div>
              <span>Lv.{pokemon.level}</span>
            </div>

            <div class="flex justify-between text-sm mt-1">
              <span>HP: {pokemon.hp}/{pokemon.maxHp}</span>
              {#if pokemon.hp <= 0}
                <span class="text-red-600 font-bold">Fainted</span>
              {/if}
            </div>

            <div class="w-full bg-gray-200 h-2 mt-1 rounded-full">
              <div
                class="h-2 rounded-full {pokemon.hp <= 0
                  ? 'bg-red-500'
                  : pokemon.hp < pokemon.maxHp * 0.25
                    ? 'bg-yellow-500'
                    : 'bg-green-500'}"
                style="width: {Math.max(
                  0,
                  Math.min(100, (pokemon.hp / pokemon.maxHp) * 100),
                )}%"
              ></div>
            </div>

            <div class="grid grid-cols-2 gap-1 mt-1 text-xs">
              {#each Object.entries(pokemon.moves) as [moveKey, move]}
                <div class="border rounded p-1">
                  <div class="font-medium">{move.name}</div>
                  <div class="flex justify-between text-gray-600">
                    <span>{move.type}</span>
                    <span>PP: {move.ppRemaining}/{move.pp}</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="mt-4">
      <h4 class="font-bold mb-1">Battle History</h4>
      <div class="h-64 overflow-y-auto border rounded-md p-2 bg-gray-50">
        {#if gauntletState?.battleHistory?.length === 0}
          <p class="text-gray-500 italic">No battles yet</p>
        {:else}
          {#each gauntletState.battleHistory as record}
            <div class="py-1 border-b last:border-b-0 text-sm">
              {#if record.type === "new-trainer"}
                <div class="font-semibold text-blue-600">{record.message}</div>
              {:else if record.type === "trainer-defeated"}
                <div class="font-semibold text-green-600">{record.message}</div>
              {:else if record.type === "victory"}
                <div class="text-green-600">{record.message}</div>
              {:else if record.type === "pokemon-fainted" || record.type === "game-over"}
                <div class="text-red-600">{record.message}</div>
              {:else}
                <div>{record.message}</div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="mt-4">
      <button
        class="w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded"
        onclick={handleReset}
      >
        Forfeit & Start New Gauntlet
      </button>
    </div>
  </div>
</div>
