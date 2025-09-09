import { define as $, Condition, ConditionBuilder } from '@cruncheevos/core'
import * as fs from 'fs'
import * as commentjson from 'comment-json'
const collectablesData = commentjson.parse(fs.readFileSync('./src/PS2/24497 - Rugrats Royal Ransom/collectables.json', 'utf8'))

/*


Regular Addresses


*/




/** $3D277C: [8-bit] Level ID, switches as soon as you select a menu option to enter or exit level
          0x01 = Rugrat Rug Race
          0x02 = Meanie Genie
          0x03 = temple of the lamp
          0x04 = Mr. Snowtato Head
          0x05 = Ready, Set, Snow
          0x07 = Snowplace to Hide
          0x08 = River Fun Run
          0x09 = Punting Papayas
          0x0a = Monkey Business
          0x0b = Cone Caper
          0x0c = Acrobatty Dash
          0x0d = Cream Pie Flyer
          0x0e = Sub-a-Dub-Dub
          0x10 = Hot Cod Racer
          0x11 = Fly High Egg Hunt
          0x12 = Rex Riding
          0x14 = Bow and Apple
          0x15 = The Holey Pail
          0x17 = Moon Buggy Madness
          0x18 = Cheesy Chase
          0x19 = Rise of the Anjellyuns
          0x1a = Stormin' the Castle
          0x1b = Play Palace 3000/Menus
          
          Minigame ID
          0x1e = Carrot Catchers
          0x20 = Ring Roller Coaster
          0x24 = Target Bash
          0x25 = Get the Sled Out
          0x26 = Snow-K Corral
          0x28 = River Race
          0x29 = Double Subble Trouble
          0x2b = Loopy Hoop Race
          0x2d = Loopy Hoop Race 2
          0x2c = Lunar 500
          0x2e = Target Time
          0x2f = Chuck and Duck
          0x30 = Double Scoop Cone Zone */
export let levelIDInstant: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3d277c }, rvalue: { type: 'Mem', size: '8bit', value: 0x3d277c }
}

/** $3F64DC: [8-bit] Level ID, currently loaded level */
export let levelIDLoaded: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64DC }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64DC } 
}

/** $3F64E4: [8-bit] Which baby are you controlling / player 1 in minigames

          0x0 = Chuckie
          0x1 = Lil
          0x2 = Phil
          0x3 = Angelica
          0x4 = Tommy
          0x5 = Kimi
          0x6 = Suzie
          0x7 = Dil
          0x8 = Lou
          0x9 = Stu */
export let baby: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64E4 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64E4 }
}

/** $3F64E8: [8-bit] What character player 2 is in minigames
          See 0x3f64e4 for ids */
export let babyTwo: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64E8 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64E8 }
}

/** $3F64EC: [8-bit] Gameplay ID
          0x01 = On title screen
          0x02 = In main menus
          0x03 = In game */
export let gameplayID: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64EC }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64EC }
}

/** $3F64F0: [8-bit] Current Number of Players, only changes to 2 once a 2 player minigame is loaded, remains 1 while on the character select menu */
export let currentNumberOfPlayers: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64F0 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64F0 }
}

/** $3F64F8: [32-bit] Current funny money
          Starts at 0x0 at the start of a save file */
export let currentFunnyMoney: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x3F64F8 }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F64F8 }
}

/** $3F64FC: [32-bit] Current coins
          Starts at 0x01f4 at the start of a save file */
export let currentCoins: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x3F64FC }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F64FC }
}

/** $3F6500: [32-bit] Current big batteries
          Starts at 0x0 at the start of a save file */
export let currentBigBatteries: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x3F6500 }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F6500 }
}

/** $3F6504: [32-bit] Currnet small batteries
          Starts at 0x0 at the start of a save file */
export let currentLittleBatteries: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x3F6504 }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F6504 }
}

/** $3F6508: [8-bit] Difficulty of last loaded game
          0x00 - Baby Easy
          0x01 - Rugrat Normal
          0x02 - Reptar Tough */
export let difficulty: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F6508 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F6508 }
}

