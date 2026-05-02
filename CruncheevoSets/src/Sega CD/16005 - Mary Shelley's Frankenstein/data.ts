import { define as $, Condition, ConditionBuilder } from '@cruncheevos/core'
import { calculation, comparison, create, sizeDict, wiiAddAddress } from '../../helpers.js'
import * as fs from 'fs'


export const chapter: Partial<Condition.Data> = create('16bit', 0x160d8)

/**0x0 = Empty Slot

Act 1:
0x3e9 = Acid Spray
0x3eb = Bread (Heals 40)
0x3ec = Chloroform
0x3ed = Victor's Key

Act 2:
0x3ef = Cell Key
0x3f0 = Dry hay
0x3f1 = Feed bag
0x3f2 = Sleeping potion
0x3f3 = Chicken Leg

Act 3:
0x3f4 = Manure
0x3f5 = Shears
0x3f6 = Hot Soup (Heals 40)
0x3f7 = Lucky Charm
0x3f8 = Pearl Necklace
0x3f9 = Roast Chicken (Heals 40)
0x3fa = Cookies (Heals 40)
0x3fb = Big Pumpkin
0x3fc = Recorder

Act 4:
0x3fb = Big Pumpkin
0x3fd = Nails
0x3fe = Matches
0x400 = Old Man's Shed Key
0x401 = Cake (Heals 40)
0x403 = Grocery Bag
0x404 = Rat Trap
0x405 = Flowers
0x408 = Candle Opera
0x409 = Coin 1 (for matches)
0x40a = Coin 2 (painting man)
0x40b = Coin 3 (painting man)
0x40c = Old Woman's Key
0x40d = Coin 4 (rat trap)
0x40e = Coin 5

Act 5:
0x40e = Coin 5
0x40f = Twine
0x410 = Body Parts
0x411 = Diary
0x412 = Wall Chart

Act 6:
0x40e = Coin 5
0x40f = Twine
0x410 = Body Parts
0x411 = Diary
0x412 = Wall Chart
0x413 = A Live Rat
0x414 = Iodine

Act 7:
0x415 = Lantern
0x416 = A Piece of Tarpaulin */
export const inventory: Array<Partial<Condition.Data>> = Array(8).fill(null).map((_, i) => create('16bit', 0x1e5c0 + 2 * i)) 

export const playerHealth: [ConditionBuilder, Partial<Condition.Data>] = [
    $(
        'I:0x138a8',
        'I:0xX10076'
    ),
    create('8bit', 0xe65e)
]

export const lives: [ConditionBuilder, Partial<Condition.Data>] = [
    $(
        'I:0x138a8',
        'I:0xX10076'
    ),
    create('8bit', 0xe662)
]

