import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger, orNext, resetIf, measuredIf, measured, addHits, resetNextIf, pauseIf } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation, create } from '../../helpers.js'
import * as fs from 'fs'
import { once } from 'events'

const b = (s) => `local\\\\${s}.png`


export function saveLoaded(): ConditionBuilder {
    return $(
        comparison(data.Event(188), '=', 1, true)
    )
}

export function isFirstYear(): ConditionBuilder {
    return $(
        comparison(data.Event(192), '=', 1),
        comparison(data.Event(193), '=', 1)
    )
}

export function watchEvent(index: number): ConditionBuilder {
    return $(
        comparison(data.Event(index), '=', 0, true),
        comparison(data.Event(index), '=', 1, false)
    )
}

function basicAchEvent(index: number): ConditionBuilder {
    return $(
        saveLoaded(),
        watchEvent(index)
    )
}

function sellOneOfAll(shop: number, items: Array<number>, isBar: boolean = false): ConditionBuilder {

    let output: ConditionBuilder = $( )


    for (let item of items) {
        output = output.also(
            addHits(
                andNext(
                    comparison(data.Player.Location, '=', shop), // In the right shop area
                    (shop == 0x17) && isBar && comparison(data.Player.Hour, '>=', 18), // for the bar and cafe, check we're in the right time
                    (shop == 0x17) && !isBar && comparison(data.Player.Hour, '<', 18),
                    comparison(data.Player.Money, '<', data.Player.Money, true, false), // make sure the money is increasing
                    comparison(data.Player.Item(item), '>', data.Player.Item(item), true, false) // make sure the item is decreasing
                )
            ).withLast({hits: 1})
        )
    }

    output = output.also(
        measured(
            $('0=1').withLast({ hits: items.length })
        )
    )

    return output
}

/**
 * Only up to item code 0x48, tools and special items need to be handled differently
 * @param index
 * @returns
 */
function gainedItem(index: number): ConditionBuilder {
    return $(
        comparison(data.Player.Item(index), '<', data.Player.Item(index), true, false)
    )
}


function upgradedTool(oldCode: number, newCode: number): any {
    let output:any = {
        core: $(
            saveLoaded()
        )
    }

    for (let i: number = 0; i < 16; i++) {
        output['alt' + (i+1).toString()] = $(
            comparison(create('8bit', 0x85a230 + i), '=', oldCode, true),
            comparison(create('8bit', 0x85a230 + i), '=', newCode, false)
        )
    }

    return output
}


