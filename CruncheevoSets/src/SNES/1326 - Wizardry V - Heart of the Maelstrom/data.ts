import { define as $, andNext, Condition, ConditionBuilder, orNext } from '@cruncheevos/core'
import { calculation, comparison, create, createDelta, sizeDict } from '../../helpers.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'

class Enemies {
    BattleID: Partial<Condition.Data>
    Type1: Partial<Condition.Data>
    Type2: Partial<Condition.Data>
    Type3: Partial<Condition.Data>
    Type4: Partial<Condition.Data>
    Amount1: Partial<Condition.Data>
    Amount2: Partial<Condition.Data>
    Amount3: Partial<Condition.Data>
    Amount4: Partial<Condition.Data>

    addAltsGroupAllDead(conditions: any, enemyCode: number): void {
        conditions['alt1'] = $(
            comparison(this.Type1, '=', enemyCode, true),
            comparison(this.Amount1, '>', 0, true),
            comparison(this.Type1, '=', enemyCode, false),
            comparison(this.Amount1, '=', 0, false)
        )

        conditions['alt2'] = $(
            comparison(this.Type2, '=', enemyCode, true),
            comparison(this.Amount2, '>', 0, true),
            comparison(this.Type2, '=', enemyCode, false),
            comparison(this.Amount2, '=', 0, false)
        )

        conditions['alt3'] = $(
            comparison(this.Type3, '=', enemyCode, true),
            comparison(this.Amount3, '>', 0, true),
            comparison(this.Type3, '=', enemyCode, false),
            comparison(this.Amount3, '=', 0, false)
        )

        conditions['alt4'] = $(
            comparison(this.Type4, '=', enemyCode, true),
            comparison(this.Amount4, '>', 0, true),
            comparison(this.Type4, '=', enemyCode, false),
            comparison(this.Amount4, '=', 0, false)
        )
    }

    uniqueBattleFinished(battleID: number): ConditionBuilder {
        return $(
            comparison(this.BattleID, '=', battleID, true),
            comparison(this.BattleID, '=', battleID, false),
            calculation(true, this.Amount1, '+', 0, true),
            calculation(true, this.Amount2, '+', 0, true),
            calculation(true, this.Amount3, '+', 0, true),
            comparison(this.Amount4, '>', 0, true),
            calculation(true, this.Amount1, '+', 0, false),
            calculation(true, this.Amount2, '+', 0, false),
            calculation(true, this.Amount3, '+', 0, false),
            comparison(this.Amount4, '=', 0, false),

        )
    }

    constructor() {
        this.BattleID = create('8bit', 0xbe)
        this.Type1 = create('8bit', 0xbf)
        this.Type2 = create('8bit', 0xc0)
        this.Type3 = create('8bit', 0xc1)
        this.Type4 = create('8bit', 0xc2)
        this.Amount1 = create('8bit', 0x93)
        this.Amount2 = create('8bit', 0x94)
        this.Amount3 = create('8bit', 0x95)
        this.Amount4 = create('8bit', 0x96)
    }
}

class Map {
    EWPos: Partial<Condition.Data>
    NSPos: Partial<Condition.Data>
    Floor: Partial<Condition.Data>
    DirectionFacing: Partial<Condition.Data>
    Location: Partial<Condition.Data>

    constructor() {
        this.EWPos = create('8bit', 0xb5)
        this.NSPos = create('8bit', 0xb6)
        this.Floor = create('8bit', 0xb7)
        this.DirectionFacing = create('8bit', 0xef)
        this.Location = create('8bit', 0xc7e)
    }
}

class Character {
    StatBlock: number
    MetaStatus: Partial<Condition.Data>
    Name1: Partial<Condition.Data>
    Name2: Partial<Condition.Data>
    Level: Partial<Condition.Data>
    Status: Partial<Condition.Data>
    AC: Partial<Condition.Data>
    MageSlots: Array<Partial<Condition.Data>>
    ClericSlots: Array<Partial<Condition.Data>>
    MageSpellsUnlocked: Array<Partial<Condition.Data>>
    ClericSpellsUnlocked: Array<Partial<Condition.Data>>
    InventoryAmount: Partial<Condition.Data>

    Inventory: Array<Partial<Condition.Data>>
    AlignmentClassRace: Partial<Condition.Data>

    AddAlignment(isDelta:boolean): ConditionBuilder {
        return $(
            calculation(true, this.AlignmentClassRace, '%', 0x4, isDelta)
        )
    }

    AddClass(isDelta: boolean): ConditionBuilder {
        return $(
            calculation(true, this.AlignmentClassRace, '/', 0x4, isDelta).withLast({ flag: 'Remember' }),
            calculation(true, 'Recall', '%', 0x8)
        )
    }

    AddRace(isDelta: boolean): ConditionBuilder {
        return $(
            calculation(true, this.AlignmentClassRace, '/', 0x20, isDelta)
        )
    }