/** $3F82C0: [8-bit, bitfield] Collected little batteries on the Play Center 3000
          bit0 = Hover-vator room battery
          bit1 = Snow slide battery
          bit2 = Tree stump battery */
export let collectedLittleBatteriesOnThePlayCenter3000: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F82C0 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F82C0 }
}

/** $41b10c: [8-bit] Paused menu open
          0x00 - No
          0x01 - Yes, and some other niche times like flashing in a loading screen */
export let pauseScreen: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x41b10c }, rvalue: { type: 'Mem', size: '8bit', value: 0x41b10c }
}

/** $50B944: [32-bit] Pointer main linked lists, data only appears when relevent to current level */
export let mainPointer: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x50B944 }, rvalue: { type: 'Mem', size: '32bit', value: 0x50B944 }
}




/*

Arrays

*/



/** $3F6514: [32-bit][Array of 104 bytes] Level unlocked, indexed by level id starting at index 1, see list of id's in 0x3d277c
          0x00 - No
          0x01 - Yes */
export function levelUnlocked(levelID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '32bit', value: 0x3F6514 + 4 * (levelID - 1) }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F6514 + 4 * (levelID - 1) }
    }
}

/** $3F65D8: [32-bit][Array of 104 bytes] Big battery collected, indexed by level id starting at index 1, see list of id's in 0x3d277c

          0x00 = No
          0x01 = Yes

          Note that you never collect the big battery in Stormin' the Castle (0x1a), the game boots out to the main menu without turning to a 0x01 */
export function bigBatteryCollected(levelID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '32bit', value: 0x3F65D8 + 4 * (levelID - 1) }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F65D8 + 4 * (levelID - 1) }
    }
}

/** $3F6698: [32-bit][Array of 148 bytes] Is the xth item in the shop available to be purchased, 37 items total
          0x00 = No
          0x01 = Yes

          Notable entry, item 36
          0x003f6724 = Secret Funny Money */
export function shopItemAvailable(levelID: number): Partial<Condition.Data> {
    return {
          lvalue: { type: 'Mem', size: '32bit', value: 0x3F6698 + 4 * (levelID - 1) }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F6698 + 4 * (levelID - 1) }
    }
}

/** $3F672C: [32-bit][Array of 148 bytes] Has the xth item in the shop been purchased, 37 items total
          0x00 = No
          0x01 = Yes

          Notable entry, item 36
          0x003f67b8 = Secret Funny Money */
export function shopItemPurchased(itemID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '32bit', value: 0x3F672C + 4 * (itemID - 1) }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F672C + 4 * (itemID - 1) }
    }
}
 
/** [16-bit][Array of 54 bytes] Little batteries shown as left to collect in level on level select screen, indexed by level id starting at 1, see list of id's in 0x3d277c

The game is wrong about how many little batteries there are in a level on occasion, these values can and will go negative if you collect more than the game thinks there are */
export function littleBatteriesLeft(itemID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '16bit', value: 0x3F98C2 + 2 * (itemID - 1) }, rvalue: { type: 'Mem', size: '16bit', value: 0x3F98C2 + 2 * (itemID - 1) }
    }
}

/**  	
 * [16 - bit][Array of 54 bytes] Funny money amount in dollars shown as left to collect in level on level select screen, indexed by level id starting at 1, see list of id's in 0x3d277c
 * 
    The game is incorrect on the amount left to find in levels on occasion, both over and underestimating the amount.The value will go negative if you collect more than the game thinks is available, but in game negative numbers will appear as $0 */
export function funnyMoneyLeft(levelID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '16bit', value: 0x3F9924 + 2 * (levelID - 1) }, rvalue: { type: 'Mem', size: '16bit', value: 0x3F9924 + 2 * (levelID - 1) }
    }
}





/*


Chains


*/





/* $3F68C0:  	
[Array of 6912 bytes] Collectables gathered in up to a 96 - bit bitfield for each level, funny money stacks first, followed by little batteries

Spaced 0x100 apart, index by(Level Id - 1) * 0x100, see list of Id's in 0x3d277c

See github for collectables.json for data on how the data is stored in the bitfields in each level per difficulty */

