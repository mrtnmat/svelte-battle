<script>
  import { getStatStagesSummary } from "../core/StatStageSystem.js";

  // Props for the component
  let { pokemon } = $props();

  // Define status effect display information
  const statusConfig = {
    Paralysis: {
      icon: "⚡",
      color: "bg-yellow-200 text-yellow-800",
      shortName: "PAR",
    },
    Burn: {
      icon: "🔥",
      color: "bg-red-200 text-red-800",
      shortName: "BRN",
    },
    Poison: {
      icon: "☠️",
      color: "bg-purple-200 text-purple-800",
      shortName: "PSN",
    },
    Sleep: {
      icon: "💤",
      color: "bg-blue-200 text-blue-800",
      shortName: "SLP",
    },
    Freeze: {
      icon: "❄️",
      color: "bg-blue-100 text-blue-800",
      shortName: "FRZ",
    },
    Confusion: {
      icon: "😵",
      color: "bg-pink-200 text-pink-800",
      shortName: "CNF",
    },
  };

  // Helper function to get active status effects
  function getActiveStatusEffects() {
    if (!pokemon.statusEffects) return [];

    return Object.entries(pokemon.statusEffects)
      .filter(([_, effect]) => effect.applied)
      .map(([name, effect]) => ({
        name,
        ...effect,
        ...statusConfig[name],
      }));
  }

  // Computed value for active status effects
  let activeEffects = $derived(getActiveStatusEffects());

  // Get stat stages for display
  let hasStatStages = $derived(
    pokemon.statStages &&
      Object.values(pokemon.statStages).some((stage) => stage !== 0),
  );
  let statStagesSummary = $derived(
    hasStatStages ? getStatStagesSummary(pokemon) : "",
  );

  // Function to get color class for stat stages
  function getStatStageColor(statName) {
    if (!pokemon.statStages || !pokemon.statStages[statName]) return "";
    const stage = pokemon.statStages[statName];
    if (stage > 0) return "text-green-600";
    if (stage < 0) return "text-red-600";
    return "";
  }
</script>

{#if activeEffects.length > 0 || hasStatStages}
  <div class="mt-1 mb-1">
    <!-- Status Effects -->
    {#if activeEffects.length > 0}
      <div class="flex flex-wrap gap-1 mb-1">
        {#each activeEffects as effect}
          <div
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {effect.color}"
          >
            <span class="mr-1">{effect.icon}</span>
            <span>{effect.shortName}</span>
            {#if effect.duration}
              <span class="ml-1 text-xs opacity-75">({effect.duration})</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Stat Stages -->
    {#if hasStatStages}
      <div class="text-xs px-2 py-1 rounded-md bg-gray-100">
        <span class="font-semibold">Stat Changes:</span>

        {#if pokemon.statStages?.attack !== 0 && pokemon.statStages?.attack !== undefined}
          <span class={getStatStageColor("attack")}>
            ATK {pokemon.statStages.attack > 0 ? "+" : ""}{pokemon.statStages
              .attack}
          </span>
        {/if}

        {#if pokemon.statStages?.defense !== 0 && pokemon.statStages?.defense !== undefined}
          <span class={getStatStageColor("defense")}>
            {" "}DEF {pokemon.statStages.defense > 0 ? "+" : ""}{pokemon
              .statStages.defense}
          </span>
        {/if}

        {#if pokemon.statStages?.specialAttack !== 0 && pokemon.statStages?.specialAttack !== undefined}
          <span class={getStatStageColor("specialAttack")}>
            {" "}SP.ATK {pokemon.statStages.specialAttack > 0
              ? "+"
              : ""}{pokemon.statStages.specialAttack}
          </span>
        {/if}

        {#if pokemon.statStages?.specialDefense !== 0 && pokemon.statStages?.specialDefense !== undefined}
          <span class={getStatStageColor("specialDefense")}>
            {" "}SP.DEF {pokemon.statStages.specialDefense > 0
              ? "+"
              : ""}{pokemon.statStages.specialDefense}
          </span>
        {/if}

        {#if pokemon.statStages?.speed !== 0 && pokemon.statStages?.speed !== undefined}
          <span class={getStatStageColor("speed")}>
            {" "}SPD {pokemon.statStages.speed > 0 ? "+" : ""}{pokemon
              .statStages.speed}
          </span>
        {/if}

        {#if pokemon.statStages?.accuracy !== 0 && pokemon.statStages?.accuracy !== undefined}
          <span class={getStatStageColor("accuracy")}>
            {" "}ACC {pokemon.statStages.accuracy > 0 ? "+" : ""}{pokemon
              .statStages.accuracy}
          </span>
        {/if}

        {#if pokemon.statStages?.evasion !== 0 && pokemon.statStages?.evasion !== undefined}
          <span class={getStatStageColor("evasion")}>
            {" "}EVA {pokemon.statStages.evasion > 0 ? "+" : ""}{pokemon
              .statStages.evasion}
          </span>
        {/if}
      </div>
    {/if}
  </div>
{/if}
