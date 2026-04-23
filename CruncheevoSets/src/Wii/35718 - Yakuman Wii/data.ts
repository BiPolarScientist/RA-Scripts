import { define as $, Condition, ConditionBuilder } from '@cruncheevos/core'
import { calculation, comparison, create, sizeDict, wiiAddAddress } from '../../helpers.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'


/** 0x0 = Wii Remote Warning Screen
    0x1 = Title Screen
    0x2 = Save Select
    0x3 = Create new save
    0x4 = Mii catchphrase settings
    0x5 = Main menu

    0x7 = CPU opponent select screen

    0x9 = In game (includes options and rule subscreens)

    0xc = CPU lock screen

    0x10 = Options
    0x11 = List of rules
    0x12 = Mii Yaku stats
    0x13 = Mii game stats

    0x1b = Friend code screen 2
    0x1c = Friend code screen 1
    0x1d = Friend code screen 3

    0x27 = Tile Efficiency Quiz
    0x28 = Tile Efficiency Quiz Loading Online Tests
    0x29 = List of yaku */
export const gameplayID: Partial<Condition.Data> = create('32bitBE', 0x5c3680)




class mahjongHand {
    seat: number
    /** [0x0-0xc: tiles in hand, 0xd: drawn tile]*/
    hand: Array<[ConditionBuilder, Partial<Condition.Data>]>
    /** [0-3 which call][0: type, 1-4: tiles 1-4]*/
    calls: Array<Array<[ConditionBuilder, Partial<Condition.Data>]>>
    numberOfDraws: [ConditionBuilder, Partial<Condition.Data>]


    constructor(seat: number) {
        this.seat = seat

        let hand: Array<[ConditionBuilder, Partial<Condition.Data>]> = []
        for (let i = 0; i < 13; i++) {
            hand.push([
                $(
                    wiiAddAddress(0x479550),
                    wiiAddAddress(0x2c4)
                ),
                create('8bit', this.seat*0x134 + 0x4 + i*0x8)
            ])
        }
        hand.push([
            $(
                wiiAddAddress(0x479550),
                wiiAddAddress(0x2c4)
            ),
            create('8bit', this.seat * 0x134 + 0x74)
        ])
        this.hand = hand

        let calls: Array<Array<[ConditionBuilder, Partial<Condition.Data>]>> = [[], [], [], []]
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 5; i++) {
                calls[j].push([
                    $(
                        wiiAddAddress(0x479550),
                        wiiAddAddress(0x2c4)
                    ),
                    create('8bit', this.seat * 0x134 + 0x78 + 0x1c * j + i)
                ])
            }
        }
        this.calls = calls

        this.numberOfDraws = [
            $(
                wiiAddAddress(0x479550),
                wiiAddAddress(0x2c4)
            ),
            create('32bitBE', 0xf4 + this.seat * 0x134)
        ]

    }
}

interface tiletype {
    tile: [ConditionBuilder, Partial<Condition.Data>]
    suit: [ConditionBuilder, Partial<Condition.Data>]
    number: [ConditionBuilder, Partial<Condition.Data>]
}

interface discardedTile extends tiletype {
    xloc: [ConditionBuilder, Partial<Condition.Data>]
    yloc: [ConditionBuilder, Partial<Condition.Data>]
}

class discardPile {
    seat: number
    pile: Array<discardedTile>
    numberOfDiscards: [ConditionBuilder, Partial<Condition.Data>]

