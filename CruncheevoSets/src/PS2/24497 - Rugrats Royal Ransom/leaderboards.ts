import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, Leaderboard } from '@cruncheevos/core'
import * as data from './data.js'
import { checkItemType, inGame, beatLevelV2 } from './achievements.js'
import { calculation, comparison, connectAddSourceChains, measureLB } from '../../helpers.js'

export function makeLeaderboards(set: AchievementSet): void {

    set.addLeaderboard({
        title: 'Baby Easy - Speedrun - RTA',
        id: 138599,
        description: 'Beat the game from a fresh save file on Baby Easy as fast as possible, timer offset by 10 seconds at the start to match RTA timing',
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
                'D:1=1.600.',
                'M:1=1'
            )  
        }
    })

    set.addLeaderboard({
        title: 'Rugrat Normal - Speedrun - RTA',
        id: 138600,
        description: 'Beat the game from a fresh save file on Rugrat Normal as fast as possible, timer offset by 10 seconds at the start to match RTA timing',
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
                'D:1=1.600.',
                'M:1=1'
            )
        }
    })

    set.addLeaderboard({
        title: 'Reptar Tough - Speedrun - RTA',
        id: 138601,
        description: 'Beat the game from a fresh save file on Reptar Tough as fast as possible, timer offset by 10 seconds at the start to match RTA timing',
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
                'D:1=1.600.',
                'M:1=1'
            )
        }
    })

    set.addLeaderboard({
        title: 'Acrobatty Dash - Speedrun - RTA',
        id: 138563,
        description: 'Beat \"Acrobatty Dash\" as fast as possible on any difficulty',
        type: 'FRAMES',
        lowerIsBetter: true,
        conditions: {
            start: $(
                comparison(data.gameplayID, '=', 3),
                comparison(data.levelIDLoaded, '=', 0x1b, true),
                comparison(data.levelIDLoaded, '=', 0xc, false)
            ),
            cancel: $(
                comparison(data.levelIDLoaded, '!=', 0xc)
            ),
            submit: $(
                data.chainLinkedListData(0, true),
                comparison(data.timer, '!=', data.timer, true, false).withLast({ flag: 'ResetNextIf' }),
                comparison(data.pauseScreen, '!=', 1).withLast({ flag: 'AndNext' }),
                data.chainLinkedListDataRange(0, 0, [
                    comparison(data.healthCounter, '>', 0).withLast({ flag: 'AndNext' }),
                    comparison(data.timer, '>', 0).withLast({ flag: 'AndNext' }),
                    comparison(data.helperBallPosition, '=', 0x28).withLast({ flag: 'AndNext' }),
                    comparison(data.timer, '=', data.timer, true, false).withLast({ hits: 4 }) // Timer changes every other frame, the extra hits are to be safe
                ], true)
            ),
            value: $(
                data.chainLinkedListData(0, true),
                comparison(data.helperBallPosition, '=', 0).withLast({ flag: 'ResetNextIf' }),

                'M:1=1',
            )
        }
    })

    set.addLeaderboard({
        title: 'Temple Run - Speedrun - RTA',
        id: 138564,
        description: 'In \"Punting Papayas\", starting from the inside of the temple where you spawn before hitting a checkpoint, fall into the temple from the second story as fast as possible. Touch the Cycas plant by spawn to cancel your attempt',
        type: 'FRAMES',
        lowerIsBetter: true,
        conditions: {
            start: $(
                inGame(),

                // Start the attempt if you walk through a small box in the entryway of the temple, an addhits chain used as a higher level ornext chain
                data.chainLinkedListDataRange(0, 50, [
                    checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                    checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }), // Making sure the delta / mem check below reads the acual data we want instead of data from two different nodes. Shouldn't interfere since nothing should spawn while close to the temple
                    comparison(data.treeCheckpoints, '=', 0).withLast({ flag: 'AndNext' }), // Checks that your checkpoint is set at the start of the level
                    comparison(data.XPos, '>=', 32, true).withLast({ flag: 'AndNext' }),
                    comparison(data.XPos, '<', 32, false).withLast({ flag: 'AndNext' }),
                    comparison(data.YPos, '>=', 51).withLast({ flag: 'AndNext' }),
                    comparison(data.YPos, '<=', 53).withLast({ flag: 'AndNext' }),
                    comparison(data.ZPos, '>=', 6).withLast({ flag: 'AndNext' }),
                    comparison(data.ZPos, '<=', 10).withLast({ flag: 'AddHits' }),
                ], true),
                '0=1.1.',

                // Reset if you leave the level or walk far enough away from the start line, ideally wouldn't need these resets, but since we need to use hits to approximate an ornext chain above, it's nessesary
                comparison(data.levelIDLoaded, '!=', 0x9).withLast({ flag: 'ResetIf' }),
                data.chainLinkedListDataRange(0, 50, [
                    checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                    checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                    comparison(data.XPos, '<', 31, true).withLast({ flag: 'ResetIf' }),
                ], true),
            ),
            cancel: {
                core: $('1=1'),
                alt1: comparison(data.levelIDLoaded, '!=', 0x9),
                alt2: $(
                    // Resets every other frame to reset the hit so you can cancel every attempt, not just the first one
                    'R:1=1.2.',

                    // Cancels if you walk near the Cycas plant, addhits as ornext chain
                    data.chainLinkedListDataRange(0, 50, [
                        checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                        checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                        comparison(data.XPos, '>=', 28.5).withLast({ flag: 'AndNext' }),
                        comparison(data.XPos, '<=', 30).withLast({ flag: 'AndNext' }),
                        comparison(data.YPos, '>=', 57).withLast({ flag: 'AndNext' }),
                        comparison(data.YPos, '<=', 58.5).withLast({ flag: 'AndNext' }),
                        comparison(data.ZPos, '>=', 4.5).withLast({ flag: 'AndNext' }),
                        comparison(data.ZPos, '<=', 5).withLast({ flag: 'AddHits' }),
                    ], true),
                    '0=1.1.'
                )
            },
            submit: $(

                // Reset if you are below a certain Z value, this is to make sure you don't set the submit flag before starting the attempt
                data.chainLinkedListDataRange(0, 50, [
                    checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                    checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                    comparison(data.ZPos, '<=', 13.5).withLast({ flag: 'ResetIf' }),
                ], true),

                // Submits if you walk through a small box into the second floor of the temple, addhits as an ornext chain
                data.chainLinkedListDataRange(0, 50, [
                    checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                    checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                    comparison(data.XPos, '>=', 40).withLast({ flag: 'AndNext' }),
                    comparison(data.XPos, '<=', 41.5).withLast({ flag: 'AndNext' }),
                    comparison(data.YPos, '>=', 56, true).withLast({ flag: 'AndNext' }),
                    comparison(data.YPos, '<', 56, false).withLast({ flag: 'AndNext' }),
                    comparison(data.ZPos, '>=', 14).withLast({ flag: 'AndNext' }),
                    comparison(data.ZPos, '<=', 16).withLast({ flag: 'AddHits' }),
                ], true),
                '0=1.1.'
            ),
            value: $(
                'M:1=1'
            )
        }
    })

    let CCandTBvalue: any = {}
    for (let i: number = 0; i < 20; i++) {
        let addition: any = $(
            data.chainLinkedListDataRange(i, i, [
                checkItemType(0x111328).withLast({ flag: 'MeasuredIf' }),
                measureLB(data.itemCounter)
            ], true)
        )
        if (i == 0) {
            CCandTBvalue['core'] = addition
        }
        else {
            CCandTBvalue['alt' + i.toString()] = addition
        }
    }


    set.addLeaderboard({
        title: 'Carrot Catchin\' - High Score',
        id: 139202,
        description: 'Collect the most carrots in \"Carrot Catchin\'\"',
        type: 'VALUE',
        lowerIsBetter: false,
        conditions: {
            start: $(
                comparison(data.levelIDInstant, '=', 0x1e, true),
                comparison(data.levelIDInstant, '=', 0x1b, false)
            ),
            cancel: $(
                '0=1'
            ),
            submit: $(
                '1=1'
            ),
            value: CCandTBvalue
        }
    })