/**
 * Provides an Add Source chain that provides total amount of cash stacks found in a level and asks if it's equal to the amount needed to 100% that level
 */
export function chainFunnyMoneyStacksCollected( levelID: number, difficulty: number, ifDelta: boolean = false): ConditionBuilder  {

    let output: ConditionBuilder = $()

    const levelData = collectablesData!['0x' + (+levelID).toString(16)][difficulty.toString()]

    let amountOfFunnyMoneyStacks: number = levelData.totalCollectables - levelData.littleBatteries
    let amountOfFunnyMoneyStacksNeeded: number = 0

    if ('funnyMoneyStacksMissing' in levelData) {
        amountOfFunnyMoneyStacksNeeded = amountOfFunnyMoneyStacks - levelData.funnyMoneyStacksMissing
    }
    else {
        amountOfFunnyMoneyStacksNeeded = amountOfFunnyMoneyStacks
    }
    

    let i: number = 0

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

    while (true) {

        if (amountOfFunnyMoneyStacks >= 8) {
            output = $(
                output,
                !ifDelta && ['AddSource', 'Mem', 'BitCount', 0x3f68c0 + 0x100 * (levelID - 1) + i],
                ifDelta && ['AddSource', 'Delta', 'BitCount', 0x3f68c0 + 0x100 * (levelID - 1) + i]
            )
            i = i + 1
            amountOfFunnyMoneyStacks = amountOfFunnyMoneyStacks - 8
        }

        if (amountOfFunnyMoneyStacks < 8) {

            for (let j = 0; j < amountOfFunnyMoneyStacks; j++) {
                output = $(
                    output,
                    !ifDelta && ['AddSource', 'Mem', sizeDict[j], 0x3f68c0 + 0x100 * (levelID - 1) + i],
                    ifDelta && ['AddSource', 'Delta', sizeDict[j], 0x3f68c0 + 0x100 * (levelID - 1) + i]
                )
            }

            if (output.conditions.length == 0) {
                return $()
            }

            if (!ifDelta) {
                output = output.withLast({
                    flag: '',
                    cmp: '=',
                    rvalue: {
                        type: 'Value',
                        value: amountOfFunnyMoneyStacksNeeded
                    }
                })
            }
            else {
                output = output.withLast({
                    flag: '',
                    cmp: '=',
                    rvalue: {
                        type: 'Value',
                        value: amountOfFunnyMoneyStacksNeeded - 1
                    }
                })
            }
            

            break
        }
    }

    return output 
    
}

/* $3F68C0:  	
[Array of 6912 bytes] Collectables gathered in up to a 96 - bit bitfield for each level, funny money stacks first, followed by little batteries

Spaced 0x100 apart, index by(Level Id - 1) * 0x100, see list of Id's in 0x3d277c

See github for collectables.json for data on how the data is stored in the bitfields in each level per difficulty */

/**
 * Provides an Add Source chain that provides total amount of little batteries found in a level and asks if it's equal to the amount needed to 100% that level
 */
export function chainLittleBatteriesCollected(levelID: number, difficulty: number, ifDelta: boolean = false): ConditionBuilder {
    let output: ConditionBuilder = $()

    const levelData = collectablesData!['0x' + (+levelID).toString(16)][difficulty.toString()]

    let amountOfFunnyMoneyStacks: number = levelData.totalCollectables - levelData.littleBatteries

    let totalBatteries: number = 0
    if ('littleBatteriesMissing' in levelData) {
        totalBatteries = levelData.littleBatteries - levelData.littleBatteriesMissing
    }
    else {
        totalBatteries = levelData.littleBatteries
    }

    let i: number = Math.floor(amountOfFunnyMoneyStacks / 8)
    let j: number = amountOfFunnyMoneyStacks % 8

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

    for (let k: number = 0; k < levelData.littleBatteries; k++) {
        if (j == 8) {
            j = 0
            i = i + 1 
        }

        output = $(
            output,
            !ifDelta && ['AddSource', 'Mem', sizeDict[j], 0x3f68c0 + 0x100 * (levelID - 1) + i],
            ifDelta && ['AddSource', 'Delta', sizeDict[j], 0x3f68c0 + 0x100 * (levelID - 1) + i]
        )

        j = j + 1
    }

    if (output.conditions.length == 0) {
        return $()
    }

    if (!ifDelta) {
        output = output.withLast({
            flag: '',
            cmp: '=',
            rvalue: {
                type: 'Value',
                value: totalBatteries
            }
        })
    }
    else {
        output = output.withLast({
            flag: '',
            cmp: '=',
            rvalue: {
                type: 'Value',
                value: totalBatteries - 1
            }
        })
    }

    return output

}

