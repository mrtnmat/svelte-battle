<script>
  // Props for the component
  let { pokemon } = $props();

  // Define status effect display information
  const statusConfig = {
    Paralysis: {
      icon: "⚡",
      color: "bg-yellow-200 text-yellow-800",
      shortName: "PAR"
    },
    Burn: {
      icon: "🔥",
      color: "bg-red-200 text-red-800",
      shortName: "BRN"
    },
    Poison: {
      icon: "☠️",
      color: "bg-purple-200 text-purple-800",
      shortName: "PSN"
    },
    Sleep: {
      icon: "💤",
      color: "bg-blue-200 text-blue-800",
      shortName: "SLP"
    },
    Freeze: {
      icon: "❄️",
      color: "bg-blue-100 text-blue-800",
      shortName: "FRZ"
    },
    Confusion: {
      icon: "😵",
      color: "bg-pink-200 text-pink-800",
      shortName: "CNF"
    }
  };

  // Helper function to get active status effects
  function getActiveStatusEffects() {
    if (!pokemon.statusEffects) return [];
    
    return Object.entries(pokemon.statusEffects)
      .filter(([_, effect]) => effect.applied)
      .map(([name, effect]) => ({
        name,
        ...effect,
        ...statusConfig[name]
      }));
  }

  // Computed value for active status effects
  let activeEffects = $derived(getActiveStatusEffects());
</script>

{#if activeEffects.length > 0}
  <div class="flex flex-wrap gap-1 mt-1">
    {#each activeEffects as effect}
      <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {effect.color}">
        <span class="mr-1">{effect.icon}</span>
        <span>{effect.shortName}</span>
        {#if effect.duration}
          <span class="ml-1 text-xs opacity-75">({effect.duration})</span>
        {/if}
      </div>
    {/each}
  </div>
{/if}