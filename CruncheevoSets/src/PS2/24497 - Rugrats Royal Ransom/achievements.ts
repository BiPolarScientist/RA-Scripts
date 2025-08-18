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



function activatedHoverVator(floorUnlocked: number, difficulty: number): ConditionBuilder {
    return $(
        comparison(data.currentBigBatteries, '=', data.floorUnlockedDicts[floorUnlocked][difficulty] - 1, true, false),
        comparison(data.currentBigBatteries, '=', data.floorUnlockedDicts[floorUnlocked][difficulty]),
        comparison(data.difficulty, '=', difficulty)
    )
}


// This function is mostly used as a helper for beatLevel() in order to reset hits if the baby you are playing failed the level
function didBabyFailLevel(levelID: number, difficulty: number, babyIdentification, angelicaPresent: number = 0): ConditionBuilder {

    if (angelicaPresent) {
        return comparison(data.levelIDLoaded, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }).andNext(  //Reset the hits if you ever leave the hub world, andNext in case the last line needs to be a reset
            comparison(data.levelIDLoaded, '=', 0x1b).withLast({ hits: 29 }),                         //Count if you've loaded the hub world for 29 frames, this is enough time for all the babies to load (still on loading screen)
            comparison(data.currentBigBatteries, '<', data.floorUnlockedDicts[4][difficulty]),        //Makes sure angelica isn't loaded
            comparison(data.baby, '=', data.babyIdentificationDict[babyIdentification]),              //Are you playing as the baby being asked about?
            comparison(data.difficulty, '=', difficulty),                                             //Are you on the right difficulty?
            data.chainLinkedListData(babyIdentification + angelicaPresent, true),                     //Goes to the node in the linked list where the baby in question is asked about
            comparison(0x7e8, '=', 0)                                                                 //Check if the floor data is 0, i.e. you've been kicked out of the play castle
        )
    }
    else {
        return comparison(data.levelIDLoaded, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }).andNext( 
            comparison(data.levelIDLoaded, '=', 0x1b).withLast({ hits: 29 }),  
            comparison(data.currentBigBatteries, '>=', data.floorUnlockedDicts[4][difficulty]),       //Makes sure angelica is loaded
            comparison(data.baby, '=', data.babyIdentificationDict[babyIdentification]),
            comparison(data.difficulty, '=', difficulty),                                          
            data.chainLinkedListData(babyIdentification + angelicaPresent, true),
            comparison(0x7e8, '=', 0)
        )
    }
}