/** Accessing one element in the linked list, forwards or backwards
 * Ends with Add Address Value 0x0 if accessNode is true, and the previous Add Address Value 0x14/0x10 if false
 */
export function chainLinkedListData(node: number, ifForward: boolean = true, accessNode: boolean = true, rememberNode: boolean = false): ConditionBuilder {

    let chain: ConditionBuilder = $(
        $(['AddAddress', '', '', 0]).withLast({ lvalue: mainPointer.lvalue }),
        ifForward && ['AddAddress', 'Mem', '32bit', 0x10],
        !ifForward && ['AddAddress', 'Mem', '32bit', 0x44],
        !ifForward && ['AddAddress', 'Mem', '32bit', 0x30]
    )


    let i: number = 0

    while (i < node) {
        chain = $(
            chain,
            ifForward && ['AddAddress', 'Mem', '32bit', 0x14],
            !ifForward && ['AddAddress', 'Mem', '32bit', 0x10]
        )
        i = i + 1
    }

    return $(chain, accessNode && ['AddAddress', 'Mem', '32bit', 0x0], rememberNode && ['Remember', 'Mem', '32bit', 0x0])
}

   

/** Checks if every element of the linked list between startnode and endnode satisfies the conditions 
 * Uses R/R so will only be more effecient than doing them one at a time if you are testing more than a few nodes */
export function chainLinkedListDataRange(startnode: number, endnode: number, conditions: Array<ConditionBuilder>, ifForward: boolean = true): ConditionBuilder {

    let i: number = endnode - startnode
    let chain: ConditionBuilder = chainLinkedListData(startnode, ifForward, false).withLast({ flag: 'Remember' })
    let nextRowForward: ConditionBuilder = $('I:{recall}', ['Remember', 'Mem', '32bit', 0x14])
    const nextRowBackward = $('I:{recall}', ['Remember', 'Mem', '32bit', 0x10])
   
    while (i >= 0) {
        for (const condition of conditions) {
            chain = $(
                chain,
                'I:{recall}',
                ['AddAddress', 'Mem', '32bit', 0x0],
                condition
            )
        }

        chain = $(
            chain,
            (i != 0) && ifForward && nextRowForward,
            (i != 0) && !ifForward && nextRowBackward
        )

        i = i -1
    }

    return chain 
}




/*



Linked List Final Offsets



*/



/** Float, Full is 1.0, empty is 0.0 */
export let healthCounter: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x7b4 }, rvalue: { type: 'Mem', size: 'Float', value: 0x7b4 }
}

/** 16-bit, 3 nodes total, only one counts all 3 rounds and goes from 0 to 300 */
export let scarabCounter: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x234 }, rvalue: { type: 'Mem', size: '16bit', value: 0x234 }
}

/** 16-bit */
export let itemCounter: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x8d4 }, rvalue: { type: 'Mem', size: '16bit', value: 0x8d4 }
}

/** 16-bit, only used in Monkey Madness and Cream Pie Flyer I believe */
export let itemTwoCounter: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x8d6 }, rvalue: { type: 'Mem', size: '16bit', value: 0x8d6 }
}

export let monkeyGrabbed: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0xa54 }, rvalue: { type: 'Mem', size: '16bit', value: 0xa54 }
}