/**Act 1:
0x0 = Starting room with electric eels
0x1 = Room with bread and acid
0x2 = Store Room
0x3 = Lab Entryway
0x4 = Victor's Bedroom

Act 2:
0x5 = Alchemist's Shop
0x6 = The Jailor's House
0x7 = Jail Cells
0x8 = General Store
0x9 = Stables
0xa = Store Owner's House
0xb = City Guard Room
0xc = Sewer behind Guard Room?
0xd = Back Alley
0xe = Pig Courtyard
0xf = Market by Gate
0x10 = Outside the City Gate

Act 3:
0x0 = Path to Chicken Cabin
0x1 = Mushroom Trees
0x2 = Left Clearing
0x3 = Wood's Crossroads
0x4 = Clearing with 2 Entrances
0x5 = Outside Outlaw's Camp
0x6 = Clearing with 3 Entrances
0x7 = Clearing with 2 Entrances
0x8 = Clearing with 3 Entrances w/ Skunk
0x9 = Spider Clearing
0xa = Flower Clearing
0xb = Wolf Clearing
0xc = Large clearing with 2 Entrances
0xd = Small path
0xe = Clearing with 2 Entrances
0xf = Forest Path
0x10 = Bug clearing
0x11 = Large Clearing with 2 Entrances
0x12 = Outside Chicken Cabin
0x13 = Outside Barn
0x14 = Outside Pumpkin Cottage
0x15 = Old Lady's House
0x16 = A Barn
0x17 = Pumpkin Cottage Front Door
0x18 = Inside Pumpkin Cottage
0x19 = Pumpkin Field
0x1a = Old Man Clearing
0x1b = Carriage Away
0x1c = Outlaw's Camp

Act 4:
0x0 = Ouside City Gates
0x1 = Outside General Store
0x2 = Outside Market Stall
0x3 = Outside Old Woman's House
0x4 = Frankenstein's Gate
0x5 = Outside Frankenstein's Mansion
0x6 = Frankenstein's Back Entrance
0x7 = Grocery Stall
0x8 = General Store
0x9 = Painting House
0xa = Opulent Garden
0xb = Old Man's House
0xc = Old Man's Shed
0xd = Old Man's Yard
0xe = Old Woman's House
0xf = Old Woman's Yard
0x10 = Ground Floor Hallway
0x11 = Upper Hallway
0x12 = The Kitchen
0x13 = William's Room
0x14 = Elizabeth's Bedroom
0x15 = The Attic
0x16 = City Tunnel
0x17 = Zoomed in on Frankenstein's Gate

Act 5:
0x0 = Back Alley
0x1 = Fox Courtyard
0x2 = Inside the Gate
0x3 = Outside the Gate
0x4 = Victor's Bedroom
0x5 = Jail
0x6 = Market Stall
0x7 = Stables
0x8 = Lab Entryway
0x9 = Sewer
0xa = Guard's Quarters
0xb = Lab Hallway

Act 6:
0x0 = Outside City Market
0x1 = Outside City Gate
0x2 = Outside Old Woman's House
0x3 = Outside General Store
0x4 = Mansion Gates
0x5 = Frankenstein's Back Entrance
0x6 = Outside Frankenstein's Mansion
0x7 = The Kitchen
0x8 = Ground Floor Hallway
0x9 = Upper Hallway
0xa = The Attic
0xb = General Store
0xc = City Tunnel
0xd = Zoomed in on Mansion Gates

Act 7:
0x0 = Inside Boat
0x1 = Above Deck
0x2 = Above Deck 2
0x3 = Above Deck 3
0x4 = On Ice */
export const room: [ConditionBuilder, Partial<Condition.Data>] = [
    $(
        'I:0x138a8',
        'I:0xX10076'
    ),
    create('8bit', 0xe686)
]

/** 0x25 -> 0x26 The final speech bubble with William */
export const convo: [ConditionBuilder, Partial<Condition.Data>] = [
    $(
        'I:0x138a8',
        'I:0xX10076'
    ),
    create('8bit', 0x10650)
]

/** Items available to have in each chapter, indexed by chapter number*/
export const availableItems: Array<Array<number>> = [
    [],
    [0x3e9, 0x3eb, 0x3ec, 0x3ed],
    [0x3ef, 0x3f0, 0x3f1, 0x3f2, 0x3f3],
    [0x3f4, 0x3f5, 0x3f6, 0x3f7, 0x3f8, 0x3f9, 0x3fa, 0x3fb, 0x3fc],
    [0x3fb, 0x3fd, 0x3fe, 0x400, 0x401, 0x403, 0x404, 0x405, 0x408, 0x409, 0x40a, 0x40b, 0x40c, 0x40d, 0x40e],
    [0x40e, 0x40f, 0x410, 0x411, 0x412],
    [0x40e, 0x40f, 0x410, 0x411, 0x412, 0x413, 0x414],
    [0x415, 0x416]
]

/** What room in each chapter is the last chapter, indexed by chapter number*/
export const endingRooms: Array<number> = [0, 0x3, 0x10, 0x1b, 0x15, 0x3, 0xa, 0x4]

export const battleptr: Partial<Condition.Data> = create('16bit', 0x638)