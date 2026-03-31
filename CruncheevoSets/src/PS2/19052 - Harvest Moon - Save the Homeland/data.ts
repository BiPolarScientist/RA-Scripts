import { define as $, Condition, ConditionBuilder } from '@cruncheevos/core'
import { calculation, comparison, create, createDelta, sizeDict } from '../../helpers.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'

/** 0x10 = Horse Race Ending Events
    0xff = Minigame Events*/
export const S2Event: Partial<Condition.Data> = create('8bit', 0x26771c)
/** 0x03 = Bob Race
    0x04 = Gwen Race
    0x05 = Bluebird summoning game

    0x12 = Won Bob's Race
    0x15 = Lost Bob's Race
    0x1b = Won Gwen's Race
    0x1e = Lost Gwen's Race */
export const S0Event: Partial<Condition.Data> = create('8bit', 0x267720)

export const MarinaProfile: Partial<Condition.Data> = create('32bit', 0x80da0c)

const CharacterNames: Record<string, number> = {
    'Lyla': 0,
    'Gwen': 1, 
    'Dia': 2,
    'Katie': 3,
    'Gina': 4,
    'Joe': 5,
    'Kurt': 6,
    'Louis': 7,
    'Bob': 8,
    'Tim': 9,
    'Wallace': 10,
    'Woody': 11,
    'Ronald': 12,
    'Martha': 13,
    'Parsley': 14,
    'Nik': 15,
    'Nac': 16,
    'Flak': 17,
    'Goddess': 18
}


export function MetNPC(i: number | string): Partial<Condition.Data> {
    if (typeof i === 'number') {
        return create('Bit0', 0x80d942 + i * 2)
    }
    else {
        return create('Bit0', 0x80d942 + CharacterNames[i] * 2)
    } 
}

export function NPCAP(i: number | string): Partial<Condition.Data> {
    if (typeof i === 'number') {
        return create('8bit', 0x859e30 + i * 2)
    }
    else {
        return create('8bit', 0x859e30 + CharacterNames[i] * 2)
    }
}

export class cow {
    IsAlive: Partial<Condition.Data>
    IsHappy: Partial<Condition.Data>
    IsCalf: Partial<Condition.Data>
    IsPregnant: Partial<Condition.Data>

    constructor(index: number) {
        this.IsAlive = create('Bit0', 0x859f20 + index * 0x20)
        this.IsHappy = create('Bit2', 0x859f20 + index * 0x20)
        this.IsCalf = create('Bit4', 0x859f21 + index * 0x20)
        this.IsPregnant = create('Bit0', 0x859f23 + index * 0x20)
    }
}

export class chicken {
    IsAlive: Partial<Condition.Data>
    IsHappy: Partial<Condition.Data>
    DaysUntilGrown: Partial<Condition.Data>

    IsChick(): ConditionBuilder {
        return $(
            comparison(this.DaysUntilGrown, '>', 0)
        )
    }

    constructor(index: number) {
        this.IsAlive = create('Bit0', 0x859e60 + index * 0x20)
        this.IsHappy = create('Bit2', 0x859e60 + index * 0x20)
        this.DaysUntilGrown = create('8bit', 0x859e64 + index * 0x20)
    }
}

export const Cows: Array<cow> = Array.from({ length: 5 }, (_, i) => new cow(i))

export const Chickens: Array<chicken> = Array.from({length: 6}, (_,i) => new chicken(i))


