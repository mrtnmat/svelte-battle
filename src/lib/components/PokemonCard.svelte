<script>
  let {
    pokemon,
    color = "blue",
    battleOver = false,
    onMoveSelect = (moveSlot) => {},
    highlightedMove = null,
  } = $props();

  // Using $derived to compute color classes
  let colorClasses = $derived(
    {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-500",
        button: "bg-blue-500 hover:bg-blue-600",
        bar: "bg-blue-500",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-500",
        button: "bg-green-500 hover:bg-green-600",
        bar: "bg-green-500",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-500",
        button: "bg-red-500 hover:bg-red-600",
        bar: "bg-red-500",
      },
    }[color],
  );
</script>

<div class="p-3 rounded-md mb-4 {colorClasses.bg}">
  <div class="flex justify-between">
    <span class="font-bold">{pokemon.name}</span>
    <span>{pokemon.hp}/{pokemon.maxHp} HP</span>
  </div>

  <div class="w-full bg-gray-200 h-2 mt-1 rounded-full">
    <div
      class="{colorClasses.bar} h-2 rounded-full"
      style="width: {(pokemon.hp / pokemon.maxHp) * 100}%"
    ></div>
  </div>

  <div class="text-sm mt-1">Speed: {pokemon.speed}</div>

  {#if !battleOver}
    <div class="mt-2 grid grid-cols-2 gap-2">
      {#each Object.entries(pokemon.moves) as [moveSlot, { name, ppRemaining, pp }]}
        <button
          class="p-2 text-white rounded {colorClasses.button} {ppRemaining <= 0
            ? 'opacity-50 cursor-not-allowed'
            : ''} 
                {highlightedMove === moveSlot ? 'ring-2 ring-yellow-400' : ''}"
          onclick={() => onMoveSelect(moveSlot)}
          disabled={ppRemaining <= 0}
        >
          {name} ({ppRemaining}/{pp})
        </button>
      {/each}
    </div>
  {/if}

</div>