<script>
  // Props for the component
  let { move } = $props();

  // Define category and type colors
  const categoryColors = {
    Physical: "bg-orange-100 text-orange-800",
    Special: "bg-blue-100 text-blue-800",
    Status: "bg-purple-100 text-purple-800"
  };

  // Type colors (simplified)
  const typeColors = {
    Normal: "bg-gray-100 text-gray-800",
    Fire: "bg-red-100 text-red-800",
    Water: "bg-blue-200 text-blue-800",
    Electric: "bg-yellow-100 text-yellow-800",
    Grass: "bg-green-100 text-green-800",
    Ice: "bg-blue-50 text-blue-800",
    Fighting: "bg-red-200 text-red-800",
    Poison: "bg-purple-100 text-purple-800",
    Ground: "bg-yellow-200 text-yellow-800",
    Flying: "bg-indigo-100 text-indigo-800",
    Psychic: "bg-pink-100 text-pink-800",
    Bug: "bg-green-200 text-green-800",
    Rock: "bg-yellow-300 text-yellow-800",
    Ghost: "bg-purple-200 text-purple-800",
    Dragon: "bg-indigo-200 text-indigo-800",
    Dark: "bg-gray-700 text-white",
    Steel: "bg-gray-400 text-gray-800",
    Fairy: "bg-pink-200 text-pink-800"
  };

  // Get the color class for the move's category
  let categoryColorClass = $derived(categoryColors[move.category] || "bg-gray-200 text-gray-800");
  
  // Get the color class for the move's type
  let typeColorClass = $derived(typeColors[move.type] || "bg-gray-200 text-gray-800");
</script>

<div class="p-3 bg-white rounded-md shadow-sm border border-gray-200">
  <div class="flex justify-between items-center mb-2">
    <h3 class="text-lg font-bold">{move.name}</h3>
    
    <div class="flex gap-1">
      <span class="text-xs px-2 py-0.5 rounded-full {typeColorClass}">
        {move.type}
      </span>
      <span class="text-xs px-2 py-0.5 rounded-full {categoryColorClass}">
        {move.category}
      </span>
    </div>
  </div>
  
  <div class="mb-2 text-sm">
    {move.description || "No description available."}
  </div>
  
  <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
    <div>
      <span class="font-semibold">Power:</span> {move.power || "—"}
    </div>
    <div>
      <span class="font-semibold">Accuracy:</span> {move.accuracy ? `${move.accuracy}%` : "—"}
    </div>
    <div>
      <span class="font-semibold">PP:</span> {move.pp}
    </div>
    
    {#if move.statusEffect}
      <div>
        <span class="font-semibold">Status:</span> {move.statusEffect}
      </div>
    {/if}
    
    {#if move.healPercent}
      <div>
        <span class="font-semibold">Heal:</span> {move.healPercent}%
      </div>
    {/if}
    
    {#if move.statToBoost}
      <div>
        <span class="font-semibold">Boosts:</span> {move.statToBoost}
      </div>
    {/if}
    
    {#if move.attackStat && move.attackStat !== (move.category === 'Physical' ? 'attack' : 'specialAttack')}
      <div>
        <span class="font-semibold">Uses:</span> {move.attackStat}
      </div>
    {/if}
    
    {#if move.defenseStat && move.defenseStat !== (move.category === 'Physical' ? 'defense' : 'specialDefense')}
      <div>
        <span class="font-semibold">Targets:</span> {move.defenseStat}
      </div>
    {/if}
  </div>
</div>