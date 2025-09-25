import { define as $, Condition, ConditionBuilder, RichPresence } from '@cruncheevos/core'
import { comparison, conditionRP, connectAddSourceChains, trimRP } from '../../helpers.js'
import * as data from './data.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'
let collectablesData: any = commentjson.parse(fs.readFileSync('./src/PS2/24497 - Rugrats Royal Ransom/collectables.json', 'utf8'))


let littleBattsCollected: Array<ConditionBuilder> = []
let funnyMoneyCollected: Array<ConditionBuilder> = []

let littleBattsTotal: Array<number> = []
let funnyMoneyTotal: Array<number> = []

for (let i: number = 0; i <= 2; i++) {
    let battChain: ConditionBuilder = $()
    let moneyChain: ConditionBuilder = $()
    let totalLittleBatteries: number = 0
    let totalFunnyMoney: number = 0

    for (var levelID in data.levelOnFloorDict) {
        let battAddition: any = connectAddSourceChains(data.chainLittleBatteriesCollected(+levelID, i, false))
        let moneyAddition: any = connectAddSourceChains(data.chainFunnyMoneyStacksCollected(+levelID, i, false))

        totalLittleBatteries = totalLittleBatteries + battAddition.tally
        totalFunnyMoney = totalFunnyMoney + moneyAddition.tally

        battChain = battChain.also(battAddition.chain)
        moneyChain = moneyChain.also(moneyAddition.chain)
    }


    littleBattsCollected[i] = $(
        battChain.withLast({ flag: 'Measured' })
    )

    funnyMoneyCollected[i] = $(
        moneyChain.withLast({ flag: 'Measured' })
    )

    littleBattsTotal[i] = totalLittleBatteries
    funnyMoneyTotal[i] = totalFunnyMoney
}



