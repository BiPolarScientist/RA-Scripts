import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger, orNext, resetIf, measuredIf, measured, addHits, resetNextIf, pauseIf } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation, create } from '../../helpers.js'
import * as fs from 'fs'
import { once } from 'events'

const b = (s) => `local\\\\${s}.png`

let titles: any = {
    1: "Not Much Else to Do",
    2: "One with the Insects",
    3: "Robotic Fishing",
    4: "The Junior College Student",
    5: "Wasn't Much of a Lesson",
    6: "Home Is Where the Heart Is",
    7: "Rural Japan's \"Ever Given\"",
    8: "Love at First Read",
    9: "Fishing Brings Community",
    10: "She Doesn't Even Go Here",
    11: "Someone Call the Ocean's OSHA",
    12: "Fish Are Food, Not Friends",
    13: "This Town is a Nightmare",
    14: "First and Only Fan Club Member",
    15: "Start Them Fishing Young",
    16: "Not as Fun When Someone Else Does It",
    17: "We Need Public Transit",
    18: "Fish Are Friends, Not Food",
    19: "The Test Kitchen",
    20: "Don't You Have a Thesis to Write?",
    21: "Circumstantial at Best",
    22: "Lost in Yeti Territory",
    23: "Worldwide Tour",
    24: "Kept Above Water",
    25: "Beginner's Luck by Proxy",
    26: "Please Get Back to Your Studies",
    27: "A Child's Drawing",
    28: "Usurp the Crown",
    29: "A Rock for an Heirloom, Good Trade",
    30: "Stream's Champion",
    31: "Mountain's Champion",
    32: "Eastern Field's Champion",
    33: "Western Field's Champion",
    34: "Rapids' Champion",
    35: "Swamp's Champion",
    36: "Chef of the Stream",
    37: "Local Stream Cuisine",
    38: "Chef of the Mountain",
    39: "Local Mountain Cuisine",
    40: "Chef of the Fields",
    41: "Local Field Cuisine",
    42: "Chef of the Rapids",
    43: "Chef of the Swamp",
    44: "Local Swamp Cuisine",
    45: "Sous Chef",
    46: "Head Chef",
    47: "Michelin Star",
    48: "Ready for Anything",
    49: "Fish Fear Me",
    50: "Bobbing for Fish",
    51: "Picnic Time",
    52: "Bait Finding Maniac",
    53: "The Avatar of Fishing",
    54: "Master Chef",
    55: "Stream Ichthyologist",
    56: "Mountain Ichthyologist",
    57: "Field Ichthyologist",
    58: "Rapids Ichthyologist",
    59: "Swamp Ichthyologist",
    60: "Ungerground Lake Ichthyologist",
    61: "The Future Is Fishing",
    62: "Secret Friend",
    63: "Super Secret Friend",
    64: "Canvassing All the Way Out Here?",
    65: "This Is One Robust Fishing Minigame",
    66: "Spotlight!",
    67: "Living off the Land",
    68: "Friends of the Stream",
    69: "Friends of the Mountain",
    70: "Friends of the Fields",
    71: "Friends of the Rapids",
    72: "Friends of the Swamp",
    73: "Friends of the Lake"
}


let Releases: Array<data.game> = [data.usa, data.pal, data.japan]
let DiaryEntries: Array<number> = [27, 16, 15, 19, 23, 1]
export function playerAddAddress(version: number): ConditionBuilder {
    return data.playerBasePointer[version].withLast({ cmp: '+', rvalue: { type: 'Recall' } })
}

export function convoAddAddress(version: number): ConditionBuilder {
    return data.convoBasePointer[version]
}

export function newConds(): any {
    return {
        core: $('1=1')
    }
}