export let papayaHeld: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x2f8 }, rvalue: { type: 'Mem', size: '16bit', value: 0x2f8 }
}

export let papayaNotUnderTree: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x74 }, rvalue: { type: 'Mem', size: '16bit', value: 0x74 }
}

/** Used in Acrobatty Dash and Holey Pail, final locations are 0x28 and 0x21 respectively */
export let helperBallPosition: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0xaf8 }, rvalue: { type: 'Mem', size: '16bit', value: 0xaf8 }
}

/** 16-bit, Used in Ring Roller Coaster, final ring is 0x12 */
export let ringCounter: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x1f4 }, rvalue: { type: 'Mem', size: '16bit', value: 0x1f4 }
}

/** Float, Used in Ring Roller Coaster, counts up from 0 to 60, breaking a target subtracts 5 */
export let ringTimer: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x9b0 }, rvalue: { type: 'Mem', size: 'Float', value: 0x9b0 }
}

/** 16-bit, Used in Rugrat Rug Race, end of laps are at multiples of 0x73 */
export let discreteMap: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x208 }, rvalue: { type: 'Mem', size: '16bit', value: 0x208 }
}

/** Float, counts up from 0 to 1 */
export let continuousMap: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0xcc8 }, rvalue: { type: 'Mem', size: 'Float', value: 0xcc8 }
}

/** Float, used in Acrobatty Dash, counts down to 0, increases each time you touch the helper ball */
export let timer: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0xcfc }, rvalue: { type: 'Mem', size: 'Float', value: 0xcfc }
}

/** 16-bit, used in Cone Caper, 0 before starting the boss, 7 is the end, odd # minion phases, even # vunerable phase */
export let bossPhase: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x3fc }, rvalue: { type: 'Mem', size: '16bit', value: 0x3fc }
}

/** 16-bit, used in hub world, 0 yard, 1-3 floors 1-3, 4 reserved for Angelica */
export let babyFloor: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '16bit', value: 0x7e8 }, rvalue: { type: 'Mem', size: '16bit', value: 0x7e8 }
}

/** Float, horizontal position */
export let XPos: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x0 }, rvalue: { type: 'Mem', size: 'Float', value: 0x0 }
}

/** Float, vertical position */
export let ZPos: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x4 }, rvalue: { type: 'Mem', size: 'Float', value: 0x4 }
}

/** Float, horizontal position */
export let YPos: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x8 }, rvalue: { type: 'Mem', size: 'Float', value: 0x8 }
}

/** Float, may or may not be 100% true, only used for Baby Marv to test a door opening, rotation of an object along some axis */
export let rotationPos: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0xc }, rvalue: { type: 'Mem', size: 'Float', value: 0xc }
}

/** 8-bit, 1 if in third person, 0 if in first person, might break while on a mount */
export let inThirdPerson: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x258 }, rvalue: { type: 'Mem', size: '8bit', value: 0x258 }
}

/** Float, while in first person, x coordinate of the unit sphere vector for direction */
export let XFirstCameraAngle: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x5e0 }, rvalue: { type: 'Mem', size: 'Float', value: 0x5e0 }
}

/** Float, while in first person, z coordinate of the unit sphere vector for direction, locked between -.6 and .6999... */
export let ZFirstCameraAngle: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x5e4 }, rvalue: { type: 'Mem', size: 'Float', value: 0x5e4 }
}

/** Float, while in first person, y coordinate of the unit sphere vector for direction */
export let YFirstCameraAngle: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x5e8 }, rvalue: { type: 'Mem', size: 'Float', value: 0x5e8 }
}

/** 8-bit, 1 if the black bars in cutscenes aren't present, 0 if they are */
export let notWideScreen: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x26c }, rvalue: { type: 'Mem', size: '8bit', value: 0x26c }
}

/** Float, used in Holey Pail, counts down to 0 seconds, starts at different values depending on difficulty I think, 2.0 on tough */
export let shoesPowerUp: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x928 }, rvalue: { type: 'Mem', size: 'Float', value: 0x928 }
}

