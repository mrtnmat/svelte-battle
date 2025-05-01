<script>
  import { moveList } from "../Moves.js";
  import PokemonCard from "../components/PokemonCard.svelte";
  import BattleLog from "../components/BattleLog.svelte";
  import { executeTurn, selectRandomMove } from "../BattleMechanics.js";
  import { changeScene, SCENES } from './SceneManager.svelte.js';
  
  // Create initial Pokemon templates
  function createPikachu() {
    return {
      name: "Pikachu",
      level: 15,
      hp: 35,
      maxHp: 35,
      attack: 21,
      defense: 17,
      speed: 32,
      moves: {
        'Move 1': {
          ...moveList["Tackle"],
          ppRemaining: 10,
        },
        'Move 2': {
          ...moveList["Thundershock"],
          ppRemaining: 20,
        },
      }
    };
  }

  function createBulbasaur() {
    return {
      name: "Bulbasaur",
      level: 5,
      hp: 19,
      maxHp: 19,
      attack: 9,
      defense: 9,
      speed: 9,
      moves: {
        'Move 1': {
          ...moveList["Tackle"],
          ppRemaining: 20,
        },
        'Move 2': {
          ...moveList["Vine Whip"],
          ppRemaining: 20,
        },
      }
    };
  }
  
  // Gauntlet state keeps track of progress across battles
  let gauntletState = $state({
    playerPokemon: null,
    defeatedCount: 0,
    log: ["Welcome to Gauntlet Mode! Defeat as many Pokémon as you can!"]
  });
  
  // Battle state tracks the current battle
  let battleState = $state(null);
  
  // Initialize the gauntlet
  initGauntlet();
  
  function initGauntlet() {
    // Create initial player Pokémon
    gauntletState.playerPokemon = createPikachu();
    gauntletState.defeatedCount = 0;
    
    // Start the first battle
    generateNextBattle();
  }
  
  function generateNextBattle() {
    // Create the enemy Pokémon
    const enemyPokemon = createBulbasaur();
    
    // Set up battle state
    battleState = {
      pokemon1: gauntletState.playerPokemon,
      pokemon2: enemyPokemon,
      turn: 1,
      log: [`Battle started against ${enemyPokemon.name}! Select a move.`],
      battleOver: false
    };
    
    gauntletState.log.push(`Battle #${gauntletState.defeatedCount + 1}: ${gauntletState.playerPokemon.name} vs ${enemyPokemon.name}`);
  }
  
  // Handle player move selection and immediate turn execution
  function handleMoveSelect(moveIndex) {
    if (!battleState || battleState.battleOver) return;
    
    // Simple AI for enemy move selection
    const enemyMoveIndex = selectRandomMove(battleState.pokemon2);
    
    if (!enemyMoveIndex) {
      // No valid moves for enemy, rare case handling
      battleState.log.push(`${battleState.pokemon2.name} has no moves with PP remaining!`);
      return;
    }
    
    // Execute turn immediately with player's selected move and enemy's random move
    const newState = executeTurn(
      { ...battleState },
      moveIndex,
      enemyMoveIndex
    );
    
    // Update battle state
    Object.assign(battleState, newState);
    
    // Check if battle is over
    if (newState.battleOver) {
      // Check who won
      if (newState.pokemon1.hp <= 0) {
        // Player lost
        gauntletState.log.push(`Game Over! You defeated ${gauntletState.defeatedCount} opponents.`);
      } else {
        // Player won
        gauntletState.defeatedCount++;
        gauntletState.log.push(`You defeated ${newState.pokemon2.name}! Total victories: ${gauntletState.defeatedCount}`);
        
        // Generate next battle
        generateNextBattle();
      }
    }
  }
</script>

<div class="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
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
  </div>
  
  {#if battleState}
    <!-- Player Pokémon (showing clickable moves) -->
    <PokemonCard
      pokemon={battleState.pokemon1}
      selectedMove={null}
      color="blue"
      battleOver={battleState.battleOver}
      onMoveSelect={(moveIndex) => handleMoveSelect(moveIndex)}
    />

    <!-- Enemy Pokémon (no clickable moves) -->
    <PokemonCard
      pokemon={battleState.pokemon2}
      selectedMove={null}
      color="red"
      battleOver={true}
      onMoveSelect={() => {}}
    />
    
    <!-- Current battle log -->
    <div class="mb-4">
      <h3 class="font-bold mb-1">Current Battle:</h3>
      <BattleLog messages={battleState.log} />
    </div>
  {/if}

  <!-- Gauntlet history log -->
  <div>
    <h3 class="font-bold mb-1">Gauntlet History:</h3>
    <BattleLog messages={gauntletState.log} />
  </div>
  
  {#if battleState && battleState.battleOver && battleState.pokemon1.hp <= 0}
    <button
      class="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded mt-4"
      onclick={initGauntlet}
    >
      Restart Gauntlet
    </button>
  {/if}
</div>