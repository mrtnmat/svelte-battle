<script>
  import { sceneState, SCENES } from './lib/scenes/SceneManager.svelte.js';
  import MainMenuScene from './lib/scenes/MainMenu.svelte';
  import BattleScene from './lib/scenes/BattleScene.svelte';
  import GauntletScene from './lib/scenes/GauntletScene.svelte';
  import MoveConstructor from './lib/scenes/MoveConstructor.svelte';
  import TrainerGauntletScene from './lib/scenes/TrainerGauntletScene.svelte';
  
  // Use $derived to track the current scene
  let currentScene = $derived(sceneState.currentScene);
</script>

<main class="container mx-auto p-4">
  {#if currentScene === SCENES.MAIN_MENU}
    <MainMenuScene />
  {:else if currentScene === SCENES.BATTLE}
    <BattleScene />
  {:else if currentScene === SCENES.GAUNTLET}
    <GauntletScene />
  {:else if currentScene === SCENES.MOVE_CONSTRUCTOR}
    <MoveConstructor />
  {:else if currentScene === SCENES.TRAINER_GAUNTLET}
    <TrainerGauntletScene />
  {/if}
</main>

<style>
  :global(body) {
    background-color: #f5f5f5;
    min-height: 100vh;
  }
</style>