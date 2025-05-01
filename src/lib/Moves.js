/**
 * @param {{ name: string; power: number; pp: number; category: string; type: string; }} name
 */
function newMove({name, power, pp, category, type}) {
    return {
          name,
          power,
          pp,
          category,
          type
    }
}

export const moveList = {
    // Basic physical moves (Normal type)
    'Tackle': newMove({name: 'Tackle', power: 40, pp: 35, category: 'Physical', type: 'Normal'}),
    'Scratch': newMove({name: 'Scratch', power: 40, pp: 35, category: 'Physical', type: 'Normal'}),
    
    // Elemental special moves
    'Thundershock': newMove({name: 'Thundershock', power: 40, pp: 30, category: 'Special', type: 'Electric'}),
    'Vine Whip': newMove({name: 'Vine Whip', power: 45, pp: 25, category: 'Special', type: 'Grass'}),
    'Ember': newMove({name: 'Ember', power: 40, pp: 25, category: 'Special', type: 'Fire'}),
    'Water Gun': newMove({name: 'Water Gun', power: 40, pp: 25, category: 'Special', type: 'Water'}),

    // Stronger moves
    'Thunderbolt': newMove({name: 'Thunderbolt', power: 90, pp: 15, category: 'Special', type: 'Electric'}),
    'Razor Leaf': newMove({name: 'Razor Leaf', power: 55, pp: 25, category: 'Special', type: 'Grass'}),
    'Flamethrower': newMove({name: 'Flamethrower', power: 90, pp: 15, category: 'Special', type: 'Fire'}),
    'Bubble Beam': newMove({name: 'Bubble Beam', power: 65, pp: 20, category: 'Special', type: 'Water'})
}

// Define type effectiveness chart
export const typeEffectiveness = {
  Normal: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1,
    Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 0.5, Ghost: 0, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 1
  },
  Fire: {
    Normal: 1, Fire: 0.5, Water: 0.5, Electric: 1, Grass: 2, Ice: 2, Fighting: 1, Poison: 1,
    Ground: 1, Flying: 1, Psychic: 1, Bug: 2, Rock: 0.5, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 2, Fairy: 1
  },
  Water: {
    Normal: 1, Fire: 2, Water: 0.5, Electric: 1, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 1,
    Ground: 2, Flying: 1, Psychic: 1, Bug: 1, Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1, Fairy: 1
  },
  Electric: {
    Normal: 1, Fire: 1, Water: 2, Electric: 0.5, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 1,
    Ground: 0, Flying: 2, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1, Fairy: 1
  },
  Grass: {
    Normal: 1, Fire: 0.5, Water: 2, Electric: 1, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 0.5,
    Ground: 2, Flying: 0.5, Psychic: 1, Bug: 0.5, Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 0.5, Fairy: 1
  },
  Poison: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 2, Ice: 1, Fighting: 1, Poison: 0.5,
    Ground: 0.5, Flying: 1, Psychic: 1, Bug: 1, Rock: 0.5, Ghost: 0.5, Dragon: 1, Dark: 1, Steel: 0, Fairy: 2
  }
}