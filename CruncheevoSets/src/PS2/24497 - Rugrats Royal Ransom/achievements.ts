import { define as $, ConditionBuilder, Condition, AchievementSet, andNext } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison } from '../../helpers.js'
import * as fs from 'fs'


function inGame(): ConditionBuilder {
    return $(comparison(data.gameplayID,'=',3))
}

/**
 * 
 * @param levelID 
 * @returns 
 * 
 * Tests if you've just gathered the big battery of the level
 * 
 */
function beatLevelOnToughFirstTime(levelID: number): ConditionBuilder {
    return $(
        comparison(data.difficulty, '=', 2),
        comparison(data.levelIDLoaded, '=', levelID),
        comparison(data.bigBatteryCollected(levelID), '=', 0, true, false),
        comparison(data.bigBatteryCollected(levelID), '=', 0)
    ) 
}

function gatheredAllLittleBatteries(levelIDArray: Array<number>, oneWorld: boolean = true): any {
    let core: ConditionBuilder = $()

    for (var id of levelIDArray) {
        core = core.also(comparison(data.littleBatteriesLeft(id), '=', 0))
    }

    if (oneWorld) {
        let i: number = 0
        let alts: Array<ConditionBuilder> = []
        for (var id of levelIDArray) {
            alts[i] = $(comparison(data.levelIDLoaded,'=',id))
            alts[i] = alts[i].also(comparison(data.littleBatteriesLeft(id), '=', 1, true, false))
            i = i + 1
        }
        let output: any = { 'core': core }
        i = 1
        for (var index in alts) {
            output['alt' + i.toString()] = alts[index]
            i = i+1
        }
        return output
    }
    else {
        return core
    }


}

function activatedHoverVator(floorUnlocked: number, difficulty: number): ConditionBuilder {
    return $(
        comparison(data.currentBigBatteries, '=', data.floorUnlockedDicts[floorUnlocked][difficulty] - 1, true, false),
        comparison(data.currentBigBatteries, '=', data.floorUnlockedDicts[floorUnlocked][difficulty]),
        comparison(data.difficulty, '=', difficulty)
    )
}


// This function is mostly used as a helper for beatLevel() in order to reset hits if the baby you are playing failed the level
// Winning and failing the level is indistinguisable without this or checking level data itself
// Not using level data which is stored in a very long linked list that has the potential to change greatly keeps consitency up, and code length down
// In comparison, the hub world level data is very simple, and only has one thing that can change at the start of the list (the presence of Angelica)
function didBabyFailLevel(levelID: number, difficulty: number, babyIdentification, angelicaPresent: number = 0): ConditionBuilder {

    if (angelicaPresent) {
        return comparison(data.levelIDLoaded, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }).andNext(  //Reset the hits if you ever leave the hub world, andNext in case the last line needs to be a reset
            comparison(data.levelIDLoaded, '=', 0x1b).withLast({ hits: 29 }),                         //Count if you've loaded the hub world for 29 frames, this is enough time for all the babies to load (still on loading screen)
            comparison(data.currentBigBatteries, '<', data.floorUnlockedDicts[4][difficulty]),        //Makes sure angelica isn't loaded
            comparison(data.baby, '=', data.babyIdentificationDict[babyIdentification]),              //Are you playing as the baby being asked about?
            data.chainLinkedListData(babyIdentification + angelicaPresent, true),                     //Goes to the node in the linked list where the baby in question is asked about
            comparison(0x7e8, '=', 0)                                                                 //Check if the floor data is 0, i.e. you've been kicked out of the play castle
        )
    }
    else {
        return comparison(data.levelIDLoaded, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }).andNext( 
            comparison(data.levelIDLoaded, '=', 0x1b).withLast({ hits: 29 }),  
            comparison(data.currentBigBatteries, '>=', data.floorUnlockedDicts[4][difficulty]),       //Makes sure angelica is loaded
            comparison(data.baby, '=', data.babyIdentificationDict[babyIdentification]),
            data.chainLinkedListData(babyIdentification + angelicaPresent, true),
            comparison(0x7e8, '=', 0)
        )
    }
}

function beatLevel(levelID: number, difficulty: number): ConditionBuilder {
    
    let logic:ConditionBuilder = $(
        comparison(data.difficulty, '=', difficulty),

        comparison(data.levelIDInstant, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }).andNext(
            comparison(data.pauseScreen, '!=', 1),
            comparison(data.levelIDInstant, '=', levelID, true, false),
            comparison(data.levelIDInstant, '=', 0x1b).withLast({hits: 1})     //This hit is true if you left the level without having the pause menu up, meaning you either failed or won (but didn't quit)
        ),

        comparison(data.levelIDLoaded, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }),
            comparison(data.levelIDLoaded, '=', 0x1b).withLast({hits: 35})     //Count if you've had the hub world loaded for 35 frames (still in loading screen), this gives enough time for the hits to reset if the baby has been kicked out of the play castle
    )

    // Adds logic to test each of the 10 positions where your baby's location data could potentially be stored
    for (var angelica of [0, 1]) {
        for (var baby of [0, 1, 2, 3, 4]) {
            logic = $(
                logic,
                didBabyFailLevel(levelID, difficulty, baby, angelica).withLast({ flag: 'ResetIf' })
            )
        }
    }

    return logic

}


