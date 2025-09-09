import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation } from '../../helpers.js'
import * as fs from 'fs'

/**
 * Returns a condition asking if the gameplay ID is 3
 * @returns 
 */
export function inGame(): ConditionBuilder {
    return $(comparison(data.gameplayID,'=',3))
}

export function checkItemType(type: number): ConditionBuilder {
    return $(
        ['AddAddress', 'Mem', '32bit', 0xd8],
        ['', 'Mem', '32bit', 0xec, '=', 'Value', '', type],

    )
}

/**
 * Tests if you've just gathered the big battery of the level
 * @param levelID 
 * @returns 
 * 
 * 
 * 
 */
function beatLevelOnToughFirstTime(levelID: number): ConditionBuilder {
    return $(
        comparison(data.difficulty, '=', 2),
        comparison(data.levelIDLoaded, '=', levelID),
        comparison(data.bigBatteryCollected(levelID), '=', 0, true),
        comparison(data.bigBatteryCollected(levelID), '=', 1, false)
    ) 
}


/**
 * Tests if you have just gathered enough big batteries to active the hovervator to the floor given at the given difficulty
 * @param floorUnlocked
 * @param difficulty
 * @returns
 */
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
            comparison(data.babyFloor, '=', 0)                                                                 //Check if the floor data is 0, i.e. you've been kicked out of the play castle
        )
    }
    else {
        return comparison(data.levelIDLoaded, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }).andNext( 
            comparison(data.levelIDLoaded, '=', 0x1b).withLast({ hits: 29 }),  
            comparison(data.currentBigBatteries, '>=', data.floorUnlockedDicts[4][difficulty]),       //Makes sure angelica is loaded
            comparison(data.baby, '=', data.babyIdentificationDict[babyIdentification]),
            comparison(data.difficulty, '=', difficulty),                                          
            data.chainLinkedListData(babyIdentification + angelicaPresent, true),
            comparison(data.babyFloor, '=', 0)
        )
    }
}


// Winning after the first time and failing the level are directly indistinguisable without checking level data itself
// Instead we indirectly check by where the baby you are controlling ends up after the hub world loads
// Not using level data which is stored in a very long linked list that has the potential to change greatly keeps consitency up, and code length down
// In comparison, the hub world level data is very simple, and only has one thing that can change at the start of the list (the presence of Angelica)
// If there IS a way in level to test if it has been beat simply, use that instead


