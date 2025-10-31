import { define as $, Condition, ConditionBuilder } from '@cruncheevos/core'
import { calculation, comparison, create, createDelta, sizeDict } from '../../helpers.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'

export let playerBasePointer: Array<ConditionBuilder> = [
    $('I:0xX5b4be8'),
    $('I:0xX5d08e8'),
    $('I:0xX614b60')
]

export let convoBasePointer: Array<ConditionBuilder> = [
    $('I:0xX5b4c68'),
    $('I:0xX5d0968'),
    $('I:0xX614be0')
]

class playerV1 {
    gameVersion: number

    area: Partial<Condition.Data>

    health: Partial<Condition.Data>

    level: Partial<Condition.Data>

    fishingTech: Partial<Condition.Data>

    cookingSkill: Partial<Condition.Data>

    money: Partial<Condition.Data>

    rodChoice: Partial<Condition.Data>
    baitCount: Array<Partial<Condition.Data>>
    polesBitcount1: Partial<Condition.Data>
    polesBitcount2: Partial<Condition.Data>
    washtub: Partial<Condition.Data>
    itemsBitcount: Partial<Condition.Data>
    recipesBitcount1: Partial<Condition.Data>
    recipesBitcount2: Partial<Condition.Data>
    recipesBitcount3: Partial<Condition.Data>
    basketsBitcount: Partial<Condition.Data>
    firstBasketFish: Partial<Condition.Data>

    recordsOffset: number

    talkedToDan: Partial<Condition.Data>
    talkedToTanuki: Partial<Condition.Data>
    fossilPieces: Partial<Condition.Data>

    diaryOffset: number

    recordFishSize(area: number, fishNumber: number, isDelta: boolean): Partial<Condition.Data> {
        let recordStartOffsets: Array<number> = [0x1d90, 0x1f88, 0x2210, 0x2480, 0x26f0, 0x2900]

        if (isDelta == false) {
            return create('16bit', recordStartOffsets[area] + fishNumber * 24 + this.recordsOffset)
        }
        else {
            return createDelta('16bit', recordStartOffsets[area] + fishNumber * 24 + this.recordsOffset)
            
        }
    }

    fishCaughtInArea(area: number, isDelta:boolean): ConditionBuilder {
        let fishTotals: Array<number> = [21, 27, 26, 26, 22, 14]
        let recordStartOffsets: Array<number> = [0x1d90, 0x1f88, 0x2210, 0x2480, 0x26f0, 0x2900]

        let output: ConditionBuilder = $()

        for (let i: number = 0; i < fishTotals[area]; i++) {
            output = output.also(
                playerBasePointer[this.gameVersion],
                !isDelta && calculation(true, create('32bit', recordStartOffsets[area] + i * 24 + 20 + this.recordsOffset), '/', create('32bit', recordStartOffsets[area] + i * 24 + 20)),
                isDelta && calculation(true, createDelta('32bit', recordStartOffsets[area] + i * 24 + 20 + this.recordsOffset), '/', createDelta('32bit', recordStartOffsets[area] + i * 24 + 20))
            )
        }

        return output
    }

    totalFishCaught(isDelta: boolean): ConditionBuilder {
        return $(
            this.fishCaughtInArea(0, isDelta),
            this.fishCaughtInArea(1, isDelta),
            this.fishCaughtInArea(2, isDelta),
            this.fishCaughtInArea(3, isDelta),
            this.fishCaughtInArea(4, isDelta),
            this.fishCaughtInArea(5, isDelta)
        )
    }

    diaryEntry(area: number, entry: number, isDelta: boolean): Partial<Condition.Data> {
        let diaryStartOffsets: Array<number> = [0x5e20, 0x5e3b, 0x5e4b, 0x5e5a, 0x5e6d, 0x5e84]

        if (isDelta == false) {
            return create('8bit', diaryStartOffsets[area] + entry + this.diaryOffset)
        }
        else {
            return createDelta('8bit', diaryStartOffsets[area] + entry + this.diaryOffset)

        }
    }

