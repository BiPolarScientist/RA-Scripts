import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger, orNext, resetIf, measuredIf, resetNextIf, addHits, pauseIf } from '@cruncheevos/core'
import { gameplayID, game, otherPointer } from './data.js'
import { comparison, connectAddSourceChains, calculation, wiiAddAddress, create } from '../../helpers.js'
import * as fs from 'fs'

let achid:number = 601623

const tilelist: Array<number> = [
    0x11, 0x12, 0x13,
    0x21, 0x22, 0x23, 0x24,
    0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
    0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
    0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59
]

const zero: Partial<Condition.Data> = create('32bitBE',0x0)

const finishedCPUSelection: ConditionBuilder = $(
    comparison(otherPointer.selectingCPUStatus, '=', 0x13, true).withLast({ flag: 'AndNext' }),
    comparison(otherPointer.selectingCPUStatus, '=', 0x15, false).withLast({ flag: 'AndNext' })
)

function addHitsCharacterDifficulty(): ConditionBuilder {
    let logic = $()

    for (let slot = 0; slot < 3; slot++) {
        for (let diffArray of [
            [0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb], // At least 1 star
            [0x0, 0x1, 0x2, 0x3, 0x4, 0x6, 0x8, 0x9, 0xb], // At least 2 stars
            [0x1, 0x3, 0x4, 0x6, 0x8, 0x9, 0xb], // At least 3 stars
            [0x8, 0xb] // 4 stars
        ]) { 
            for (let ID of diffArray) {
                logic = logic.also(
                    addHits(
                        finishedCPUSelection,
                        comparison(otherPointer.CPUIds[slot], '=', ID).withLast({hits: 1})
                    )
                )
            }
        }
    }

    return logic
}

function startGameHit(dangerSenseBlock: boolean = true): ConditionBuilder {
    return $(
        resetNextIf(
            orNext(
                comparison(gameplayID, '!=', 0x9),
                dangerSenseBlock && comparison(game.dangerSense, '=', 1),
                comparison(game.support, '=', 1),
                comparison(game.autoPlay, '=', 1)
            )
        ), // Reset the game hit if we ever activate support functions

        andNext(
            comparison(gameplayID, '=', 0x9, true),
            comparison(game.status, '=', 0x5, true),
            comparison(gameplayID, '=', 0x9, false),
            comparison(game.status, '=', 0x6, false).withLast({ hits: 1 })
        ) // Creates a hit upon the start of a game
    )
}

function wonGame(withDifficulty: boolean = false, difficulty: number = 0, dangerSenseBlock: boolean = true): ConditionBuilder {

    return $(
        withDifficulty && resetIf(
            andNext(
                comparison(gameplayID, '!=', 0x7),
                comparison(gameplayID, '!=', 0x9)
            )
        ), // Reset the difficulty Hit if we exit the game
        withDifficulty && addHitsCharacterDifficulty(),
        withDifficulty && $('0=1').withLast({ hits: difficulty }), // Sums up hits equal to the number of stars CPUs have total


        startGameHit(dangerSenseBlock),


        orNext(
            comparison(game.gameScoreScreenPointer, '=', 0, true),
            comparison(game.status, '=', 0x28, true)
        ),
        comparison(game.gameScoreScreenPointer, '!=', 0),
        comparison(game.status, '=', 0x29), // Marks the end of a game

        comparison(game.gameScore.placement[0], '=', 0) // Check the player is in position 0 (first place)
    )
}

// Outputs logic which stores which seat the player is sitting in 0=east...3=north
function rememberWhatSeatPlayerIsIn(): ConditionBuilder {
    return $(
        calculation(true, game.seats[1], '*', game.seats[2]),
        calculation(true, game.seats[1], '*', game.seats[2]),
        calculation(true, game.seats[1], '*', game.seats[2]),
        calculation(true, game.seats[1], '*', game.seats[3]),
        calculation(true, game.seats[1], '*', game.seats[3]),
        calculation(true, game.seats[2], '*', game.seats[3]).withLast({ flag: 'Remember' }),
        calculation(true, game.seats[0], '*', 'recall').withLast({ flag: 'Remember' }),
        calculation(true, 'recall', '/', 6).withLast({ flag: 'Remember' })
    )
}