    constructor(seat: number) {
        this.seat = seat

        let pile: Array<discardedTile> = []
        let address: ConditionBuilder =
            $(
                wiiAddAddress(0x479550),
                wiiAddAddress(0x2c8)
            )
        for (let i = 0; i < 28; i++) {
            pile.push(
                {
                    tile: [address, create('8bit', 0x204 * this.seat + 0x10 * i + 0x4)],
                    suit: [address, create('Upper4', 0x204 * this.seat + 0x10 * i + 0x4)],
                    number: [address, create('Lower4', 0x204 * this.seat + 0x10 * i + 0x4)],
                    xloc: [
                        $(
                            wiiAddAddress(0x479550),
                            wiiAddAddress(0x2c8)
                        ),
                        create('32bitBE', 0x204 * this.seat + 0x10 * i + 0x8)
                    ],
                    yloc: [
                        $(
                            wiiAddAddress(0x479550),
                            wiiAddAddress(0x2c8)
                        ),
                        create('32bitBE', 0x204 * this.seat + 0x10 * i + 0xc)
                    ]
                } as discardedTile
            )
        }
        this.pile = pile 

        this.numberOfDiscards = [
            $(
                wiiAddAddress(0x479550),
                wiiAddAddress(0x2c8)
            ),
            create('32bitBE', this.seat * 0x204 + 0x1e0)
        ]
    }
}

interface wonHand {
    yaku: Array<[ConditionBuilder, Partial<Condition.Data>]>
    han: Array<[ConditionBuilder, Partial<Condition.Data>]>
    numberOfYaku: [ConditionBuilder, Partial<Condition.Data>]
    fu: Array<[ConditionBuilder, Partial<Condition.Data>]>
    fuID: Array<[ConditionBuilder, Partial<Condition.Data>]>
    fuMeldTTiles: Array<Array<tiletype>>
    fuOpen: Array<[ConditionBuilder, Partial<Condition.Data>]>
    numberOfFuConsiderations: [ConditionBuilder, Partial<Condition.Data>]
    basePoints: [ConditionBuilder, Partial<Condition.Data>]
    honba: [ConditionBuilder, Partial<Condition.Data>]
}

let yaku: Array<[ConditionBuilder, Partial<Condition.Data>]> = []
let han: Array<[ConditionBuilder, Partial<Condition.Data>]> = []
let fu: Array<[ConditionBuilder, Partial<Condition.Data>]> = []
let fuID: Array<[ConditionBuilder, Partial<Condition.Data>]> = []
let fuMeldTTiles: Array<Array<tiletype>> = []
let fuOpen: Array<[ConditionBuilder, Partial<Condition.Data>]> = []

for (let i = 0; i < 10; i++) {
    if (i < 8) {
        fu.push([
            $(
                wiiAddAddress(0x479550),
                wiiAddAddress(0x2cc),
                wiiAddAddress(0xc)
            ),
            create('8bit', 0x2 + 0xa*i)
        ])
        fuID.push([
            $(
                wiiAddAddress(0x479550),
                wiiAddAddress(0x2cc),
                wiiAddAddress(0xc)
            ),
            create('8bit', 0x1 + 0xa * i)
        ])
        fuOpen.push([
            $(
                wiiAddAddress(0x479550),
                wiiAddAddress(0x2cc),
                wiiAddAddress(0xc)
            ),
            create('8bit', 0x7 + 0xa * i)
        ])
        fuMeldTTiles.push(
            [0,1,2,3].map((x) => ({
                tile: [
                    $(
                        wiiAddAddress(0x479550),
                        wiiAddAddress(0x2cc),
                        wiiAddAddress(0xc)
                    ),
                    create('8bit', 0x3 + x + 0xa * i)
                ],
                suit: [
                    $(
                        wiiAddAddress(0x479550),
                        wiiAddAddress(0x2cc),
                        wiiAddAddress(0xc)
                    ),
                    create('Upper4', 0x3 + x + 0xa * i)
                ],
                number: [
                    $(
                        wiiAddAddress(0x479550),
                        wiiAddAddress(0x2cc),
                        wiiAddAddress(0xc)
                    ),
                    create('Lower4', 0x3 + x + 0xa * i)
                ]
            } as tiletype)
            )
        )
    }

    yaku.push([
        $(
            wiiAddAddress(0x479550),
            wiiAddAddress(0x2cc),
            wiiAddAddress(0x0)
        ),
        create('16bitBE', 0x4 * i)
    ])
    han.push([
        $(
            wiiAddAddress(0x479550),
            wiiAddAddress(0x2cc),
            wiiAddAddress(0x0)
        ),
        create('8bit', 0x2 + 0x4 * i)
    ])
}


