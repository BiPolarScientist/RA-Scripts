import { define as $, Condition, ConditionBuilder } from '@cruncheevos/core'

/*


Regular Addresses


*/




/* $3D277C: [8-bit] Level ID, switches as soon as you select a menu option to enter or exit level
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

// $3F64DC: [8-bit] Level ID, currently loaded level
export let levelIDLoaded: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64DC }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64DC } 
}

// $3F64E4: [8-bit] Which baby are you controlling / player 1 in minigames
//          
//          0x0 = Chuckie
//          0x1 = Lil
//          0x2 = Phil
//          0x3 = Angelica
//          0x4 = Tommy
//          0x5 = Kimi
//          0x6 = Suzie
//          0x7 = Dil
//          0x8 = Lou
//          0x9 = Stu
export let baby: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64E4 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64E4 }
}

// $3F64E8: [8-bit] What character player 2 is in minigames
//          See 0x3f64e4 for ids
export let babyTwo: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64E8 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64E8 }
}

// $3F64EC: [8-bit] Gameplay ID
//          0x01 = On title screen
//          0x02 = In main menus
//          0x03 = In game
export let gameplayID: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64EC }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64EC }
}

// $3F64F0: [8-bit] Current Number of Players, only changes to 2 once a 2 player minigame is loaded, remains 1 while on the character select menu
export let currentNumberOfPlayers: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F64F0 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F64F0 }
}

// $3F64F8: [32-bit] Current funny money
//          Starts at 0x0 at the start of a save file
export let currentFunnyMoney: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x3F64F8 }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F64F8 }
}

// $3F64FC: [32-bit] Current coins
//          Starts at 0x01f4 at the start of a save file
export let currentCoins: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x3F64FC }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F64FC }
}

// $3F6500: [32-bit] Current big batteries
//          Starts at 0x0 at the start of a save file
export let currentBigBatteries: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x3F6500 }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F6500 }
}

// $3F6504: [32-bit] Currnet small batteries
//          Starts at 0x0 at the start of a save file
export let currnetSmallBatteries: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x3F6504 }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F6504 }
}

// $3F6508: [8-bit] Difficulty of last loaded game
//          0x00 - Baby Easy
//          0x01 - Rugrat Normal
//          0x02 - Reptar Tough
export let difficulty: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F6508 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F6508 }
}

// $3F82C0: [8-bit, bitfield] Collected little batteries on the Play Center 3000
//          bit0 = Hover-vator room battery
//          bit1 = Snow slide battery
//          bit2 = Tree stump battery
export let collectedLittleBatteriesOnThePlayCenter3000: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x3F82C0 }, rvalue: { type: 'Mem', size: '8bit', value: 0x3F82C0 }
}

// $41b10c: [8-bit] Paused menu open
//          0x00 - No
//          0x01 - Yes, and some other niche times like flashing in a  loading screen
export let pauseScreen: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '8bit', value: 0x41b10c }, rvalue: { type: 'Mem', size: '8bit', value: 0x41b10c }
}

// $50B944: [32-bit] Pointer main linked lists, data only appears when relevent to current level
export let mainPointer: Partial<Condition.Data> = {
    lvalue: { type: 'Mem', size: '32bit', value: 0x50B944 }, rvalue: { type: 'Mem', size: '32bit', value: 0x50B944 }
}




/*

Arrays

*/




// $3F6514: [32-bit][Array of 104 bytes] Level unlocked, indexed by level id starting at index 1, see list of id's in 0x3d277c
//          0x00 - No
//          0x01 - Yes
export function levelUnlocked(levelID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '32bit', value: 0x3F6514 + 4 * (levelID - 1) }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F6514 + 4 * (levelID - 1) }
    }
}

// $3F65D8: [32-bit][Array of 104 bytes] Big battery collected, indexed by level id starting at index 1, see list of id's in 0x3d277c
//          
//          0x00 = No
//          0x01 = Yes
//          
//          Table of how many batteries until each extension is unlocked on each difficulty
//          {Floor number, Easy, Normal, Tough}
//          {2, 0x03, 0x03, 0x05}
//          {3, 0x08, 0x09, 0x0d}
//          {4, 0x0d, 0x0f, 0x14}
//          
//          Note that you never collect the big battery in Stormin' the Castle (0x1a), the game boots out to the main menu without turning to a 0x01
export function bigBatteryCollected(levelID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '32bit', value: 0x3F65D8 + 4 * (levelID - 1) }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F65D8 + 4 * (levelID - 1) }
    }
}

