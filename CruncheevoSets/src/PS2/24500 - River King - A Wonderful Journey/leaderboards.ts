import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, Leaderboard, orNext, measuredIf } from '@cruncheevos/core'
import * as data from './data.js'
import { calculation, comparison, connectAddSourceChains, measureLB } from '../../helpers.js'
import { newConds, playerAddAddress } from './achievements.js'

export function makeLeaderboards(set: AchievementSet): void {


    let areaCodes: any = {
        0: 0,
        1: 2,
        2: 4,
        3: 1,
        4: 3,
        5: 5
    }

    let fishDoubles: Array<Array<[number, number]>> = [
        [[0x0, 0xa], [0x1, 0x1]],
        [[0x0, 0xc], [0x1, 0x2]],
        [[0x0, 0xd], [0x1, 0x4]],
        [[0x0, 0xe], [0x1, 0x5]],
        [[0x0, 0x10], [0x1, 0x9]],
        [[0x0, 0x12], [0x1, 0x15]],
        [[0x1, 0x11], [0x2, 0xb], [0x4, 0xf]],
        [[0x1, 0x12], [0x2, 0xd]],
        [[0x2, 0x2], [0x4, 0x0]],
        [[0x2, 0x3], [0x4, 0x5]],
        [[0x2, 0x5], [0x4, 0x6]],
        [[0x2, 0x8], [0x4, 0x9]],
        [[0x2, 0xa], [0x4, 0xa]],
        [[0x2, 0xe], [0x4, 0x10]],
        [[0x2, 0xf], [0x4, 0x11]],
        [[0x2, 0x11], [0x4, 0x13]],
        [[0x2, 0x12], [0x4, 0x15]],
        [[0x2, 0x13], [0x4, 0x16]],
        [[0x2, 0x14], [0x4, 0x18]],
        [[0x2, 0x15], [0x4, 0x19]],
        [[0x3, 0x6], [0x4, 0x2]],
        [[0x3, 0x16], [0x4, 0x12]]
    ]


    let fishnames: any = {
        0: ["Akaza", 99, [0x0, 0x0]],
        1: ["Aburahaya", 99, [0x0, 0x1]],
        2: ["Amago", 99, [0x0, 0x2]],
        3: ["Amemasu", 99, [0x0, 0x3]],
        4: ["Ayu", 99, [0x0, 0x4]],
        5: ["Itou", 99, [0x0, 0x5]],
        6: ["Big Itou", 99, [0x0, 0x6]],
        7: ["Albino Itou", 99, [0x0, 0x7]],
        8: ["Iwana", 99, [0x0, 0x8]],
        9: ["Big Iwana", 99, [0x0, 0x9]],
        10: ["Oshorokoma", 0, [0x0, 0xa]],
        11: ["Kajika", 99, [0x0, 0xb]],
        12: ["River Trout", 1, [0x0, 0xc]],
        13: ["Gogi", 2, [0x0, 0xd]],
        14: ["Cherry Salmon", 3, [0x0, 0xe]],
        15: ["Takahaya", 99, [0x0, 0xf]],
        16: ["Rainbow Trout", 4, [0x0, 0x10]],
        17: ["Haze", 99, [0x0, 0x11]],
        18: ["Yamame", 5, [0x0, 0x12]],
        19: ["Crab", 99, [0x0, 0x13]],
        20: ["Newt", 99, [0x0, 0x14]],
        21: ["Ugui", 99, [0x1, 0x0]],
        22: ["Pink Salmon", 99, [0x1, 0x3]],
        23: ["Big Cherry Salmon", 99, [0x1, 0x6]],
        24: ["Salmon", 99, [0x1, 0x7]],
        25: ["Donko", 99, [0x1, 0x8]],
        26: ["Albino Rainbow Trout", 99, [0x1, 0xa]],
        27: ["Big Rainbow Trout", 99, [0x1, 0xb]],
        28: ["Hasu", 99, [0x1, 0xc]],
        29: ["Higai", 99, [0x1, 0xd]],
        30: ["Princess Salmon", 99, [0x1, 0xe]],
        31: ["Brown Trout", 99, [0x1, 0xf]],
        32: ["Great Brown Trout", 99, [0x1, 0x10]],
        33: ["Black Bass", 6, [0x1, 0x11]],
        34: ["Bluegill", 7, [0x1, 0x12]],
        35: ["Red Salmon", 99, [0x1, 0x13]],
        36: ["Honmoroko", 99, [0x1, 0x14]],
        37: ["Albino Yamame", 99, [0x1, 0x16]],
        38: ["Smelt", 99, [0x1, 0x17]],
        39: ["Wataka", 99, [0x1, 0x18]],
        40: ["Frog", 99, [0x1, 0x19]],
        41: ["Itoyo", 99, [0x2, 0x0]],
        42: ["Itomoroko", 99, [0x2, 0x1]],
        43: ["Eel", 8, [0x2, 0x2]],
        44: ["Carp", 9, [0x2, 0x3]],
        45: ["Sand Loach", 99, [0x2, 0x4]],
        46: ["Tanago", 10, [0x2, 0x5]],
        47: ["Tsuchifuki", 99, [0x2, 0x6]],
        48: ["Fighting Fish", 99, [0x2, 0x7]],
        49: ["Loach", 11, [0x2, 0x8]],
        50: ["Tomiyo", 99, [0x2, 0x9]],
        51: ["Catfish", 12, [0x2, 0xa]],
        52: ["Monster Bass", 99, [0x2, 0xc]],
        53: ["Pejerrey", 13, [0x2, 0xe]],
        54: ["Herabuna", 14, [0x2, 0xf]],
        55: ["Big Herabuna", 99, [0x2, 0x10]],
        56: ["Killifish", 15, [0x2, 0x11]],
        57: ["Motsugo", 16, [0x2, 0x12]],
        58: ["Snakehead", 17, [0x2, 0x13]],
        59: ["Prawn", 18, [0x2, 0x14]],
        60: ["Crawfish", 19, [0x2, 0x15]],
        61: ["Aouo", 99, [0x3, 0x0]],
        62: ["Akane", 99, [0x3, 0x1]],
        63: ["King Akane", 99, [0x3, 0x2]],
        64: ["Ina", 99, [0x3, 0x3]],
        65: ["Oikawa", 99, [0x3, 0x4]],
        66: ["Oyanirami", 99, [0x3, 0x5]],
        67: ["Kamatsuka", 20, [0x3, 0x6]],
        68: ["Kamaruchi", 99, [0x3, 0x7]],
        69: ["Kawamutsu", 99, [0x3, 0x8]],
        70: ["Bullhead", 99, [0x3, 0x9]],
        71: ["Guppy", 99, [0x3, 0xa]],
        72: ["King Carp", 99, [0x3, 0xb]],
        73: ["Bighead Carp", 99, [0x3, 0xc]],
        74: ["Albino Bighead Carp", 99, [0x3, 0xd]],
        75: ["Big Bighead Carp", 99, [0x3, 0xe]],
        76: ["Satsuki Trout", 99, [0x3, 0xf]],
        77: ["Grass Carp", 99, [0x3, 0x10]],
        78: ["Big Grass Carp", 99, [0x3, 0x11]],
        79: ["Tamaroko", 99, [0x3, 0x12]],
        80: ["Silver Carp", 99, [0x3, 0x13]],
        81: ["King Hakuren", 99, [0x3, 0x14]],
        82: ["Queen Salmon", 99, [0x3, 0x15]],
        83: ["Mabuna", 21, [0x3, 0x16]],
        84: ["Mugitsuku", 99, [0x3, 0x17]],
        85: ["Roughskin Sculpin", 99, [0x3, 0x18]],
        86: ["Turtle", 99, [0x3, 0x19]],
        87: ["Softshell Turtle", 99, [0x3, 0x1a]],
        88: ["Big Eel", 99, [0x4, 0x1]],
        89: ["Gold Buna", 99, [0x4, 0x3]],
        90: ["Silver Buna", 99, [0x4, 0x4]],
        91: ["Electric Eel", 99, [0x4, 0x7]],
        92: ["Tilapia", 99, [0x4, 0x8]],
        93: ["Big Catfish", 99, [0x4, 0xb]],
        94: ["Monster Catfish", 99, [0x4, 0xc]],
        95: ["Nigoi", 99, [0x4, 0xd]],
        96: ["Hariyo", 99, [0x4, 0xe]],
        97: ["Albino Killifish", 99, [0x4, 0x14]],
        98: ["Big Snakehead", 99, [0x4, 0x17]],
        99: ["Pirarucu", 99, [0x5, 0x0]],
        100: ["Alligator Gar", 99, [0x5, 0x1]],
        101: ["Silver Arowana", 99, [0x5, 0x2]],
        102: ["Black Arowana", 99, [0x5, 0x3]],
        103: ["Asian Arowana", 99, [0x5, 0x4]],
        104: ["Coelacanth", 99, [0x5, 0x5]],
        105: ["River King", 99, [0x5, 0x6]],
        106: ["Freshwater Ray", 99, [0x5, 0x7]],
        107: ["Sterlet", 99, [0x5, 0x8]],
        108: ["Butterfly Fish", 99, [0x5, 0x9]],
        109: ["Gar Pike", 99, [0x5, 0xa]],
        110: ["Albino Gar Pike", 99, [0x5, 0xb]],
        111: ["Royal Knife Fish", 99, [0x5, 0xc]],
        112: ["Cuban Gar", 99, [0x5, 0xd]]
    }

    let Releases: Array<data.game> = [data.usa, data.pal, data.japan]
    let caughtRiverKing = newConds()
    let caughtRiverKingValue = newConds()
    let i:number = 1

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

        caughtRiverKingValue['alt' + i.toString()] = $(
            measuredIf(
                game.checkVersion(),
                game.inGame()
            ),
            game.rememberPersonPlayingIs('records'),
            game.player.totalFishCaught(false, true, false),
            $("M:0")
        )
        i = i + 1
    }

    set.addLeaderboard({
        title: 'Efficiency - Speedrun',
        description: 'Number of fish caught before catching the River King',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: caughtRiverKing,
            cancel: $('0=1'),
            submit: $('1=1'),
            value: caughtRiverKingValue
        }
    })


    for (let fish in fishnames) {

        if (fishnames[fish][1] == 99) {

            let start = newConds()
            let value = newConds()
            let i: number = 1

            for (let game of Releases) {
                let fishSize: Partial<Condition.Data> = game.player.recordFishSize(areaCodes[fishnames[fish][2][0]], fishnames[fish][2][1])

                start['alt' + i.toString()] = $(
                    game.checkVersion(),
                    game.inGame(),
                    game.rememberPersonPlayingIs('records'),
                    playerAddAddress(game.version),
                    comparison(fishSize, '<', fishSize, true, false)
                )

                value['alt' + i.toString()] = $(
                    measuredIf(
                        game.checkVersion(),
                        game.inGame()
                    ),
                    game.rememberPersonPlayingIs('records'),
                    playerAddAddress(game.version),
                    measureLB(fishSize)
                )
                i = i + 1
            }

            set.addLeaderboard({
                title: 'High Score - ' + fishnames[fish][0] + ' Length',
                description: 'Catch the longest ' + fishnames[fish][0] + ' measured in centimeters',
                lowerIsBetter: false,
                type: 'UNSIGNED',
                conditions: {
                    start: start,
                    cancel: $('0=1'),
                    submit: $('1=1'),
                    value: value
                }
            })
        }
        else {
            let start = newConds()
            let value = newConds()
            let i: number = 1

            for (let game of Releases) {
                for (let fishCopy of fishDoubles[fishnames[fish][1]]) {
                    let fishSize: Partial<Condition.Data> = game.player.recordFishSize(areaCodes[fishCopy[0]], fishCopy[1])

                    start['alt' + i.toString()] = $(
                        game.checkVersion(),
                        game.inGame(),
                        game.rememberPersonPlayingIs('stats'),
                        playerAddAddress(game.version),
                        comparison(game.player.area, '=', areaCodes[fishCopy[0]]),
                        game.rememberPersonPlayingIs('records'),
                        playerAddAddress(game.version),
                        comparison(fishSize, '<', fishSize, true, false)
                    )

                    value['alt' + i.toString()] = $(
                        measuredIf(
                            game.checkVersion(),
                            game.inGame(),
                            game.rememberPersonPlayingIs('stats'),
                            playerAddAddress(game.version),
                            comparison(game.player.area, '=', areaCodes[fishCopy[0]])
                        ),
                        game.rememberPersonPlayingIs('records'),
                        playerAddAddress(game.version),
                        measureLB(fishSize)
                    )
                    i = i + 1
                }
            }

            set.addLeaderboard({
                title: 'High Score - ' + fishnames[fish][0] + ' Length',
                description: 'Catch the longest ' + fishnames[fish][0] + ' measured in centimeters',
                lowerIsBetter: false,
                type: 'UNSIGNED',
                conditions: {
                    start: start,
                    cancel: $('0=1'),
                    submit: $('1=1'),
                    value: value
                }
            })
        }

        
    }


}