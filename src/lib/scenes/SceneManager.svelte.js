// Define scenes enum for easier reference
export const SCENES = {
  MAIN_MENU: 'MAIN_MENU',
  BATTLE: 'BATTLE',
  GAUNTLET: 'GAUNTLET',
  ADVANCED_BATTLE: 'ADVANCED_BATTLE',
  ADVANCED_BATTLE_TEST: 'ADVANCED_BATTLE_TEST',
};

// Create a reactive state store
export const sceneState = $state({
  currentScene: SCENES.MAIN_MENU,
  sceneParams: {}
});

// Function to change scenes
export function changeScene(sceneName, params = {}) {
  sceneState.currentScene = sceneName;
  sceneState.sceneParams = params;
}