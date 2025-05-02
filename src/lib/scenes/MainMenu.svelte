<script>
  import { changeScene, SCENES } from "./SceneManager.svelte.js";
</script>

<div class="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
  <h1 class="text-2xl font-bold mb-4 text-center">Pokémon Battle Simulator</h1>

  <div class="space-y-4">
    <button
      class="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
      onclick={() => changeScene(SCENES.BATTLE)}
    >
      Single Battle
    </button>

    <button
      class="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-md"
      onclick={() => changeScene(SCENES.GAUNTLET)}
    >
      Gauntlet Mode
    </button>
    
    <button
      class="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-md"
      onclick={() => changeScene(SCENES.ADVANCED_BATTLE)}
    >
      Advanced Battle
    </button>
    
    <button
      class="w-full p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md"
      onclick={() => changeScene(SCENES.ADVANCED_BATTLE_TEST)}
    >
      Move Constructor
    </button>
  </div>
  
  <div class="mt-4 text-center text-sm text-gray-500">
    <p>Version 0.2.0 - Advanced Moves System</p>
  </div>
</div>