// Winning after the first time and failing the level are directly indistinguisable without checking level data itself
// Instead we indirectly check by where the baby you are controlling ends up after the hub world loads
// Not using level data which is stored in a very long linked list that has the potential to change greatly keeps consitency up, and code length down
// In comparison, the hub world level data is very simple, and only has one thing that can change at the start of the list (the presence of Angelica)
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

    set.addAchievement({
        title: 'No Rugrat Left Behind',
        description: 'Have all five controllable rugrats in the Play Palace 3000 at once',
        points: 1,
        conditions: {
            core: $(
                inGame(),
                comparison(data.levelIDLoaded,'=',0x1b)
            ),

            alt1: $( // Alt checking the case where Angelica isn't present
                data.chainLinkedListDataRange(0, 4, [
                    $(
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x111328]
                    ),
                    $(
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Delta', '32bit', 0xec, '=', 'Value', '', 0x111328]
                    ),
                    $(
                        ['AndNext', 'Mem', '16bit', 0x7e8, '>=', 'Value', '', 1]
                    ),
                    $(
                        ['', 'Mem', '16bit', 0x7e8, '<=', 'Value', '', 3]
                    )
                ], true),

                data.chainLinkedListDataRange(0, 4, [
                    $(['OrNext', 'Delta', '16bit', 0x7e8, '=', 'Value', '', 0])
                ]).withLast({ flag: '' })
            ),

            alt2: $( // Alt checking the case where Angelica is present
                data.chainLinkedListDataRange(1, 5, [
                    $(
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x111328]
                    ),
                    $(
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Delta', '32bit', 0xec, '=', 'Value', '', 0x111328]
                    ),
                    $(
                        ['AndNext', 'Mem', '16bit', 0x7e8, '>=', 'Value', '', 1]
                    ),
                    $(
                        ['', 'Mem', '16bit', 0x7e8, '<=', 'Value', '', 3]
                    )
                ], true),

                data.chainLinkedListDataRange(1, 5, [
                    $(['OrNext', 'Delta', '16bit', 0x7e8, '=', 'Value', '', 0])
                ]).withLast({ flag: '' })
            )
        }
    })




    // Complete each level on floors 1-3 on Reptar Tough
    for (let i = 1; i < 0x1a; i++) {

        if (data.levelNames.hasOwnProperty(i)) {
            set.addAchievement({
                title: data.levelNames[i].achTitle,
                description: 'Collect the big battery in ' + data.levelNames[i].title + ' on Reptar Tough',
                points: data.levelNames[i].points,
                conditions: $( inGame() ,beatLevelOnToughFirstTime(i) )
            })
        }
    }




    // Collect all the small batteries in each world
    for (let i: number = 1; i < 0x9; i++) {

        let core: ConditionBuilder = $(
            inGame(),
            comparison(data.difficulty, '=', 2)
        )
        let deltaChain: ConditionBuilder = $()

        for (var levelID of data.littleBatteryData[i].levelArray) {
            core = $(
                core,
                comparison(data.littleBatteriesLeft(levelID), '=', 0)
            )

            deltaChain = $(
                deltaChain,
                $().withLast({
                    flag: 'AddSource',
                    lvalue: data.littleBatteriesLeft(levelID).lvalue
                }).withLast({
                    lvalue: {type: 'Delta'}
                })
            )
        }

        set.addAchievement({
            title: data.littleBatteryData[i].achTitle,
            description: 'Collect all the small batteries in the ' + data.littleBatteryData[i].title + ' world on Reptar Tough',
            points: data.littleBatteryData[i].points,
            conditions: $(
                core,
                deltaChain.withLast({
                    flag: '',
                    cmp: '=',
                    rvalue: {type: 'Value', value: 1}
                })
            )
        })
    }





    // Collect all the Funny Money in each world
    for (let i = 1; i < 0xa; i++) {

        let core: ConditionBuilder = $(
            inGame(),
            comparison(data.difficulty, '=', 2)
        )
        let deltaChain: ConditionBuilder = $()

        
        for (const [index, levelID] of data.funnyMoneyData[i].levelArray.entries()) {
            core = $(
                core,
                // Checks that you have all the stacks collected in each level in the world
                data.chainFunnyMoneyStacksCollected(levelID).withLast({
                    flag: '',
                    cmp: '=',
                    rvalue: { type: 'Value', value: data.funnyMoneyData[i].stacksArray[index] }
                })
            )

            // Sums up the delta values of all stacks collected in the world
            deltaChain = $(deltaChain, data.chainFunnyMoneyStacksCollected(levelID, true))
        }

        // Total amount of stacks to be collected in the world
        let totalStacks: number = data.funnyMoneyData[i].stacksArray.reduce( (a,b) => a+b, 0 )

        core = $(
            core,
            deltaChain.withLast({
                flag: '',
                cmp: '=',
                rvalue: {type: 'Value', value: totalStacks - 1}
            })
        )

        // Small change to the desctiption for the final achievement in this series
        let description: string = 'Collect all the funny money in the ' + data.funnyMoneyData[i].title + ' world on Reptar Tough'
        if (i == 0x9) {
            description = 'Collect all the funny money in Stormin\' the Castle on Reptar Tough'
        }

        set.addAchievement({
            title: data.funnyMoneyData[i].achTitle,
            description: description,
            points: data.funnyMoneyData[i].points,
            conditions: core
        })

        
    }





    // Progression-like and final level achievements

    set.addAchievement({
        title: 'a',
        description: 'Activate the Hover-vator to the second level',
        points: 5,
        type: 'progression',
        conditions: {
            'core': inGame(),
            'alt1': activatedHoverVator(2, 0), // Can be done on any difficulty
            'alt2': activatedHoverVator(2, 1),
            'alt3': activatedHoverVator(2, 2)
        }
    })

    set.addAchievement({
        title: 'a',
        description: 'Activate the Hover-vator to the third level',
        points: 10,
        type: 'progression',
        conditions: {
            'core': inGame(),
            'alt1': activatedHoverVator(3, 0), // Can be done on any difficulty
            'alt2': activatedHoverVator(3, 1),
            'alt3': activatedHoverVator(3, 2)
        }
    })

    set.addAchievement({
        title: 'a',
        description: 'Purchase Secret Funny Money from the ATM after unlocking floor 3. This will activate counters for each level on Reptar Tough for how much funny money is left to collect',
        points: 1,
        conditions: $(
            inGame(),
            comparison(data.shopItemAvailable(36), '=', 1),
            comparison(data.shopItemPurchased(36), '=', 0, true, false),
            comparison(data.shopItemPurchased(36), '=', 1, false, false)
        )
    })







    //Challenges

    set.addAchievement({
        title: 'snowplace to hide no damage challenge',
        description: 'Complete Snowplace to Hide on Reptar Tough after unlocking the door and without taking damage',
        points: 5,
        conditions: $(
            inGame(),

            beatLevel(0x7, 2),

            comparison(data.levelIDLoaded, '=', 0x1b, true, false).withLast({ flag: 'AndNext' }), // Sets a checkpoint hit at the start of the level
            comparison(data.levelIDLoaded, '=', 0x7).withLast({ hits: 1 }),

            data.chainLinkedListData(0, false).withLast({ flag: 'Remember' }). // Checks that the door has been unlocked
                also(
                    'I: { recall }',
                    ['AddAddress', 'Mem', '32bit', 0xd8],
                    ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x192098],
                    'I: { recall }',
                    ['AndNext', 'Delta', 'Float', 0xc, '>=', 'Value', '', 0],
                    'I: { recall }',
                    $(['', 'Mem', 'Float', 0xc, '<', 'Value', '', 0]).withLast({ hits: 1 })
            ),

            data.chainLinkedListDataRange(0, 80, [  // Checks all positions for the health value, and resets the checkpoint if it's ever less than full
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



    set.addAchievement({
        title: 'snowplace to hide no key challenge',
        description: 'Complete Snowplace to Hide without unlocking the door',
        points: 5,
        conditions: {
            'core': $(
                inGame(),

                comparison(data.levelIDLoaded, '=', 0x1b, true, false).withLast({ flag: 'AndNext' }), // Sets a checkpoint hit at the start of the level
                comparison(data.levelIDLoaded, '=', 0x7).withLast({ hits: 1 }),

                data.chainLinkedListData(0, false).withLast({ flag: 'Remember' }). // Resets the checkpoint if the door is ever opened
                    also(
                        'I: { recall }',
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x192098],
                        'I: { recall }',
                        ['ResetIf', 'Mem', 'Float', 0xc, '<', 'Value', '', 0]
                )
            ),
            'alt1': beatLevel(0x7, 0), // Can be done on any difficulty
            'alt2': beatLevel(0x7, 1),
            'alt3': beatLevel(0x7, 2)
        }
    })



    set.addAchievement({
        title: 'a',
        description: 'Complete Rugrat Rug Race on Reptar Tough within 2 laps',
        points: 5,
        conditions: $(
            inGame(),

            comparison(data.levelIDLoaded, '=', 0x1),
            comparison(data.difficulty, '=', 2),

            data.chainLinkedListData(0, true).withLast({ flag: 'Remember' }). // Checks for the moment the game counter goes from 1 to 0
                also(
                    'I: { recall }',
                    ['AddAddress', 'Mem', '32bit', 0xd8],
                    ['', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x111328],
                    'I: { recall }',
                    ['Trigger', 'Delta', '16bit', 0x8d4, '=', 'Value', '', 1],
                    'I: { recall }',
                    ['Trigger', 'Mem', '16bit', 0x8d4, '=', 'Value', '', 0]
                ),

            data.chainLinkedListData(1, true).withLast({ flag: 'Remember' }). // Checks that you haven't started the third lap, with one extra checkpoint for saftey
                also(
                    'I: { recall }',
                    ['AddAddress', 'Mem', '32bit', 0xd8],
                    ['', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x129b38],
                    'I: { recall }',
                    ['', 'Mem', '16bit', 0x208, '<=', 'Value', '', 0xe7]
                )
        )
    })
}