    constructor(statBlockAddress: number) {
        this.StatBlock = statBlockAddress
        this.MetaStatus = create('8bit', 0x0 + this.StatBlock)
        this.Name1 = create('32bit', 0x2 + this.StatBlock)
        this.Name2 = create('32bit', 0x6 + this.StatBlock)
        this.Level = create('8bit', 0x21 + this.StatBlock)
        this.Status = create('8bit', 0x23 + this.StatBlock)
        this.AC = create('8bit', 0x26 + this.StatBlock)
        this.AlignmentClassRace = create('8bit', 0xa + this.StatBlock)
        this.InventoryAmount = create('8bit', 0x53 + this.StatBlock)

        this.MageSlots = []
        this.ClericSlots = []
        this.MageSpellsUnlocked = []
        this.ClericSpellsUnlocked = []
        this.Inventory = []

        for (let i: number = 0; i < 7; i++) {
            this.MageSlots.push(
                create('8bit', this.StatBlock + 0x27 + i)
            )
            this.ClericSlots.push(
                create('8bit', this.StatBlock + 0x2e + i)
            )
            this.MageSpellsUnlocked.push(
                create('8bit', this.StatBlock + 0x35 + i)
            )
            this.ClericSpellsUnlocked.push(
                create('8bit', this.StatBlock + 0x3c + i)
            )
            this.Inventory.push(
                create('8bit', this.StatBlock + 0x4b + i)
            )
        }

        this.Inventory.push(
            create('8bit', this.StatBlock + 0x4b + 7)
        )


    }

}

class Game {
    Enemies: Enemies
    Characters: Array<Character>
    Map: Map
    inBattle: Partial<Condition.Data>
    Summon: Partial<Condition.Data>

    addAltsAnyActiveCharactersHaveItem(conditions:any, itemcode: number): void {
        for (let i: number = 1; i < 21; i++) {
            conditions['alt' + i.toString()] = $(
                comparison(this.Characters[i - 1].MetaStatus, '=', 0x85),
                orNext(
                    ...this.Characters[i - 1].Inventory.map(
                        (value, index, array) => comparison(value, '=', itemcode)
                    )
                )
            )
        }
    }

    addAltsAnyActiveCharactersPickUpItem(conditions: any, itemcode: number): void {
        for (let i: number = 0; i < 160; i++) {
            conditions['alt' + (i+1).toString()] = $(
                comparison(this.Characters[Math.floor(i / 8)].MetaStatus, '=', 0x85),
                comparison(this.Characters[Math.floor(i / 8)].Inventory[i % 8], '=', itemcode, false)
            )
        }
    }

    addAltsAnyActiveCharactersLoseItem(conditions: any, itemcode: number): void {
        for (let i: number = 0; i < 20; i++) {
            conditions['alt' + (i + 1).toString()] = $(
                comparison(this.Characters[i].MetaStatus, '=', 0x85),
                orNext(
                    comparison(this.Characters[i].Inventory[0], '=', itemcode, true),
                    comparison(this.Characters[i].Inventory[1], '=', itemcode, true),
                    comparison(this.Characters[i].Inventory[2], '=', itemcode, true),
                    comparison(this.Characters[i].Inventory[3], '=', itemcode, true),
                    comparison(this.Characters[i].Inventory[4], '=', itemcode, true),
                    comparison(this.Characters[i].Inventory[5], '=', itemcode, true),
                    comparison(this.Characters[i].Inventory[6], '=', itemcode, true),
                    comparison(this.Characters[i].Inventory[7], '=', itemcode, true)
                ),
                andNext(
                    comparison(this.Characters[i].Inventory[0], '!=', itemcode, false),
                    comparison(this.Characters[i].Inventory[1], '!=', itemcode, false),
                    comparison(this.Characters[i].Inventory[2], '!=', itemcode, false),
                    comparison(this.Characters[i].Inventory[3], '!=', itemcode, false),
                    comparison(this.Characters[i].Inventory[4], '!=', itemcode, false),
                    comparison(this.Characters[i].Inventory[5], '!=', itemcode, false),
                    comparison(this.Characters[i].Inventory[6], '!=', itemcode, false),
                    comparison(this.Characters[i].Inventory[7], '!=', itemcode, false)
                ) 
                
            )
        }
    }

    addTotalInventoryHeldInActiveParty(isDelta: boolean): ConditionBuilder {
        let output: ConditionBuilder = $()
        for (let character of this.Characters) {
            output = output.also(
                calculation(true, character.InventoryAmount, '*', character.MetaStatus, isDelta, isDelta).withLast({ rvalue: { size: 'Bit7' } })
            )
        }

        return output
    }

    constructor() {
        this.Enemies = new Enemies()
        this.Map = new Map()
        this.inBattle = create('8bit', 0xb4)
        this.Summon = create('8bit', 0xc3)

        this.Characters = []
        for (let i: number = 0; i < 20; i++) {
            this.Characters.push(
                new Character(0x1000 + i * 0x80)
            )
        }
    }
}

export let game = new Game()
