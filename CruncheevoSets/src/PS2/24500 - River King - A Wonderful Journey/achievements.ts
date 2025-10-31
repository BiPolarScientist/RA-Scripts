import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger, orNext, resetIf, measuredIf, measured } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation, create } from '../../helpers.js'
import * as fs from 'fs'
import { once } from 'events'

let Releases: Array<data.game> = [data.usa, data.pal, data.japan]
let DiaryEntries: Array<number> = [27, 16, 15, 19, 23, 1]
function playerAddAddress(version: number): ConditionBuilder {
    return data.playerBasePointer[version].withLast({ cmp: '+', rvalue: { type: 'Recall' } })
}

function convoAddAddress(version: number): ConditionBuilder {
    return data.convoBasePointer[version].withLast({ cmp: '+' })
}

function newCond(): any {
    return {
        core: $('1=1')
    }
}

function checkDiaryEntry(area: number, entry: number): any {
    let output = newCond()
    let i:number = 1

    for (let game of Releases) {
        for (let j: number = 0; j < DiaryEntries[area]; j++) {
            output['alt' + i.toString()] = $(
                game.checkVersion(),
                game.inGame(),
                game.rememberPersonPlayingIs('diary'),
                playerAddAddress(game.version),
                comparison(game.player.diaryEntry(area, j, true), '=', 0xff),
                playerAddAddress(game.version),
                comparison(game.player.diaryEntry(area, j, false), '=', entry)
            )
            i = i + 1
        }
    }

    return output
}