/** Float, used in Holey Pail, counts down to 0 seconds, starts at different values depending on difficulty I think, 20.0 on tough */
export let shieldPowerUp: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x92c }, rvalue: { type: 'Mem', size: 'Float', value: 0x92c }
}

/** Float, used in Holey Pail, counts down to 0 seconds, starts at different values depending on difficulty I think, 20.0 on tough */
export let potionPowerUp: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: 'Float', value: 0x930 }, rvalue: { type: 'Mem', size: 'Float', value: 0x930 }
}





/*



Non-memory data



*/






/** [Floor unlcoked][Difficulty] = number of big battteries needed */
export const floorUnlockedDicts = {
    2: { 0: 0x3, 1: 0x3, 2: 0x5 },
    3: { 0: 0x8, 1: 0x9, 2: 0xd },
    4: { 0: 0xd, 1: 0xf, 2: 0x14 }
}

/** Takes in baby order in linked list, and outputs babyID number */
export const babyIdentificationDict = {
    0: 4,
    1: 5,
    2: 2,
    3: 1,
    4: 0
}

/** [levelID] = what floor of the play palace the entrance is */
export const levelOnFloorDict = {
    0x01 : 2,
    0x02 : 2,
    0x03 : 2,
    0x04 : 1,
    0x05: 1,
    0x07: 1,
    0x08: 1,
    0x09: 1,
    0x0a: 1,
    0x0b: 2,
    0x0c: 2,
    0x0d: 2,
    0x0e: 2,
    0x10: 2,
    0x11: 3,
    0x12: 3,
    0x14: 3,
    0x15: 3,
    0x17: 3,
    0x18: 3,
    0x19: 3,
    0x1a: 4,
    0x1b: 0
}

export const levelNamesAchData = {
    0x01: { title: 'Rugrat Rug Race', achTitle: 'Way to Burn Rugger!', points: 3 , id: 541538, badge: 616321 },
    0x02: { title: 'Meanie Genie', achTitle: 'You\'re a Real Lamp Champ', points: 4, id: 541539, badge: 616320 },
    0x03: { title: 'Temple of the Lamp', achTitle: 'Not as Good as Mr. Fluffles', points: 2, id: 541540, badge: 616322 },
    0x04: { title: 'Mr. Snowtato Head', achTitle: 'Let\'s Make a Snowbaby', points: 1, id: 541541, badge: 615871 },
    0x05: { title: 'Ready, Set, Snow', achTitle: 'You\'re a Snow Pro!', points: 3, id: 541542, badge: 615872 },
    0x07: { title: 'Snowplace to Hide', achTitle: 'If Only I Had My Screwdriver...', points: 1, id: 541543, badge: 615873 },
    0x08: { title: 'River Fun Run', achTitle: 'Race to the Jungle Beaver Medicine', points: 10, id: 541544, badge: 615877 },
    0x09: { title: 'Punting Papayas', achTitle: 'You Should Be a Papaya Crate-r!', points: 3, id: 541545, badge: 615878 },
    0x0a: { title: 'Monkey Business', achTitle: 'I Went on a Jungle Gym Once', points: 3, id: 541546, badge: 615879 },
    0x0b: { title: 'Cone Caper', achTitle: 'Under This Freak Show, I\'m a Regular Guy', points: 4, id: 541547, badge: 616406 },
    0x0c: { title: 'Acrobatty Dash', achTitle: 'Astrobats Flying Through the Air', points: 3, id: 541548, badge: 616407 },
    0x0d: { title: 'Cream Pie Flyer', achTitle: 'The Ring Monster\'s Trial', points: 10, id: 541549, badge: 616408 },
    0x0e: { title: 'Sub-a-Dub-Dub', achTitle: 'Scrubmarine to the Rescue!', points: 2, id: 541550, badge: 616217 },
    0x10: { title: 'Hot Cod Racer', achTitle: 'That\'s Them, the Sea Monies', points: 3, id: 541551, badge: 616218 },
    0x11: { title: 'Fly High Egg Hunt', achTitle: 'How Many Is a Gross of Eggs?', points: 5, id: 541552, badge: 0},
    0x12: { title: 'Rex Riding', achTitle: 'Where\'s Reptar?', points: 5, id: 541553, badge: 0},
    0x14: { title: 'Bow and Apple', achTitle: 'The Days of Shovelry', points: 10, id: 541554, badge:0 },
    0x15: { title: 'The Holey Pail', achTitle: 'The Knightses of the Sand Table', points: 4, id: 541555, badge:0 },
    0x17: { title: 'Moon Buggy Madness', achTitle: 'Driving with Less Grabity', points: 3, id: 541556, badge: 0},
    0x18: { title: 'Cheesy Chase', achTitle: 'Moon Cheese Comes from Moon Graters', points: 3, id: 541557, badge: 0},
    0x19: { title: 'Rise of the Anjellyuns', achTitle: 'Lonely Space Vixens', points: 4, id: 541558, badge: 0}

}