function startHandHit(): ConditionBuilder {
    return $(
        resetNextIf(
            orNext(
                comparison(gameplayID, '!=', 0x9),
                comparison(game.dangerSense, '=', 1),
                comparison(game.support, '=', 1),
                comparison(game.autoPlay, '=', 1)
            )
        ), // Reset the hand hit if we ever activate support functions or leave the game
        andNext(
            comparison(gameplayID, '=', 0x9, true),
            comparison(game.status, '=', 0x6, true),
            comparison(gameplayID, '=', 0x9, false),
            comparison(game.status, '=', 0x7, false).withLast({ hits: 1 })
        ) // Creates a hit upon the start of a hand
    )
}

function wonHand(): ConditionBuilder {
    let logic = $()

    logic = logic.also(

        startHandHit(),


        comparison(game.status, '=', 0x27, true).withLast({ lvalue: { type: 'Prior' } }),
        comparison(game.status, '=', 0x28, false),
        comparison(game.scoreScreenPointer, '!=', 0),
        rememberWhatSeatPlayerIsIn(),
        game.scoreScreen.scoreDifference,
        wiiAddAddress('recall'),
        comparison(zero, '>', 0),
        wiiAddAddress('recall'),
        comparison(zero, '<', 0x80000000)
    )

    return logic
}


function checkYakuHan(core: any, han: number, bannedYaku: Array<number> = []): any {

    let logic: any = {
        core: core
    }

    for (let i: number = 0; i < 10; i++) {
        let addition: ConditionBuilder = $(
            comparison(game.lastWonHand.numberOfYaku, '>=', i + 1),
            comparison(game.lastWonHand.han[i], '=', han)
        )

        for (let badYaku of bannedYaku) {
            addition = addition.also(
                comparison(game.lastWonHand.yaku[i], '!=', badYaku)
            )
        }

        logic['alt' + (i + 1).toString()] = addition
            
    }

    return logic
}

function totalHan(core: any, cmp: string, han: number): any {

    let logic: any = {
        core: core
    }

    for (let i: number = 0; i < 10; i++) {
        let addition: ConditionBuilder = $(
            comparison(game.lastWonHand.numberOfYaku, '=', i + 1),
        )

        for (let j: number = 0; j < (i + 1); j++) {
            addition = addition.also(
                calculation(true, game.lastWonHand.han[j])
            )
        }

        logic['alt' + (i + 1).toString()] = $(
            addition,
            comparison(0, cmp, han)
        )

    }

    return logic
}




