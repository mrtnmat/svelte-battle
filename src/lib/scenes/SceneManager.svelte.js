// Define scenes enum for easier reference
export const SCENES = {
  MAIN_MENU: 'MAIN_MENU',
  BATTLE: 'BATTLE',
  GAUNTLET: 'GAUNTLET',
  MOVE_CONSTRUCTOR: 'MOVE_CONSTRUCTOR'
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