    constructor(version: number, member: number) {
        this.gameVersion = version

        this.area = create('32bit', 0x1298 + member * 0x4)

        this.health = create('16bit', 0x12a8 + member * 0x4)

        this.level = create('8bit', 0x1308 + member * 0x4)

        this.fishingTech = create('8bit', 0x1314 + member * 0x4)

        this.cookingSkill = create('8bit', 0x1320 + member * 0x4)

        this.money = create('32bit', 0x1370 + member * 0x4)

        this.rodChoice = create('32bit', 0x13e8 + member * 0x26c)
        this.baitCount = [
            create('8bit', 0x13f0 + member * 0x26c),
            create('8bit', 0x13f1 + member * 0x26c),
            create('8bit', 0x13f2 + member * 0x26c),
            create('8bit', 0x13f3 + member * 0x26c),
            create('8bit', 0x13f4 + member * 0x26c),
            create('8bit', 0x13f5 + member * 0x26c),
            create('8bit', 0x13f6 + member * 0x26c),
            create('8bit', 0x13f7 + member * 0x26c),
            create('8bit', 0x13f8 + member * 0x26c)
        ]
        this.polesBitcount1 = create('BitCount', 0x1414 + member * 0x26c)
        this.polesBitcount2 = create('BitCount', 0x1415 + member * 0x26c)
        this.washtub = create('Bit0', 0x144c + member * 0x26c)
        this.itemsBitcount = create('BitCount', 0x144c + member * 0x26c)
        this.recipesBitcount1 = create('BitCount', 0x1468 + member * 0x26c)
        this.recipesBitcount2 = create('BitCount', 0x1469 + member * 0x26c)
        this.recipesBitcount3 = create('BitCount', 0x146a + member * 0x26c)
        this.basketsBitcount = create('BitCount', 0x1484 + member * 0x26c)
        this.firstBasketFish = create('32bit', 0x1518 + member * 0x26c)

        this.recordsOffset = 0xcc4 * member

        this.talkedToDan = create('32bit', 0x52e0 + member * 0x31c)
        this.talkedToTanuki = create('32bit', 0x52ec + member * 0x31c)
        this.fossilPieces = create('32bit', 0x530c + member * 0x31c)

        this.diaryOffset = 0x65 * member
    }
}


class player {
    gameVersion: number

    area: Partial<Condition.Data>

    health: Partial<Condition.Data>

    level: Partial<Condition.Data>

    fishingTech: Partial<Condition.Data>

    cookingSkill: Partial<Condition.Data>

    money: Partial<Condition.Data>

    rodChoice: Partial<Condition.Data>
    baitCount: Array<Partial<Condition.Data>>
    polesBitcount1: Partial<Condition.Data>
    polesBitcount2: Partial<Condition.Data>
    washtub: Partial<Condition.Data>
    itemsBitcount: Partial<Condition.Data>
    recipesBitcount1: Partial<Condition.Data>
    recipesBitcount2: Partial<Condition.Data>
    recipesBitcount3: Partial<Condition.Data>
    basketsBitcount: Partial<Condition.Data>
    firstBasketFish: Partial<Condition.Data>


    talkedToDan: Partial<Condition.Data>
    talkedToTanuki: Partial<Condition.Data>
    fossilPieces: Partial<Condition.Data>


    recordFishSize(area: number, fishNumber: number): Partial<Condition.Data> {
        let recordStartOffsets: Array<number> = [0x1d90, 0x1f88, 0x2210, 0x2480, 0x26f0, 0x2900]
        return create('16bit', recordStartOffsets[area] + fishNumber * 24 )

    }

    recordFishCaught(area: number, fishNumber: number): Partial<Condition.Data> {
        let recordStartOffsets: Array<number> = [0x1d90, 0x1f88, 0x2210, 0x2480, 0x26f0, 0x2900]
        return create('32bit', recordStartOffsets[area] + fishNumber * 24 + 20)
    }

    fishCaughtInArea(area: number, isDelta: boolean): ConditionBuilder {
        let fishTotals: Array<number> = [21, 27, 26, 26, 22, 14]
        let recordStartOffsets: Array<number> = [0x1d90, 0x1f88, 0x2210, 0x2480, 0x26f0, 0x2900]

        let output: ConditionBuilder = $()

        for (let i: number = 0; i < fishTotals[area]; i++) {
            output = output.also(
                playerBasePointer[this.gameVersion].withLast({ cmp: '+', rvalue: { type: 'Recall' } }),
                !isDelta && calculation(true, create('32bit', recordStartOffsets[area] + i * 24 + 20 ), '/', create('32bit', recordStartOffsets[area] + i * 24 + 20)),
                isDelta && calculation(true, createDelta('32bit', recordStartOffsets[area] + i * 24 + 20 ), '/', createDelta('32bit', recordStartOffsets[area] + i * 24 + 20))
            )
        }

        return output
    }

