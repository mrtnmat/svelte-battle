<script>
  import { createInitialState, selectMove } from "./lib/gameState.js";
  import PokemonCard from "./lib/components/PokemonCard.svelte";
  import BattleLog from "./lib/components/BattleLog.svelte";
  import { NO_MOVE_SELECTED } from "./lib/constants.js";

  // Initialize game state (mutable)
  let gameState = createInitialState();

  // Computed properties
  $: bothMovesSelected =
    gameState.pokemon1.selectedMove !== NO_MOVE_SELECTED &&
    gameState.pokemon2.selectedMove !== NO_MOVE_SELECTED;

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

  <!-- Battle log -->
  <BattleLog messages={gameState.log} />
</main>

<style>
</style>
