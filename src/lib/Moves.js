/**
 * @param {{ name: string; power: number; pp: number; }} name
 */
function newMove({name, power, pp}) {
    return {
          name,
          power,
          pp,
    }
}

export const moveList = {
    // Basic physical moves
    'Tackle': newMove({name: 'Tackle', power: 40, pp: 35}),
    'Scratch': newMove({name: 'Scratch', power: 40, pp: 35}),
    
    // Elemental moves
    'Thundershock': newMove({name: 'Thundershock', power: 40, pp: 30}),
    'Vine Whip': newMove({name: 'Vine Whip', power: 45, pp: 25}),
    'Ember': newMove({name: 'Ember', power: 40, pp: 25}),
    'Water Gun': newMove({name: 'Water Gun', power: 40, pp: 25}),

    // Stronger moves
    'Thunderbolt': newMove({name: 'Thunderbolt', power: 90, pp: 15}),
    'Razor Leaf': newMove({name: 'Razor Leaf', power: 55, pp: 25}),
    'Flamethrower': newMove({name: 'Flamethrower', power: 90, pp: 15}),
    'Bubble Beam': newMove({name: 'Bubble Beam', power: 65, pp: 20})
}