    totalFishCaught(isDelta: boolean): ConditionBuilder {
        return $(
            this.fishCaughtInArea(0, isDelta),
            this.fishCaughtInArea(1, isDelta),
            this.fishCaughtInArea(2, isDelta),
            this.fishCaughtInArea(3, isDelta),
            this.fishCaughtInArea(4, isDelta),
            this.fishCaughtInArea(5, isDelta)
        )
    }

    diaryEntry(area: number, entry: number, isDelta: boolean): Partial<Condition.Data> {
        let diaryStartOffsets: Array<number> = [0x5e20, 0x5e3b, 0x5e4b, 0x5e5a, 0x5e6d, 0x5e84]

        if (isDelta == false) {
            return create('8bit', diaryStartOffsets[area] + entry)
        }
        else {
            return createDelta('8bit', diaryStartOffsets[area] + entry)

        }
    }

    constructor(version: number) {
        this.gameVersion = version

        this.area = create('32bit', 0x1298 )

        this.health = create('16bit', 0x12a8 )

        this.level = create('8bit', 0x1308 )

        this.fishingTech = create('8bit', 0x1314 )

        this.cookingSkill = create('8bit', 0x1320 )

        this.money = create('32bit', 0x1370 )

        this.rodChoice = create('32bit', 0x13e8 )
        this.baitCount = [
            create('8bit', 0x13f0 ),
            create('8bit', 0x13f1 ),
            create('8bit', 0x13f2 ),
            create('8bit', 0x13f3 ),
            create('8bit', 0x13f4 ),
            create('8bit', 0x13f5 ),
            create('8bit', 0x13f6 ),
            create('8bit', 0x13f7 ),
            create('8bit', 0x13f8 )
        ]
        this.polesBitcount1 = create('BitCount', 0x1414 )
        this.polesBitcount2 = create('BitCount', 0x1415 )
        this.washtub = create('Bit0', 0x144c )
        this.itemsBitcount = create('BitCount', 0x144c )
        this.recipesBitcount1 = create('BitCount', 0x1468 )
        this.recipesBitcount2 = create('BitCount', 0x1469 )
        this.recipesBitcount3 = create('BitCount', 0x146a)
        this.basketsBitcount = create('BitCount', 0x1484 )
        this.firstBasketFish = create('32bit', 0x1518)

        this.talkedToDan = create('32bit', 0x52e0 )
        this.talkedToTanuki = create('32bit', 0x52ec )
        this.fossilPieces = create('32bit', 0x530c )

    }
}



export class game {
    version: number
    player: player
    convo = {
        speaker: create('32bit', 0x578),
        line: create('32bit', 0x57c)
    }
    playerOffsets = {
        stats: 0x4,
        items: 0x26c,
        records: 0xcc4,
        counters: 0x31c,
        diary: 0x65
    }

    playerXCoord: Partial<Condition.Data>

    checkVersion(): ConditionBuilder {
        return $(
            comparison(
                create('8bit', 0x15512), '=', (this.version == 0) ? 0x55 : (
                (this.version == 1) ? 0x45 : 0x50)
            )
        )
    }

    inGame(): ConditionBuilder {
        let temp: Partial<Condition.Data> = create('32bit',
            (this.version == 0) ? 0x5b45f4 : (
            (this.version == 1) ? 0x5d02f4 : 0x614574
            )
        )

        let tempDelta: Partial<Condition.Data> = createDelta('32bit',
            (this.version == 0) ? 0x5b45f4 : (
                (this.version == 1) ? 0x5d02f4 : 0x614574
            )
        )

        return $(
            comparison(tempDelta, '=', 1),
            comparison(temp, '=', 1)
        )

    }

    rememberPersonPlayingIs(offsetType: string): ConditionBuilder {
        return $(
            playerBasePointer[this.version],
            'K:0xX44',
            $('K:{recall}*' + this.playerOffsets[offsetType].toString())
        )
    }


    constructor(version: number) {
        this.version = version
        this.player = new player(version)

        this.playerXCoord = create('Float',
            (version == 0) ? 0x4f5880 : (
                (version == 1) ? 0x5114f0 : 0x551cf0
            )
        )
    }

}

export let usa: game = new game(0)
export let pal: game = new game(1)
export let japan: game = new game(2)