export function makeRP(): any {
    return RichPresence({
        lookupDefaultParameters: { keyFormat: 'dec', compressRanges: true },
        format: {
            Timer: 'FRAMES'
        },
        lookup: {
            baby: {
                values: {
                    0x0: 'Chuckie',
                    0x1: 'Lil',
                    0x2: 'Phil',
                    0x3: 'Angelica',
                    0x4: 'Tommy',
                    0x5: 'Kimi',
                    0x6: 'Suzie',
                    0x7: 'Dil',
                    0x8: 'Lou',
                    0x9: 'Stu'
                }
            },
            level: {
                values: {
                    0x01: 'Rugrat Rug Race',
                    0x02: 'Meanie Genie',
                    0x03: 'Temple of the Lamp',
                    0x04: 'Mr.Snowtato Head',
                    0x05: 'Ready, Set, Snow',
                    0x07: 'Snowplace to Hide',
                    0x08: 'River Fun Run',
                    0x09: 'Punting Papayas',
                    0x0a: 'Monkey Business',
                    0x0b: 'Cone Caper',
                    0x0c: 'Acrobatty Dash',
                    0x0d: 'Cream Pie Flyer',
                    0x0e: 'Sub-a-Dub-Dub',
                    0x10: 'Hot Cod Racer',
                    0x11: 'Fly High Egg Hunt',
                    0x12: 'Rex Riding',
                    0x14: 'Bow and Apple',
                    0x15: 'The Holey Pail',
                    0x17: 'Moon Buggy Madness',
                    0x18: 'Cheesy Chase',
                    0x19: 'Rise of the Anjellyuns',
                    0x1a: 'Stormin\' the Castle',
                    0x1b: 'Play Palace 3000',
                    0x1e: 'Carrot Catchers',
                    0x20: 'Ring Roller Coaster',
                    0x24: 'Target Bash',
                    0x25: 'Get the Sled Out',
                    0x26: 'Snow-K Corral',
                    0x28: 'River Race',
                    0x29: 'Double Subble Trouble',
                    0x2b: 'Loopy Hoop Race',
                    0x2d: 'Loopy Hoop Race 2',
                    0x2c: 'Lunar 500',
                    0x2e: 'Target Time',
                    0x30: 'Double Scoop Cone Zone'
                }
            },
            verb: {
                values: {
                    '*': 'in',
                    0x1b: 'in the',
                    0x1e: 'playing',
                    0x20: 'playing',
                    0x24: 'playing',
                    0x25: 'playing',
                    0x26: 'playing',
                    0x28: 'playing',
                    0x29: 'playing',
                    0x2b: 'playing',
                    0x2d: 'playing',
                    0x2c: 'playing',
                    0x2e: 'playing',
                    0x30: 'playing'
                }
            },
            difficulty: {
                values: {
                    0x0: 'Baby Easy',
                    0x1: 'Rugrat Normal',
                    0x2: 'Reptar Tough'
                }
            },
            emotes: {
                values: {
                    '*': '👶',
                    0x1: '💎',
                    0x2: '💎',
                    0x3: '💎',
                    0x4: '⛄',
                    0x5: '⛄',
                    0x7: '⛄',
                    0x8: '🌳',
                    0x9: '🌳',
                    0xa: '🌳',
                    0xb: '🎪',
                    0xc: '🎪',
                    0xd: '🎪',
                    0xe: '🌊',
                    0x10: '🌊',
                    0x11: '🍖',
                    0x12: '🍖',
                    0x14: '🏰',
                    0x15: '🏰',
                    0x17: '🌕',
                    0x18: '🌕',
                    0x19: '🌕',
                    0x1a: '👑',
                    0x1e: '🥕',
                    0x20: '⭕',
                    0x24: '🎯',
                    0x25: '⛄',
                    0x26: '⛄',
                    0x28: '🌊',
                    0x29: '🌊',
                    0x2b: '🛩️',
                    0x2d: '🛩️',
                    0x2c: '🌕',
                    0x2e: '🎯',
                    0x2f: '🎯',
                    0x30: '🎪'
                }
            }
        },
        displays: ({ lookup, format, macro, tag }) => [

            //
            // Fresh file on Baby Easy, speedrunning specific
            //

            // This first one is while the speedrun is still active, has the same triggers as the clause below it, but with a less stringent reset
            [
                $(
                    comparison(data.gameplayID, '=', 4, true).withLast({ flag: 'AndNext' }),
                    comparison(data.gameplayID, '=', 3, false).withLast({ hits: 1 }), // Started a fresh file
                    comparison(data.difficulty, '=', 0), // on Easy
                    comparison(data.levelIDLoaded, '<=', 0x1b), // Double check you're not in minigame mode
                    comparison(data.gameplayID, '!=', 3).withLast({ flag: 'ResetIf' }) // Reset once you've exited the game
                ),
                trimRP(tag`
                    ${lookup.baby.at(conditionRP(data.baby))} 
                    speedrunning on
                    ${lookup.difficulty.at(conditionRP(data.difficulty))} 
                    ● 
                    Big 🔋 [${macro.Unsigned.at(conditionRP(data.currentBigBatteries))}/13] 
                    ●
                    ⏱️ ${format.Timer.at(
                        'D:1=1.600.' +
                        '_M:1=1' +
                        '_R:' + conditionRP(data.gameplayID) + '!=3' +
                        '_N:' + conditionRP(data.gameplayID) + '=1' +
                        '_P:' + conditionRP(data.levelIDLoaded) + '=26'
                        )
                    } 
                `)
            ],

            // Adds more to the reset so it will stay active during the final cutscene
            [
                $(
                    comparison(data.gameplayID, '=', 4, true).withLast({ flag: 'AndNext' }),
                    comparison(data.gameplayID, '=', 3, false).withLast({ hits: 1 }),
                    comparison(data.difficulty, '=', 0),
                    comparison(data.levelIDLoaded, '<=', 0x1b),
                    comparison(data.gameplayID, '!=', 3).withLast({ flag: 'AndNext' }),
                    comparison(data.levelIDLoaded, '!=', 0x1a).withLast({ flag: 'ResetIf' })
                ),
                trimRP(tag`
                    ${lookup.baby.at(conditionRP(data.baby))} 
                    defeated Angelica on 
                    ${lookup.difficulty.at(conditionRP(data.difficulty))} 
                    in 
                    ⏱️ ${format.Timer.at(
                        'D:1=1.600.' +
                        '_M:1=1' +
                        '_R:' + conditionRP(data.gameplayID) + '!=3' +
                        '_N:' + conditionRP(data.gameplayID) + '=1' +
                        '_P:' + conditionRP(data.levelIDLoaded) + '=26'
                    )
                    }! 
                `)
            ],


            //
            // Generic beat final boss for any difficulty clause
            //


            [
                $(
                    comparison(data.gameplayID, '=', 1),
                    comparison(data.levelIDLoaded, '=', 0x1a)
                ),
                trimRP(tag`
                    ${lookup.baby.at(conditionRP(data.baby))} 
                    defeated Angelica on 
                    ${lookup.difficulty.at(conditionRP(data.difficulty))}!
                `)
            ],


            //
            // Regular gameplay clauses
            //


            // Baby Easy
            [
                $(
                    comparison(data.gameplayID, '=', 3),
                    comparison(data.difficulty, '=', 0),
                    comparison(data.levelIDLoaded , '<=', 0x1b)
                ),
                trimRP(tag`
                    ${lookup.baby.at(conditionRP(data.baby))} 
                    ${lookup.verb.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.emotes.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.level.at(conditionRP(data.levelIDLoaded))} 
                    on ${lookup.difficulty.at(conditionRP(data.difficulty))} 
                    ● 
                    Big 🔋 [${macro.Unsigned.at(conditionRP(data.currentBigBatteries))}/21] 
                    ● 
                    Little 🔋 [${macro.Unsigned.at(littleBattsCollected[0])}/${littleBattsTotal[0].toString()}] 
                    ● 
                    Funny 💵 [${macro.Unsigned.at(funnyMoneyCollected[0])}/${funnyMoneyTotal[0].toString()}]
                `)
            ],

            // Rugrat Normal
            [
                $(
                    comparison(data.gameplayID, '=', 3),
                    comparison(data.difficulty, '=', 1),
                    comparison(data.levelIDLoaded, '<=', 0x1b)
                ),
                trimRP(tag`
                    ${lookup.baby.at(conditionRP(data.baby))} 
                    ${lookup.verb.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.emotes.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.level.at(conditionRP(data.levelIDLoaded))} 
                    on ${lookup.difficulty.at(conditionRP(data.difficulty))} 
                    ● 
                    Big 🔋 [${macro.Unsigned.at(conditionRP(data.currentBigBatteries))}/21] 
                    ● 
                    Little 🔋 [${macro.Unsigned.at(littleBattsCollected[1])}/${littleBattsTotal[1].toString()}] 
                    ● 
                    Funny 💵 [${macro.Unsigned.at(funnyMoneyCollected[1])}/${funnyMoneyTotal[1].toString()}]
                `)
            ],

            // Reptar Tough
            [
                $(
                    comparison(data.gameplayID, '=', 3),
                    comparison(data.difficulty, '=', 2),
                    comparison(data.levelIDLoaded, '<=', 0x1b)
                ),
                trimRP(tag`
                    ${lookup.baby.at(conditionRP(data.baby))} 
                    ${lookup.verb.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.emotes.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.level.at(conditionRP(data.levelIDLoaded))} 
                    on ${lookup.difficulty.at(conditionRP(data.difficulty))} 
                    ● 
                    Big 🔋 [${macro.Unsigned.at(conditionRP(data.currentBigBatteries))}/21] 
                    ● 
                    Little 🔋 [${macro.Unsigned.at(littleBattsCollected[2])}/${littleBattsTotal[2].toString()}] 
                    ● 
                    Funny 💵 [${macro.Unsigned.at(funnyMoneyCollected[2])}/${funnyMoneyTotal[2].toString()}]
                `)
            ],


            //
            // Minigame Clauses
            //

            // One player
            [
                $(
                    comparison(data.gameplayID, '=', 3),
                    comparison(data.levelIDLoaded, '>=', 0x1e),
                    comparison(data.currentNumberOfPlayers, '=', 1)
                ),
                trimRP(tag`
                    ${lookup.baby.at(conditionRP(data.baby))} 
                    ${lookup.verb.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.emotes.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.level.at(conditionRP(data.levelIDLoaded))} 
                `)
            ],

            // Two players
            [
                $(
                    comparison(data.gameplayID, '=', 3),
                    comparison(data.levelIDLoaded, '>=', 0x1e),
                    comparison(data.currentNumberOfPlayers, '=', 2)
                ),
                trimRP(tag`
                    ${lookup.baby.at(conditionRP(data.baby))} 
                    and
                    ${lookup.baby.at(conditionRP(data.babyTwo))} 
                    ${lookup.verb.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.emotes.at(conditionRP(data.levelIDLoaded))} 
                    ${lookup.level.at(conditionRP(data.levelIDLoaded))} 
                `)
            ],


            //
            // Generic Gamemodes
            //

            [
                $(
                    comparison(data.gameplayID, '=', 0).withLast({ flag: 'OrNext' }),
                    comparison(data.gameplayID, '=', 1)
                ), 'Viewing the title screen'
            ],

            [
                comparison(data.gameplayID, '=', 2), 'Navigating the menus'
            ],

            [
                comparison(data.gameplayID, '=', 4), tag`Starting a new save file on ${lookup.difficulty.at(conditionRP(data.difficulty))}`,
            ],


            //
            // Catch all, will be active on game start up
            //

            'Just being babies'
        ]
    })
}