let lastWinningHand: wonHand = {
    yaku: yaku,
    han: han,
    numberOfYaku: [
        $(
            wiiAddAddress(0x479550),
            wiiAddAddress(0x2cc)
        ),
        create('32bitBE', 0x4)
    ],
    fu: fu,
    fuID: fuID,
    fuMeldTTiles: fuMeldTTiles,
    fuOpen: fuOpen,
    numberOfFuConsiderations: [
        $(
            wiiAddAddress(0x479550),
            wiiAddAddress(0x2cc)
        ),
        create('32bitBE', 0x10)
    ],
    basePoints: [
        $(
            wiiAddAddress(0x479550),
            wiiAddAddress(0x2cc)
        ),
        create('32bitBE', 0x30)
    ],
    honba: [
        $(
            wiiAddAddress(0x479550),
            wiiAddAddress(0x2cc)
        ),
        create('32bitBE', 0x38)
    ]
}



interface scorescreen {
    scoreBefore: ConditionBuilder
    scoreDifference: ConditionBuilder
    scoreAfter: ConditionBuilder
}

let scoreScreen: scorescreen = {
    scoreBefore: $(
        $('K:{recall}*4'),
        $('K:{recall}+20'),
        $('K:0xG479560+{recall}')
    ),
    scoreDifference: $(
        $('K:{recall}*4'),
        $('K:{recall}+36'),
        $('K:0xG479560+{recall}')
    ),
    scoreAfter: $(
        $('K:{recall}*4'),
        $('K:{recall}+52'),
        $('K:0xG479560+{recall}')
    )
}

interface gamescore {
    placement: Array<[ConditionBuilder, Partial<Condition.Data>]>
    score: Array<[ConditionBuilder, Partial<Condition.Data>]>
    plusminus: Array<[ConditionBuilder, Partial<Condition.Data>]>
}

let gameScore: gamescore = {
    placement: [0,1,2,3].map((x) => [
        wiiAddAddress(0x479564),
        create('32bitBE', 0xb0 + 0x4 * x)
    ]),
    score: [0,1,2,3].map((x) => [
        wiiAddAddress(0x479564),
        create('32bitBE', 0xc0 + 0x4 * x)
    ]),
    plusminus: [0,1,2,3].map((x) => [
        wiiAddAddress(0x479564),
        create('32bitBE', 0xd0 + 0x4 * x)
    ])
}

interface gme {
    pointer: Partial<Condition.Data>
    /** 0x1 = Game loaded
    0x4 =
    0x5 = Everyone says hi :) / initial seat placements
    0x6 = Hand number screen
    0x7 = Hand setup screen (dice rolling etc)
    0x8 = Tile is being drawn
    0x9 = asked to call something
    0xa = What tile to discard for a call
    0xc = making a call (pon)
    0xe = making a call (chi)
    0x10 = Player calling ron
    0x11 = picking what to discard
    0x14 = Computer taking a turn
    0x16 = Tile is being discarded (includes riichiing)
    0x1a-0x1c = Turn over transferring to next player
    0x20 = Draw
    0x25 = Hand over, looking at table by player ron
    0x27 = Hand value calculation screen
    0x28 = Point dispersion screen
    0x29 = End of game screen */
    status: [ConditionBuilder, Partial<Condition.Data>]
    hands: Array<mahjongHand>
    discards: Array<discardPile>
    lastWonHand: wonHand,
    /** Check to make sure not a tsumo win */
    rememberLastDiscardedTile: ConditionBuilder
    /** Indexed by seats, outputs index of [Player, CPU1, CPU2, CPU3]*/
    seats: Array<[ConditionBuilder, Partial<Condition.Data>]>
    dangerSense: [ConditionBuilder, Partial<Condition.Data>]
    autoPlay: [ConditionBuilder, Partial<Condition.Data>]
    support: [ConditionBuilder, Partial<Condition.Data>]
    scoreScreenPointer: Partial<Condition.Data>
    /** Uses recall, should have stored what seat the player is in, after this use addaddress recall mem 0 to access data */
    scoreScreen: scorescreen
    gameScoreScreenPointer: Partial<Condition.Data>
    /** Index based on [Player, CPU1, CPU2, CPU3]*/
    gameScore: gamescore
    whosTurn: [ConditionBuilder, Partial<Condition.Data>]
    isRiichi: Array<[ConditionBuilder, Partial<Condition.Data>]>
}