interface player {
    PowerBerryCount: Partial<Condition.Data>
    /** 0: King of the Lake
    *  1: Strange Fish
    *  2: Silver Fish
    */ 
    SpecialFishCaught: Array<Partial<Condition.Data>>
    Money: Partial<Condition.Data>
    /** 0x00 = Farm
        0x01 = Farm with Doghouse
        0x02 = Outside Supermarket
        0x03 = Outside Flower / Tool Shops
        0x04 = Walnut Forest
        0x05 = Maple Lake
        0x06 = Harvest Goddes Lake
        0x07 = Brownie Farm
        0x08 = Brownie Farm Pasture
        0x09 = Praria Forest
        0x0a = Sacred Land
        0x0b = House
        0x0c = Kitchen
        0x0d = Barn
        0x0e = Coop
        0x0f = Supermarket
        0x10 = Ronald's Coop
        0x11 = Flower Shop
        0x12 = Lyla's House
        0x13 = Tool Shop
        0x14 = Louis' House
        0x15 = Carpenter's House
        0x16 = Apprentices' Shack
        0x17 = Sunny Garden Cafe
        0x18 = Katie's House
        0x19 = Clove's Villa
        0x1a = Dia's Room?
        0x1b = Brownie Farm House
        0x1c = Farm Store
        0x1d = Brownie Farm Barn
        0x1e = Harvest Sprite Cave / Room */
    Location: Partial<Condition.Data>
    /** 0x00 = Walking around
        0x02 = Inventory screen
        0x03 = Map
        0x04 = Status Screen
        0x05 = In Freezer
        0x06 = Diary Screen
        0x08 = Calander
        0x0b = Cooking Menu
        0x0c = Watching TV
        0x0e = Horse Racing
        0x0f = Time Trials
        0x10 = Main Menu
        0x11 = Option Screen
        0x14 = Loading in?
        0x15 = Area Transitions
        0x16 = Cutscenes
        0x17 = Cutscene transitions?*/
    CurrentAction: Partial<Condition.Data>
    /** 0x0 = Spring
        0x1 = Summer
        0x2 = Fall
        0x3 = Winter*/
    Season: Partial<Condition.Data>
    Day: Partial<Condition.Data>
    Hour: Partial<Condition.Data>
    Holding: Partial<Condition.Data>
    /**
     *  0x00= Potato
        0x01= Tomato
        0x02= Corn
        0x03= Breadfruit
        0x04= White Egg
        0x05= Gold Egg
        0x06= Small Milk
        0x07= Medium Milk
        0x08= Large Milk
        0x09= Golden Milk
        0x0a= Very Berry
        0x0b= Cranberry
        0x0c= Blueberry
        0x0d= Walnut
        0x0e= Mushroom
        0x0f= Full Moon Berry
        0x10= Green Herb
        0x11= Red Herb
        0x12= Small Fish
        0x13= Medium Fish
        0x14= Large Fish
        0x15= Ponata Root
        0x16= Rice Ball
        0x17= Sandwich
        0x18= Soft Bread
        0x19= Honey Pot
        0x1a= Yogurt
        0x1b= Flan
        0x1c= Cheese
        0x1d= Cake
        0x1e= Cheesecake
        0x1f= Pancakes
        0x20= Cooked Fish
        0x21= Plain Omelet
        0x22= Boiled Egg
        0x23= Sunny Side Up Eggs
        0x24= Creamy Soup
        0x25= AP Medicine
        0x26= Very Berry Jam
        0x27= Cranberry Jam
        0x28= Blueberry Jam
        0x29= Mixed Jam
        0x2a= Hot Milk
        0x2b= Cream of Corn
        0x2c= Cream of Tomato
        0x2d= Cream of Mushroom
        0x2e= Cheese Omelet
        0x2f= Mixed Omelet
        0x30= Fruit Omelet
        0x31= Bouillabaisse
        0x32= Sauteed Fish w/ Cream
        0x33= Leaf-Grilled Fish
        0x34= Fruit Flan
        0x35= Special Cheese
        0x36= Special Cheesecake
        0x37= Fruit Cake
        0x38= Honey Cake
        0x39= Failed Recipe
        0x3a= Chicken Feed
        0x3b= Potato Seed
        0x3c= Tomato Seed
        0x3d= Corn Seed
        0x3e= Breadfruit Seed
        0x3f= Weed
        0x40= Yellow Flower
        0x41= Purple Flower
        0x42= Copper Ore
        0x43= Iron Ore
        0x44= Blue Rock
        0x45= Rare Metal
        0x46= Moonlight Stone
        0x47= Limestone
        0x48= Fodder
        0x49= Tim's Map
        0x4a= Cake Recipe
        0x4b= Magic Book
        0x4c= Lucky Charm
        0x4d= Silk Thread
        0x4e= Rainbow Fabric
        0x4f= Blue Mist Seed
     * @param index
     */
    Item(index: number): Partial<Condition.Data>

}

export const Player: player = {
    PowerBerryCount: create('BitCount', 0x267860),
    SpecialFishCaught: [
        create('Bit0', 0x26785c),
        create('Bit1', 0x26785c),
        create('Bit2', 0x26785c)
    ],
    Money: create('32bit', 0x267864),
    Location: create('8bit', 0x267734),
    CurrentAction: create('8bit', 0x26776c),
    Season: create('8bit', 0x85a2f7),
    Day: create('8bit', 0x85a2f6),
    Hour: create('8bit', 0x85a2f5),
    Holding: create('8bit', 0x267840),
    Item: (index: number) => {return create('8bit', 0x85a2a0 + index) }
}

interface dog {
    IsAdopted: Partial<Condition.Data>
    PerformingHeel: Partial<Condition.Data>
    PerformingSit: Partial<Condition.Data>
    PerformingLayDown: Partial<Condition.Data>
    PerformingCows: Partial<Condition.Data>
    /** 0x1f = One heart
        0x51 = Two hearts
        0x82 = Three hearts
        0xb4 = Four hearts
        0xdc = Five hearts*/
    AP: Partial<Condition.Data>

}

export const Dog: dog = {
    IsAdopted: create('Bit0', 0x859fe0),
    PerformingHeel: create('Bit6', 0x859fe1),
    PerformingSit: create('Bit0', 0x859fe2),
    PerformingLayDown: create('Bit1', 0x859fe2),
    PerformingCows: create('Bit4', 0x859fe3),
    AP: create('8bit', 0x859ffa)
}

interface horse {
    IsAdopted: Partial<Condition.Data>
    /** 0x1e = First heart
        0x50 = Two hearts
        0x8c = Three hearts
        0xc8 = Four hearts
        0xf0 = Five hearts*/
    AP: Partial<Condition.Data>
}

export const Horse: horse = {
    IsAdopted: create('Bit0', 0x859fc0),
    AP: create('8bit', 0x859fc8)
}

export function Event(index: number): Partial<Condition.Data> {

    return create(sizeDict[index%8],0x80d980 + Math.floor(index/8))
}

