import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger, orNext, resetIf, measuredIf, resetNextIf, addHits, pauseIf } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation, wiiAddAddress, create } from '../../helpers.js'
import * as fs from 'fs'

/**
 * Couldn't find a proper in game / in battle flag, so checking that inventory is in the proper state to avoid any junk data during cutscenes
 * @param chapter
 * @returns
 */
function checkInventoryProperState(chapter: number): ConditionBuilder {
    let logic: ConditionBuilder = $()

    for (let invslot of data.inventory) {
        logic.also(comparison(invslot, '=', 0x0).withLast({ flag: 'OrNext' }))

        for (let item of data.availableItems[chapter]) {
            logic.also(comparison(invslot, '=', item).withLast({ flag: 'OrNext' }))
        }

        logic = logic.withLast({ flag: '' })
    }

    return logic
}

function useItemInRoom(chapter: number, room: number, item: number, canEat: boolean = false, isTrade: boolean = false, tradeItems: Array<number> = []): any {
    let logic: any = {
        core: $(
            comparison(data.chapter, '=', chapter),
            comparison(data.room, '=', room),
            checkInventoryProperState(chapter),
            canEat && comparison(data.playerHealth, '=', data.playerHealth, true, false)
        )
    }

    let i: number = 1

    for (let invslot of data.inventory) {
        logic['alt' + i.toString()] = $(
            comparison(invslot, '=', item, true),
            orNext(
                comparison(invslot, '=', 0x0, false),
                ...tradeItems.map((x) =>
                    $(isTrade && comparison(invslot, '=', x, false))
                )
            )
        )

        i = i + 1
    }

    return logic
}

function obtainItem(chapter: number, room: number, item: number): any {
    let logic: any = {
        core: $(
            comparison(data.chapter, '=', chapter),
            comparison(data.room, '=', room),
            checkInventoryProperState(chapter)
        )
    }

    let i: number = 1

    for (let invslot of data.inventory) {
        logic['alt' + i.toString()] = $(
            comparison(invslot, '=', 0x0, true),
            comparison(invslot, '=', item, false)
        )

        i = i + 1
    }

    return logic
}

function finishAct(chapter: number): ConditionBuilder {
    return $(
        comparison(data.room, '=', data.endingRooms[chapter]),
        comparison(data.chapter, '=', chapter, true),
        comparison(data.chapter, '=', chapter + 1, false),
        checkInventoryProperState(chapter)
    )
}

