import { STAB_BONUS } from "../core/Constants"
import { typeEffectiveness } from "../core/Types"

const effectivness = ({atkType, defType}) => typeEffectiveness[atkType][defType]
const randomFactor = () => (Math.random() * 15 + 85) / 100
const levelDamage = (level) => (level * 2 / 5) + 2

export const isSTAB = ({ pkmTypes, mvType }) => pkmTypes.includes(mvType) ? true : false

export function calculateDamage({ attacker, defender, move }) {
    let attackStat, defenseStat

    if (move.category === 'Physical') {
        attackStat = attacker.attack
        defenseStat = defender.defense
    } else if (move.category === 'Special') {
        attackStat = attacker.specialAttack
        defenseStat = defender.specialDefense
    }

    const typeModifier = defender.types
        .map((defType) => effectivness({ atkType: move.type, defType }))
        .reduce((v, acc) => acc * v)

    const attackRatio = attackStat / defenseStat

    const baseDamage = (levelDamage(attacker.level)
        * move.power
        * attackRatio) / 50 + 2

    const finalDamage = baseDamage
        * typeModifier
        * (isSTAB({ pkmTypes: attacker.types, mvType: move.type }) ? STAB_BONUS : 1)
        * randomFactor()

    return Math.max(1, Math.round(finalDamage))
}