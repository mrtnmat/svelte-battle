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
    'Tackle': newMove({name: 'Tackle', power: 40, pp:35}),
    'Thundershock': newMove({name: 'Thundershock', power: 40, pp:30}),
}