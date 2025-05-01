import { NO_MOVE_SELECTED } from "./constants";
import { moveList } from "./moves";

export function createInitialState() {
  return {
    pokemon1: {
      name: "Pikachu",
      level: 50,
      hp: 95,
      maxHp: 95,
      attack: 60,
      defense: 45,
      speed: 95,
      moves: {
        'Move 1': {
          ...moveList.Tackle,
          ppRemaining: 10,
        },
        'Move 2': {
          ...moveList.Thundershock,
          ppRemaining: 20,
        },
      },
      selectedMove: NO_MOVE_SELECTED,
    },
    pokemon2: {
      name: "Bulbasaur",
      level: 50,
      hp: 105,
      maxHp: 105,
      attack: 54,
      defense: 54,
      speed: 50,
      moves: {
        'Move 1': {
          ...moveList.Tackle,
          ppRemaining: 20,
        },
        'Move 2': {
          ...moveList.Tackle,
          ppRemaining: 20,
        },
      },
      selectedMove: NO_MOVE_SELECTED,
    },
    turn: 1,
    log: ["Battle started! Select moves for both Pokémon."],
    battleOver: false
  };
}