// NO LONGER NEEDED, REALLY GROSS, AVOID USING AT ALL COSTS
function beatLevel(levelID: number, difficulty: number): ConditionBuilder {
    
    let logic:ConditionBuilder = $(
        comparison(data.difficulty, '=', difficulty),

        comparison(data.levelIDInstant, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }).andNext(
            comparison(data.pauseScreen, '!=', 1),
            comparison(data.levelIDInstant, '=', levelID, true, false),
            comparison(data.levelIDInstant, '=', 0x1b).withLast({hits: 1})     // This hit is true if you left the level without having the pause menu up, meaning you either failed or won (but didn't quit)
        ),

        comparison(data.levelIDLoaded, '!=', 0x1b).withLast({ flag: 'ResetNextIf' }),
            comparison(data.levelIDLoaded, '=', 0x1b).withLast({hits: 35})     // Count if you've had the hub world loaded for 35 frames (still in loading screen), this gives enough time for the hits to reset if the baby has been kicked out of the play castle    
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


// The only ways to exit this level are quitting out via menu, dying, and winning.

/** An alternative to beatLevel() just for levels where the only exits are available through the menu, dying, or winning
 * Always use with a ResetIf LevelIDLoaded != level
 */
function beatLevelV2(levelID: number, nodesToCheck: number = 100, extraConditionsOnPlayerData: Array<ConditionBuilder> = []): ConditionBuilder {
    return $(
        data.chainLinkedListDataRange(0, nodesToCheck, [
            checkItemType(0x111328).withLast({ flag: 'AndNext' }), // Character info node
            ...extraConditionsOnPlayerData.map(x => x.withLast({ flag: 'AndNext' })), // Any additional checks you'd like to make for saftey
            $(
                comparison(data.healthCounter, '!=', 0).withLast({ flag: 'AndNext' }), // Make sure you aren't dead
                comparison(data.levelIDInstant, '=', 0x1b, false).withLast({ flag: 'AddHits' }) // Static, so lumping with the previous line so it doesn't get AddAddressed. Tests for going back into the hub level.
            )
        ], true),
        '0=1.1.',
        comparison(data.levelIDInstant, '=', levelID, true), // Along with the static check above, this checks that we are heading into the hub world, but the previous level info is still loaded, will only be true for the single frame the above hit has to accumulate
        comparison(data.pauseScreen, '!=', 1) // Make sure the pause screen wasn't up, so we didn't quit out of the level
    )
    
}



function isBabyLookingAtTak(node: number): ConditionBuilder {
    return $(
        // Makes sure you're in the hub world 
        comparison(data.levelIDLoaded, '=', 0x1b).withLast({ flag: 'AndNext' }),

        data.chainLinkedListDataRange(node, node, [
            // Make sure you are outside of the play palace and are in first person
            comparison(data.babyFloor, '=', 0x0).withLast({ flag: 'AndNext' }),
            comparison(data.inThirdPerson, '=', 0x0).withLast({ flag: 'AndNext' }),

            // Checks you are in a medium sized box around the photos
            comparison(data.XPos, '>=', -8.05).withLast({ flag: 'AndNext' }),
            comparison(data.XPos, '<=', -2.95).withLast({ flag: 'AndNext' }),
            comparison(data.YPos, '>=', 16.95).withLast({ flag: 'AndNext' }),
            comparison(data.YPos, '<=', 21.05).withLast({ flag: 'AndNext' }),

            // Make sure you point the camera down
            comparison(data.ZFirstCameraAngle, '<=', -.01).withLast({ flag: 'AndNext' }),

            // Calculates the dot product of your camera angle vector and the vector pointing at the pictures of Tak, makes sure it's positive (the camera is pointing towards tak (or at least 90 degrees either way))
            // I wanted to get more specific than this but without sqrt's the distance to the pictures and the fact that the camera is in spherical rather than cylindrical coordinates gets in the way of calculations sadly
            calculation(true, -5.3, '*', data.XFirstCameraAngle),
            calculation(false, data.XPos, '*', data.XFirstCameraAngle),
            calculation(true, 19.05, '*', data.YFirstCameraAngle),
            calculation(false, data.YPos, '*', data.YFirstCameraAngle)
        ], true),
        'f0.0>f0.0.1.' // Stores a hit when true
    )
}



export function makeAchievements(set: AchievementSet): void {

    set.addAchievement({
        title: 'No Rugrat Left Behind',
        id: 540562,
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

        if (data.levelNamesAchData.hasOwnProperty(i)) {
            set.addAchievement({
                title: data.levelNamesAchData[i].achTitle,
                id: data.levelNamesAchData[i].id,
                description: 'Collect the big battery in \"' + data.levelNamesAchData[i].title + '\" on Reptar Tough',
                points: data.levelNamesAchData[i].points,
                conditions: $(
                    inGame(),
                    beatLevelOnToughFirstTime(i)
                )
            })
        }
    }




    // Collect all the small batteries in each world
    for (var worldID in data.littleBatteryAchData) {

        // Will check if there are 0 little batteries left to collect in each level this frame
        let core: ConditionBuilder = $()

        // Will check if there was 1 little battery left to collect last frame
        let deltaChains: Array<ConditionBuilder> = []

        // Will keep track of the total amount of little batteries to collect in the world, adding on each level at a time
        let totalBatteries: number = 0


        // Repeat loop for each level in the world
        for (var levelID of data.littleBatteryAchData[worldID].levelArray) {

            // Connects all the addsource chains for little batteries in each level
            let addition: any = connectAddSourceChains(data.chainLittleBatteriesCollected(levelID, 2, false))
            totalBatteries = totalBatteries + addition.tally

            core = $(
                core,
                addition.chain
            )

            // Adds a delta addsource chain of little batteries to the array to be made into a new alt group
            deltaChains.push(data.chainLittleBatteriesCollected(levelID, 2, true) )
        }

        // Change the end of the addsource chain to a measured flag that checks if you have all the batteries in the world
        core = core.withLast({
            flag: 'Measured',
            cmp: '=',
            rvalue: {
                type: 'Value',
                value: totalBatteries
            }
        })


        // Creation of the object that will store the core and alt groups to be used in achievement creation
        let conditions: any = {
            core: $(
                inGame(),
                comparison(data.difficulty, '=', 2).withLast({ flag: 'MeasuredIf' }),
                core
            )
        }
        // Creation of the alt groups
        for (let index in deltaChains) {
            conditions['alt' + (+index + 1).toString()] = deltaChains[index]
        }
 

        set.addAchievement({
            title: data.littleBatteryAchData[worldID].achTitle,
            id: data.littleBatteryAchData[worldID].id,
            description: 'Collect every small battery in the ' + data.littleBatteryAchData[worldID].title + ' world on Reptar Tough',
            points: data.littleBatteryAchData[worldID].points,
            conditions: conditions
        }) 
    }





    // Collect all the Funny Money in each world, see the above loop in the little batteries achievements for comments, logic is identical
    for (var worldID in data.funnyMoneyAchData) {

        let core: ConditionBuilder = $()

        let deltaChains: Array<ConditionBuilder> = []

        let totalStacks: number = 0

        for (var levelID of data.funnyMoneyAchData[worldID].levelArray) {

            let addition: any = connectAddSourceChains(data.chainFunnyMoneyStacksCollected(levelID, 2, false))
            totalStacks = totalStacks + addition.tally

            core = $(
                core,
                addition.chain
            )

            deltaChains.push(data.chainFunnyMoneyStacksCollected(levelID, 2, true))

        }

        core = core.withLast({
            flag: 'Measured',
            cmp: '=',
            rvalue: {
                type: 'Value',
                value: totalStacks
            }
        })


        let conditions: any = {
            core: $(
                inGame(),
                comparison(data.difficulty, '=', 2).withLast({ flag: 'MeasuredIf' }),
                core
            )
        }

        for (let index in deltaChains) {
            conditions['alt' + (+index + 1).toString()] = deltaChains[index]
        }


        // Small change to the desctiption for the final achievement in this series
        let description: string = 'Collect all the funny money in the ' + data.funnyMoneyAchData[worldID].title + ' world on Reptar Tough'
        if (+worldID == 0x9) {
            description = 'Collect all the funny money in \"Stormin\' the Castle\" on Reptar Tough'
        }

        set.addAchievement({
            title: data.funnyMoneyAchData[worldID].achTitle,
            id: data.funnyMoneyAchData[worldID].id,
            description: description,
            points: data.funnyMoneyAchData[worldID].points,
            conditions: conditions
        }) 
    }




    // Progression-like and final level achievements

    set.addAchievement({
        title: 'The Tower of Pizza',
        id: 541576,
        description: 'Activate the Hover-vator to the second floor of the Play Palace 3000',
        points: 10,
        type: 'progression',
        conditions: {
            'core': inGame(),
            'alt1': activatedHoverVator(2, 0), // Can be done on any difficulty
            'alt2': activatedHoverVator(2, 1),
            'alt3': activatedHoverVator(2, 2)
        }
    })

    set.addAchievement({
        title: 'The Tower of Baby Babble',
        id: 541577,
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
        title: 'You Have to Spend Money to Make Money',
        id: 541578,
        description: 'Purchase Secret Funny Money from the ATM after unlocking floor 3 on Reptar Tough. This will activate leaderboard counters for each level on Reptar Tough for how many collectables are left to collect',
        points: 1,
        conditions: $(
            inGame(),
            comparison(data.difficulty, '=', 2),
            comparison(data.shopItemAvailable(36), '=', 1, true),
            comparison(data.shopItemPurchased(36), '=', 0, true),
            comparison(data.shopItemPurchased(36), '=', 1, false)
        )
    })

    set.addAchievement({
        title: 'The Cootie Tah Worked!',
        id: 541579,
        description: 'Defeat Angela in \"Stormin\' the Castle\"',
        points: 25,
        type: 'win_condition',
        conditions: $(
            comparison(data.levelIDLoaded, '=', 0x1a),
            comparison(data.gameplayID, '=', 3, true),
            comparison(data.gameplayID, '=', 1, false)
        )
    })

    set.addAchievement({
        title: 'Punishment for Elastic Perjury',
        id: 541580,
        description: 'Defeat Angela in \"Stormin\' the Castle\" on Reptar Tough',
        points: 5,
        conditions: $(
            comparison(data.levelIDLoaded, '=', 0x1a),
            comparison(data.difficulty, '=', 2),
            comparison(data.gameplayID, '=', 3, true),
            comparison(data.gameplayID, '=', 1, false)
        )
    })



    // Collect all the funny money and batteries in the game

    let finalCore: ConditionBuilder = $()
    let finalAlts: Array<ConditionBuilder> = []

    let totalCounter: number = 0
    let addition: any
   
    for (var levelID in data.levelOnFloorDict) {

        // Connects addsource chains of each level's funny money, little batteries, and big battery for the core group
        for (var addSourceChain of [
            data.chainFunnyMoneyStacksCollected(levelID, 2, false),
            data.chainLittleBatteriesCollected(levelID, 2, false),
            comparison(data.bigBatteryCollected(levelID), '=', 1)
        ]) {
            addition = connectAddSourceChains(addSourceChain)
            totalCounter = totalCounter + addition.tally
            finalCore = finalCore.also(addition.chain)
        }

        // Places delta chains for each of the above in their own alt groups
        finalAlts.push(data.chainFunnyMoneyStacksCollected(levelID, 2, true))
        finalAlts.push(data.chainLittleBatteriesCollected(levelID, 2, true))
        finalAlts.push(comparison(data.bigBatteryCollected(levelID), '=', 0, true, false))
    }

    // Special case for funny money in final level
    addition = connectAddSourceChains(data.chainFunnyMoneyStacksCollected(0x1a, 2, false))
    totalCounter = totalCounter + addition.tally
    finalCore = finalCore.also(addition.chain)

    finalAlts.push(data.chainFunnyMoneyStacksCollected(0x1a, 2, true))

    // Special case for little batteries in play palace 3000
    addition = connectAddSourceChains(data.chainLittleBatteriesCollected(0x1b, 2, false))
    totalCounter = totalCounter + addition.tally
    finalCore = finalCore.also(addition.chain)

    finalAlts.push(data.chainLittleBatteriesCollected(0x1b, 2, true))


    // Creation of the core and alt groups
    let finalConditions: any = {
        core: $(
            inGame(),
            comparison(data.difficulty, '=', 2),
            finalCore,
            comparison(0, '=', totalCounter)
        )
    }

    finalAlts.forEach(function (condition, index) {
        finalConditions['alt'+(+index+1).toString()] = condition
    })



    set.addAchievement({
        title: 'Time to Find a New Toy',
        id: 541581,
        description: 'Collect all the batteries and funny money available in the game on Reptar Tough',
        points: 25,
        conditions: finalConditions
    })







    //Challenges and the rest


    set.addAchievement({
        title: 'Snowboarding with the Power of Juju',
        id: 541582,
        badge: 617024,
        description: 'Look at a picture of Tak in first person mode before finding him in person!',
        points: 1,
        conditions: {
            core: $(
                // Reset if you exit to the main menu
                comparison(data.gameplayID, '!=', 0x3).withLast({ flag: 'ResetIf' }),

                // Tests when you find Tak in person
                // Should trigger when on the section of the track right before Tak appears to give the player time to look around and see him
                // Delta check set up as a range since the node has the possibility of moving right around when Tak appears, due to particle effects from you or snowmen running into icicles
                data.chainLinkedListDataRange(0, 20, [
                    checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                    checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                    comparison(data.continuousMap, '<', 0.64, true).withLast({ flag: 'AndNext' }),
                    comparison(data.continuousMap, '>=', 0.61, false).withLast({ flag: 'AddHits' })
                ], true),
                'T:0=1.1.',

                // Resets the hits if you leave the level tak is in (to make sure you have to find the photo first)
                // This does leave an opening for you to find the photo, priming the achievement, enter this level, quit/lose before reaching him, thus reseting the other alts
                // There's not much that can be done about this issue, given we need the hits to act as an ornext chain for either this or the alts if we switch which is core and which are alts
                comparison(data.levelIDLoaded, '=', 0x5, true).withLast({ flag: 'AndNext' }),
                comparison(data.levelIDLoaded, '=', 0x1b, false).withLast({ flag: 'ResetIf' })
            ),

            alt1: isBabyLookingAtTak(0),
            alt2: isBabyLookingAtTak(1),
            alt3: isBabyLookingAtTak(2),
            alt4: isBabyLookingAtTak(3),
            alt5: isBabyLookingAtTak(4),
            alt6: isBabyLookingAtTak(5)
        }
            
    })

    set.addAchievement({
        title: 'Baby John Wick',
        id: 540563,
        description: 'Complete \"Snowplace to Hide\" on Reptar Tough after unlocking the door and without taking damage',
        points: 5,
        conditions: $(
            inGame(),
            comparison(data.difficulty, '=', 2),

            // Reset all hits if you aren't in the right level
            comparison(data.levelIDLoaded, '!=', 0x7).withLast({ flag: 'ResetIf' }), 

            // Sets a checkpoint hit at the start of the level
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }), 
            comparison(data.levelIDLoaded, '=', 0x7, false).withLast({ hits: 1 }),

            // Checks that the door has been unlocked, the door is always the last element in the list
            data.chainLinkedListDataRange(0, 0, [
                checkItemType(0x192098).withLast({ flag: 'AndNext' }),
                comparison(data.rotationPos, '>=', 0, true).withLast({ flag: 'AndNext' }),
                comparison(data.rotationPos, '<', 0, false).withLast({ flag: 'Trigger', hits: 1})
            ], false),

            // Checks all positions for the health value, and resets the checkpoint if it's ever less than full
            data.chainLinkedListDataRange(0, 80, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.healthCounter, '!=', 1).withLast({ flag: 'ResetIf' })
            ], true),

            // contains an addhits chain as an ornext chain popping when you beat the level
            trigger(beatLevelV2(0x7, 80))
        )
    })



    set.addAchievement({
        title: 'Baby Marv Murchins',
        id: 541583,
        description: 'Complete \"Snowplace to Hide\" without unlocking the door',
        points: 2,
        conditions: $(
            inGame(),

            // Reset all hits if you aren't in the right level
            comparison(data.levelIDLoaded, '!=', 0x7).withLast({ flag: 'ResetIf' }),

            // Sets a checkpoint hit at the start of the level
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }), 
            comparison(data.levelIDLoaded, '=', 0x7, false).withLast({ hits: 1 }),

            // Resets the checkpoint if the door is ever opened
            data.chainLinkedListDataRange(0, 0, [
                checkItemType(0x192098).withLast({ flag: 'AndNext' }),
                comparison(data.rotationPos, '<', 0, false).withLast({ flag: 'ResetIf' })
            ], false),

            // contains an addhits chain as an ornext chain popping when you beat the level
            trigger(beatLevelV2(0x7, 80))
        )
    })

    /* Trashed as not very interesting / difficult, more frustrating. Swapped for the below ach
    Also as is has an issue determining when you break a papaya by running into a boulder, seems to work for falling in the water or falling

    set.addAchievement({
        title: 'Baby Carmen Berzatto',
        description: 'Complete \"Punting Papayas\" on Reptar Tough without breaking more than 2 papayas',
        points: 5,
        conditions: $(
            inGame(),
            comparison(data.difficulty, '=', 2),

            // Reset any hits if you aren't in the level
            comparison(data.levelIDLoaded, '!=', 0x9).withLast({ flag: 'ResetIf' }),

            // Sets a checkpoint hit at the start of the level
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }),
            comparison(data.levelIDLoaded, '=', 0x9, false).withLast({ hits: 1 }),

            // Reset if you drop more than 2 papayas
            // Testing if you've dropped a papaya by checking if you aren't holding a papaya while there is a papaya not spawned under a tree
            data.chainLinkedListDataRange(0, 200, [
                checkItemType(0x276cf8).withLast({ flag: 'AndNext' }),
                comparison(data.papayaNotUnderTree, '=', 1).withLast({ flag: 'AndNext' }),
                comparison(data.papayaHeld, '=', 1, true).withLast({ flag: 'AndNext' }),
                comparison(data.papayaHeld, '=', 0, false).withLast({ flag: 'AddHits' })
            ], true),
            'R:0=1.3.',

            // Sets a hit if you complete the level
            // an addhits chain used as a higher level ornext chain since having 200 alts without use of recall would reach the ach length limit
            data.chainLinkedListDataRange(0, 200, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.itemCounter, '=', 1, true).withLast({ flag: 'AndNext' }),
                comparison(data.itemCounter, '=', 0, false).withLast({ flag: 'AddHits' })
            ], true),
            'T:0=1.1.'
        )
    })

    */


    set.addAchievement({
        title: 'Baby Laura Croft',
        id: 541584,
        description: 'In \"Punting Papayas\", starting from the inside of the temple near where you spawn, fall into the temple from the second story within 2:30',
        points: 10,
        conditions: $(
            inGame(),

            // Reset if you are out of the level
            comparison(data.levelIDLoaded, '!=', 0x9).withLast({ flag: 'ResetIf' }),

            // Reset if you are in a small box inside the temple, before the checkpoint trigger box to allow easy restarts
            data.chainLinkedListDataRange(0, 50, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                comparison(data.XPos, '>=', 32).withLast({ flag: 'AndNext' }),
                comparison(data.XPos, '<', 36).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '>=', 51).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '<=', 53).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '>=', 6).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '<=', 10).withLast({ flag: 'ResetIf' }),
            ], true),

            // Reset if time is up
            'R:1=1.9001.',

            // Sets a checkpoint hit upon walking through a small box blocking the start of the temple, addhits as an ornext chain
            data.chainLinkedListDataRange(0, 50, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }), // Making sure the delta / mem check below reads the acual data we want instead of data from two different nodes. Shouldn't interfere since nothing should spawn while close to the temple
                comparison(data.XPos, '>=', 32, true).withLast({ flag: 'AndNext' }),
                comparison(data.XPos, '<', 32, false).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '>=', 51).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '<=', 53).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '>=', 6).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '<=', 10).withLast({ flag: 'AddHits' }),
            ], true),
            '0=1.1.',

            // Finishes the achievement if you walk through a small box at the top of the temple entrance on the second floor, addhits as ornext chain
            data.chainLinkedListDataRange(0, 50, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                comparison(data.XPos, '>=', 40).withLast({ flag: 'AndNext' }),
                comparison(data.XPos, '<=', 41.5).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '>=', 56, true).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '<', 56, false).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '>=', 14).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '<=', 16).withLast({ flag: 'AddHits' }),
            ], true),
            'T:0=1.1.'

        )
    })

    /*
    This one has the same issues as the snowcone achievements below, as well as a few other issues that I hadn't bothered to patch up

    set.addAchievement({
        title: 'The Baby in the Yellow Hat',
        description: 'Catch a monkey in \"Monkey Business\" on Reptar Tough without using a banana',
        points: 1,
        conditions: $(
            inGame(),
            comparison(data.difficulty, '=', 2),
            comparison(data.levelIDLoaded, '!=', 0xa).withLast({ flag: 'ResetIf' }),

            // Create a checkpoint hit whenever the level is loaded or a monkey is put in a box
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }),
            comparison(data.levelIDLoaded, '=', 0xa, false).withLast({ flag: 'AddHits' }),
            data.chainLinkedListDataRange(0, 100, [
                checkItemType(0x111328).withLast({flag: 'AndNext'}),
                comparison(data.itemTwoCounter, '<', data.itemTwoCounter, false, true).withLast({ flag: 'AddHits' })
            ], true),
            '0=1.1.',

            // Reset if you throw a banana
            data.chainLinkedListDataRange(0, 100, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.itemCounter, '<', data.itemCounter, false, true).withLast({ flag: 'ResetIf' })
            ], true),

            // Sets a hit for only a frame when you pick up a monkey
            // a two hit resetnextif and a one hit checkpoint with the same logic only differing by a delta check
            // an addhits chain used as a higher level ornext chain since having 100 alts without use of recall would reach the ach length limit
            data.chainLinkedListDataRange(0, 100, [
                checkItemType(0x1ccdb8).withLast({ flag: 'AndNext' }),
                comparison(data.monkeyGrabbed, '=', 1).withLast({ flag: 'AddHits' })
            ], true),
            'Z:0=1.2.',
            data.chainLinkedListDataRange(0, 100, [
                checkItemType(0x1ccdb8).withLast({ flag: 'AndNext' }),
                comparison(data.monkeyGrabbed, '<', data.monkeyGrabbed, true, false).withLast({ flag: 'AddHits' })
            ], true),
            'T:0=1.1.'
        )
    })
    */


    set.addAchievement({
        title: 'Baby Dwayne LaFontant',
        id: 540565,
        description: 'In \"Meanie Genie\", defeat every scarab without losing more than half your health on \"Reptar Tough\"',
        points: 5,
        conditions: $(
            inGame(),
            comparison(data.difficulty, '=', 2),

            // Reset if you leave the level
            comparison(data.levelIDLoaded, '!=', 0x2).withLast({ flag: 'ResetIf' }),

            // Sets a checkpoint hit at the start of the level
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }), 
            comparison(data.levelIDLoaded, '=', 0x2, false).withLast({ hits: 1 }),

            // Sets a hit upon defeat of the 300th scarab
            // an addhits chain used as a higher level ornext chain since having 200 alts without use of recall would reach the ach length limit
            data.chainLinkedListDataRange(0, 200, [
                // The total scarab killed count is held in the first node of type 0x1b2868 in a row of three, but the other two only reach a max of 200 before resetting, so no harm in reading those as well
                checkItemType(0x1b2868).withLast({ flag: 'AndNext' }),
                comparison(data.scarabCounter, '=', 299, true).withLast({ flag: 'AndNext' }),
                comparison(data.scarabCounter, '=', 300, false).withLast({ flag: 'AddHits' })
            ], false),
            $('0=1').withLast({ flag: 'Trigger', hits: 1 }),

            // Reset if health ever goes below half
            data.chainLinkedListDataRange(0, 150, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.healthCounter, '<', 0.5).withLast({ flag: 'ResetIf', rvalue: { type: 'Float' } })
            ])

        )
    })


    set.addAchievement({
        title: 'Baby Smaug',
        id: 541585,
        description: 'Complete \"Rugrat Rug Race\" on Reptar Tough before entering the treasure cave on the final lap',
        points: 10, // Very tough, might want to make this 25 
        conditions: $(
            inGame(),
            comparison(data.difficulty, '=', 2),

            comparison(data.levelIDLoaded, '!=', 0x1).withLast({ flag: 'ResetIf' }),

            // Checkpoint upon starting the level, mainly just for a trigger icon
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }),
            comparison(data.levelIDLoaded, '=', 0x1, false).withLast({ hits: 1 }),

            // Tests the moment the gem counter goes from 1 to 0, addhits as an ornext chain
            data.chainLinkedListDataRange(0, 30, [
                checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.itemCounter, '=', 1, true).withLast({ flag: 'AndNext' }),
                comparison(data.itemCounter, '=', 0, false).withLast({ flag: 'AddHits' })
            ], true),
            'T:0=1.1.',

            // Resets once you hit the treaure cave on the third lap, with one extra checkpoint for kindness
            data.chainLinkedListDataRange(1, 31, [
                checkItemType(0x129b38).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                checkItemType(0x129b38).withLast({ flag: 'AndNext' }),
                comparison(data.discreteMap, '<', 0x160).withLast({ flag: 'AndNext' }), // initializes at 0xffff
                comparison(data.discreteMap, '>', 0xfb).withLast({ flag: 'ResetIf' })
            ], true)
        )
    })

    /* Impossible to use due to needing to do a delta > mem check on a node while it moves deeper in the linked list, either that or requiring the entire level without taking damamge and that isn't the vibe I want

    set.addAchievement({
        title: 'Baby Bill Denbrough',
        description: 'Defeat the clown boss in \"Cone Caper\" on Reptar Tough without taking damage',
        points: 5,
        conditions: $(
            inGame(),
            comparison(data.difficulty, '=', 2),

            // reset if not in Cone caper to fix any issues with hits holding over from previous attempts/other level data
            comparison(data.levelIDLoaded, '!=', 0xb).withLast({ flag: 'ResetIf' }),


            // Set a checkpoint hit upon hitting the start of the boss battle
            data.chainLinkedListDataRange(0, 50, [
                checkItemType(0x1e87e8).withLast({ flag: 'AndNext' }).also(
                $(
                    'I:{recall}',
                    ['AddAddress', 'Mem', '32bit', 0x10],
                    ['AddAddress', 'Mem', '32bit', 0x0],
                    checkItemType(0x1e87e8).withLast({ flag: 'AndNext' })
                )), // Testing if this node and the node after are both of type 0x1e87e8, since this node type is not unique, but spawns in a chain of 2 (we want the first)
                comparison(data.bossPhase, '=', 0, true).withLast({ flag: 'AndNext' }),
                comparison(data.bossPhase, '=', 1, false).withLast({ flag: 'AddHits' })
            ], false),
            '0=1.1.',


            // Reset if your health lowers
            data.chainLinkedListDataRange(0, 100, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.healthCounter, '<', data.healthCounter, false, true).withLast({ flag: 'ResetIf' })
            ], true),


            // Sets a hit upon completion of the boss fight
            // set up as a hit with an addhits chain acting a higher level ornext chain
            // if these were all in alt groups, the ach length limit would beceome an issue
            data.chainLinkedListDataRange(0, 50, [
                checkItemType(0x1e87e8).withLast({ flag: 'AndNext' }).also(
                $(
                    'I:{recall}',
                    ['AddAddress', 'Mem', '32bit', 0x10],
                    ['AddAddress', 'Mem', '32bit', 0x0],
                    checkItemType(0x1e87e8).withLast({ flag: 'AndNext' })
                )), // Testing if this node and the node after are both of type 0x1e87e8, since this node type is not unique, but spawns in a chain of 2 (we want the first)
                comparison(data.bossPhase, '=', 6, true).withLast({ flag: 'AndNext' }),
                comparison(data.bossPhase, '=', 7, false).withLast({ flag: 'AddHits' })
            ], false),
            'T:0=1.1.'

        )
    })

    */

    set.addAchievement({
        title: 'Baby Bob Lee Swagger',
        id: 539457,
        description: 'Make it through the circus and first phase of the clown boss in \"Cone Caper\" on Reptar Tough by only throwing a single snowcone and not picking up any more',
        points: 5,
        conditions: $(
            inGame(),
            comparison(data.difficulty, '=', 2),

            // set a checkpoint hit upon entering Cone Caper
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }),
            comparison(data.levelIDLoaded, '=', 0xb, false).withLast({ hits: 1 }),

            // reset if not in Cone caper to fix any issues with hits holding over from previous attempts/other level data
            comparison(data.levelIDLoaded, '!=', 0xb).withLast({ flag: 'ResetIf' }),


            // Reset if your snowcone count is anything other than 9 or 10 (you can only reload in multiples of 5)
            data.chainLinkedListDataRange(0, 100, [
                comparison(data.itemCounter, '<', 9).withLast({ flag: 'OrNext' }),
                comparison(data.itemCounter, '>', 10).withLast({ flag: 'AndNext' }),
                checkItemType(0x111328).withLast({ flag: 'ResetIf' })
                
            ], true),


            // Sets a hit upon completion of the first phase of the boss fight
            // set up as a hit with an addhits chain acting a higher level ornext chain
            // if these were all in alt groups, the ach length limit would beceome an issue
            data.chainLinkedListDataRange(0, 50, [
                checkItemType(0x1e87e8).withLast({flag: 'AndNext'}).also(
                    $(
                        'I:{recall}',
                        ['AddAddress', 'Mem', '32bit', 0x10],
                        ['AddAddress', 'Mem', '32bit', 0x0],
                        checkItemType(0x1e87e8).withLast({ flag: 'AndNext' }) // The way to tell if we have the right node is looking for two nodes of the same type right after each other
                    )
                ),
                comparison(data.bossPhase, '=', 2, true).withLast({ flag: 'AndNext' }),
                comparison(data.bossPhase, '=', 3, false).withLast({ flag: 'AddHits' })
            ], false),
            'T:0=1.1.'
        )
    })
    

    set.addAchievement({
        title: 'Baby Nina Sayers',
        id: 541586,
        description: 'Complete \"Acrobatty Dash\" within 3:40',
        points: 5,
        conditions: $(
            inGame(),

            // Set a checkpoint hit at the start of the level
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }),
            comparison(data.levelIDLoaded, '=', 0xc, false).withLast({ hits: 1 }),

            // Reset all the hits if we ever leave the level
            comparison(data.levelIDLoaded, '!=', 0xc).withLast({ flag: 'ResetIf' }),

            // Reset the hits timer until we move the helper ball from it's initial placement (after the intro cutscene ends)
            data.chainLinkedListData(0, true),
            comparison(data.helperBallPosition, '=', 0).withLast({ flag: 'ResetNextIf' }),

            // Timer, reset if the frames exceed 3:40 (plus a few frames to compinsate for the level end condition)
            'R:1=1.13206.',

            // To tell if the level has been won, check if the game timer has stopped while you
            // 1. Aren't paused
            // 2. Aren't dead
            // 3. The timer isn't 0
            // 4. And while the helper ball is in the final position of 0x28, just in case
            data.chainLinkedListData(0, true),
            comparison(data.timer, '!=', data.timer, true, false).withLast({ flag: 'ResetNextIf' }),
            comparison(data.pauseScreen, '!=', 1).withLast({ flag: 'AndNext' }),
            data.chainLinkedListDataRange(0, 0, [
                comparison(data.healthCounter, '>', 0).withLast({ flag: 'AndNext' }),
                comparison(data.timer, '>', 0).withLast({ flag: 'AndNext' }),
                comparison(data.helperBallPosition, '=', 0x28).withLast({ flag: 'AndNext' }),
                comparison(data.timer, '=', data.timer, true, false).withLast({ flag: 'Trigger', hits: 4 }) // Timer changes every other frame, the extra hits are to be safe
            ], true)
        )
    })


    set.addAchievement({
        title: 'Baby Luke Skywalker',
        id: 541587,
        description: 'In \"Fly High Egg Hunt\", following the flowing lava river near your spawn, fly to the yellow egg without flying above the canyon or hitting any walls',
        points: 3,
        conditions: $(
            inGame(),

            // Reset if your health goes down, or your Z coordinate goes positive (out of the chasm)
            comparison(data.levelIDLoaded, '!=', 0x11).withLast({ flag: 'ResetIf' }),
            data.chainLinkedListDataRange(0, 60, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '>', 0).withLast({ flag: 'ResetIf' }),
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }),
                comparison(data.healthCounter, '<', data.healthCounter, false, true).withLast({ flag: 'ResetIf' })
            ], true),

            // Sets a hit upon entering the canyon at the lava river near spawn, addhits as a ornext chain
            data.chainLinkedListDataRange(0, 60, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }), // Making sure the delta / mem check below reads the acual data we want instead of data from two different nodes. Shouldn't interfere since nothing should spawn while close to the temple
                comparison(data.XPos, '>=', -80.1).withLast({ flag: 'AndNext' }),
                comparison(data.XPos, '<=', -49.9).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '>=', 115.01).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '<=', 145.01).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '>=', 0, true).withLast({ flag: 'AndNext' }),
                comparison(data.ZPos, '<', 0, false).withLast({ flag: 'AddHits' }),
            ], true),
            '0=1.1.',

            // Complete the challenge if you fly to the end of the canyon, addhits as a ornext chain
            data.chainLinkedListDataRange(0, 60, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                checkItemType(0x111328).withLast({ flag: 'AndNext', lvalue: { type: 'Delta' } }), // Making sure the delta / mem check below reads the acual data we want instead of data from two different nodes. Shouldn't interfere since nothing should spawn while close to the temple
                comparison(data.XPos, '>=', -20.1).withLast({ flag: 'AndNext' }),
                comparison(data.XPos, '<=', 0).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '<=', -140.01, true).withLast({ flag: 'AndNext' }),
                comparison(data.YPos, '>', -140.01, false).withLast({ flag: 'AddHits' })
            ], true),
            '0=1.1.',
        )
    })

    set.addAchievement({
        title: 'Baby Mark Watney',
        id: 541588,
        description: 'Complete \"Moon Buggy Madness\" on Reptar Tough without using more than 2 fuel canisters',
        points: 5, // Might change to 10 points with only 1 fuel canister after play test
        conditions: $(
            inGame(),

            // Set a checkpoint hit at the start of the level
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }),
            comparison(data.levelIDLoaded, '=', 0x17, false).withLast({ hits: 1 }),

            // Reset all hits when not in the level
            comparison(data.levelIDLoaded, '!=', 0x17).withLast({ flag: 'ResetIf' }),

            
            data.chainLinkedListDataRange(0, 0, [

                // Reset upon increasing fuel gauge X times
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.healthCounter, '<', data.healthCounter, true, false).withLast({ flag: 'ResetIf', hits: 3 }), 

                // Check for the moment you reach 0 cheese left to collect
                checkItemType(0x111328).withLast({ flag: 'Trigger' }),
                comparison(data.itemCounter, '=', 1, true).withLast({ flag: 'Trigger' }),
                comparison(data.itemCounter, '=', 0, false).withLast({ flag: 'Trigger' })

            ], true)       
        )
    })

    set.addAchievement({
        title: 'Baby Mashle',
        id: 542275,
        description: 'Complete \"Holy Pail\" on Reptar Tough without using more than 2 magic spells',
        points: 5,
        conditions: $(
            inGame(),

            // Set a checkpoint hit at the start of the level
            comparison(data.levelIDLoaded, '=', 0x1b, true).withLast({ flag: 'AndNext' }),
            comparison(data.levelIDLoaded, '=', 0x15, false).withLast({ hits: 1 }),

            // Reset all hits when not in the level
            comparison(data.levelIDLoaded, '!=', 0x15).withLast({ flag: 'ResetIf' }),

            // Reset upon grabbing your 3rd magic spell (set up without deltas as it's possible for the node to move the frame you grab one)
            // Each line will add 4 hits when you grab that specific power up, reset on 11 hits to allow some wiggle room just in case
            data.chainLinkedListDataRange(0, 50, [
                comparison(data.shoesPowerUp, '>', 2.9, false).withLast({ flag: 'OrNext' }),
                comparison(data.shieldPowerUp, '>', 19.9, false).withLast({ flag: 'OrNext' }),
                comparison(data.potionPowerUp, '>', 19.9, false).withLast({ flag: 'AndNext' }),
                checkItemType(0x111328).withLast({ flag: 'AddHits' }),

            ], true),
            'R:0=1.11.',

            trigger(
                beatLevelV2(0x15, 60, [
                    comparison(data.helperBallPosition, '=', 0x21)
                ])
            )
        )
    })

    set.addAchievement({
        title: 'Baby Paulie Bleeker',
        id: 541589,
        description: 'Complete the game in under 40 minutes in one sitting, follows the leaderboard timer',
        points: 25,
        conditions: $(
            // Sets a checkpoint hit upon entering a fresh save 
            // Checking initial resource values for saftey
            andNext(
                comparison(data.currentFunnyMoney, '=', 0),
                comparison(data.currentCoins, '=', 500),
                comparison(data.currentBigBatteries, '=', 0),
                comparison(data.currentLittleBatteries, '=', 0),
                comparison(data.gameplayID, '=', 4, true),
                comparison(data.gameplayID, '=', 3, false).withLast({hits: 1}) // 4 Watching intro cutscene -> 3 Playing game
            ),

            // Game completion is tested by seeing tha gameplay id go from 3 to 1 during level 0x1a
            // so we only want to reset the timer if the gameplay ID isn't 3 for two frames in a row
            comparison(data.gameplayID, '!=', 3, true).withLast({ flag: 'AndNext' }),
            comparison(data.gameplayID, '!=', 3, false).withLast({ flag: 'ResetIf'}),

            // Gameplay timer, reset if it gets too high, extra 10 seconds added to match the RTA timing of the leaderboards
            comparison(1, '=', 1).withLast({ flag: 'ResetIf', hits: 144601 }),

            // End of game completion test
            comparison(data.levelIDLoaded, '=', 0x1a), // Final level loaded
            comparison(data.gameplayID, '=', 3, true),
            comparison(data.gameplayID, '=', 1, false) // 3 Playing Game -> 1 Title Screen 
        )
    })

    set.addAchievement({
        title: 'You Ate Vegetables?!?',
        id: 541590,
        description: 'Grab more than 100 carrots in \"Carrot Catchin\'\"',
        points: 5,
        conditions: $(
            inGame(),

            // Don't allow the hit to count if you aren't in the right level
            comparison(data.levelIDLoaded, '!=', 0x1e).withLast({ flag: 'PauseIf' }),

            // Check for when the amount of carrots is 100
            // set up as a hit with an addhits chain acting a higher level ornext chain
            // if these were all in alt groups, the ach length limit would beceome an issue
            data.chainLinkedListDataRange(0, 100, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.itemCounter, '=', 99, true).withLast({ flag: 'AndNext' }), 
                comparison(data.itemCounter, '=', 100, false).withLast({ flag: 'AddHits' }) 
            ], true),
            '0=1.1.'
        )
    })

    set.addAchievement({
        title: 'Collecting the Rings of the Sunbeam',
        id: 541594,
        description: 'Complete \"Ring Roller Coaster\" with more than 45 seconds remaining',
        points: 5,
        conditions: $(
            comparison(data.gameplayID, '!=', 0x2).withLast({ flag: 'OrNext' }),
            comparison(data.levelIDLoaded, '!=', 0x20).withLast({ flag: 'ResetIf' }),

            // Resets the pauselock when you reach 18 rings collected
            // Set up as a hit with an addhits chain acting a higher level ornext chain
            data.chainLinkedListDataRange(0, 100, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.ringCounter, '=', 0x12).withLast({ flag: 'AddHits' })
            ], true),
            '0=1.1.',

            // Sets a hit to award the achievement if you have more than XX seconds left
            // Both sides of that comparison have an additional .1 in order to force comparison to use floats instead of values
            // A bit of wiggle room since the timer moves a little bit right before the gameplayid changes to 2, but after you finished the level
            data.chainLinkedListDataRange(1, 101, [
                checkItemType(0x24c990).withLast({ flag: 'AndNext' }),
                $(
                    'B:fF9b0',
                    comparison(60.1, '>=', 45.01).withLast({ flag: 'AddHits' })
                )
            ]),
            '0=1.1.'
        )
    })

    set.addAchievement({
        title: 'Reptar Rampage',
        id: 541591,
        description: 'Smash more than 42 targets in \"Target Bash\"',
        points: 5,
        conditions: $(
            inGame(),

            // Don't allow the hit to count if you aren't in the right level
            comparison(data.levelIDLoaded, '!=', 0x24).withLast({ flag: 'PauseIf' }),

            // Check for when the amount of bashes is 42
            // set up as a hit with an addhits chain acting a higher level ornext chain
            // if these were all in alt groups, the ach length limit would beceome an issue
            data.chainLinkedListDataRange(0, 100, [
                checkItemType(0x111328).withLast({ flag: 'AndNext' }),
                comparison(data.itemCounter, '>=', 42, false).withLast({ flag: 'AddHits' }) 
            ], true),
            '0=1.1.'
        )
    })


}
