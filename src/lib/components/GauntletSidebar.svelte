<script>
  // Props for the component
  let { 
    battleHistory = [], 
    playerPokemon = null,
    defeatedCount = 0,
    totalXP = 0,
    onReset = () => {},
    gauntletOver = false
  } = $props();

  // Auto-scroll to bottom when history updates
  let historyContainer;

  $effect(() => {
    if (historyContainer && battleHistory.length > 0) {
      historyContainer.scrollTop = historyContainer.scrollHeight;
    }
  });
</script>

<div class="bg-white p-4 rounded-lg shadow-md h-full">
  <h3 class="text-lg font-bold mb-2">Gauntlet Progress</h3>
  
  <!-- Player info -->
  <div class="mb-4 p-2 bg-blue-50 rounded-md">
    <p class="font-bold">{playerPokemon ? playerPokemon.name : "Your Pokémon"}</p>
    <p>Level: {playerPokemon ? playerPokemon.level : "—"}</p>
    <p>Victories: {defeatedCount}</p>
    
    {#if playerPokemon}
      <p class="text-sm mt-1">XP: {totalXP} / {playerPokemon.level * 5}</p>
      <div class="w-full bg-gray-200 h-2 rounded-full mt-1">
        <div
          class="bg-green-500 h-2 rounded-full"
          style="width: {Math.min(100, (totalXP / (playerPokemon.level * 5)) * 100)}%"
        ></div>
      </div>
    {/if}
  </div>
  
  <!-- Battle history -->
  <div class="mb-4">
    <h4 class="font-semibold mb-1">Battle History</h4>
    <div 
      bind:this={historyContainer}
      class="h-64 overflow-y-auto border rounded-md p-2 bg-gray-50"
    >
      {#if battleHistory.length === 0}
        <p class="text-gray-500 italic">No battles yet</p>
      {:else}
        {#each battleHistory as record, i}
          <div class="py-1 border-b last:border-b-0 text-sm">
            {#if record.type === 'level-up'}
              <div class="text-green-600 font-bold">{record.message}</div>
            {:else if record.result === 'victory'}
              <div class="text-green-600">{record.message}</div>
            {:else if record.result === 'defeat'}
              <div class="text-red-600">{record.message}</div>
            {:else}
              <div>{record.message}</div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
  
  <!-- Action buttons -->
  <div>
    {#if gauntletOver}
      <button
        class="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded"
        onclick={() => onReset}
      >
        Start New Gauntlet
      </button>
    {:else}
      <button
        class="w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded"
        onclick={() => onReset}
      >
        Forfeit & Restart
      </button>
    {/if}
  </div>
</div>