export function makeAchievements(set: AchievementSet): void {



    set.addAchievement({
        title: 'T-Minus 2-Shanten',
        id: achid,
        badge: 682394,
        description: 'Complete all 4 rounds of the tile effciency quiz',
        points: 2,
        conditions: $(
            comparison(gameplayID, '=', 0x27),
            comparison(otherPointer.efficiencyQuizQuestionsAnswered, '=', 4, true),
            comparison(otherPointer.efficiencyQuizQuestionsAnswered, '=', 5, false)
        )
    })
    achid += 1

    set.addAchievement({
        title: 'Beginner\'s Luck',
        id: achid,
        badge: 682395,
        description: 'Win a game. "Safe Tiles" is allowed on this achievement, but is banned on every other achievement along with "Support" and "Auto Play"',
        points: 3,
        type: 'progression',
        conditions: wonGame(false, 0, false)
    })
    achid += 1

    set.addAchievement({
        title: 'Iishanten',
        id: achid,
        badge: 682396,
        description: 'Win a game where your non-Mii opponents have at least 5 stars total',
        points: 5,
        type: 'win_condition',
        conditions: wonGame(true, 5, true)
    })
    achid += 1

    set.addAchievement({
        title: 'Tenpai',
        id: achid,
        badge: 682397,
        description: 'Win a game where your non-Mii opponents have at least 8 stars total',
        points: 10,
        conditions: wonGame(true, 8, true)
    })
    achid += 1

    set.addAchievement({
        title: 'Tsumo',
        id: achid,
        badge: 682398,
        description: 'Win a game where your non-Mii opponents have at least 11 stars total',
        points: 10,
        conditions: wonGame(true, 11, true)
    })
    achid += 1

    set.addAchievement({
        title: 'Branching Out',
        id: achid,
        badge: 682399,
        description: 'Win a hand with a yaku worth 2 han that is not dora or Value Tiles/Yakuhai',
        points: 2,
        conditions: checkYakuHan(wonHand(), 2, [0x3, 0x2a]) // Ban yakuhai and dora, as they are 1 han, but might add up to more
    })
    achid += 1

    set.addAchievement({
        title: 'Specialty Hands',
        id: achid,
        badge: 682400,
        description: 'Win a hand with a yaku worth at least 3 han that is not dora or Value Tiles/Yakuhai',
        points: 5,
        conditions: checkYakuHan(wonHand(), 3, [0x3, 0x2a]) // Ban yakuhai and dora, as they are 1 han, but might add up to more
    })
    achid += 1

    set.addAchievement({
        title: 'Who Needs Minipoints?',
        id: achid,
        badge: 682650,
        description: 'Win a hand worth at least 6 han',
        points: 5,
        conditions: totalHan(wonHand(), '>', 5)
    })
    achid += 1

    set.addAchievement({
        title: 'Stacking the Charges',
        id: achid,
        badge: 682654,
        description: 'Win a hand with 4 different yaku other than dora',
        points: 5,
        conditions: {
            core: wonHand(),
            alt1: $(
                comparison(game.lastWonHand.numberOfYaku, '>=', 5)
            ),
            alt2: $(
                comparison(game.lastWonHand.numberOfYaku, '=', 4),
                ...([0, 1, 2, 3].map((x) => comparison(game.lastWonHand.yaku[x], '!=', 0x2a)))
            )
        }
    })
    achid += 1

    function noRepeatedTileV2(): any {
        let logic: any = {
            core: $(
                wonHand(),
                comparison(game.status, '!=', 0x28).withLast({ flag: 'ResetIf' }) // Reset all the hits if we aren't scoreing a hand
            )
        }

            for (let seat of [0, 1, 2, 3]) {
                logic['alt' + (seat + 1).toString()] = $(
                    comparison(game.seats[seat], '=', 0),
                    game.rememberLastDiscardedTile
                )
                for (let tile of tilelist) {
                    for (let i: number = 0; i < 14; i++) {
                        logic['alt' + (seat + 1).toString()] = logic['alt' + (seat + 1).toString()].also(
                            $(
                                comparison(game.hands[seat].hand[i], '=', tile).withLast({ flag: 'OrNext' })
                            )
                        )
                    }
                    logic['alt' + (seat + 1).toString()] = logic['alt' + (seat + 1).toString()].also(
                        $(
                            comparison('recall', '=', tile).withLast({ flag: 'AddHits', hits: 1 })
                        )
                    )
                }
                logic['alt' + (seat + 1).toString()] = logic['alt' + (seat + 1).toString()].also(
                    $(
                        '0=1.13.' // Make sure we have at least 13 unique tiles in hand
                    )
                )
            }   
        return logic

    }

    function rememberFirstTileOfHandPtr(): ConditionBuilder {
        return $(
            rememberWhatSeatPlayerIsIn(),
            'K:{recall}*308',
            wiiAddAddress(0x479550),
            'K:0xG2c4+{recall}'
        )
    }

    function rememberFirstTileOfDiscardPtr(): ConditionBuilder {
        return $(
            rememberWhatSeatPlayerIsIn(),
            'K:{recall}*516',
            wiiAddAddress(0x479550),
            'K:0xG2c8+{recall}'
        )
    }


    function noRepeatedTileV3(): ConditionBuilder {
        let logic: ConditionBuilder = $(
                wonHand()
        )


        for (let tile of tilelist) {
            logic = logic.also(
                comparison(game.status, '!=', 0x28).withLast({ flag: 'ResetNextIf' }),
                rememberFirstTileOfHandPtr()
            )
            for (let i: number = 0; i < 14; i++) {
                logic = logic.also(
                    $(
                        wiiAddAddress('recall'),
                        comparison(create('8bit', 4 + 8 * i), '=', tile).withLast({ flag: 'OrNext' })
                    )
                )
            }
            for (let meld: number = 0; meld < 4; meld++) {
                for (let i: number = 0; i < 4; i++) {
                    logic = logic.also(
                        $(
                            wiiAddAddress('recall'),
                            comparison(create('8bit', 0x79 + meld * 0x1c + i), '=', tile).withLast({ flag: 'OrNext'})
                        )
                    )
                }
            }
            logic = logic.also(
                game.rememberLastDiscardedTile,
                comparison('recall', '=', tile).withLast({ flag: 'AddHits', hits: 1 })
            )
        }

        logic = logic.also(
            $(
                '0=1.13.' // Make sure we have at least 13 unique tiles in hand
            )
        )


        return logic

    }

    set.addAchievement({
        title: 'Thirteen Oar Fans',
        id: achid,
        badge: 682655,
        description: 'Win a hand with no repeated tiles except a single pair',
        points: 2,
        conditions: noRepeatedTileV3()
    })
    achid += 1

    set.addAchievement({
        title: 'Slow Motion Yakuman',
        id: achid,
        badge: 682401,
        description: 'Reach 32,000 points above your starting point value in a game',
        points: 25,
        conditions: $(
            startGameHit(),
            orNext(
                comparison(game.status, '=', 0x20, true),
                comparison(game.status, '=', 0x27, true),
                comparison(game.status, '=', 0x28, false)
            ),
            comparison(game.scoreScreenPointer, '!=', 0),
            rememberWhatSeatPlayerIsIn(),
            game.scoreScreen.scoreAfter,
            wiiAddAddress('recall'),
            comparison(zero, '>=', 57000),
            wiiAddAddress('recall'),
            comparison(zero, '<', 0x80000000)
        )
    })

    achid += 1

    function noOpenMelds(): any {
        let logic: any = {
            core: $(
                wonHand()
            )
        }

        for (let i of [0, 1]) {

            logic['alt' + (i + 1).toString()] = $(
                comparison(game.lastWonHand.numberOfFuConsiderations, '=', i + 7) // Check if we need to check 7 or 8 locations for melds
            )

            // Checking all melds
            for (let meld: number = 0; meld < (1 + 7); meld++) {

                logic['alt' + (i + 1).toString()] = logic['alt' + (i + 1).toString()].also(
                    orNext(
                        comparison(game.lastWonHand.fuOpen[meld], '=', 0), // meld closed
                        comparison(game.lastWonHand.fuID[meld], '<', 5),
                        comparison(game.lastWonHand.fuID[meld], '>', 9) // or isn't a meld
                    )
                )

            }

            // Checking whole hand for either tsumo, or a non meld wait
            for (let meld: number = 0; meld < (1 + 7); meld++) {

                logic['alt' + (i + 1).toString()] = logic['alt' + (i + 1).toString()].also(
                    comparison(game.lastWonHand.fuID[meld], '=', 0x10).withLast({ flag: 'OrNext' }), // wait was a single pair
                    comparison(game.lastWonHand.fuID[meld], '=', 0x2).withLast({ flag: 'OrNext' }) // or won by tsumo
                )

            }

            logic['alt' + (i + 1).toString()] = logic['alt' + (i + 1).toString()].withLast({flag: ''}) // Just to catch the last ornext from above

        }


        return logic

    }

    set.addAchievement({
        title: 'Tight Lipped Secret',
        id: achid,
        badge: 682402,
        description: 'Win a hand with four closed melds',
        points: 3,
        conditions: noOpenMelds()
    })
    achid += 1

    function checkForAllCalls(seat: number): ConditionBuilder {
        return $(
            orNext(
                ...([0, 1, 2, 3].map((x) => $(
                    comparison(game.hands[seat].calls[x][0], '=', 1)
                )))
            ), // Check there was a pon call
            orNext(
                ...([0, 1, 2, 3].map((x) => $(
                    comparison(game.hands[seat].calls[x][0], '=', 2)
                )))
            ), // Check there was a chi call
            orNext(
                ...([0, 1, 2, 3].map((x) => $(
                    comparison(game.hands[seat].calls[x][0], '>=', 3)
                )))
            ) // Check there was a kan call (open or closed)
        )
    }

    set.addAchievement({
        title: 'Winning via Klarna',
        id: achid,
        badge: 682403,
        description: 'Win a hand with an open pon, an open chi, and a kan',
        points: 5,
        conditions: {
            core: wonHand(),
            alt1: $(
                comparison(game.seats[0], '=', 0),
                checkForAllCalls(0)
            ),
            alt2: $(
                comparison(game.seats[1], '=', 0),
                checkForAllCalls(1)
            ),
            alt3: $(
                comparison(game.seats[2], '=', 0),
                checkForAllCalls(2)
            ),
            alt4: $(
                comparison(game.seats[3], '=', 0),
                checkForAllCalls(3)
            )
        }
    })
    achid += 1

    function manganAch(): any {
        let logic: any = {
            core: wonHand()
        }

        let i: number = 1
        for (let reqHan: number = 3; reqHan < 5; reqHan++) { // Can either have 3 or 4 han
            for (let yakuAmount: number = 1; yakuAmount < 11; yakuAmount++) {
                for (let fuConsiderations: number = 7; fuConsiderations < 9; fuConsiderations++) { // all possible combinations of fu and yaku amounts



                    logic['alt' + (i).toString()] = $(
                        comparison(game.lastWonHand.numberOfYaku, '=', yakuAmount),
                        comparison(game.lastWonHand.numberOfFuConsiderations, '=', fuConsiderations)
                    )

                    // Sum up all the han in the hand and check it matches the han requirement
                    for (let yaku: number = 0; yaku < yakuAmount; yaku++) {
                        logic['alt' + (i).toString()] = logic['alt' + (i).toString()].also(
                            calculation(true, game.lastWonHand.han[yaku])
                        )
                    }
                    logic['alt' + (i).toString()] = logic['alt' + (i).toString()].also(
                        comparison(0, '=', reqHan)
                    )


                    // Sum up all the fu in the hand and check it exceeds the mangan requirement for the han given
                    for (let fu: number = 0; fu < fuConsiderations; fu++) {
                        logic['alt' + (i).toString()] = logic['alt' + (i).toString()].also(
                            calculation(true, game.lastWonHand.fu[fu])
                        )
                    }
                    logic['alt' + (i).toString()] = logic['alt' + (i).toString()].also(
                        comparison(0, '>=', (reqHan == 3) ? 60 : 30)
                    )


                    // Next alt
                    i = i + 1

                }
            }
        }

        return logic
    }

    set.addAchievement({
        title: 'Fu Fu Fu, You\'ve Activated My Trap Tile',
        id: achid,
        badge: 682651,
        description: 'Score a hand worth a mangan with less than 5 han',
        points: 10,
        conditions: manganAch()
    })
    achid += 1

    function testFuIDs(id: number): ConditionBuilder {
        let logic: ConditionBuilder = $()
        for (let i: number = 8; i > 1; i--) {
            logic = logic.also(
                comparison(game.lastWonHand.fuID[i - 1], '=', id).withLast({ flag: 'AndNext' }),
                comparison(game.lastWonHand.numberOfFuConsiderations, '>=', i).withLast({ flag: 'OrNext' })
            )
        }
        return $(
            logic,
            comparison(game.lastWonHand.fuID[0], '=', id).withLast({ flag: 'AddHits', hits: 1 })
        )
    }

    set.addAchievement({
        title: 'Time to Start Learning Complex Wait Patterns',
        id: achid,
        badge: 682658,
        description: 'In a single game, win hands with 4 of the 5 basic wait patterns',
        points: 10,
        conditions: {

            core: $(
                startGameHit(),
                comparison(gameplayID, '!=', 0x9).withLast({ flag: 'ResetIf' }),
                comparison(game.status, '=', 0x5).withLast({ flag: 'ResetIf' })
            ),
            alt1: $(
                rememberWhatSeatPlayerIsIn(),
                game.scoreScreen.scoreDifference,
                orNext(
                    comparison(game.status, '!=', 0x27, true).withLast({ lvalue: { type: 'Prior' } }), // timing the pause messes up if this is delta instead
                    comparison(game.status, '!=', 0x28, false),
                    comparison(game.scoreScreenPointer, '=', 0),
                    wiiAddAddress('recall'),
                    comparison(zero, '>=', 0x80000000),
                    wiiAddAddress('recall'),
                    comparison(zero, '=', 0).withLast({ flag: 'PauseIf' })
                ),
                testFuIDs(0xd),
                testFuIDs(0xe),
                testFuIDs(0xf),
                testFuIDs(0x10),
                testFuIDs(0x11),
                $('M:0=1.4.')
            )
        }
    })

    achid += 1

    function sujiV1(): any {
        let logic: any = {
            core: $(
                startHandHit()
            )
        }

        let k:number = 1

        for (let Riichiseat: number = 0; Riichiseat < 4; Riichiseat++) {
            for (let Playerseat: number = 0; Playerseat < 4; Playerseat++) {
                let alt: ConditionBuilder = $(
                    comparison(game.seats[Riichiseat], '!=', 0),
                    comparison(game.seats[Playerseat], '=', 0),
                    resetIf(comparison(game.gameScoreScreenPointer, '!=', 0)),
                    resetNextIf(
                        comparison(game.discards[Riichiseat].numberOfDiscards, '!=', game.discards[Riichiseat].numberOfDiscards, true, false)
                    ),
                    andNext(
                        comparison(game.isRiichi[Riichiseat], '=', 0, true),
                        comparison(game.isRiichi[Riichiseat], '=', 1, false).withLast({ hits: 1 })
                    ),
                    'A:244',
                    'K:' + Riichiseat.toString() + '*308',
                    'I:0xG00479550&536870911',
                    'K:0xG000002c4+{recall}',
                    'I:{recall}&536870911',
                    'K:0xG00000000',
                    'I:0xG00479550&536870911',
                    'A:' + Riichiseat.toString() + '*516',
                    'B:'+(((Riichiseat - Playerseat) % 4 == 1) ? 28 : 12).toString(),
                    'K:{recall}*16',
                    'I:0xG00479550&536870911',
                    'K:0xG000002c8+{recall}',
                    'I:{recall}&536870911',
                    'K:0xX00000000', // Remembers the last tile discarded by Riichiseat
                    comparison('recall', '>', 0x30), //Makes sure it isn't an honor tile
                    'K:{recall}-3' // Set up for first suji tile
                )

                for (let tile: number = 2; tile < 19; tile++) {
                    alt = alt.also(
                        $(

                            resetNextIf(
                                comparison(game.status, '=', 0x11)
                            ),
                            andNext(
                                comparison(game.discards[Playerseat].pile[tile].tile, '=', 0, true),
                                comparison(game.discards[Playerseat].pile[tile].tile, '=', 'recall', false).withLast({ flag: 'AddHits'})
                            )
                        )
                    )
                }


                alt = alt.also(
                    $('K:{recall}+6')
                )

                for (let tile: number = 2; tile < 19; tile++) {
                    alt = alt.also(
                        $(

                            resetNextIf(
                                comparison(game.status, '=', 0x11)
                            ),
                            andNext(
                                comparison(game.discards[Playerseat].pile[tile].tile, '=', 0, true),
                                comparison(game.discards[Playerseat].pile[tile].tile, '=', 'recall', false).withLast({ flag: 'AddHits'})
                            )
                        )
                    )
                }


                alt = alt.also(
                    $('0=1.1.')
                )

                if (Playerseat != Riichiseat) {
                    logic['alt' + k.toString()] = alt
                    k = k+1
                }
            }
        }


        return logic
    }

    function sujiV2(): any {

        let core: ConditionBuilder = $(
            startHandHit(),

            // Remember the pointer to the first tile of the player's discard pile
            rememberFirstTileOfDiscardPtr()
        )

        // Check for the frame that the player adds a tile to their discard pile
        for (let tile: number = 0; tile < 26; tile++) {
            core = core.also(
                $(
                    wiiAddAddress('recall'),
                    calculation(true, create('8bit', 0x4 + 0x10 * tile), '-', create('8bit', 0x4 + 0x10 * tile), false, true)
                )
            )
        }
        core = core.also($(
            comparison(0, '>', 0)
        )) 

        let logic: any = {
            core: core
        }

        let k: number = 1

        let numberOfDraws: Array<string> = ['244', '552', '860', '898']

        for (let Riichiseat: number = 0; Riichiseat < 4; Riichiseat++) {
            for (let Playerseat: number = 0; Playerseat < 4; Playerseat++) {

                

                let alt: ConditionBuilder = $(
                    // Make sure we are watching the correct seats
                    comparison(game.seats[Riichiseat], '!=', 0),
                    comparison(game.seats[Playerseat], '=', 0),

                    // Reset the next hits if it becomes Riichi Seat's turn again, or if we start a new hand (they are un-richii'd)
                    resetNextIf(
                        andNext(
                            comparison(game.whosTurn, '=', Riichiseat),
                            comparison(game.status, '=', 0x8, true),
                            orNext(
                                comparison(game.status, '=', 0x14, false),
                                comparison(game.isRiichi[Riichiseat], '=', 0)
                            )
                        )
                    ),
                    andNext(
                        comparison(game.isRiichi[Riichiseat], '=', 0, true),
                        comparison(game.isRiichi[Riichiseat], '=', 1, false).withLast({ hits: 1 }) // Make sure Riichi seat has called Riichi
                    )
                    
                )


                alt = alt.also($(
                    
                    'A:244',
                    'K:' + Riichiseat.toString() + '*308',
                    'I:0xG00479550&536870911',
                    'K:0xG000002c4+{recall}',
                    'I:{recall}&536870911',
                    'K:0xG00000000',
                    'I:0xG00479550&536870911',
                    'A:' + Riichiseat.toString() + '*516',
                    'B:' + (((Riichiseat - Playerseat) % 4 == 1) ? 28 : 12).toString(),
                    'K:{recall}*16',
                    'I:0xG00479550&536870911',
                    'K:0xG000002c8+{recall}',
                    'I:{recall}&536870911',
                    'K:0xX00000000' // Remembers the last tile discarded by Riichiseat, fuck if I know how it works exactly, did it by trial and error for the most part


                ))


                // Make sure remembered tile is not an honor tile
                alt = alt.also($(
                    comparison('recall', '>', 0x30)
                ))


                // Tests if the last tile in the players discard pile is 3 above or below the remebered tile
                for (let tile: number = 0; tile < 26; tile++) {
                    alt = alt.also($(
    
                        calculation(true, game.discards[Playerseat].pile[tile].tile, '-', 3),
                        comparison(0, '=', 'recall').withLast({ flag: 'OrNext' }),
                        calculation(true, game.discards[Playerseat].pile[tile].tile, '+', 3),
                        comparison(0, '=', 'recall').withLast({ flag: 'AndNext' }),
                        (tile < 25) && comparison(game.discards[Playerseat].pile[tile+1].tile, '=', 0).withLast({ flag: 'OrNext' })
                        
                    ))
                }

                // Only need the alts for when non-player riichi
                if (Playerseat != Riichiseat) {
                    logic['alt' + k.toString()] = alt.withLast({ flag: '' }) // Get rid of last andnext flag from tile checks
                    k = k + 1
                }

            }
        }

        return logic
    }

    set.addAchievement({
        title: 'Counting by Threes',
        id: achid,
        badge: 682404,
        description: 'After an opponent without a kan calls riichi, discard suji to their riichi discard before their next turn',
        points: 3,
        conditions: sujiV2()
    })
    achid += 1


    function highTileCount(): any {

        let alt1: ConditionBuilder = $(
            comparison(game.lastWonHand.numberOfFuConsiderations, '=', 1),
            rememberFirstTileOfHandPtr()
        )

        for (let i: number = 0; i < 7; i++) {
            alt1 = alt1.also(
                $(
                    wiiAddAddress('recall'),
                    calculation(true, create('Lower4', 0x4 + 0x8 * i * 2)),
                    wiiAddAddress('recall'),
                    calculation(true, create('Lower4', 0x4 + 0x8 * i * 2))
                )
            )
        }
        alt1 = alt1.also($('0>=100'))

        let alt2: ConditionBuilder = $(
            comparison(game.lastWonHand.numberOfFuConsiderations, '=', 7)
        )
        let alt3: ConditionBuilder = $(
            comparison(game.lastWonHand.numberOfFuConsiderations, '=', 8)
        )

        for (let fuslots: number = 0; fuslots < 8; fuslots++) {
            for (let tile: number = 0; tile < 4; tile++) {
                
                alt3 = alt3.also(
                    $(
                        calculation(true, game.lastWonHand.fuMeldTTiles[fuslots][tile].number)
                    )
                )
                if (fuslots < 7) {
                    alt2 = alt2.also(
                        $(
                            calculation(true, game.lastWonHand.fuMeldTTiles[fuslots][tile].number)
                        )
                    )
                }
                
            }
        }

        alt2 = alt2.also(
            $(
                '0>=100'
            )
        )
        alt3 = alt3.also(
            $(
                '0>=100'
            )
        )


        return {
            core: $(
                wonHand()
            ),
            alt1: alt1,
            alt2: alt2,
            alt3: alt3
        }
    }

    set.addAchievement({
        title: 'This Game Isn\'t Like Golf Right?',
        id: achid,
        badge: 682405,
        description: 'Win with a hand whose tiles sum up to at least 100',
        points: 10,
        conditions: highTileCount()
    })

    achid += 1

    function yakuChain(yaku: number): ConditionBuilder {
        let output: ConditionBuilder = $()
        for (let i: number = 10; i > 0; i--) {
            output = output.also(
                $(
                    comparison(game.lastWonHand.yaku[i - 1], '=', yaku).withLast({ flag: 'AndNext' }),
                    comparison(game.lastWonHand.numberOfYaku, '>=', i).withLast({ flag: 'OrNext' })
                )
            )
        }
        output = output.also($('0=1')) // to catch the lingering ornext above

        return output
    }

    function fuChain(id: number): ConditionBuilder {
        let output: ConditionBuilder = $()
        for (let i: number = 8; i > 0; i--) {
            output = output.also(
                $(
                    comparison(game.lastWonHand.fuID[i - 1], '=', id).withLast({ flag: 'AndNext' }),
                    comparison(game.lastWonHand.numberOfFuConsiderations, '>=', i).withLast({ flag: 'OrNext' })
                )
            )
        }
        output = output.also($('0=1')) // to catch the lingering ornext above

        return output
    }

    function pinfuNoFive(): any {

        let core: ConditionBuilder = $(
            wonHand(),
            yakuChain(1)
        )



        let alt1: ConditionBuilder = $(
            comparison(game.lastWonHand.numberOfFuConsiderations, '=', 7)
        )
        let alt2: ConditionBuilder = $(
            comparison(game.lastWonHand.numberOfFuConsiderations, '=', 8)
        )

        for (let fuslots: number = 0; fuslots < 8; fuslots++) {
            for (let tile: number = 0; tile < 4; tile++) {

                alt2 = alt2.also(
                    $(
                        comparison(game.lastWonHand.fuMeldTTiles[fuslots][tile].number, '!=', 5)
                    )
                )
                if (fuslots < 7) {
                    alt1 = alt1.also(
                        $(
                            comparison(game.lastWonHand.fuMeldTTiles[fuslots][tile].number, '!=', 5)
                        )
                    )
                }

            }
        }

        return {
            core: core,
            alt1: alt1,
            alt2: alt2
        }
        
    }


    set.addAchievement({
        title: 'If It\'s Not Red, I Don\'t Care',
        id: achid,
        badge: 682652,
        description: 'Win a hand with the Minimum Fu/Pinfu yaku without using any fives',
        points: 10,
        conditions: pinfuNoFive()
    })

    achid += 1




    function junechan(): any {


        return {
            core: $(wonHand()),
            alt1: $(
                yakuChain(0xc),
                fuChain(0xd)
            ),
            alt2: $(
                yakuChain(0x11),
                fuChain(0xd)
            )
        }

    }


    set.addAchievement({
        title: 'Waiting for June',
        id: achid,
        badge: 682668,
        description: 'Win a hand with either the Outside Hand/Chanta or Terminal and Honor/Junchan yaku on an open wait',
        points: 10,
        conditions: junechan()
    })

    achid += 1

    function yakuhai(han: number): any {

        let logic: any = {
            core: $(wonHand())
        }

        for (let i: number = 0; i < 10; i++) {
            logic['alt' + (i + 1).toString()] = $(
                comparison(game.lastWonHand.numberOfYaku, '>=', i + 1),
                comparison(game.lastWonHand.yaku[i], '=', 0x3),
                comparison(game.lastWonHand.han[i], '>=', han)
            )
        }


        return logic
    }

    set.addAchievement({
        title: 'That\'s a Lot of Damage',
        id: achid,
        badge: 682406,
        description: 'Win a hand with 3 han from the Value Tile/Yakuhai yaku',
        points: 5,
        conditions: yakuhai(3)
    })


    function ittsuu(): any {
        let core: ConditionBuilder = $(
            wonHand(),
            yakuChain(0xd)
        )

        return {
            core: core,
            alt1: fuChain(0x10),
            alt2: fuChain(0x11)
        }
    }

    set.addAchievement({
        title: 'Leaving Nothing to Chance',
        id: 602758,
        badge: 683762,
        description: 'Win a hand with the Straight/Ittsuu yaku on a pair or dual pair wait',
        points: 5,
        conditions: ittsuu()
    })

}