// $3F6698: [32-bit][Array of 148 bytes] Is the xth item in the shop available to be purchased, 37 items total
//          0x00 = No
//          0x01 = Yes
//          
//          Notable entry, item 36
//          0x003f6724 = Secret Funny Money
export function shopItemAvailable(levelID: number): Partial<Condition.Data> {
    return {
          lvalue: { type: 'Mem', size: '32bit', value: 0x3F6698 + 4 * (levelID - 1) }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F6698 + 4 * (levelID - 1) }
    }
}

// $3F672C: [32-bit][Array of 148 bytes] Has the xth item in the shop been purchased, 37 items total
//          0x00 = No
//          0x01 = Yes
//          
//          Notable entry, item 36
//          0x003f67b8 = Secret Funny Money
export function shopItemPurchased(levelID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '32bit', value: 0x3F672C + 4 * (levelID - 1) }, rvalue: { type: 'Mem', size: '32bit', value: 0x3F672C + 4 * (levelID - 1) }
    }
}

// $3F98C2: [16-bit][Array of 54 bytes] Little batteries left to collect in level, indexed by level id starting at 1, see list of id's in 0x3d277c
export function littleBatteriesLeft(levelID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '16bit', value: 0x3F98C2 + 2 * (levelID - 1) }, rvalue: { type: 'Mem', size: '16bit', value: 0x3F98C2 + 2 * (levelID - 1) }
    }
}

// $3F9924: [16-bit][Array of 54 bytes] Funny money amount in dollars left to collect in level, indexed by level id starting at 1, see list of id's in 0x3d277c
export function funnyMoneyLeft(levelID: number): Partial<Condition.Data> {
    return {
        lvalue: { type: 'Mem', size: '16bit', value: 0x3F9924 + 2 * (levelID - 1) }, rvalue: { type: 'Mem', size: '16bit', value: 0x3F9924 + 2 * (levelID - 1) }
    }
}





/*


Chains


*/





// $3F68C0: [64-bit, bitfield][Array of 6656 bytes] Collected funny money in a 64-bit bitfield for each level, spaced 0x100 apart, index by (Level Id-1) * 0x100, see list of Id's in 0x3d277c
//          e.g. (0x01) Rugrat Rug Race, 64-bit bitfield at 0x3f68c0
//          (0x03) Temple of the Lamp, 64-bit bitfield at 0x3f6ac0
/**
 * Provides an Add Source chain that provides total amount of cash stacks found in a level, follow it up with ['', 'Value', '', 0, (cmp), (rvalue)]
 */
export function chainFunnyMoneyStacksCollected( levelID: number): ConditionBuilder  {
    return $(
        '', '', '', '', '', '', '', ''
    ).map((c, index) => c.with({
        flag: 'AddSource',
        lvalue: {
            type: 'Mem',
            size: 'BitCount',
            value: (0x3F68C0 + (levelID * 0x100)) + index
        }}))
}

/** Accessing one element in the linked list, forwards or backwards
 * Ends with Add Address Value 0x0 if accessNode is true, and the previous Add Address Value 0x14/0x10 if false
 */
export function chainLinkedListData(node: number, ifForward: boolean = true, accessNode: boolean = true): ConditionBuilder {

    let chain: ConditionBuilder = $(
        $(['AddAddress', '', '', 0]).withLast({ lvalue: mainPointer.lvalue }),
        ifForward && ['AddAddress', 'Value', '', 0x10],
        !ifForward && ['AddAddress', 'Value', '', 0x44],
        !ifForward && ['AddAddress', 'Value', '', 0x30]
    )


    let i: number = 0

    while (i < node) {
        chain = $(
            chain,
            ifForward && ['AddAddress', 'Value', '', 0x14],
            !ifForward && ['AddAddress', 'Value', '', 0x10]
        )
        i = i + 1
    }

    return $(chain, accessNode && ['AddAddress', 'Value', '', 0x0])
}

   

/** Checks if every element of the linked list between startnode and endnode satisfies the conditions 
 * Uses R/R so will only be more effecient than doing them one at a time if you are testing more than a few nodes */
export function chainLinkedListDataRange(startnode: number, endnode: number, conditions: Array<ConditionBuilder>, ifForward: boolean = true): ConditionBuilder {

    let i: number = endnode - startnode
    let chain: ConditionBuilder = chainLinkedListData(startnode, ifForward, false).withLast({ flag: 'Remember' })
    let nextRowForward: ConditionBuilder = $('I:{recall}', ['Remember', 'Value', '', 0x14])
    const nextRowBackward = $('I:{recall}', ['Remember', 'Value', '', 0x10])
   
    while (i >= 0) {
        for (const condition of conditions) {
            chain = $(
                chain,
                'I:{recall}',
                ['AddAddress', 'Value', '', 0x0],
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