function checkDiaryEntry(area: number, entry: number): any {
    let output = newConds()
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

    let i: number = 1
    let badgenum: number = 1

    //
    // Errand/Progression Achievements
    //





    let firstFish = newConds()
    i = 1

    for (let game of Releases) {
        firstFish['alt' + i.toString()] = $(
            game.checkVersion(),
            game.inGame(),
            game.rememberPersonPlayingIs('records'),
            game.player.totalFishCaught(true, true),
            '0=0',
            game.player.totalFishCaught(false, true),
            '0=1'
        )
        i = i + 1
    }

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch your first fish',
        type: 'progression',
        points: 1,
        conditions: firstFish
    })
    badgenum = badgenum + 1

    // Types of fishing

    function caughtWithRodType(rodMin: number, rodMax: number): any {
        let output = newConds()
        let i:number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                game.checkVersion(),
                game.inGame(),
                game.rememberPersonPlayingIs('items'),
                playerAddAddress(game.version),
                comparison(game.player.rodChoice, '>=', rodMin),
                playerAddAddress(game.version),
                comparison(game.player.rodChoice, '<=', rodMax),
                game.rememberPersonPlayingIs('records'),
                game.player.totalFishCaught(false, true, false),
                game.player.totalFishCaught(true, false, false),
                '0=1'
            )
            i = i + 1
        }
        return output
    }

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch a fish using a fly fishing rod',
        points: 1,
        conditions: caughtWithRodType(0x8, 0xa)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch a fish using a lure fishing rod',
        points: 1,
        conditions: caughtWithRodType(0xb, 0xd)
    })
    badgenum = badgenum + 1



    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Beat your rival in a competition in the Stream',
        type: 'missable',
        points: 2,
        conditions: checkDiaryEntry(0, 0x2)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Learn how to swim',
        type: 'progression',
        points: 1,
        conditions: checkDiaryEntry(0, 0x18)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Find the hidden artifact in the Stream',
        type: 'progression',
        points: 2,
        conditions: checkDiaryEntry(0, 0xb)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Remove the boulder blocking the path to the Mountain',
        type: 'progression',
        points: 3,
        conditions: checkDiaryEntry(0, 0x13)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Bring a new romantic couple together',
        points: 3,
        conditions: checkDiaryEntry(0, 0x6)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Participate in the Black Bass festival',
        points: 3,
        conditions: checkDiaryEntry(1, 0x3)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help your rival catch the Great Brown Trout',
        type: 'progression',
        points: 3,
        conditions: checkDiaryEntry(1, 0x1)
    })
    badgenum = badgenum + 1

    let washbasinGet = newConds()
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Find the washbasin',
        type: 'progression',
        points: 3,
        conditions: washbasinGet
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Find the hidden artifact in the Mountain',
        type: 'progression',
        points: 3,
        conditions: checkDiaryEntry(1, 0xa)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Solve some high school drama to unblock the way to the Field',
        type: 'progression',
        points: 4,
        conditions: checkDiaryEntry(0, 0x10)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help your rival\'s fan get her autograph',
        points: 4,
        conditions: checkDiaryEntry(2, 0x1)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help the local science class study Killifish',
        points: 4,
        conditions: checkDiaryEntry(2, 0x4)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Find the hidden artifact in the Field',
        type: 'progression',
        points: 4,
        conditions: checkDiaryEntry(2, 0x5)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help the curry chef to unblock the path to the Rapids',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(0, 0xe)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help an old man find a lost friend',
        points: 5,
        conditions: checkDiaryEntry(3, 0x5)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Find the hidden artifact in the Rapids',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(3, 0xb)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Beat your rival in a competition in the Rapids',
        type: 'missable',
        points: 5,
        conditions: checkDiaryEntry(3, 0x1)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help solve the attempted murder to unblock the path to the Swamp',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(3, 0xf)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Bring the missing kid home to the Field',
        points: 5,
        conditions: checkDiaryEntry(2, 0x8)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help a depressed cook get his mojo back',
        points: 5,
        conditions: checkDiaryEntry(4, 0x7)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help keep a fish restaurant in business',
        points: 5,
        conditions: checkDiaryEntry(4, 0x4)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Help a pop star beat your rival',
        type: 'missable',
        points: 5,
        conditions: checkDiaryEntry(4, 0x13)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Complete a game of 7up in a final competition with your rival',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(4, 0x1)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Find the hidden artifact in the Swamp',
        type: 'progression',
        points: 5,
        conditions: checkDiaryEntry(4, 0xf)
    })
    badgenum = badgenum + 1


    let caughtRiverKing = newConds()
    i = 1

    for (let game of Releases) {
        caughtRiverKing['alt' + i.toString()] = $(
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch the River King',
        type: 'win_condition',
        points: 25,
        conditions: caughtRiverKing
    })
    badgenum = badgenum + 1


    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Complete the Straw Millionaire errand line',
        points: 5,
        conditions: checkDiaryEntry(4, 0x10)
    })
    badgenum = badgenum + 1



    //
    // Fishing and Cooking competitions
    //

    /**
     * Options: 0 = only competition of the area, 1 = Tanago, 2 = Hera
     * @param area
     * @param options
     */
    function beatFishingCompetition(area: number, options: number): any {
        let output = newConds()
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                game.checkVersion(),
                game.inGame(),
                game.rememberPersonPlayingIs('area'),
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the Ayu fishing contest',
        points: 1,
        conditions: beatFishingCompetition(0,0)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the Bass fishing contest',
        points: 3,
        conditions: beatFishingCompetition(2, 0)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the Tanago fishing contest',
        points: 4,
        conditions: beatFishingCompetition(4, 1)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the Hera fishing contest',
        points: 4,
        conditions: beatFishingCompetition(4, 2)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the Turtle fishing contest',
        points: 5,
        conditions: beatFishingCompetition(1, 0)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the Catfish fishing contest',
        points: 5,
        conditions: beatFishingCompetition(3, 0)
    })
    badgenum = badgenum + 1

    /**
     * Area uses game based area codes
     * @param area
     * @param inSwamp
     * @param isChallenge
     * @returns
     */
    function beatCookingCompetition(area: number, inSwamp: boolean, isChallenge: boolean): any {
        let output = newConds()
        let judgeNumbers: Array<number> = [0x5, 0x1c, 0x10, 0x23, 0x19]
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                game.checkVersion(),
                game.inGame(),
                game.rememberPersonPlayingIs('area'),
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition in the Stream',
        type: 'missable',
        points: 3,
        conditions: beatCookingCompetition(0, false, false)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition in the Stream starting with no fish in your basket',
        type: 'missable',
        points: 5,
        conditions: beatCookingCompetition(0, false, true)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition in the Mountain',
        type: 'missable',
        points: 3,
        conditions: beatCookingCompetition(2, false, false)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition in the Mountain starting with no fish in your basket',
        type: 'missable',
        points: 5,
        conditions: beatCookingCompetition(2, false, true)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition in the Fields',
        type: 'missable',
        points: 5,
        conditions: beatCookingCompetition(4, false, false)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition in the Fields starting with no fish in your basket',
        type: 'missable',
        points: 10,
        conditions: beatCookingCompetition(4, false, true)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition in the Rapids',
        type: 'missable',
        points: 10,
        conditions: beatCookingCompetition(1, false, false)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition finals in the Swamp',
        points: 10,
        conditions: beatCookingCompetition(3, true, false)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Win the cooking competition finals in the Swamp starting with no fish in your basket',
        type: 'missable',
        points: 10,
        conditions: beatCookingCompetition(3, true, true)
    })
    badgenum = badgenum + 1







    //
    // Stats and collection
    //

    function reachSkillLevel(skill: string, level: number): any {
        let output = newConds()
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                game.checkVersion(),
                game.inGame(),
                game.rememberPersonPlayingIs('stat'),
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Reach Decent cooking skill',
        points: 5,
        conditions: reachSkillLevel('cookingSkill', 4)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Reach Professional Cooking skill',
        points: 10,
        conditions: reachSkillLevel('cookingSkill', 6)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Reach World Class cooking skill',
        points: 25,
        conditions: reachSkillLevel('cookingSkill', 8)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Reach level 3 fishing technique',
        points: 5,
        conditions: reachSkillLevel('fishingTech', 3)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Reach maximum level fishing technique',
        points: 10,
        conditions: reachSkillLevel('fishingTech', 5)
    })
    badgenum = badgenum + 1



    function collectionBitcounts(sources: Array<Partial<Condition.Data>>, total: number): any {
        let output = newConds()
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                measuredIf(
                    game.checkVersion(),
                    game.inGame()
                ),
                game.rememberPersonPlayingIs('items')
            )

            for (let source in sources) {
                output['alt' + i.toString()] = output['alt' + i.toString()].also(
                    playerAddAddress(game.version),
                    calculation(true, sources[source]).withLast({ lvalue: { type: 'Delta' } }),
                    (+source == 2) && playerAddAddress(game.version),
                    (+source == 2) && calculation(false, sources[source]).withLast({ lvalue: { type: 'Delta', size: 'Bit0' } }),
                    (+source == 2) && playerAddAddress(game.version),
                    (+source == 2) && calculation(false, sources[source]).withLast({ lvalue: { type: 'Delta', size: 'Bit7' } })
                )
            }
            output['alt' + i.toString()] = output['alt' + i.toString()].also(
                comparison(0, '=', total - 1)
            )

            for (let source in sources) {
                output['alt' + i.toString()] = output['alt' + i.toString()].also(
                    playerAddAddress(game.version),
                    calculation(true, sources[source]),
                    (+source == 2) && playerAddAddress(game.version),
                    (+source == 2) && calculation(false, sources[source]).withLast({ lvalue: { size: 'Bit0' } }),
                    (+source == 2) && playerAddAddress(game.version),
                    (+source == 2) && calculation(false, sources[source]).withLast({ lvalue: { size: 'Bit7' } })
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Own all 4 fishing bobbers',
        points: 3,
        conditions: collectionBitcounts([data.usa.player.bobbersBitcount], 4)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Own all 5 fish baskets',
        points: 5,
        conditions: collectionBitcounts([data.usa.player.basketsBitcount], 5)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Own all 6 permanent inventory items',
        points: 5,
        conditions: collectionBitcounts([data.usa.player.itemsBitcount], 6)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Own all 13 fishing poles',
        points: 10,
        conditions: collectionBitcounts([data.usa.player.polesBitcount1, data.usa.player.polesBitcount2], 13)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Own all 22 cooking recipes',
        points: 10,
        conditions: collectionBitcounts([data.usa.player.recipesBitcount1, data.usa.player.recipesBitcount2, data.usa.player.recipesBitcount3] , 22)
    })
    badgenum = badgenum + 1

    /**
     * Area uses ordered area codes
     * @param area
     * @returns
     */
    function allFishInAreaCollected(area: number): any {
        let output = newConds()
        let fishTotals: Array<number> = [21, 27, 26, 26, 22, 14]
        let i: number = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
                measuredIf(
                    game.checkVersion(),
                    game.inGame()
                ),
                game.rememberPersonPlayingIs('records'),
                game.player.fishCaughtInArea(area, true, true),
                comparison(0, '=', fishTotals[area] - 1),
                game.player.fishCaughtInArea(area, false, true),
                measured(comparison(0, '=', fishTotals[area]))
            )

            i = i + 1
        }
        return output
    }

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch all 21 types of fish in the Stream area',
        points: 25,
        conditions: allFishInAreaCollected(0)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch all 26 types of fish in the Mountain area',
        points: 25,
        conditions: allFishInAreaCollected(1)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch all 22 types of fish in the Field area',
        points: 25,
        conditions: allFishInAreaCollected(2)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch all 27 types of fish in the Rapids area',
        points: 25,
        conditions: allFishInAreaCollected(3)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch all 26 types of fish in the Swamp area',
        points: 25,
        conditions: allFishInAreaCollected(4)
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Catch all 14 types of fish in the Underground Lake',
        points: 25,
        conditions: allFishInAreaCollected(5)
    })
    badgenum = badgenum + 1


   


    //
    // Unique NPC achievements
    //





    let fortuneTold: any = newConds()
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Have an in depth fortune reading',
        points: 2,
        conditions: fortuneTold
    })
    badgenum = badgenum + 1

    let tanuki: any = newConds()
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Talk to the Tanuki who lives in the inn',
        points: 3,
        conditions: tanuki
    })
    badgenum = badgenum + 1

    let panda: any = newConds()
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Talk to the Panda who lives in the inn',
        points: 3,
        conditions: panda
    })
    badgenum = badgenum + 1

    let primeMinister: any = newConds()
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
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Meet a doppleganger of a previous Prime Minister of Japan',
        points: 3,
        conditions: primeMinister
    })
    badgenum = badgenum + 1

    let harvestMoon: any = newConds()
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
            addHits(
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
                )
            ),
            measured(
                $('0=1.3.')
            )
        )

        i = i + 1
    }

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Talk with three strangers from a different game in one session',
        points: 3,
        conditions: harvestMoon
    })
    badgenum = badgenum + 1

    let buttons: any = newConds()
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
            game.rememberPersonPlayingIs('area'),
            ...([0, 1, 2, 3, 4].map((value: number, index: number) => {
                return $(
                    addHits(andNext(
                        playerAddAddress(game.version),
                        comparison(game.player.area, '=', value),
                        convoAddAddress(game.version),
                        comparison(game.convo.speaker, '=', 0xffffffff, true),
                        convoAddAddress(game.version),
                        comparison(game.convo.speaker, '=', 0x12f, false).withLast({ hits: 1 })
                    ))
                )
            })),
            measured(
                $('0=1.5.')
            )
        )

        i = i + 1
    }

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Press all 5 spotlight buttons in one session',
        points: 3,
        conditions: buttons
    })
    badgenum = badgenum + 1

    let baits: any = newConds()
    i = 1
    for (let game of Releases) {
        baits['alt' + i.toString()] = $(
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

            resetNextIf(
                convoAddAddress(game.version),
                comparison(game.convo.speaker, '!=', 0xffffffff)
            ),
            resetNextIf(
                convoAddAddress(game.version),
                comparison(game.convo.speaker, '=', 0xffffffff).withLast({hits:5})
            ),
            pauseIf(
                $('1=1')
            ),
            
            ...(game.player.baitCount.map((value: Partial<Condition.Data>, index: number) => {
                return $(
                    addHits(andNext(
                        game.rememberPersonPlayingIs('money'),
                        playerAddAddress(game.version),
                        comparison(game.player.money, '=', game.player.money, true, false),
                        game.rememberPersonPlayingIs('items'),
                        playerAddAddress(game.version),
                        comparison(value, '<', value, true, false).withLast({ hits: 1 })
                    )),
                )
            })),
            measured(
                $('0=1.9.')
            )
        )

        i = i + 1
    }

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Gather one of every bait type from the environment in one session',
        points: 5,
        conditions: baits
    })
    badgenum = badgenum + 1

    /**
     * Area uses game based area codes
     * @param area
     * @param animalCodes
     * @returns
     */
    function animals(area: number, animalCodes: Array<number>): any {
        let output: ConditionBuilder = newConds()
        i = 1

        for (let game of Releases) {
            output['alt' + i.toString()] = $(
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

                game.rememberPersonPlayingIs('area'),

                ...(animalCodes.map((value: number, index: number) => {
                    return $(
                        addHits(andNext(
                            playerAddAddress(game.version),
                            comparison(game.player.area, (area < 5) ? '=' : '>=', area),
                            convoAddAddress(game.version),
                            comparison(game.convo.speaker, '=', value, true),
                            convoAddAddress(game.version),
                            comparison(game.convo.line, '=', 0x3, true),
                            convoAddAddress(game.version),
                            comparison(game.convo.line, '=', 0xffffffff, false).withLast({ hits: 1 })
                        )),
                    )
                })),
                measured(
                    $('0=1').withLast({ hits: animalCodes.length })
                )
            )

            i = i + 1
        }

        return output
    }

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Correctly answer a question from all Stream animals in one session',
        points: 5,
        conditions: animals(0, [0x3a, 0x3b, 0x3c])
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Correctly answer a question from all Mountain animals in one session',
        points: 5,
        conditions: animals(2, [0x3d, 0x3e, 0x3f])
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Correctly answer a question from all permanent Field animals in one session',
        points: 5,
        conditions: animals(4, [0x40, 0x41, 0x42])
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Correctly answer a question from all Rapids animals in one session',
        points: 5,
        conditions: animals(1, [0x44, 0x45, 0x46])
    })
    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Correctly answer a question from all Swamp animals in one session',
        points: 5,
        conditions: animals(3, [0x47, 0x48, 0x49, 0x4a])
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: titles[badgenum],
        badge: b(badgenum.toString()),
        description: 'Correctly answer a question from all Underground Lake animals in one session',
        points: 5,
        conditions: animals(5, [0x4b, 0x4c, 0x4d])
    })

}