/* Leaderboard needs a way to find out if you've broken a target without looking at the RingTimer delta/mem as debris spawns that same frame. Also needs editing to fix negaitve values always taking over
    let RRCvalue: any = {}
    for (let i: number = 1; i < 19; i++) {
        if (i > 1) {
            RRCvalue['alt' + (i - 1).toString()] = $(
                data.chainLinkedListDataRange(0, 20, [
                    checkItemType(0x24c990).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                    checkItemType(0x24c990).withLast({ flag: 'AndNext' }),
                    comparison(data.ringTimer, '>', data.ringTimer, true, false).withLast({ flag: 'AddHits' })
                ]),
                $('Z:0=1').withLast({ hits: i }),
                comparison(data.loadedTimer, '<', 0.5).withLast({flag: 'MeasuredIf', hits: 1 }),
                calculation(true, data.loadedTimer, '*', 100),
                calculation(false, 500, '*', i - 1),
                'M:0'
            )
        }
        else {
            RRCvalue['core'] = $(
                data.chainLinkedListDataRange(0, 20, [
                    checkItemType(0x24c990).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                    checkItemType(0x24c990).withLast({ flag: 'AndNext' }),
                    comparison(data.ringTimer, '>', data.ringTimer, true, false).withLast({ flag: 'AddHits' })
                ]),
                $('Z:0=1').withLast({ hits: i }),
                comparison(data.loadedTimer, '<', 0.5).withLast({ flag: 'MeasuredIf', hits: 1 }),
                calculation(true, data.loadedTimer, '*', 100),
                calculation(false, 500, '*', i - 1),
                'M:0'
            )
        }
        
    }

    set.addLeaderboard({
        title: 'Ring Roller Coaster - Scored Speedrun',
        description: 'Beat \"Ring Roller Coaster\" as fast as possible, each target broken subtracts 5 seconds from your final time',
        type: 'FIXED2',
        lowerIsBetter: true,
        conditions: {
            start: $(
                inGame(),
                comparison(data.levelIDLoaded, '=', 0x1b, true),
                comparison(data.levelIDLoaded, '=', 0x20, false)
            ),
            cancel: $(
                comparison(data.levelIDLoaded, '!=', 0x20)
            ),
            submit: $(
                beatLevelV2(0x20, 20, [
                    $(comparison(data.ringCounter, '=', 0x12)),
                    $(comparison(data.ringTimer, '!=', 0.0))
                ])
            ),
            value: RRCvalue
        }
    })
    */


    set.addLeaderboard({
        title: 'Target Bash - High Score',
        id: 139203,
        description: 'Bash the most targets in \"Target Bash\"',
        type: 'VALUE',
        lowerIsBetter: false,
        conditions: {
            start: $(
                comparison(data.levelIDInstant, '=', 0x24, true),
                comparison(data.levelIDInstant, '=', 0x1b, false)
            ),
            cancel: $(
                '0=1'
            ),
            submit: $(
                '1=1'
            ),
            value: CCandTBvalue
        }
    })

    // Collectables left to collect hidden leaderboards for Reptar Tough
    let idCounter:number = 138602
    for (var levelID in data.levelOnFloorDict) {

        if (+levelID >= 0x1a) {break }

        let temp: any = connectAddSourceChains(data.chainFunnyMoneyStacksCollected(+levelID, 2))
        let totalCollectables: number = temp.tally
        let chainOne: ConditionBuilder = temp.chain.map((cond, index, array) => cond.with({ flag: 'SubSource' }))

        temp = connectAddSourceChains(data.chainLittleBatteriesCollected(+levelID, 2))
        totalCollectables = totalCollectables + temp.tally
        let chainTwo: ConditionBuilder = temp.chain.map((cond, index, array) => cond.with({ flag: 'SubSource' }))

        set.addLeaderboard({
            title: 'Collectable Detector - ' + data.levelNamesAchData[levelID].title,
            id: idCounter,
            description: 'Shows how many collectables are left to find in the level',
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
                    chainOne,
                    chainTwo,
                    ['Measured', 'Value', '', totalCollectables]
                )
            }
        })
        idCounter = idCounter + 1
    }



    const sizeDict = {
        0: 'Bit0',
        1: 'Bit1',
        2: 'Bit2',
        3: 'Bit3',
        4: 'Bit4',
        5: 'Bit5',
        6: 'Bit6',
        7: 'Bit7'
    }

    // Hidden Leaderboards for each of the missing collectables when they are grabbed in game
    for (var levelID in data.levelOnFloorDict) {
        for (var missingCollectable of (data.collectablesData!['0x' + (+levelID).toString(16)]['2'].missingArray ?? [])) {
            set.addLeaderboard({
                title: 'Impossible Collectable Gathered',
                description: 'Collectable ' + missingCollectable.toString() + ' in level ' + levelID,
                type: 'VALUE',
                lowerIsBetter: false,
                conditions: {
                    start: $(
                        inGame().withLast({ lvalue: { type: 'Delta' } }),
                        comparison(data.difficulty, '=', 2),
                        ['', 'Delta', sizeDict[missingCollectable % 8], 0x3f68c0 + 0x100 * (+levelID - 1) + Math.floor(missingCollectable / 8), '=', 'Value', '', 0],
                        ['', 'Mem', sizeDict[missingCollectable % 8], 0x3f68c0 + 0x100 * (+levelID - 1) + Math.floor(missingCollectable / 8), '=', 'Value', '', 1]
                    ),
                    cancel: $('0=1'),
                    submit: $('1=1'),
                    value: $('M:1')
                }
            })
        }
    }


    /* Hidden leaderboard for all the missing collectables in one upon loading a game, abandoned as it would be super annoying if someone got one legit to have this pop up every time they loaded
    let missingBitSum: ConditionBuilder = $()
    let powerCounter: number = 0
    for (var levelID in data.levelOnFloorDict) {
        for (var missingCollectable of (data.collectablesData!['0x' + (+levelID).toString(16)]['2'].missingArray ?? [])) {
            missingBitSum = missingBitSum.also(
                $(['AddSource', 'Mem', sizeDict[missingCollectable % 8], 0x3f68c0 + 0x100 * (+levelID - 1) + Math.floor(missingCollectable / 8), '*', 'Value', '', 2**powerCounter])
            )
            powerCounter = powerCounter + 1
        }
    }

    set.addLeaderboard({
        title: 'Impossible Collectables Loaded',
        description: 'Loaded into a Tough game with missing collectables already gathered',
        type: 'VALUE',
        lowerIsBetter: false,
        conditions: {
            start: $(
                comparison(data.gameplayID, '=', 2, true),
                comparison(data.gameplayID, '=', 3, false),
                comparison(data.difficulty, '=', 2),
                missingBitSum,
                '0>1'
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: missingBitSum.withLast({ flag: 'Measured' })
        }
    })
    */

    

}