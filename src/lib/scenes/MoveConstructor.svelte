<script>
    import { createPokemon } from "../core/PokemonFactory.js";
    import PokemonCard from "../components/PokemonCard.svelte";
    import BattleLog from "../components/BattleLog.svelte";
    import MoveDetail from "../components/MoveDetail.svelte";
    import { moveList } from "../core/Moves.js";
    import { changeScene, SCENES } from "./SceneManager.svelte.js";
    import * as SingleBattle from "../modes/SingleBattle.js";
    import {
        battleLog,
        cleanupEventListeners,
        addCustomLogMessage,
    } from "../services/BattleLogManager.js";
    import { onDestroy, onMount } from "svelte";
    import { getAllSpecies } from "../core/PokemonFactory.js";

    // Available Pokémon species
    let pokemonSpecies = $state(getAllSpecies());

    // Available moves for testing
    let availableMoves = $state(
        Object.entries(moveList).map(([name, move]) => ({
            name,
            move,
        })),
    );

    // Selected moves for each Pokémon
    let selectedMovesPlayer = $state([]);
    let selectedMovesOpponent = $state([]);

    // Selected Pokémon species
    let playerSpecies = $state("Pikachu");
    let opponentSpecies = $state("Abra");

    // Pokémon levels
    let playerLevel = $state(15);
    let opponentLevel = $state(15);

    // Game state
    let gameState = $state(null);
    let battleState = $state(null);
    let uiState = $state(null);

    // Track selected move for details
    let selectedMoveForDetails = $state(null);

    // Filter moves by search term
    let moveSearchTerm = $state("");
    let filteredMoves = $derived(() => {
        if (!moveSearchTerm) return availableMoves;

        const term = moveSearchTerm.toLowerCase();
        return availableMoves.filter(
            ({ name, move }) =>
                name.toLowerCase().includes(term) ||
                move.type.toLowerCase().includes(term) ||
                move.category.toLowerCase().includes(term),
        );
    });

    // Initialize the battle
    function initializeBattle() {
        // Create custom Pokémon with selected moves
        const player = createPokemon(playerSpecies, playerLevel, {
            moveKeys: selectedMovesPlayer.slice(0, 4),
        });

        const opponent = createPokemon(opponentSpecies, opponentLevel, {
            moveKeys: selectedMovesOpponent.slice(0, 4),
        });

        // Create initial game state
        gameState = SingleBattle.createInitialState(player, opponent);
        battleState = gameState.battle;
        uiState = gameState.ui;

        // Add welcome message
        addCustomLogMessage(
            "Custom battle created! Select moves for both Pokémon.",
        );
    }

    // Add move to a Pokémon's moveset
    function addMove(pokemonType, moveName) {
        if (pokemonType === "player") {
            if (
                selectedMovesPlayer.length < 4 &&
                !selectedMovesPlayer.includes(moveName)
            ) {
                selectedMovesPlayer = [...selectedMovesPlayer, moveName];
            }
        } else {
            if (
                selectedMovesOpponent.length < 4 &&
                !selectedMovesOpponent.includes(moveName)
            ) {
                selectedMovesOpponent = [...selectedMovesOpponent, moveName];
            }
        }
    }

    // Remove move from a Pokémon's moveset
    function removeMove(pokemonType, moveName) {
        if (pokemonType === "player") {
            selectedMovesPlayer = selectedMovesPlayer.filter(
                (m) => m !== moveName,
            );
        } else {
            selectedMovesOpponent = selectedMovesOpponent.filter(
                (m) => m !== moveName,
            );
        }
    }

    // Show move details
    function showMoveDetails(moveName) {
        selectedMoveForDetails = moveList[moveName];
    }

    // Handle move selection in battle
    function handleMoveSelect(pokemonId, moveKey) {
        if (!gameState) return;

        gameState = SingleBattle.selectMove(gameState, pokemonId, moveKey);
        battleState = gameState.battle;
        uiState = gameState.ui;
    }

    // Reset battle
    function handleReset() {
        if (!gameState) return;

        gameState = SingleBattle.resetBattle(gameState);
        battleState = gameState.battle;
        uiState = gameState.ui;
    }

    // Clean up event listeners when component is destroyed
    onDestroy(() => {
        cleanupEventListeners();
    });

    // Set some default moves for quick testing
    onMount(() => {
        selectedMovesPlayer = [
            "Thundershock",
            "Swift",
            "Thunder Wave",
            "Metronome",
        ];
        selectedMovesOpponent = ["Psyshock", "Recover", "Growth", "Metronome"];
    });
