import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, Leaderboard } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains } from '../../helpers.js'

export function makeLeaderboards(set: AchievementSet): void {

    set.addLeaderboard({
        title: 'Baby Easy - Speedrun - RTA',
        description: 'Beat the game from a fresh save file on Baby Easy as fast as possible',
        type: 'FRAMES',
        lowerIsBetter: true,
        conditions: {
            start: $(
                comparison(data.currentFunnyMoney, '=', 0),
                comparison(data.currentCoins, '=', 500),
                comparison(data.currentBigBatteries, '=', 0),
                comparison(data.currentLittleBatteries, '=', 0),
                comparison(data.difficulty, '=', 0),
                comparison(data.gameplayID, '=', 4, true),
                comparison(data.gameplayID, '=', 3, false)
            ),
            cancel: $(
                comparison(data.gameplayID, '!=', 3, true),
                comparison(data.gameplayID, '!=', 3, false)
            ),
            submit: $(
                comparison(data.levelIDLoaded, '=', 0x1a),
                comparison(data.gameplayID, '=', 3, true),
                comparison(data.gameplayID, '=', 1, false)
            ),
            value: $(
                'M:1=1'
            )  
        }
    })

    set.addLeaderboard({
        title: 'Rugrat Normal - Speedrun - RTA',
        description: 'Beat the game from a fresh save file on Rugrat Normal as fast as possible',
        type: 'FRAMES',
        lowerIsBetter: true,
        conditions: {
            start: $(
                comparison(data.currentFunnyMoney, '=', 0),
                comparison(data.currentCoins, '=', 500),
                comparison(data.currentBigBatteries, '=', 0),
                comparison(data.currentLittleBatteries, '=', 0),
                comparison(data.difficulty, '=', 1),
                comparison(data.gameplayID, '=', 4, true),
                comparison(data.gameplayID, '=', 3, false)
            ),
            cancel: $(
                comparison(data.gameplayID, '!=', 3, true),
                comparison(data.gameplayID, '!=', 3, false)
            ),
            submit: $(
                comparison(data.levelIDLoaded, '=', 0x1a),
                comparison(data.gameplayID, '=', 3, true),
                comparison(data.gameplayID, '=', 1, false)
            ),
            value: $(
                'M:1=1'
            )
        }
    })

    set.addLeaderboard({
        title: 'Reptar Tough - Speedrun - RTA',
        description: 'Beat the game from a fresh save file on Reptar Tough as fast as possible',
        type: 'FRAMES',
        lowerIsBetter: true,
        conditions: {
            start: $(
                comparison(data.currentFunnyMoney, '=', 0),
                comparison(data.currentCoins, '=', 500),
                comparison(data.currentBigBatteries, '=', 0),
                comparison(data.currentLittleBatteries, '=', 0),
                comparison(data.difficulty, '=', 2),
                comparison(data.gameplayID, '=', 4, true),
                comparison(data.gameplayID, '=', 3, false)
            ),
            cancel: $(
                comparison(data.gameplayID, '!=', 3, true),
                comparison(data.gameplayID, '!=', 3, false)
            ),
            submit: $(
                comparison(data.levelIDLoaded, '=', 0x1a),
                comparison(data.gameplayID, '=', 3, true),
                comparison(data.gameplayID, '=', 1, false)
            ),
            value: $(
                'M:1=1'
            )
        }
    })

    // Funny money left to collect hidden leaderboards for Reptar Tough
    for (var levelID in data.levelOnFloorDict) {

        let temp: any = connectAddSourceChains(data.chainFunnyMoneyStacksCollected(+levelID, 2))
        let totalStacks: number = temp.tally
        let chain: ConditionBuilder = temp.chain.map((cond, index, array) => cond.with({flag:'SubSource'}))

        set.addLeaderboard({
            title: 'Funny Money Detector - ' + data.levelNamesAchData[levelID].title,
            description: 'Shows how many stacks of funny money are left to collect in the level',
            type: 'VALUE',
            lowerIsBetter: true,
            conditions: {
                start: $(
                    comparison(data.gameplayID,'=',3),
                    comparison(data.difficulty, '=', 2),
                    comparison(data.levelIDLoaded, '=', 0x1b, true),
                    comparison(data.levelIDLoaded, '=', +levelID, false),
                    comparison(data.shopItemPurchased(36),'=',1)
                ),
                cancel: $(
                    comparison(data.levelIDLoaded, '!=', +levelID)
                ),
                submit: $('0=1'),
                value: $(
                    chain,
                    ['Measured', 'Value', '', totalStacks]
                )
            }
        })
    }

}