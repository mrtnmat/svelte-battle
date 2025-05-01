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
