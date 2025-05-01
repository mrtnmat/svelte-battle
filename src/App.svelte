<script>
  import { createInitialState, selectMove } from "./lib/gameState.js";
  import PokemonCard from "./lib/components/PokemonCard.svelte";

  let gameState = createInitialState();

  // Handle move selection
  function handleMoveSelect(pokemonId, moveIndex) {
    // The state object is mutable, but we need to trigger a UI update
    gameState = selectMove({ ...gameState }, pokemonId, moveIndex);
  }
</script>

<main>
  <!-- Pokémon 1 (Pikachu) -->
  <PokemonCard
    pokemon={gameState.pokemon1}
    selectedMove={gameState.pokemon1.selectedMove}
    color="blue"
    battleOver={gameState.battleOver}
    onMoveSelect={(moveIndex) => handleMoveSelect("pokemon1", moveIndex)}
  />

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
</main>

<style>
</style>