</script>

<div class="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Move Constructor</h2>
        <button
            class="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
            onclick={() => changeScene(SCENES.MAIN_MENU)}
        >
            Back to Menu
        </button>
    </div>

    <!-- Setup Section (before battle is started) -->
    {#if !gameState}
        <div class="grid grid-cols-2 gap-4 mb-4">
            <!-- Player Pokémon Setup -->
            <div class="border rounded-md p-3">
                <h3 class="text-lg font-bold mb-2">Player Pokémon</h3>

                <div class="mb-3">
                    <label class="block text-sm font-medium mb-1">Species</label
                    >
                    <select
                        class="w-full p-2 border rounded"
                        bind:value={playerSpecies}
                    >
                        {#each pokemonSpecies as species}
                            <option value={species}>{species}</option>
                        {/each}
                    </select>
                </div>

                <div class="mb-3">
                    <label class="block text-sm font-medium mb-1">Level</label>
                    <input
                        type="number"
                        class="w-full p-2 border rounded"
                        min="1"
                        max="100"
                        bind:value={playerLevel}
                    />
                </div>

                <div class="mb-3">
                    <label class="block text-sm font-medium mb-1">Moves</label>
                    <ul class="border rounded-md divide-y">
                        {#each selectedMovesPlayer as move}
                            <li class="p-2 flex justify-between items-center">
                                <span>{move}</span>
                                <div class="flex gap-2">
                                    <button
                                        class="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded"
                                        onclick={() => showMoveDetails(move)}
                                    >
                                        Details
                                    </button>
                                    <button
                                        class="text-xs bg-red-100 text-red-800 py-1 px-2 rounded"
                                        onclick={() =>
                                            removeMove("player", move)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        {/each}
                        {#if selectedMovesPlayer.length === 0}
                            <li class="p-2 text-gray-500 italic">
                                No moves selected
                            </li>
                        {/if}
                    </ul>
                    {#if selectedMovesPlayer.length < 4}
                        <div class="text-xs text-gray-500 mt-1">
                            {4 - selectedMovesPlayer.length} move slots remaining
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Opponent Pokémon Setup -->
            <div class="border rounded-md p-3">
                <h3 class="text-lg font-bold mb-2">Opponent Pokémon</h3>

                <div class="mb-3">
                    <label class="block text-sm font-medium mb-1">Species</label
                    >
                    <select
                        class="w-full p-2 border rounded"
                        bind:value={opponentSpecies}
                    >
                        {#each pokemonSpecies as species}
                            <option value={species}>{species}</option>
                        {/each}
                    </select>
                </div>

                <div class="mb-3">
                    <label class="block text-sm font-medium mb-1">Level</label>
                    <input
                        type="number"
                        class="w-full p-2 border rounded"
                        min="1"
                        max="100"
                        bind:value={opponentLevel}
                    />
                </div>

                <div class="mb-3">
                    <label class="block text-sm font-medium mb-1">Moves</label>
                    <ul class="border rounded-md divide-y">
                        {#each selectedMovesOpponent as move}
                            <li class="p-2 flex justify-between items-center">
                                <span>{move}</span>
                                <div class="flex gap-2">
                                    <button
                                        class="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded"
                                        onclick={() => showMoveDetails(move)}
                                    >
                                        Details
                                    </button>
                                    <button
                                        class="text-xs bg-red-100 text-red-800 py-1 px-2 rounded"
                                        onclick={() =>
                                            removeMove("opponent", move)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        {/each}
                        {#if selectedMovesOpponent.length === 0}
                            <li class="p-2 text-gray-500 italic">
                                No moves selected
                            </li>
                        {/if}
                    </ul>
                    {#if selectedMovesOpponent.length < 4}
                        <div class="text-xs text-gray-500 mt-1">
                            {4 - selectedMovesOpponent.length} move slots remaining
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Move Selection -->
        <div class="mb-4">
            <h3 class="text-lg font-bold mb-2">Available Moves</h3>

            <div class="mb-3">
                <input
                    type="text"
                    placeholder="Search moves..."
                    class="w-full p-2 border rounded"
                    bind:value={moveSearchTerm}
                />
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {#each filteredMoves() as { name, move }}
                    <div class="border rounded-md p-2 flex flex-col">
                        <div class="font-medium">{name}</div>
                        <div class="text-xs text-gray-600">
                            {move.type} / {move.category} / Power: {move.power ||
                                "—"}
                        </div>
                        <div class="mt-2 flex gap-1">
                            <button
                                class="text-xs bg-blue-500 text-white py-1 px-2 rounded flex-1"
                                onclick={() => addMove("player", name)}
                                disabled={selectedMovesPlayer.length >= 4 ||
                                    selectedMovesPlayer.includes(name)}
                            >
                                Add to Player
                            </button>
                            <button
                                class="text-xs bg-green-500 text-white py-1 px-2 rounded flex-1"
                                onclick={() => addMove("opponent", name)}
                                disabled={selectedMovesOpponent.length >= 4 ||
                                    selectedMovesOpponent.includes(name)}
                            >
                                Add to Opponent
                            </button>
                        </div>
                        <button
                            class="text-xs bg-gray-200 mt-1 py-1 px-2 rounded"
                            onclick={() => showMoveDetails(name)}
                        >
                            Details
                        </button>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Start Battle Button -->
        <div class="flex justify-center">
            <button
                class="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-bold"
                onclick={initializeBattle}
                disabled={selectedMovesPlayer.length === 0 ||
                    selectedMovesOpponent.length === 0}
            >
                Start Battle
            </button>
        </div>
    {:else}
        <!-- Battle Section (after battle is started) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
                <!-- Pokémon 1 (Player) -->
                <PokemonCard
                    pokemon={battleState.pokemon1}
                    highlightedMove={uiState.selectedMoves.pokemon1}
                    color="blue"
                    battleOver={battleState.battleOver}
                    onMoveSelect={(moveKey) =>
                        handleMoveSelect("pokemon1", moveKey)}
                />

                <!-- Pokémon 2 (Opponent) -->
                <PokemonCard
                    pokemon={battleState.pokemon2}
                    highlightedMove={uiState.selectedMoves.pokemon2}
                    color="green"
                    battleOver={battleState.battleOver}
                    onMoveSelect={(moveKey) =>
                        handleMoveSelect("pokemon2", moveKey)}
                />

                {#if battleState.battleOver}
                    <button
                        class="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded mt-4"
                        onclick={handleReset}
                    >
                        New Battle
                    </button>
                {/if}
            </div>

            <div>
                <!-- Move details display -->
                {#if selectedMoveForDetails}
                    <div class="mb-4">
                        <h3 class="text-md font-bold mb-2">Move Details:</h3>
                        <MoveDetail move={selectedMoveForDetails} />
                    </div>
                {/if}

                <!-- Battle log -->
                <div class="mt-4">
                    <h3 class="text-md font-bold mb-2">Battle Log:</h3>
                    <BattleLog />
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    input:disabled,
    select:disabled,
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>