export function makeAchievements(set: AchievementSet): void {

    let id:number = 604212

    set.addAchievement({
        title: 'Violence Isn\'t the Answer, but It Can Feel Good',
        id: id,
        description: 'Perform a shoulder bash',
        points: 1,
        conditions: $(
            // Pointer to battle data, is junk until after it switches from 0xffff or sometimes 0xa1 when you're being hit
            orNext(
                comparison(create('16bit', 0x638), '=', 0xffff).withLast({ lvalue: { type: 'Prior' } }),
                comparison(create('16bit', 0x638), '=', 0xa1).withLast({ lvalue: { type: 'Prior' } })
            ),
            
            // Check the shoulder bash move calc goes to 4
            comparison([
                $('I:0x638'),
                create('8bit', 0xe)
            ], '<', 4, true),
            comparison([
                $('I:0x638'),
                create('8bit', 0xe)
            ], '=', 4, false)
        )
    })

    id = id + 1
    set.addAchievement({
        title: 'Don\'t Be the Monster They See',
        id: id,
        description: 'Put your creator to sleep without resorting to fisticuffs',
        points: 2,
        conditions: useItemInRoom(1, 0x4, 0x3ec)
    })

    id = id + 1
    set.addAchievement({
        title: 'Into the Outside World',
        id: id,
        description: 'Escape Frankenstein\'s lab',
        points: 3,
        type: 'progression',
        conditions: useItemInRoom(1, 0x3, 0x3ed)
    })

    id = id + 1
    set.addAchievement({
        title: 'A Morning Nightcap',
        id: id,
        description: 'Help the parched jailor to a drink',
        points: 2,
        conditions: useItemInRoom(2, 0x6, 0x3f2)
    })

    id = id + 1
    set.addAchievement({
        title: 'A Little Arson Is Good for the Soul',
        id: id,
        description: 'Distract the guard dog without killing it',
        points: 3,
        conditions: useItemInRoom(2, 0x7, 0x3f3)
    })

    id = id + 1
    set.addAchievement({
        title: 'They Don\'t Understand You Here',
        id: id,
        description: 'Escape the town of Ingolstadt',
        points: 4,
        type: 'progression',
        conditions: finishAct(2)
    })

    id = id + 1
    set.addAchievement({
        title: 'Don\'t Refuse the Refuse',
        id: id,
        description: 'Obtain the manure',
        points: 1,
        type: 'progression',
        conditions: obtainItem(3, 0x16, 0x3f4)
    })

    id = id + 1
    set.addAchievement({
        title: 'Kindness Begets Kindness',
        id: id,
        description: 'Return some stolen jewelery to the rightful owner',
        points: 2,
        conditions: useItemInRoom(3, 0x15, 0x3f8, false, true, [0x3f9, 0x3fa])
    })

    id = id + 1
    set.addAchievement({
        title: 'Nice Wolfie',
        id: id,
        description: 'Feed a starving wolf',
        points: 2,
        conditions: useItemInRoom(3, 0xb, 0x3f9, true)
    })

    id = id + 1
    set.addAchievement({
        title: 'Hitching a Ride',
        id: id,
        description: 'Take a carriage to Geneva',
        points: 5,
        type: 'progression',
        conditions: finishAct(3)
    })

    id = id + 1
    set.addAchievement({
        title: 'Interior Design',
        id: id,
        description: 'Help hang up a painting',
        points: 3,
        type: 'progression',
        conditions: useItemInRoom(4, 0x9, 0x3fd, false, true, [0x40a, 0x40b])
    })

    id = id + 1
    set.addAchievement({
        title: 'Animal Control',
        id: id,
        description: 'Return a missing cat back home',
        points: 2,
        type: 'progression',
        conditions: obtainItem(4, 0xe, 0x405)
    })

    id = id + 1
    set.addAchievement({
        title: 'Delivery Man',
        id: id,
        description: 'Deliver a bag of groceries',
        points: 1,
        conditions: useItemInRoom(4, 0x12, 0x403)
    })

    id = id + 1
    set.addAchievement({
        title: 'Floral Arrangements',
        id: id,
        description: 'Find a vase for a bouquet of flowers',
        points: 1,
        conditions: useItemInRoom(4, 0x14, 0x405)
    })

    id = id + 1
    set.addAchievement({
        title: 'You\'re Safe in this Tale',
        id: id,
        description: 'Meet Victor\'s son William',
        points: 1,
        conditions: $(
            comparison(data.chapter, '=', 4),
            comparison(data.room, '=', 0x13),
            comparison(data.convo, '=', 0x25, true),
            comparison(data.convo, '=', 0x26, false),
            checkInventoryProperState(4)
        )
    })

    id = id + 1
    set.addAchievement({
        title: 'An Accumulation of Anguish',
        id: id,
        description: 'Confront your creator in Geneva',
        points: 5,
        type: 'progression',
        conditions: finishAct(4)
    })

    id = id + 1
    set.addAchievement({
        title: 'Reading It Would Be Too Evil',
        id: id,
        description: 'Find your creator\'s diary',
        points: 2,
        type: 'progression',
        conditions: obtainItem(5, 0x4, 0x411)
    })

    id = id + 1
    set.addAchievement({
        title: 'The Makings of Friendship',
        id: id,
        description: 'Return to Geneva with the preparations nearly complete',
        points: 3,
        type: 'progression',
        conditions: finishAct(5)
    })

    id = id + 1
    // FinishAct(6) doesn't work here, as the chapter data doesn't change until after a cutscene, messing up the inventory and room checks
    set.addAchievement({
        title: 'Indulging the Other',
        id: id,
        description: 'Defeat your opponent in the attic in mortal combat',
        points: 4,
        type: 'progression',
        conditions: $(
            comparison(data.chapter, '=', 6),
            // Pointer to battle data, is junk until after it switches from 0xffff or sometimes 0xa1 when you're being hit
            orNext(
                comparison(create('16bit', 0x638), '=', 0xffff).withLast({ lvalue: { type: 'Prior' } }),
                comparison(create('16bit', 0x638), '=', 0xa1).withLast({ lvalue: { type: 'Prior' } })
            ),
            // Check enemy health goes to 0
            comparison([
                $('I:0x638'),
                create('8bit', 0x190)
            ], '>', 0, true),
            comparison([
                $('I:0x638'),
                create('8bit', 0x190)
            ], '=', 0, false)
        )
    })

    id = id + 1
    set.addAchievement({
        title: 'A Great and Sudden Change',
        id: id,
        description: 'Set your old life ablaze',
        points: 10,
        type: 'win_condition',
        conditions: useItemInRoom(7, 0x4, 0x415)
    })

    id = id + 1
    set.addAchievement({
        title: 'A Life of Loss',
        id: id,
        description: 'Set off into the tundra alone',
        points: 3,
        type: 'win_condition',
        conditions: $(
            comparison(data.chapter, '=', 7),
            comparison(data.room, '=', 3, true),
            comparison(data.room, '=', 4, false),
            comparison(data.inventory[0], '=', 0x416), // Have the tarp
            ...Array(7).fill(null).map((_, i) => comparison(data.inventory[i+1], '=', 0)) // and only the tarp
        )
    })


    let threeHeartLogic: any = useItemInRoom(7, 0x4, 0x415)

    threeHeartLogic['alt9'] = $(
        comparison(data.room, '=', 3, true),
        comparison(data.inventory[0], '=', 0x416), // Have the tarp
        ...Array(7).fill(null).map((_, i) => comparison(data.inventory[i + 1], '=', 0)) // and only the tarp
    )

    id = id + 1
    set.addAchievement({
        title: 'Your Heart Grew Three Sizes That Day',
        id: id,
        description: 'Finish the game with at least 3 hearts remaining',
        points: 25,
        conditions: threeHeartLogic
    })


}