export function makeAchievements(set: AchievementSet): void {

    let i:number = 1

    //
    // Errand/Progression Achievements
    //

    let firstFish = newCond()
    i = 1

    for (let game of Releases) {
        firstFish['alt' + i.toString()] = $(
            game.checkVersion(),
            game.inGame(),
            game.rememberPersonPlayingIs('records'),
            game.player.totalFishCaught(true),
            '0=0',
            game.player.totalFishCaught(false),
            '0=1'
        )
        i = i + 1
    }

    set.addAchievement({
        title: 'a',
        description: 'Catch your first fish',
        type: 'progression',
        points: 1,
        conditions: firstFish
    })



    set.addAchievement({
        title: 'a',
        description: 'Beat your rival in a competition in the Stream',
        type: 'missable',
        points: 2,
        conditions: checkDiaryEntry(0, 0x2)
    })

    set.addAchievement({
        title: 'a',
        description: 'Learn how to swim',
        type: 'progression',
        points: 1,
        conditions: checkDiaryEntry(0, 0x18)
    })

    set.addAchievement({
        title: 'a',
        description: 'Find the hidden artifact in the Stream',
        type: 'progression',
        points: 2,
        conditions: checkDiaryEntry(0, 0xb)
    })

    set.addAchievement({
        title: 'a',
        description: 'Remove the boulder blocking the path to the Mountain',
        type: 'progression',
        points: 3,
        conditions: checkDiaryEntry(0, 0x13)
    })

    set.addAchievement({
        title: 'a',
        description: 'Bring a new romantic couple together',
        points: 3,
        conditions: checkDiaryEntry(0, 0x6)
    })

    set.addAchievement({
        title: 'a',
        description: 'Participate in the Black Bass festival',
        points: 3,
        conditions: checkDiaryEntry(1, 0x3)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help your rival catch the Great Brown Trout',
        type: 'progression',
        points: 3,
        conditions: checkDiaryEntry(1, 0x1)
    })

    let washbasinGet = newCond()
    i = 1

    for (let game of Releases) {
        washbasinGet['alt' + i.toString()] = $(
            game.checkVersion(),
            game.inGame(),
            game.rememberPersonPlayingIs('items'),
            playerAddAddress(game.version),
            comparison(game.player.washtub, '=', 0x0, true),
            playerAddAddress(game.version),
            comparison(game.player.washtub, '=', 0x1, false)
        )
        i = i + 1
    }

    set.addAchievement({
        title: 'a',
        description: 'Find the washbasin',
        points: 3,
        conditions: washbasinGet
    })

    set.addAchievement({
        title: 'a',
        description: 'Find the hidden artifact in the Mountain',
        type: 'progression',
        points: 3,
        conditions: checkDiaryEntry(1, 0xa)
    })

    set.addAchievement({
        title: 'a',
        description: 'Solve some high school drama to unblock the way to the Field',
        type: 'progression',
        points: 4,
        conditions: checkDiaryEntry(0, 0x10)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help your rival\'s fan get her autograph',
        points: 4,
        conditions: checkDiaryEntry(2, 0x1)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help the local science class study Killifish',
        points: 4,
        conditions: checkDiaryEntry(2, 0x4)
    })

    set.addAchievement({
        title: 'a',
        description: 'Find the hidden artifact in the Field',
        type: 'progression',
        points: 4,
        conditions: checkDiaryEntry(2, 0x5)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help the curry chef to unblock the path to the Rapids',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(0, 0xe)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help an old man find a lost friend',
        points: 5,
        conditions: checkDiaryEntry(3, 0x5)
    })

    set.addAchievement({
        title: 'a',
        description: 'Find the hidden artifact in the Rapids',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(3, 0xb)
    })

    set.addAchievement({
        title: 'a',
        description: 'Beat your rival in a competition in the Rapids',
        type: 'missable',
        points: 5,
        conditions: checkDiaryEntry(3, 0x1)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help solve the attempted murder to unblock the path to the Swamp',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(3, 0xf)
    })

    set.addAchievement({
        title: 'a',
        description: 'Bring the missing kid home to the Field',
        points: 5,
        conditions: checkDiaryEntry(2, 0x8)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help a depressed cook get his mojo back',
        points: 5,
        conditions: checkDiaryEntry(4, 0x7)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help keep a fish restaurant in business',
        points: 5,
        conditions: checkDiaryEntry(4, 0x4)
    })

    set.addAchievement({
        title: 'a',
        description: 'Help a pop star beat your rival',
        type: 'missable',
        points: 5,
        conditions: checkDiaryEntry(4, 0x13)
    })

    set.addAchievement({
        title: 'a',
        description: 'Complete a game of 7up in a final competition with your rival',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(4, 0x1)
    })

    set.addAchievement({
        title: 'a',
        description: 'Find the hidden artifact in the Swamp',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(4, 0xf)
    })


    let caughtRiverKing = newCond()
    i = 1

    for (let game of Releases) {
        washbasinGet['alt' + i.toString()] = $(
            game.checkVersion(),
            game.inGame(),
            game.rememberPersonPlayingIs('records'),
            playerAddAddress(game.version),
            comparison(game.player.recordFishCaught(5, 0x6), '=', 0, true),
            playerAddAddress(game.version),
            comparison(game.player.recordFishCaught(5, 0x6), '=', 1, false)
        )
        i = i + 1
    }

    set.addAchievement({
        title: 'a',
        description: 'Catch the River King',
        type: 'win_condition',
        points: 25,
        conditions: caughtRiverKing
    })


    set.addAchievement({
        title: 'a',
        description: 'Complete the Straw Millionaire errand line',
        points: 5,
        conditions: checkDiaryEntry(4, 0x10)
    })



    //
    // Fishing and Cooking competitions
    //

    /**
     * Options: 0 = only competition of the area, 1 = Tanago, 2 = Hera
     * @param area
     * @param options
     */
    function beatFishingCompetition(area: number, options: number): any {
        let output = newCond()
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                game.checkVersion(),
                game.inGame(),
                game.rememberPersonPlayingIs('stats'),
                playerAddAddress(game.version),
                comparison(game.player.area, '=', area),
                (options == 1) && $(
                    comparison(game.playerXCoord, '>', 0.1)
                ),
                (options == 2) && $(
                    comparison(game.playerXCoord, '<', -0.1)
                ),
                orNext(
                    convoAddAddress(game.version),
                    comparison(game.convo.line, '=', 0xffffffff, false),
                    andNext(
                        convoAddAddress(game.version),
                        comparison(game.convo.line, '=', 0x19, false),
                        convoAddAddress(game.version),
                        comparison(game.convo.speaker, '=', 0x38, true),
                        convoAddAddress(game.version),
                        comparison(game.convo.line, '=', 0x18, true),
                    )
                )
            )
            i = i + 1
        }
        return output
    }

    set.addAchievement({
        title: 'a',
        description: 'Win the Ayu fishing contest',
        points: 1,
        conditions: beatFishingCompetition(0,0)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the Bass fishing contest',
        points: 3,
        conditions: beatFishingCompetition(1, 0)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the Tanago fishing contest',
        points: 4,
        conditions: beatFishingCompetition(2, 1)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the Hera fishing contest',
        points: 4,
        conditions: beatFishingCompetition(2, 2)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the Turtle fishing contest',
        points: 5,
        conditions: beatFishingCompetition(3, 0)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the Catfish fishing contest',
        points: 5,
        conditions: beatFishingCompetition(4, 0)
    })

    function beatCookingCompetition(area: number, inSwamp: boolean, isChallenge: boolean): any {
        let output = newCond()
        let judgeNumbers: Array<number> = [0x5, 0x10, 0x19, 0x1c, 0x23]
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                game.checkVersion(),
                game.inGame(),
                game.rememberPersonPlayingIs('stats'),
                playerAddAddress(game.version),
                comparison(game.player.area, '=', area),
                game.rememberPersonPlayingIs('items'),
                isChallenge && orNext(
                    convoAddAddress(game.version),
                    comparison(game.convo.line, '=', 0xffffffff, false),
                    andNext(
                        convoAddAddress(game.version),
                        inSwamp && comparison(game.convo.line, '=', 0x4, false),
                        !inSwamp && comparison(game.convo.line, '=', 0x5, false),
                        convoAddAddress(game.version),
                        comparison(game.convo.speaker, '=', judgeNumbers[area], true),
                        convoAddAddress(game.version),
                        inSwamp && comparison(game.convo.line, '=', 0x3, true),
                        !inSwamp && comparison(game.convo.line, '=', 0x4, true),
                        playerAddAddress(game.version),
                        comparison(game.player.firstBasketFish, '=', 0)
                    )
                ).withLast({hits: 1}),
                !isChallenge && orNext(
                    convoAddAddress(game.version),
                    comparison(game.convo.line, '=', 0xffffffff, false),
                    andNext(
                        convoAddAddress(game.version),
                        inSwamp && comparison(game.convo.line, '=', 0x40, false),
                        !inSwamp && comparison(game.convo.line, '=', 0x1c, false),
                        convoAddAddress(game.version),
                        comparison(game.convo.speaker, '=', judgeNumbers[area], true),
                        convoAddAddress(game.version),
                        inSwamp && comparison(game.convo.line, '=', 0x3f, true),
                        !inSwamp && comparison(game.convo.line, '=', 0x1b, true)
                    )
                ),
                isChallenge && trigger(orNext(
                    convoAddAddress(game.version),
                    comparison(game.convo.line, '=', 0xffffffff, false),
                    andNext(
                        convoAddAddress(game.version),
                        inSwamp && comparison(game.convo.line, '=', 0x40, false),
                        !inSwamp && comparison(game.convo.line, '=', 0x1c, false),
                        convoAddAddress(game.version),
                        comparison(game.convo.speaker, '=', judgeNumbers[area], true),
                        convoAddAddress(game.version),
                        inSwamp && comparison(game.convo.line, '=', 0x3f, true),
                        !inSwamp && comparison(game.convo.line, '=', 0x1b, true)
                    )
                ))
            )
            i = i + 1
        }
        return output
    }

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition in the Stream',
        type: 'missable',
        points: 3,
        conditions: beatCookingCompetition(0, false, false)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition in the Stream starting with no fish in your basket',
        type: 'missable',
        points: 5,
        conditions: beatCookingCompetition(0, false, true)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition in the Mountain',
        type: 'missable',
        points: 3,
        conditions: beatCookingCompetition(1, false, false)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition in the Mountain starting with no fish in your basket',
        type: 'missable',
        points: 5,
        conditions: beatCookingCompetition(1, false, true)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition in the Fields',
        type: 'missable',
        points: 5,
        conditions: beatCookingCompetition(2, false, false)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition in the Fields starting with no fish in your basket',
        type: 'missable',
        points: 10,
        conditions: beatCookingCompetition(2, false, true)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition in the Rapids',
        type: 'missable',
        points: 5,
        conditions: beatCookingCompetition(3, false, false)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition finals in the Swamp',
        points: 10,
        conditions: beatCookingCompetition(4, true, false)
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the cooking competition finals in the Swamp starting with no fish in your basket',
        type: 'missable',
        points: 10,
        conditions: beatCookingCompetition(4, true, true)
    })



    //
    // Types of fishing
    //





    //
    // Stats and collection
    //

    function reachSkillLevel(skill: string, level: number): any {
        let output = newCond()
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                game.checkVersion(),
                game.inGame(),
                game.rememberPersonPlayingIs('stats'),
                playerAddAddress(game.version),
                comparison(game.player[skill], '=', level - 1, true),
                playerAddAddress(game.version),
                comparison(game.player[skill], '=', level, false)
            )
            i = i + 1
        }
        return output
    }

    set.addAchievement({
        title: 'a',
        description: 'Reach Decent cooking skill',
        points: 5,
        conditions: reachSkillLevel('cookingSkill', 4)
    })

    set.addAchievement({
        title: 'a',
        description: 'Reach Professional Cooking skill',
        points: 10,
        conditions: reachSkillLevel('cookingSkill', 6)
    })

    set.addAchievement({
        title: 'a',
        description: 'Reach World Class cooking skill',
        points: 25,
        conditions: reachSkillLevel('cookingSkill', 8)
    })

    set.addAchievement({
        title: 'a',
        description: 'Reach level 3 fishing technique',
        points: 5,
        conditions: reachSkillLevel('fishingTech', 3)
    })

    set.addAchievement({
        title: 'a',
        description: 'Reach maximum level fishing technique',
        points: 10,
        conditions: reachSkillLevel('fishingTech', 5)
    })



    function collectionBitcounts(sources: Array<Partial<Condition.Data>>, total: number): any {
        let output = newCond()
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                measuredIf(
                    game.checkVersion(),
                    game.inGame()
                ),
                game.rememberPersonPlayingIs('items')
            )

            for (let source of sources) {
                output['alt' + i.toString()] = output['alt' + i.toString()].also(
                    playerAddAddress(game.version),
                    calculation(true, source).withLast({ lvalue: { type: 'Delta' } })
                )
            }
            output['alt' + i.toString()] = output['alt' + i.toString()].also(
                comparison(0, '=', total - 1)
            )

            for (let source of sources) {
                output['alt' + i.toString()] = output['alt' + i.toString()].also(
                    playerAddAddress(game.version),
                    calculation(true, source)
                )
            }
            output['alt' + i.toString()] = output['alt' + i.toString()].also(
                comparison(0, '=', total).withLast({ flag: 'Measured' })
            )


            i = i + 1
        }
        return output
    }

    set.addAchievement({
        title: 'a',
        description: 'Own all 5 fish baskets',
        points: 5,
        conditions: collectionBitcounts([data.usa.player.basketsBitcount], 5)
    })

    set.addAchievement({
        title: 'a',
        description: 'Own all 6 permanent inventory items',
        points: 5,
        conditions: collectionBitcounts([data.usa.player.itemsBitcount], 6)
    })

    set.addAchievement({
        title: 'a',
        description: 'Own all 13 fishing poles',
        points: 10,
        conditions: collectionBitcounts([data.usa.player.polesBitcount1, data.usa.player.polesBitcount2], 13)
    })

    set.addAchievement({
        title: 'a',
        description: 'Own all 22 cooking recipes',
        points: 10,
        conditions: collectionBitcounts([data.usa.player.recipesBitcount1, data.usa.player.recipesBitcount2, data.usa.player.recipesBitcount3] , 22)
    })


    function allFishInAreaCollected(area: number): any {
        let output = newCond()
        let fishTotals: Array<number> = [21, 27, 26, 26, 22, 14]
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                measuredIf(
                    game.checkVersion(),
                    game.inGame()
                ),
                game.rememberPersonPlayingIs('records'),
                game.player.fishCaughtInArea(area, true),
                comparison(0, '=', fishTotals[area] - 1),
                game.player.fishCaughtInArea(area, false),
                comparison(0, '=', fishTotals[area])
            )

            i = i + 1
        }
        return output
    }

    set.addAchievement({
        title: 'a',
        description: 'Catch all 21 types of fish in the Stream area',
        points: 25,
        conditions: allFishInAreaCollected(0)
    })

    set.addAchievement({
        title: 'a',
        description: 'Catch all 26 types of fish in the Mountain area',
        points: 25,
        conditions: allFishInAreaCollected(1)
    })

    set.addAchievement({
        title: 'a',
        description: 'Catch all 22 types of fish in the Field area',
        points: 25,
        conditions: allFishInAreaCollected(2)
    })

    set.addAchievement({
        title: 'a',
        description: 'Catch all 27 types of fish in the Rapids area',
        points: 25,
        conditions: allFishInAreaCollected(3)
    })

    set.addAchievement({
        title: 'a',
        description: 'Catch all 26 types of fish in the Swamp area',
        points: 25,
        conditions: allFishInAreaCollected(4)
    })

    set.addAchievement({
        title: 'a',
        description: 'Catch all 14 types of fish in the Underground Lake',
        points: 25,
        conditions: allFishInAreaCollected(5)
    })





    //
    // Unique NPC achievements
    //

    let fortuneTold: any = newCond()
    i = 1
    for (let game of Releases) {
        fortuneTold['alt' + i.toString()] = $(
            game.checkVersion(),
            game.inGame(),
            convoAddAddress(game.version),
            comparison(game.convo.speaker, '=', 0x2e, true),
            convoAddAddress(game.version),
            comparison(game.convo.line, '=', 0x51, true),
            convoAddAddress(game.version),
            comparison(game.convo.line, '=', 0xffffffff, false)
        )

        i = i + 1
    }


    set.addAchievement({
        title: 'a',
        description: 'Have your fortune told',
        points: 1,
        conditions: fortuneTold
    })

    let tanuki: any = newCond()
    i = 1
    for (let game of Releases) {
        tanuki['alt' + i.toString()] = $(
            game.checkVersion(),
            game.inGame(),
            game.rememberPersonPlayingIs('counters'),
            playerAddAddress(game.version),
            comparison(game.player.talkedToTanuki, '=', 0x0, true),
            playerAddAddress(game.version),
            comparison(game.player.talkedToTanuki, '=', 0x1, false)
        )

        i = i + 1
    }


    set.addAchievement({
        title: 'a',
        description: 'Talk to the Tanuki who lives in the inn',
        points: 3,
        conditions: tanuki
    })

    let panda: any = newCond()
    i = 1
    for (let game of Releases) {
        panda['alt' + i.toString()] = $(
            game.checkVersion(),
            game.inGame(),
            game.rememberPersonPlayingIs('counters'),
            playerAddAddress(game.version),
            comparison(game.player.talkedToTanuki, '=', 0x64, true),
            playerAddAddress(game.version),
            comparison(game.player.talkedToTanuki, '=', 0x65, false)
        )

        i = i + 1
    }


    set.addAchievement({
        title: 'a',
        description: 'Talk to the Panda who lives in the inn',
        points: 3,
        conditions: panda
    })

    let primeMinister: any = newCond()
    i = 1
    for (let game of Releases) {
        primeMinister['alt' + i.toString()] = $(
            game.checkVersion(),
            game.inGame(),
            convoAddAddress(game.version),
            comparison(game.convo.speaker, '=', 0xffffffff, true),
            convoAddAddress(game.version),
            comparison(game.convo.speaker, '=', 0x28, false)
        )

        i = i + 1
    }

    set.addAchievement({
        title: 'a',
        description: 'Meet a doppleganger of a previous Prime Minister of Japan',
        points: 3,
        conditions: primeMinister
    })

    let harvestMoon: any = newCond()
    i = 1
    for (let game of Releases) {
        harvestMoon['alt' + i.toString()] = $(
            measuredIf(
                game.checkVersion(),
                game.inGame()
            ),
            resetIf(
                andNext(
                    game.checkVersion(),
                    comparison(
                        create('32bit',
                        (game.version == 0) ? 0x5b45f4 : (
                            (game.version == 1) ? 0x5d02f4 : 0x614574
                            )),
                        '!=',
                        1
                    )
                )
            ),
            andNext(
                convoAddAddress(game.version),
                comparison(game.convo.speaker, '=', 0xffffffff, true),
                convoAddAddress(game.version),
                comparison(game.convo.speaker, '=', 0x29, false).withLast({hits: 1})
            ),
            andNext(
                convoAddAddress(game.version),
                comparison(game.convo.speaker, '=', 0xffffffff, true),
                convoAddAddress(game.version),
                comparison(game.convo.speaker, '=', 0x2a, false).withLast({ hits: 1 })
            ),
            andNext(
                convoAddAddress(game.version),
                comparison(game.convo.speaker, '=', 0xffffffff, true),
                convoAddAddress(game.version),
                comparison(game.convo.speaker, '=', 0x2b, false).withLast({ hits: 1 })
            ),
            measured(
                $('0=1.3.')
            )
        )

        i = i + 1
    }

    set.addAchievement({
        title: 'a',
        description: 'Talk with three strangers from a different game in one session',
        points: 3,
        conditions: harvestMoon
    })

    let buttons: any = newCond()
    i = 1
    for (let game of Releases) {
        buttons['alt' + i.toString()] = $(
            measuredIf(
                game.checkVersion(),
                game.inGame()
            ),
            resetIf(
                andNext(
                    game.checkVersion(),
                    comparison(
                        create('32bit',
                            (game.version == 0) ? 0x5b45f4 : (
                                (game.version == 1) ? 0x5d02f4 : 0x614574
                            )),
                        '!=',
                        1
                    )
                )
            ),
            game.rememberPersonPlayingIs('stats'),
            ...([0, 1, 2, 3, 4].map((value: number, index: number) => {
                return $(
                    andNext(
                        playerAddAddress(game.version),
                        comparison(game.player.area, '=', value),
                        convoAddAddress(game.version),
                        comparison(game.convo.speaker, '=', 0xffffffff, true),
                        convoAddAddress(game.version),
                        comparison(game.convo.speaker, '=', 0x12f, false).withLast({ hits: 1 })
                    )
                )
            })),
            measured(
                $('0=1.5.')
            )
        )

        i = i + 1
    }

    set.addAchievement({
        title: 'a',
        description: 'Press all 5 spotlight buttons in one session',
        points: 3,
        conditions: buttons
    })

}