export function makeAchievements(set: AchievementSet): void {

    let i:number = 1
    while (i < 0x1a) {
        if (data.levelNames.hasOwnProperty(i)) {
            set.addAchievement({
                title: data.levelNames[i].achTitle,
                description: 'Collect the big battery in ' + data.levelNames[i].title + ' on Reptar Tough',
                points: data.levelNames[i].points,
                conditions: $( inGame() ,beatLevelOnToughFirstTime(i) )
            })
        }
        i = i + 1
    }



    let littleb: any = gatheredAllLittleBatteries([0x4, 0x5, 0x7], true)

    set.addAchievement({
        title: 'test',
        description: 'Collect all the small batteries in the snow world',
        points: 1,
        conditions: {
            'core': $(inGame(), littleb.core),
            'alt1': littleb.alt1,
            'alt2': littleb.alt2,
            'alt3': littleb.alt3
        }
    })

    littleb = gatheredAllLittleBatteries([0x8, 0x9, 0xa], true)

    set.addAchievement({
        title: 'test' ,
        description: 'Collect all the small batteries in the jungle world',
        points: 1,
        conditions: {
            'core': $(inGame(), littleb.core),
            'alt1': littleb.alt1,
            'alt2': littleb.alt2,
            'alt3': littleb.alt3
        }
    })

    littleb = gatheredAllLittleBatteries([0xe, 0x10], true)

    set.addAchievement({
        title: 'test',
        description: 'Collect all the small batteries in the undersea world',
        points: 1,
        conditions: {
            'core': $(inGame(), littleb.core),
            'alt1': littleb.alt1,
            'alt2': littleb.alt2
        }
    })

    littleb = gatheredAllLittleBatteries([0x1, 0x2, 0x3], true)

    set.addAchievement({
        title: 'test',
        description: 'Collect all the small batteries in the Arabian world',
        points:1 ,
        conditions: {
            'core': $(inGame(), littleb.core),
            'alt1': littleb.alt1,
            'alt2': littleb.alt2,
            'alt3': littleb.alt3
        }
    })

    littleb = gatheredAllLittleBatteries([0xb, 0xc, 0xd], true)

    set.addAchievement({
        title: 'test',
        description: 'Collect all the small batteries in the circus world',
        points:1 ,
        conditions: {
            'core': $(inGame(), littleb.core),
            'alt1': littleb.alt1,
            'alt2': littleb.alt2,
            'alt3': littleb.alt3
        }
    })

    littleb = gatheredAllLittleBatteries([0x11, 0x12], true)

    set.addAchievement({
        title: 'test',
        description: 'Collect all the small batteries in the dino world',
        points:1 ,
        conditions: {
            'core': $(inGame(), littleb.core),
            'alt1': littleb.alt1,
            'alt2': littleb.alt2
        }
    })

    littleb = gatheredAllLittleBatteries([0x17, 0x18, 0x19], true)

    set.addAchievement({
        title: 'test',
        description: 'Collect all the small batteries in the Moon world',
        points: 1,
        conditions: {
            'core': $(inGame(), littleb.core),
            'alt1': littleb.alt1,
            'alt2': littleb.alt2,
            'alt3': littleb.alt3
        }
    })

    littleb = gatheredAllLittleBatteries([0x14, 0x15], true)

    set.addAchievement({
        title: 'test',
        description: 'Collect all the small batteries in the Medieval world',
        points: 1,
        conditions: {
            'core': $(inGame(), littleb.core),
            'alt1': littleb.alt1,
            'alt2': littleb.alt2
        }
    })


    set.addAchievement({
        title: 'snowplace to hide no damage challenge',
        description: 'Complete Snowplace to Hide on Reptar Tough after unlocking the door and without taking damage',
        points: 5,
        conditions: $(
            inGame(),
            beatLevel(0x7, 2).andNext(
                $(comparison(data.levelIDLoaded, '=', 0x1b, true, false)),
                $(comparison(data.levelIDLoaded, '=', 0x7))).withLast({ hits: 1 }),
            data.chainLinkedListDataRange(0, 60, [
                $(
                    ['AddAddress', 'Mem', '32bit', 0xd8],
                    ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x111328]
                ),
                $(
                    ['ResetIf', 'Mem', 'Float', 0x7b4, '!=', 'Value', '', 1]
                )
            ], true)

        )
    })
}
