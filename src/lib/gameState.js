import { NO_MOVE_SELECTED } from "./Constants";
import { moveList } from "./Moves";

export function createInitialState() {
  return {
    pokemon1: {
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
      },
      selectedMove: NO_MOVE_SELECTED,
    },
    pokemon2: {
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
      },
      selectedMove: NO_MOVE_SELECTED,
    },
    turn: 1,
    log: ["Battle started! Select moves for both Pokémon."],
    battleOver: false
  };
}
