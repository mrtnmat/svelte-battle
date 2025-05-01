/**
 * @param {{ name: string; power: number; pp: number; category: string; }} name
 */
function newMove({name, power, pp, category}) {
    return {
          name,
          power,
          pp,
          category
    }
}

export const moveList = {
    // Basic physical moves
    'Tackle': newMove({name: 'Tackle', power: 40, pp: 35, category: 'Physical'}),
    'Scratch': newMove({name: 'Scratch', power: 40, pp: 35, category: 'Physical'}),
    
    // Elemental special moves
    'Thundershock': newMove({name: 'Thundershock', power: 40, pp: 30, category: 'Special'}),
    'Vine Whip': newMove({name: 'Vine Whip', power: 45, pp: 25, category: 'Special'}),
    'Ember': newMove({name: 'Ember', power: 40, pp: 25, category: 'Special'}),
    'Water Gun': newMove({name: 'Water Gun', power: 40, pp: 25, category: 'Special'}),

    // Stronger moves
    'Thunderbolt': newMove({name: 'Thunderbolt', power: 90, pp: 15, category: 'Special'}),
    'Razor Leaf': newMove({name: 'Razor Leaf', power: 55, pp: 25, category: 'Special'}),
    'Flamethrower': newMove({name: 'Flamethrower', power: 90, pp: 15, category: 'Special'}),
    'Bubble Beam': newMove({name: 'Bubble Beam', power: 65, pp: 20, category: 'Special'})
}