export const littleBatteryAchData = {
    0x01: { title: 'snow', achTitle: 'Cold Fusion', points: 5, levelArray: [0x4, 0x5, 0x7], id: 541559, badge: 615842 },
    0x02: { title: 'jungle', achTitle: 'Photosynthetic Energy', points: 5, levelArray: [0x8, 0x9, 0xa], id: 541560, badge: 615843 },
    0x03: { title: 'undersea', achTitle: 'Hydropower Energy', points: 5, levelArray: [0xe, 0x10], id: 541561, badge: 615844 },
    0x04: { title: 'Arabian', achTitle: 'Solar Energy', points: 5, levelArray: [0x1, 0x2, 0x3], id: 541562, badge: 616030 },
    0x05: { title: 'circus', achTitle: 'Scream Energy', points: 5, levelArray: [0xb, 0xc, 0xd], id: 541563, badge: 615846 },
    0x06: { title: 'dino', achTitle: 'Fossil Fuels', points: 5, levelArray: [0x11, 0x12], id: 541564, badge:0 },
    0x07: { title: 'Moon', achTitle: 'Lunar Energy', points: 5, levelArray: [0x17, 0x18, 0x19], id: 541565, badge: 0},
    0x08: { title: 'Medieval', achTitle: 'Were These Even Invented Yet?', points: 5, levelArray: [0x14, 0x15], id: 541566, badge: 0}
}

export const funnyMoneyAchData = {
    0x01: { title: 'snow', achTitle: 'Frozen Assets', points: 10, levelArray: [0x4, 0x5, 0x7], id: 541567, badge: 615850 },
    0x02: { title: 'jungle', achTitle: 'Your Papaya Paycheck', points: 10, levelArray: [0x8, 0x9, 0xa], id: 541568, badge: 615851 },
    0x03: { title: 'undersea', achTitle: 'Jackpot at the Seahorse Track', points: 10, levelArray: [0xe, 0x10], id: 541569, badge: 615852 },
    0x04: { title: 'Arabian', achTitle: 'Accessing Your Offshore Account', points: 10, levelArray: [0x1, 0x2, 0x3], id: 541570, badge: 615853 },
    0x05: { title: 'circus', achTitle: 'Avoiding Clowngrades', points: 10, levelArray: [0xb, 0xc, 0xd], id: 541571, badge: 615854 },
    0x06: { title: 'dino', achTitle: 'Their Bones Are Their Money', points: 10, levelArray: [0x11, 0x12], id: 541572, badge: 0},
    0x07: { title: 'Moon', achTitle: 'The Moon Might Not Be Made of Cheese, but It Does Have a Lot of Cheddar', points: 10, levelArray: [0x17, 0x18, 0x19], id: 541573, badge:0 },
    0x08: { title: 'Medieval', achTitle: 'Investing Early', points: 10, levelArray: [0x14, 0x15], id: 541574, badge: 0},
    0x09: { title: 'Stomin\' the Castle', achTitle: 'Your Treasury Bond Has Matured', points: 10, levelArray: [0x1a], id: 541575, badge: 0}
}




