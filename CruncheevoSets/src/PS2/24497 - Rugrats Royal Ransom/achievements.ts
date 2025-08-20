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
                    $(['OrNext', 'Delta', '16bit', 0x7e8, '=', 'Value', '', 0]) // Was at least one of the babies on the ground floor last frame?
                ]).withLast({ flag: '' }),

                data.chainLinkedListDataRange(0, 4, [
                    $(
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Delta', '32bit', 0xec, '=', 'Value', '', 0x111328]
                    ),
                    $(
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x111328] // Is the baby data loaded both this frame and last
                    ),
                    $(
                        ['AndNext', 'Mem', '16bit', 0x7e8, '>=', 'Value', '', 1]
                    ),
                    $(
                        ['', 'Mem', '16bit', 0x7e8, '<=', 'Value', '', 3] // Are all the babies on floors 1-3? Avoiding floor 4 to avoid the case where Angelica can be considered one of the babies
                    )
                ], true)         
            ),

            alt2: $( // Alt checking the case where Angelica is present

                data.chainLinkedListDataRange(1, 5, [
                    $(['OrNext', 'Delta', '16bit', 0x7e8, '=', 'Value', '', 0]) // Was at least one of the babies on the ground floor last frame?
                ]).withLast({ flag: '' }),

                data.chainLinkedListDataRange(1, 5, [ 
                    $(
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Delta', '32bit', 0xec, '=', 'Value', '', 0x111328]
                    ),
                    $(
                        ['AddAddress', 'Mem', '32bit', 0xd8],
                        ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x111328] // Is the baby data loaded both this frame and last
                    ),
                    $(
                        ['AndNext', 'Mem', '16bit', 0x7e8, '>=', 'Value', '', 1] 
                    ),
                    $(
                        ['', 'Mem', '16bit', 0x7e8, '<=', 'Value', '', 3] // Are all the babies on floors 1-3?
                    )
                ], true)
            )
        }
    })




    // Complete each level on floors 1-3 on Reptar Tough
    for (let i = 1; i < 0x1a; i++) {

        if (data.levelNames.hasOwnProperty(i)) {
            set.addAchievement({
                title: data.levelNames[i].achTitle,
                description: 'Collect the big battery in \"' + data.levelNames[i].title + '\" on Reptar Tough',
                points: data.levelNames[i].points,
                conditions: $( inGame() ,beatLevelOnToughFirstTime(i) )
            })
        }
    }




    // Collect all the small batteries in each world
    for (let i: number = 1; i < 0x9; i++) {

        // Will check if there are 0 little batteries left to collect in each level this frame
        let core: ConditionBuilder = $()

        // Will check if there was 1 little battery left to collect last frame
        let deltaChains: Array<ConditionBuilder> = []


        for (var levelID of data.littleBatteryData[i].levelArray) {
            core = $(
                core,
                data.chainLittleBatteriesCollected(levelID, 2, false)
            )

            deltaChains.push(data.chainLittleBatteriesCollected(levelID, 2, true) )
        }

        let description: string = 'Collect every small battery in the ' + data.littleBatteryData[i].title + ' world on Reptar Tough'
        let title: string = data.littleBatteryData[i].achTitle
        let points: number = data.littleBatteryData[i].points


        switch (data.littleBatteryData[i].levelArray.length) {

            case 2:
                set.addAchievement({
                    title: title,
                    description: description,
                    points: points,
                    conditions: {
                        'core': $(
                            inGame(),
                            comparison(data.difficulty, '=', 2),
                            core
                        ),
                        'alt1': deltaChains[0],
                        'alt2': deltaChains[1]
                    }
                })
                break

            case 3:
                set.addAchievement({
                    title: title,
                    description: description,
                    points: points,
                    conditions: {
                        'core': $(
                            inGame(),
                            comparison(data.difficulty, '=', 2),
                            core
                        ),
                        'alt1': deltaChains[0],
                        'alt2': deltaChains[1],
                        'alt3': deltaChains[2]
                    }
                })
                break

            default:
                console.log('Something went wrong in collect all little batteries in each world achievement building, attempted to build a world without 2-3 levels')
        }
    }





    // Collect all the Funny Money in each world
    for (let i = 1; i < 0xa; i++) {

        // Will check if all of the stacks have been collected on this frame
        let core: ConditionBuilder = $()

        // Will check if you were missing just one stack last frame
        let deltaChains: Array<ConditionBuilder> = []


        for (var levelID of data.funnyMoneyData[i].levelArray) {

            core = $(
                core,
                data.chainFunnyMoneyStacksCollected(levelID, 2, true)
            )

            deltaChains.push(data.chainFunnyMoneyStacksCollected(levelID, 2, false))

        }


        // Small change to the desctiption for the final achievement in this series
        let description: string = 'Collect all the funny money in the ' + data.funnyMoneyData[i].title + ' world on Reptar Tough'
        if (i == 0x9) {
            description = 'Collect all the funny money in \"Stormin\' the Castle\" on Reptar Tough'
        }


        switch (data.funnyMoneyData[i].levelArray.length) {
            case 1:
                set.addAchievement({
                    title: data.funnyMoneyData[i].achTitle,
                    description: description,
                    points: data.funnyMoneyData[i].points,
                    conditions: $(
                        inGame(),
                        comparison(data.difficulty, '=', 2),
                        deltaChains[0],
                        core
                    )
                })
                break

            case 2:
                set.addAchievement({
                    title: data.funnyMoneyData[i].achTitle,
                    description: description,
                    points: data.funnyMoneyData[i].points,
                    conditions: {
                        'core': $(
                            inGame(),
                            comparison(data.difficulty, '=', 2),
                            core
                        ),
                        'alt1': deltaChains[0],
                        'alt2': deltaChains[1]
                    }
                })
                break

            case 3:
                set.addAchievement({
                    title: data.funnyMoneyData[i].achTitle,
                    description: description,
                    points: data.funnyMoneyData[i].points,
                    conditions: {
                        'core': $(
                            inGame(),
                            comparison(data.difficulty, '=', 2),
                            core
                        ),
                        'alt1': deltaChains[0],
                        'alt2': deltaChains[1],
                        'alt3': deltaChains[2]
                    }
                })
                break

            default:
                console.log('Something went wrong in collect all funny money in each world achievement building, attempted to build a world without 1-3 levels')
        }
    }




    // Progression-like and final level achievements

    set.addAchievement({
        title: 'a',
        description: 'Activate the Hover-vator to the second floor of the Play Palace 3000',
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
        description: 'Activate the Hover-vator to the third floor of the Play Palace 3000',
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

    let finalCore: ConditionBuilder = $()
    let finalAlts: Array<ConditionBuilder> = []

    for (var levelID in [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 20, 21, 23, 24, 25]) {
        finalCore = $(
            finalCore,
            data.chainFunnyMoneyStacksCollected(levelID, 2, false),
            data.chainLittleBatteriesCollected(levelID, 2, false),
            comparison(data.bigBatteryCollected(levelID), '=' , 1)
        )

        finalAlts.push(data.chainFunnyMoneyStacksCollected(levelID, 2, true))
        finalAlts.push(data.chainLittleBatteriesCollected(levelID, 2, true))
        finalAlts.push(comparison(data.bigBatteryCollected(levelID), '=', 0, true, false))
    }

    finalCore = $(
        finalCore,
        data.chainFunnyMoneyStacksCollected(0x1a, 2, false),
        data.chainLittleBatteriesCollected(0x1b, 2, false)
    )
    finalAlts.push(data.chainFunnyMoneyStacksCollected(0x1a, 2, true))
    finalAlts.push(data.chainLittleBatteriesCollected(0x1b, 2, true))

    let finalConditions: any = {
        core: $(
            inGame(),
            comparison(data.difficulty, '=', 2),
            finalCore
        )
    }

    finalAlts.forEach(function (condition, index) {
        finalConditions['alt'+(index+1).toString()] = condition
    })


    set.addAchievement({
        title: 'a',
        description: 'Gather all the batteries and funny money available in the game on Reptar Tough',
        points: 25,
        conditions: finalConditions
    })







    //Challenges and the rest

    set.addAchievement({
        title: 'Snowboarding with the Power of Juju',
        description: 'Find Tak!',
        points: 1,
        conditions: $(
            inGame(),
            comparison(data.levelIDLoaded, '=', 0x5),
            data.chainLinkedListData(0).withLast({ flag: 'Remember' }),
            'I: { recall }',
            ['AddAddress', 'Mem', '32bit', 0xd8],
            ['AndNext', 'Delta', '32bit', 0xec, '=', 'Value', '', 0x111328],
            'I: { recall }',
            ['AddAddress', 'Mem', '32bit', 0xd8],
            ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x111328],
            'I: { recall }',
            ['', 'Delta', 'Float', 0xcc8, '<', 'Float', '', .625],
            'I: { recall }',
            ['', 'Mem', 'Float', 0xcc8, '>=', 'Float', '', .625]
        )
    })

    set.addAchievement({
        title: 'Baby John Wick',
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
                    ['AndNext', 'Delta', 'Float', 0xc, '>=', 'Float', '', 0],
                    'I: { recall }',
                    $(['', 'Mem', 'Float', 0xc, '<', 'Float', '', 0]).withLast({ hits: 1 })
            ),

            data.chainLinkedListDataRange(0, 80, [  // Checks all positions for the health value, and resets the checkpoint if it's ever less than full
                $(
                    ['AddAddress', 'Mem', '32bit', 0xd8],
                    ['AndNext', 'Mem', '32bit', 0xec, '=', 'Value', '', 0x111328]
                ),
                $(
                    ['ResetIf', 'Mem', 'Float', 0x7b4, '!=', 'Float', '', 1]
                )
            ], true)

        )
    })



    set.addAchievement({
        title: 'Baby Marv Murchins',
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
                        ['ResetIf', 'Mem', 'Float', 0xc, '<', 'Float', '', 0]
                )
            ),
            'alt1': beatLevel(0x7, 0), // Can be done on any difficulty
            'alt2': beatLevel(0x7, 1),
            'alt3': beatLevel(0x7, 2)
        }
    })



    set.addAchievement({
        title: 'Baby Smaug',
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
