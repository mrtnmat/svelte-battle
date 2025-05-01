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
  <div class="flex justify-between items-center">
    <span class="font-bold">{pokemon.name}</span>
    <span>{pokemon.hp}/{pokemon.maxHp} HP</span>
  </div>
  
  <div class="flex flex-wrap gap-1 mt-1 mb-1">
    {#each pokemon.types as type}
      <span class="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 font-semibold">
        {type}
      </span>
    {/each}
  </div>

  <div class="w-full bg-gray-200 h-2 mt-1 rounded-full">
    <div
      class="{colorClasses.bar} h-2 rounded-full"
      style="width: {(pokemon.hp / pokemon.maxHp) * 100}%"
    ></div>
  </div>

  <div class="grid grid-cols-2 gap-1 text-sm mt-1">
    <div>Attack: {pokemon.attack}</div>
    <div>Defense: {pokemon.defense}</div>
    <div>Sp.Atk: {pokemon.specialAttack}</div>
    <div>Sp.Def: {pokemon.specialDefense}</div>
    <div>Speed: {pokemon.speed}</div>
    <div>Level: {pokemon.level}</div>
  </div>

  {#if !battleOver}
    <div class="mt-2 grid grid-cols-2 gap-2">
      {#each Object.entries(pokemon.moves) as [moveSlot, move]}
        <button
          class="p-2 text-white rounded {colorClasses.button} {move.ppRemaining <= 0
            ? 'opacity-50 cursor-not-allowed'
            : ''} 
                {highlightedMove === moveSlot ? 'ring-2 ring-yellow-400' : ''}"
          onclick={() => onMoveSelect(moveSlot)}
          disabled={move.ppRemaining <= 0}
        >
          <div>{move.name}</div>
          <div class="flex justify-between text-xs">
            <span>{move.type} / {move.category}</span>
            <span>({move.ppRemaining}/{move.pp})</span>
          </div>
        </button>
      {/each}
    </div>
  {/if}

</div>