export function makeAchievements(set: AchievementSet): void {

    let i: number = 1
    let badgenum: number = 1

    

    set.addAchievement({
        title: 'Tour of the Town',
        badge: b(badgenum),
        description: 'Meet everyone in the valley on Spring 2nd',
        points: 3,
        conditions: $(
            saveLoaded(),
            measuredIf($(
                comparison(data.Player.Season, '=', 0),
                comparison(data.Player.Day, '=', 2)
            )),
            ...(
                [...Array.from({ length: 15 }, (_, i) => i), 22, 23, 24].map(
                    input => calculation(true, data.MetNPC(input)).withLast({ lvalue: { type: 'Delta' } })
                )
            ),
            '0=17',
            measured(
                ...(
                    [...Array.from({ length: 15 }, (_, i) => i), 22, 23, 24].map(
                        input => calculation(true, data.MetNPC(input))
                    )
                ),
                '0=18'
            )
        )
    })


    badgenum = badgenum + 1

    //
    // Ending based Achievements
    //



    set.addAchievement({
        title: 'Frequent Walks',
        badge: b(badgenum),
        description: 'Take your dog for a walk and stumble into the sacred land',
        points: 5,
        conditions: basicAchEvent(0x3)
    })

    badgenum = badgenum + 1


    set.addAchievement({
        title: 'Reading Pays',
        badge: b(badgenum),
        description: 'Discover the sacred land with the help of a history buff',
        points: 5,
        conditions: basicAchEvent(0xc)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'The Golden Treasure',
        badge: b(badgenum),
        description: 'Look upon the treasure of the sacred land growing with a friend',
        points: 2,
        type: 'missable',
        conditions: {
            core: saveLoaded(),
            alt1: watchEvent(0x6),
            alt2: watchEvent(0x10)
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'An Adventurer\'s Home Base',
        badge: b(badgenum),
        description: 'Save the valley with a rare golden potato with Tim',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x1e)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'A Kiss Amongst the Grass',
        badge: b(badgenum),
        description: 'Save the valley with a rare golden potato with Dia',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x1d)
    })

    badgenum = badgenum + 1


    //
    // Azure Swallowtail
    //


    set.addAchievement({
        title: 'Botanist\'s Journey',
        badge: b(badgenum),
        description: 'Find a seed for a blue flower',
        points: 2,
        conditions: basicAchEvent(0x23)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Bechdel\'s Nightmare',
        badge: b(badgenum),
        description: 'Witness talk about love between two women',
        points: 4,
        type: 'missable',
        conditions: basicAchEvent(0x24)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'He Went to Bestbuy',
        badge: b(badgenum),
        description: 'Witness the dicussion about a camera from a one-sided crush',
        points: 3,
        type: 'missable',
        conditions: basicAchEvent(0x27)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'A Bundle of Love',
        badge: b(badgenum),
        description: 'Receive a bride\'s bouquet',
        points: 5,
        type: 'missable',
        conditions: basicAchEvent(0x2a)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'The Butterfly Effect',
        badge: b(badgenum),
        description: 'Save the valley by finding the endangered butterfly',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x2c)
    })

    badgenum = badgenum + 1

    //
    // Horse Race
    //


    set.addAchievement({
        title: 'Reconnaissance for the Homeland',
        badge: b(badgenum),
        description: 'Overhear a conversation between your race rivals',
        points: 2,
        conditions: basicAchEvent(0x33)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'The Horsey 500',
        badge: b(badgenum),
        description: 'Beat Bob in a race',
        points: 4,
        conditions: $(
            saveLoaded(),
            comparison(data.S2Event, '=', 0xff, true),
            comparison(data.S0Event, '=', 0x03, true),
            comparison(data.S0Event, '=', 0x12, false)
        )
    })

    badgenum = badgenum + 1

    const FrameTimer: Partial<Condition.Data> = create('32bit', 0x14)

    set.addAchievement({
        title: 'The Tortoise and the Race Car',
        badge: b(badgenum),
        description: 'Beat Gwen\'s best time of 52 seconds around the race track',
        points: 5,
        type: 'missable',
        conditions: $(
            saveLoaded(),

            andNext(
                comparison(data.S0Event, '!=', 0x3),               
                orNext(
                    comparison(data.S0Event, '!=', 0x4),                  
                    andNext(
                        comparison(data.S2Event, '!=', 0xff),
                        resetIf(
                            comparison(data.Player.CurrentAction, '!=', 0xf)
                        )
                    )
                )
            ), // Reset if we aren't doing a time trial, or racing bob/gwen


            'I:0xX2675d0',
            comparison(FrameTimer, '=', 0).withLast({ hits: 1 }), // Timer must have been at 0 at some point, to not measure the garbage before the race
            'I:0xX2675d0',
            comparison(FrameTimer, '!=', 0), // Don't submit before the race has started
            resetNextIf(
                'I:0xX2675d0',
                comparison(FrameTimer, '!=', FrameTimer, true, false)
            ),
            'I:0xX2675d0',
            comparison(FrameTimer, '=', FrameTimer, true, false).withLast({ hits: 5 }), //Wait for the timer to stop for at least 5 frames in a row, for saftey
            'I:0xX2675d0',
            comparison(FrameTimer, '<', 3120) // check time is less than 52 seconds

        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'The Goddess Derby',
        badge: b(badgenum),
        description: 'Save the valley by hosting a horse race',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x41)
    })

    badgenum = badgenum + 1

    //
    // Cake Contest
    //

    set.addAchievement({
        title: 'It\'s a Piece of Cake',
        badge: b(badgenum),
        description: 'Find a recipe for an aspiring baker',
        points: 2,
        conditions: basicAchEvent(0x45)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'To Bake a Pretty Cake',
        badge: b(badgenum),
        description: 'Witness a private baking lesson',
        points: 3,
        type: 'missable',
        conditions: basicAchEvent(0x4d)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'If the Way Is Hazy',
        badge: b(badgenum),
        description: 'Make Moon Drop Dew',
        points: 5,
        type: 'missable',
        conditions: {
            core: saveLoaded(),
            alt1: watchEvent(0x52),
            alt2: watchEvent(0x54),
            alt3: watchEvent(0x56),
            alt4: watchEvent(0x58),
            alt5: watchEvent(0x5a)
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'You Gotta Do the Cookin\' by the Book',
        badge: b(badgenum),
        description: 'Save the valley with a world renowned cake',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x63)
    })

    badgenum = badgenum + 1

    //
    // Goddess Dress
    //

    set.addAchievement({
        title: 'Florals? For Spring?',
        badge: b(badgenum),
        description: 'Find help for an aspiring fashion designer',
        points: 2,
        conditions: basicAchEvent(0x66)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'It\'s Actually Cerulean',
        badge: b(badgenum),
        description: 'Deliver the Goddess\' Cloth to the seamstress',
        points: 3,
        conditions: basicAchEvent(0x6b)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Truth Is, No One Can Do What I Do',
        badge: b(badgenum),
        description: 'Witness a quiet man soothe a scorned friend',
        points: 5,
        conditions: basicAchEvent(0x6e)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'That\'s All',
        badge: b(badgenum),
        description: 'Save the valley with a world renowned dress',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x73)
    })

    badgenum = badgenum + 1

    //
    // Silver Fish
    //

    set.addAchievement({
        title: 'Sharing Hobbies',
        badge: b(badgenum),
        description: 'Receive the fishing rod from an avid fisher',
        points: 2,
        conditions: basicAchEvent(0x75)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Fish Fear Me',
        badge: b(badgenum),
        description: 'Purchase the super fishing rod',
        points: 3,
        type: 'missable',
        conditions: upgradedTool(0x55, 0x5b)

    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Holy Mackerel',
        badge: b(badgenum),
        description: 'Receive advice from the divine on the silver fish',
        points: 5,
        type: 'missable',
        conditions: basicAchEvent(0x7c) 
    })

    badgenum = badgenum + 1


    set.addAchievement({
        title: 'Tipping the Silver Scales',
        badge: b(badgenum),
        description: 'Save the town by finding the endangered fish',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x7e)
    })

    badgenum = badgenum + 1

    //
    // Endangered Weasel
    //

    set.addAchievement({
        title: 'Don\'t Mess With Me or My Sons',
        badge: b(badgenum),
        description: 'Help the sprites with a weasel problem',
        points: 2,
        conditions: basicAchEvent(0x81)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Ding Dong',
        badge: b(badgenum),
        description: 'Attend a failed photoshoot',
        points: 3,
        conditions: basicAchEvent(0x85)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Could Have Been the Theme Park\'s Mascot',
        badge: b(badgenum),
        description: 'Save the town by finding the endangered weasel',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x88)
    })

    badgenum = badgenum + 1

    //
    // Bluebird
    //

    set.addAchievement({
        title: 'Recruited to the Band',
        badge: b(badgenum),
        description: 'Receive the recorder from the inventor',
        points: 2,
        conditions: basicAchEvent(0x8a)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Snow White Incarnate',
        badge: b(badgenum),
        description: 'Score over 150 in your recorder preformance',
        points: 5,
        type: 'missable',
        conditions: $(
            measuredIf(
                saveLoaded(),
                comparison(data.S2Event, '=', 0xff),
                comparison(data.S0Event, '=', 0x05)
            ),
            'I:0xX2675c4',
            'd0xHb=55',
            'I:0xX2675c4',
            '0xHb=56',
            'I:0xX2675c4',
            measured(
                '0xH8>=150'
            )
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Flashes of the Future',
        badge: b(badgenum),
        description: 'Witness a proposal with a love interest',
        points: 3,
        type: 'missable',
        conditions: $(
            basicAchEvent(0x92),
            orNext(
                comparison(data.NPCAP('Gwen'), '>', 99),
                comparison(data.NPCAP('Dia'), '>', 99),
                comparison(data.NPCAP('Katie'), '>', 99),
                comparison(data.NPCAP('Gina'), '>', 99)
            )
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'A Storied Tradition',
        badge: b(badgenum),
        description: 'Save the valley by finding the endangered bluebird',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x92)
    })


    badgenum = badgenum + 1

    //
    // Goddess Profile
    //


    set.addAchievement({
        title: 'The Fledgling Goddess',
        badge: b(badgenum),
        description: 'Unlock Marina\'s profile',
        points: 10,
        conditions: $(
            saveLoaded(),
            comparison(data.MarinaProfile, '=', 0x0, true),
            comparison(data.MarinaProfile, '=', 0xff, false)
        )
    })

    badgenum = badgenum + 1


    //
    // Shops
    //

    set.addAchievement({
        title: 'Supermarket Sweep',
        badge: b(badgenum),
        description: 'Sell one of everything to the Supermarket in one session',
        points: 5,
        conditions: {
            core: $(
                '1=1',
                resetIf(
                    saveLoaded().withLast({ cmp: '!=' })
                )
            ),
            alt1: $(
                sellOneOfAll(0xf, [0x0, 0x1, 0x2, 0x3, 0xa, 0xb, 0xc, 0x1a, 0x1c])
            )
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Floral Fiefdom',
        badge: b(badgenum),
        description: 'Sell one of everything to the Flower Shop in one session',
        points: 5,
        conditions: {
            core: $(
                '1=1',
                resetIf(
                    saveLoaded().withLast({ cmp: '!=' })
                )
            ),
            alt1: $(
                sellOneOfAll(0x11, [0x0, 0x1, 0x2, 0x40, 0x41, 0x10, 0x47])
            )
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Cafe Compass',
        badge: b(badgenum),
        description: 'Sell one of everything to the Sunny Garden Cafe in one session',
        points: 5,
        conditions: {
            core: $(
                '1=1',
                resetIf(
                    saveLoaded().withLast({ cmp: '!=' })
                )
            ),
            alt1: $(
                sellOneOfAll(0x17, [0x10, 0x3, 0x4, 0x6, 0x7, 0x8, 0x9, 0x1c, 0x1a, 0x26, 0x27, 0x28, 0x29], false)
            )
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Full Carpenter Circle',
        badge: b(badgenum),
        description: 'Sell one of everything to the Carpenter in one session',
        points: 5,
        conditions: {
            core: $(
                '1=1',
                resetIf(
                    saveLoaded().withLast({ cmp: '!=' })
                )
            ),
            alt1: $(
                sellOneOfAll(0x15, [0x44, 0x45, 0x42, 0x43, 0x47])
            )
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Tool Totality',
        badge: b(badgenum),
        description: 'Sell one of everything to the Tool Shop in one session',
        points: 5,
        conditions: {
            core: $(
                '1=1',
                resetIf(
                    saveLoaded().withLast({ cmp: '!=' })
                )
            ),
            alt1: $(
                sellOneOfAll(0x13, [0x46, 0x45, 0x43, 0x42, 0x15, 0x11, 0x6, 0x7, 0x8, 0x9])
            )
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Villa\'s Volume',
        badge: b(badgenum),
        description: 'Sell one of everything to Clove\'s Villa in one session',
        points: 5,
        conditions: {
            core: $(
                '1=1',
                resetIf(
                    saveLoaded().withLast({ cmp: '!=' })
                )
            ),
            alt1: $(
                sellOneOfAll(0x19, [0x4, 0x6, 0x7, 0x8, 0x9, 0x0, 0x1, 0x2, 0x3, 0x1c, 0x1a, 0x13, 0x14, 0x10])
            )
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Breadth of the Bar',
        badge: b(badgenum),
        description: 'Sell one of everything to the bar in one session',
        points: 5,
        conditions: {
            core: $(
                '1=1',
                resetIf(
                    saveLoaded().withLast({ cmp: '!=' })
                )
            ),
            alt1: $(
                sellOneOfAll(0x17, [0xa, 0xb, 0xc, 0xd, 0xe, 0x13, 0x14, 0x1c, 0x0, 0x1, 0x2], true)
            )
        }
    })

    badgenum = badgenum + 1


    //
    // Best Friends
    //

    const BFAchs: Array<Array<string>> = [
        ['Nik', 'Snap'],
        ['Nac', 'Crackle'],
        ['Flak', 'Pop'],
        ['Ronald', 'The Store Owner'],
        ['Wallace', 'The Old Barkeep'],
        ['Katie', 'The Young Patissier'],
        ['Louis', 'The Amateur Inventor'],
        ['Lyla', 'The Fair Florist'],
        ['Parsley', 'The Botanist Hunter'],
        ['Bob', 'The Steadfast Rancher'],
        ['Tim', 'The Young Explorer'],
        ['Gwen', 'The Animal Lover'],
        ['Martha', 'Clove\'s Caretaker'],
        ['Gina', 'The Maiden Maid'],
        ['Dia', 'The Stoic Bookworm'],
        ['Woody', 'The Experienced Woodsman'],
        ['Joe', 'The Frenzied Fisher'],
        ['Kurt', 'The Quiet Apprentice']
    ]

    for (let Names of BFAchs) {
        set.addAchievement({
            title: Names[1],
            badge: b(badgenum),
            description: 'Become best friends with ' + Names[0],
            points: 5,
            conditions: $(
                measuredIf(
                    saveLoaded()
                ),
                comparison(data.NPCAP(Names[0]), '<', 200, true),
                measured(
                    comparison(data.NPCAP(Names[0]), '>=', 200)
                )
            )
        })

        badgenum = badgenum + 1

    }


    //
    // Character Specific Stuff
    //

    set.addAchievement({
        title: 'Grass Cutting Extraodinaire',
        badge: b(badgenum),
        description: 'Purchase the super sickle',
        points: 3,
        conditions: upgradedTool(0x51, 0x52)
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Powering Up',
        badge: b(badgenum),
        description: 'Find two power berries',
        points: 5,
        conditions: $(
            measuredIf(
                saveLoaded()
            ),
            comparison(data.Player.PowerBerryCount, '=', 1, true),
            measured(
                comparison(data.Player.PowerBerryCount, '=', 2, false)
            )
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Max Power',
        badge: b(badgenum),
        description: 'Find all five power berries',
        points: 10,
        conditions: $(
            measuredIf(
                saveLoaded(),
                comparison(data.Player.PowerBerryCount, '>=', 2)
            ),
            comparison(data.Player.PowerBerryCount, '=', 4, true),
            measured(
                comparison(data.Player.PowerBerryCount, '=', 5, false)
            )
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'No More Outhouse Needed',
        badge: b(badgenum),
        description: 'Build a kitchen',
        points: 5,
        conditions: $(
            saveLoaded(),
            watchEvent(0xb8)
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'A House of One\'s Own',
        badge: b(badgenum),
        description: 'Build a doghouse',
        points: 3,
        conditions: $(
            saveLoaded(),
            watchEvent(0xb9)
        )
    })

    badgenum = badgenum + 1


    //
    // Animals
    //


    set.addAchievement({
        title: 'Diligent Part-Timer',
        badge: b(badgenum),
        description: 'Adopt a horse',
        points: 3,
        conditions: $(
            saveLoaded(),
            comparison(data.Horse.IsAdopted, '=', 0, true),
            comparison(data.Horse.IsAdopted, '=', 1, false)
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Man\'s Best Chariot',
        badge: b(badgenum),
        description: 'Reach 5 hearts with your horse',
        points: 5,
        conditions: $(
            saveLoaded(),
            comparison(data.Horse.AP, '<', 0xf0, true),
            comparison(data.Horse.AP, '>=', 0xf0, false)
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Stray\'s Salvation',
        badge: b(badgenum),
        description: 'Adopt a dog',
        points: 3,
        conditions: $(
            saveLoaded(),
            comparison(data.Dog.IsAdopted, '=', 0, true),
            comparison(data.Dog.IsAdopted, '=', 1, false)
        )
    })
    badgenum = badgenum + 1


    set.addAchievement({
        title: 'Farmer\'s Best Friend',
        badge: b(badgenum),
        description: 'Reach 5 hearts with your dog',
        points: 5,
        conditions: $(
            saveLoaded(),
            comparison(data.Dog.AP, '<', 0xdc, true),
            comparison(data.Dog.AP, '>=', 0xdc, false)
        )
    })

    badgenum = badgenum + 1


    set.addAchievement({
        title: 'Good Boy!',
        badge: b(badgenum),
        description: 'Have your dog preform sit down, lay down, heel, and round up cows all in one day',
        points: 5,
        conditions: $(
            measuredIf(
                saveLoaded(),
                comparison(data.Dog.IsAdopted, '=', 1)
            ),
            resetIf(comparison(data.Player.Day, '!=', data.Player.Day, true, false)),
            addHits(
                comparison(data.Dog.PerformingHeel, '=', 1).withLast({ hits: 1 }),
                comparison(data.Dog.PerformingSit, '=', 1).withLast({ hits: 1 }),
                comparison(data.Dog.PerformingLayDown, '=', 1).withLast({ hits: 1 }),
                comparison(data.Dog.PerformingCows, '=', 1).withLast({ hits: 1 })
            ),
            measured('0=1').withLast({ hits: 4 })
        )
    })

    badgenum = badgenum + 1


    function isAliveChain(animal: data.chicken | data.cow, isDelta?: boolean): ConditionBuilder {
        let output = calculation(true, animal.IsAlive)
        if (isDelta) {
            return output.withLast({ lvalue: { type: 'Delta' } })
        }
        return output
    }

    function isHappyChain(animal: data.chicken | data.cow, isDelta?: boolean): ConditionBuilder {
        let output = calculation(true, animal.IsHappy)
        if (isDelta) {
            return output.withLast({ lvalue: { type: 'Delta' } })
        }
        return output
    }

    set.addAchievement({
        title: 'Chicken Run? I Sure Hope They Do',
        badge: b(badgenum),
        description: 'Have a full coup of fully grown and very happy chickens',
        points: 5,
        conditions: {
            core: $(
                saveLoaded(),
                ...(data.Chickens.map(animal => isAliveChain(animal, false))),
                '0=6',
                ...(data.Chickens.map(animal => isHappyChain(animal, false))),
                '0=6',
            ),
            alt1: $(
                ...(data.Chickens.map(animal => isAliveChain(animal, true))),
                '0<6'
            ),
            alt2: $(
                ...(data.Chickens.map(animal => isHappyChain(animal, true))),
                '0<6'

            )
        }
    })
    badgenum = badgenum + 1


    set.addAchievement({
        title: '30 Gallons a Day',
        badge: b(badgenum),
        description: 'Have a full barn of fully grown and very happy cows',
        points: 5,
        conditions: {
            core: $(
                saveLoaded(),
                ...(data.Cows.map(animal => isAliveChain(animal, false))),
                '0=5',
                ...(data.Cows.map(animal => isHappyChain(animal, false))),
                '0=5',
            ),
            alt1: $(
                ...(data.Cows.map(animal => isAliveChain(animal, true))),
                '0<5'
            ),
            alt2: $(
                ...(data.Cows.map(animal => isHappyChain(animal, true))),
                '0<5'

            )
        }
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Cheep Cheep!',
        badge: b(badgenum),
        description: 'Hatch a chick',
        points: 1,
        conditions: $(
            saveLoaded(),
            orNext(
                comparison(data.Player.Location, '=', 0x0),
                comparison(data.Player.Location, '=', 0x1),
                comparison(data.Player.Location, '=', 0xe)
            ),
            ...(data.Chickens.map(animal => isAliveChain(animal, true))),
            'K:0',
            ...(data.Chickens.map(animal => isAliveChain(animal, false))),
            '0>{recall}',
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Moo!',
        badge: b(badgenum),
        description: 'Have one of your cows give birth',
        points: 2,
        conditions: $(
            saveLoaded(),
            orNext(
                comparison(data.Player.Location, '=', 0x0),
                comparison(data.Player.Location, '=', 0x1),
                comparison(data.Player.Location, '=', 0xd)
            ),
            ...(data.Cows.map(animal => isAliveChain(animal, true))),
            'K:0',
            ...(data.Cows.map(animal => isAliveChain(animal, false))),
            '0>{recall}',
        )
    })


    badgenum = badgenum + 1

    //
    // Cooking
    //

    function cookedAllFood(method: string): any {
        const Cookbook: { [id: string]: Array<number> } = {
            'Oven': [0x1d, 0x1e, 0x1b, 0x37, 0x34, 0x38, 0x33, 0x36],
            'Pot': [0x26, 0x27, 0x28, 0x29, 0x31, 0x1c, 0x35, 0x2b, 0x2c, 0x2d, 0x24, 0x22, 0x2a, 0x1a],
            'Pan': [0x21, 0x2e, 0x20, 0x30, 0x2f, 0x1f, 0x17, 0x32, 0x23]
        }

        if (method in Cookbook) {
            let logic: ConditionBuilder = $(
                resetIf(saveLoaded().withLast({ cmp: '!=' }))
            )

            for (let food of Cookbook[method]) {
                logic = logic.also(
                    addHits(
                        andNext(
                            comparison(data.Player.CurrentAction, '=', 0xb, true),
                            comparison(data.Player.CurrentAction, '=', 0x0, false),
                            comparison(data.Player.Holding, '=', food).withLast({ hits: 1 })
                        )
                    )
                )
            }

            logic = logic.also(
                measured('0=1').withLast({ hits: Cookbook[method].length })
            )

            return logic

        }

        else {
            return $()
        }
    }

    set.addAchievement({
        title: 'Oven: The Hot Food',
        badge: b(badgenum),
        description: 'Cook all oven recipes in one session',
        points: 10,
        conditions: cookedAllFood('Oven')
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Pot: The Wet Food',
        badge: b(badgenum),
        description: 'Cook all pot recipes in one session',
        points: 10,
        conditions: cookedAllFood('Pot')
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Pan: The Seared Food',
        badge: b(badgenum),
        description: 'Cook all frying pan recipes in one session',
        points: 10,
        conditions: cookedAllFood('Pan')
    })

    badgenum = badgenum + 1


    //
    // Other
    //

    set.addAchievement({
        title: 'The Great King',
        badge: b(badgenum),
        description: 'Catch the King of Maple Lake',
        points: 10,
        conditions: $(
            saveLoaded(),
            comparison(data.Player.SpecialFishCaught[0], '=', 0, true),
            comparison(data.Player.SpecialFishCaught[0], '=', 1, false)
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'The Haggard Witch',
        badge: b(badgenum),
        description: 'Catch the strange fish',
        points: 10,
        conditions: $(
            saveLoaded(),
            comparison(data.Player.SpecialFishCaught[1], '=', 0, true),
            comparison(data.Player.SpecialFishCaught[1], '=', 1, false)
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'A Full Moon\'s Reflection on a Still Lake',
        badge: b(badgenum),
        description: 'Pick a full moon berry',
        points: 1,
        conditions: $(
            saveLoaded(),
            comparison(data.Player.Location, '=', 0x5),
            comparison(data.Player.Holding, '=', 0xff, true),
            comparison(data.Player.Holding, '=', 0xf, false)
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'The Talk of the Town',
        badge: b(badgenum),
        description: 'Become best friends with all the humans in the valley in year 1',
        points: 25,
        type: 'missable',
        conditions: $(
            measuredIf(
                saveLoaded(),
                isFirstYear()
            ),
            ...(
                Array.from({ length: 15 }, (_, i) => i).map(
                    input => calculation(true, data.NPCAP(input), '/', 200, true)
                )
            ),
            '0<15',
            ...(
                Array.from({ length: 15 }, (_, i) => i).map(
                    input => calculation(true, data.NPCAP(input), '/', 200, false)
                )
            ),
            measured('0=15')
            
        )
    })

    badgenum = badgenum + 1

    set.addAchievement({
        title: 'Just Renting',
        badge: b(badgenum),
        description: 'Save the valley before Summer 1st',
        points: 10,
        conditions: {
            core: $(
                saveLoaded(),
                comparison(data.Player.Season, '=', 0x0)
            ),
            alt1: $(
                watchEvent(0x1d)
            ),
            alt2: $(
                watchEvent(0x1e)
            ),
            alt3: $(
                watchEvent(0x2c)
            ),
            alt4: $(
                watchEvent(0x41)
            ),
            alt5: $(
                watchEvent(0x63)
            ),
            alt6: $(
                watchEvent(0x71)
            ),
            alt7: $(
                watchEvent(0x7e)
            ),
            alt8: $(
                watchEvent(0x88)
            ),
            alt9: $(
                watchEvent(0x92)
            )
        }
    })

    badgenum = badgenum + 1

}