export let game: gme = {
    pointer: create('32bitBE', 0x479550),

    status: [
        wiiAddAddress(0x479550),
        create('32bitBE', 0x418)
    ],
    hands: [0,1,2,3].map((x) => new mahjongHand(x)),
    discards: [0,1,2,3].map((x) => new discardPile(x)),
    lastWonHand: lastWinningHand,
    rememberLastDiscardedTile: $(
        'I:0xG00479550&536870911',
        'K:0xG0000042c',
        'A:244',
        'K:{recall}*308',
        'I:0xG00479550&536870911',
        'K:0xG000002c4+{recall}',
        'I:{recall}&536870911',
        'K:0xG00000000',
        'I:0xG00479550&536870911',
        'A:0xG0000042c*516',
        'B:12',
        'K:{recall}*16',
        'I:0xG00479550&536870911',
        'K:0xG000002c8+{recall}',
        'I:{recall}&536870911',
        'K:0xX00000000'
        ),// I am so sorry for anyone who needs to figure this one out...

    seats: [0,1,2,3].map((x) => [
        wiiAddAddress(0x479550),
        create('16bitBE', 0x2e4 + x*0x2)
    ]),
    dangerSense: [
        $(
            wiiAddAddress(0x479550),
            wiiAddAddress(0x4c4)
        ),
        create('32bitBE', 0x29c)
    ],
    autoPlay: [
        wiiAddAddress(0x479550),
        create('8bit', 0x47c)
    ],
    support: [
        wiiAddAddress(0x479550),
        create('8bit', 0x4d4)
    ],

    scoreScreenPointer: create('32bitBE', 0x479560),

    scoreScreen: scoreScreen,

    gameScoreScreenPointer: create('32bitBE', 0x479564),

    gameScore: gameScore,

    whosTurn: [
        wiiAddAddress(0x479550),
        create('32bitBE', 0x42c)
    ],

    isRiichi: [0, 1, 2, 3].map((x) => [
        $(
            wiiAddAddress(0x479550),
            wiiAddAddress(0x2c4)
        ),
        create('8bit', 0xee + 0x134 * x)
    ])
}

interface otherpointer {
    efficiencyQuizQuestionsAnswered: [ConditionBuilder, Partial<Condition.Data>]
    selectingCPUStatus: [ConditionBuilder, Partial<Condition.Data>]
    CPUIds: Array<[ConditionBuilder, Partial<Condition.Data>]>
}

export let otherPointer: otherpointer = {
    efficiencyQuizQuestionsAnswered: [
        wiiAddAddress(0x5c3690),
        create('32bitBE', 0xbc)
    ],
    /** 0x13 into 0x15 = Start of the game */
    selectingCPUStatus: [
        wiiAddAddress(0x5c3690),
        create('32bitBE', 0x10a4)
    ],
    CPUIds: [0,1,2].map((x) => [
        wiiAddAddress(0x5c3690),
        create('32bitBE', 0x10d0 + x*0x4)
    ])
}