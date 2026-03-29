import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger, orNext, resetIf, measuredIf, measured, addHits, resetNextIf, pauseIf } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation, create } from '../../helpers.js'
import * as fs from 'fs'
import { once } from 'events'

const b = (s) => `local\\\\${s}.png`


function saveLoaded(): ConditionBuilder {
    return $(
        comparison(data.Event(188), '=', 1, true)
    )
}

function isFirstYear(): ConditionBuilder {
    return $(
        comparison(data.Event(192), '=', 1),
        comparison(data.Event(193), '=', 1)
    )
}

function watchEvent(index: number): ConditionBuilder {
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
    //Pause if we aren't in the shop
    let output: ConditionBuilder = $(
        comparison(data.Player.Location, '!=', shop)
    )

    //Pause if we are in the bar/cafe but the opposite shop is open at the time
    if (shop == 0x17) {
        output = output.also(
            isBar && comparison(data.Player.Hour, '<', 18),
            !isBar && comparison(data.Player.Hour, '>=', 18)
        )
    }

    //Pause if our money isn't increasing
    output = output.also(
        comparison(data.Player.Money, '=', data.Player.Money, true, false)
    )

    output = pauseIf(output)



    for (let item of items) {
        output = output.also(
            addHits(
                comparison(data.Player.Item(item), '>', data.Player.Item(item), true, false)
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
        output['alt' + i.toString()] = $(
            comparison(create('8bit', 0x85a230 + i), '=', oldCode, true),
            comparison(create('8bit', 0x85a230 + i), '=', newCode, false)
        )
    }
}


export function makeAchievements(set: AchievementSet): void {

    let i: number = 1
    let badgenum: number = 1

    let totalPeopleMet: Array<ConditionBuilder> = [$(), $()]
    for (let i: number = 0; i <= 17; i++) {
        totalPeopleMet[0] = totalPeopleMet[0].also(
            calculation(true, data.MetNPC(i))
        )
        totalPeopleMet[1] = totalPeopleMet[1].also(
            calculation(true, data.MetNPC(i)).withLast({ lvalue: { type: 'Delta' } })
        )
    }

    set.addAchievement({
        title: 'Tour of the Town',
        description: 'Meet everyone in the valley on Spring 2nd',
        points: 3,
        conditions: $(
            saveLoaded(),
            measuredIf($(
                comparison(data.Player.Season, '=', 0),
                comparison(data.Player.Day, '=', 2)
            )),
            ...(
                Array.from({ length: 18 }, (_, i) => i).map(
                    input => calculation(true, data.MetNPC(input)).withLast({ lvalue: { type: 'Delta' } })
                )
            ),
            '0=17',
            measured(
                ...(
                    Array.from({ length: 18 }, (_, i) => i).map(
                        input => calculation(true, data.MetNPC(input))
                    )
                ),
                '0=18'
            )
        )
    })


    //
    // Ending based Achievements
    //



    set.addAchievement({
        title: 'Frequent Walks',
        description: 'Take your dog for a walk and find the sacred land',
        points: 5,
        conditions: basicAchEvent(0x3)
    })


    set.addAchievement({
        title: 'Reading Pays',
        description: 'Find the sacred land with the help of a history buff',
        points: 5,
        conditions: basicAchEvent(0xc)
    })

    set.addAchievement({
        title: 'a',
        description: 'Observe at the treasure of the sacred land growing with a friend',
        points: 2,
        type: 'missable',
        conditions: {
            core: saveLoaded(),
            alt1: watchEvent(0x6),
            alt2: watchEvent(0x10)
        }
    })

    set.addAchievement({
        title: 'a',
        description: 'Witness the Sweet Potato Festival with Tim',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x1e)
    })

    set.addAchievement({
        title: 'a',
        description: 'Witness the Sweet Potato Festival with Dia',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x1d)
    })


    //
    // Azure Swallowtail
    //


    set.addAchievement({
        title: 'Botanist\'s Journey',
        description: 'Find a seed for a blue flower',
        points: 2,
        conditions: basicAchEvent(0x23)
    })

    set.addAchievement({
        title: 'a',
        description: 'Witness talk about love between two women',
        points: 2,
        type: 'missable',
        conditions: basicAchEvent(0x24)
    })

    set.addAchievement({
        title: 'a',
        description: 'a',
        points: 3,
        type: 'missable',
        conditions: basicAchEvent(0x27)
    })

    set.addAchievement({
        title: 'a',
        description: 'Receive a bride\'s bouquet',
        points: 5,
        type: 'missable',
        conditions: basicAchEvent(0x2a)
    })

    set.addAchievement({
        title: 'a',
        description: 'See the Azure Butterfly',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x2c)
    })

    //
    // Horse Race
    //


    set.addAchievement({
        title: 'a',
        description: 'Overhear a conversation between your race rivals',
        points: 2,
        conditions: basicAchEvent(0x33)
    })

    set.addAchievement({
        title: 'a',
        description: 'Beat Bob in a race',
        points: 3,
        conditions: $('1=1')
    })

    set.addAchievement({
        title: 'a',
        description: 'Beat Gwen in a race',
        points: 5,
        conditions: $('1=1')
    })

    set.addAchievement({
        title: 'a',
        description: 'Win the horse race',
        points: 10,
        type: 'win_condition',
        conditions: $('1=1')
    })

    //
    // Cake Contest
    //

    set.addAchievement({
        title: 'It\'s a Piece of Cake',
        description: 'Find a recipe for an aspiring baker',
        points: 1,
        conditions: basicAchEvent(0x45)
    })

    set.addAchievement({
        title: 'To Bake a Pretty Cake',
        description: 'Witness a private baking lesson',
        points: 3,
        type: 'missable',
        conditions: basicAchEvent(0x4d)
    })

    set.addAchievement({
        title: 'If the Way Is Hazy',
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

    set.addAchievement({
        title: 'You Gotta Do the Cookin\' by the Book',
        description: 'Help a young baker win the baking competition',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x63)
    })

    //
    // Goddess Dress
    //

    set.addAchievement({
        title: 'a',
        description: 'Find help for an aspiring fashion designer',
        points: 2,
        conditions: basicAchEvent(0x66)
    })

    set.addAchievement({
        title: 'a',
        description: 'Deliver the Goddess\' Cloth to the seamstress',
        points: 3,
        conditions: basicAchEvent(0x6b)
    })

    set.addAchievement({
        title: 'a',
        description: 'Witness an argument from a friend who feels neglected',
        points: 3,
        conditions: $('1=1')
    })

    set.addAchievement({
        title: 'a',
        description: 'Help the seamstress win the dress contest',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x73)
    })

    //
    // Silver Fish
    //

    set.addAchievement({
        title: 'a',
        description: 'Receive the fishing rod from an avid fisher',
        points: 2,
        conditions: basicAchEvent(0x75)
    })

    set.addAchievement({
        title: 'a',
        description: 'Purchase the super fishing rod',
        points: 5,
        type: 'missable',
        conditions: upgradedTool(0x55, 0x5b)

    })

    set.addAchievement({
        title: 'a',
        description: 'Receive advice from the divine on the silver fish',
        points: 3,
        type: 'missable',
        conditions: basicAchEvent(0x7c) //DOUBLE CHECK
    })


    set.addAchievement({
        title: 'a',
        description: 'Save the homeland with a silver scale',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x7e)
    })

    //
    // Endangered Weasel
    //

    set.addAchievement({
        title: 'a',
        description: 'Help the sprites with a weasel problem',
        points: 2,
        conditions: basicAchEvent(0x81)
    })


    set.addAchievement({
        title: 'a',
        description: 'Save the homeland with the help of a weasel',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x88)
    })

    //
    // Bluebird
    //

    set.addAchievement({
        title: 'a',
        description: 'Receive the recorder from the inventor',
        points: 2,
        conditions: basicAchEvent(0x8a)
    })

    set.addAchievement({
        title: 'a',
        description: 'Score over 140 in your recorder preformance',
        points: 5,
        type: 'missable',
        conditions: $(
            saveLoaded(),
            measuredIf(
                'I:0xX2675c4',
                '0xHb>0'
            ),
            'I:0xX2675c4',
            'd0xHb=55',
            'I:0xX2675c4',
            '0xHb=56',
            'I:0xX2675c4',
            measured(
                '0xH8>=140'
            )
        )
    })

    set.addAchievement({
        title: 'a',
        description: 'Witness a proposal with a love interest',
        points: 3,
        type: 'missable',
        conditions: $(
            basicAchEvent(0x8a),
            orNext(
                comparison(data.NPCAP('Gwen'), '>', 99),
                comparison(data.NPCAP('Dia'), '>', 99),
                comparison(data.NPCAP('Katie'), '>', 99),
                comparison(data.NPCAP('Gina'), '>', 99)
            )
        )
    })

    set.addAchievement({
        title: 'a',
        description: 'Save the valley by finding the endangered bluebird',
        points: 10,
        type: 'win_condition',
        conditions: basicAchEvent(0x92)
    })


    //
    // Goddess Profile
    //



    //
    // Shops
    //

    set.addAchievement({
        title: 'Supermarket Sweep',
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

    set.addAchievement({
        title: 'Floral Fiefdom',
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

    set.addAchievement({
        title: 'Cafe Compass',
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

    set.addAchievement({
        title: 'Full Carpenter Circle',
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

    set.addAchievement({
        title: 'Tool Totality',
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

    set.addAchievement({
        title: 'a',
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

    set.addAchievement({
        title: 'Breadth of the Bar',
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


    //
    // Best Friends
    //

    const BFAchs: Array<Array<string>> = [
        ['Nic', 'Snap'],
        ['Nac', 'Crackle'],
        ['Flak', 'Pop'],
        ['Ronald', 'The Store Owner'],
        ['Wallace', 'The Old Barkeep'],
        ['Katie', 'The Young Patissier'],
        ['Louis', 'The Amateur Inventor'],
        ['Lyla', 'The Fair Florist'],
        ['Parsely', 'The Botanist Hunter'],
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
    }


    //
    // Character Specific Stuff
    //

    set.addAchievement({
        title: 'a',
        description: 'Purchase the super sickle',
        points: 3,
        conditions: upgradedTool(0x51, 0x52)
    })

    set.addAchievement({
        title: 'Powering Up',
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

    set.addAchievement({
        title: 'Max Power',
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

    set.addAchievement({
        title: 'No More Outhouse Needed',
        description: 'Build a kitchen',
        points: 5,
        conditions: $(
            saveLoaded(),
            watchEvent(0xb8)
        )
    })

    set.addAchievement({
        title: 'A House of One\'s Own',
        description: 'Build a doghouse',
        points: 3,
        conditions: $(
            saveLoaded(),
            watchEvent(0xb9)
        )
    })


    //
    // Animals
    //


    set.addAchievement({
        title: 'Diligent Part-Timer',
        description: 'Adopt a horse',
        points: 3,
        conditions: $(
            saveLoaded(),
            comparison(data.Horse.IsAdopted, '=', 0, true),
            comparison(data.Horse.IsAdopted, '=', 1, false)
        )
    })

    set.addAchievement({
        title: 'a',
        description: 'Reach 5 hearts with your horse',
        points: 5,
        conditions: $(
            saveLoaded(),
            comparison(data.Horse.AP, '<', 0xf0, true),
            comparison(data.Horse.AP, '>=', 0xf0, false)
        )
    })

    set.addAchievement({
        title: 'Stray\'s Salvation',
        description: 'Adopt a dog',
        points: 3,
        conditions: $(
            saveLoaded(),
            comparison(data.Dog.IsAdopted, '=', 0, true),
            comparison(data.Dog.IsAdopted, '=', 1, false)
        )
    })

    set.addAchievement({
        title: 'a',
        description: 'Reach 5 hearts with your dog',
        points: 5,
        conditions: $(
            saveLoaded(),
            comparison(data.Dog.AP, '<', 0xdc, true),
            comparison(data.Dog.AP, '>=', 0xdc, false)
        )
    })


    set.addAchievement({
        title: 'a',
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
        title: 'a',
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
                '0=5'
            ),
            alt2: $(
                ...(data.Chickens.map(animal => isHappyChain(animal, true))),
                '0=5'

            )
        }
    })

    set.addAchievement({
        title: 'a',
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
                '0=4'
            ),
            alt2: $(
                ...(data.Cows.map(animal => isHappyChain(animal, true))),
                '0=4'

            )
        }
    })

    set.addAchievement({
        title: 'a',
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

    set.addAchievement({
        title: 'a',
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
            let alt1: ConditionBuilder = pauseIf(
                comparison(data.Player.CurrentAction, '!=', 0xb)
            )

            for (let food of Cookbook[method]) {
                alt1 = alt1.also(
                    addHits(gainedItem(food).withLast({ hits: 1 }))
                )
            }

            alt1 = alt1.also(
                measured('0=1').withLast({ hits: Cookbook[method].length })
            )

            return {
                core: $(
                    resetIf(saveLoaded().withLast({ cmp: '!=' }))
                ),
                alt1: alt1
            }

        }

        else {
            return $()
        }
    }

    set.addAchievement({
        title: 'a',
        description: 'Cook all oven recipes in one session',
        points: 10,
        conditions: cookedAllFood('Oven')
    })

    set.addAchievement({
        title: 'a',
        description: 'Cook all pot recipes in one session',
        points: 10,
        conditions: cookedAllFood('Pot')
    })

    set.addAchievement({
        title: 'a',
        description: 'Cook all frying pan recipes in one session',
        points: 10,
        conditions: cookedAllFood('Pan')
    })


    //
    // Other
    //

    set.addAchievement({
        title: 'a',
        description: 'Catch the King of Maple Lake',
        points: 10,
        conditions: $(
            saveLoaded(),
            comparison(data.Player.SpecialFishCaught[0], '=', 0, true),
            comparison(data.Player.SpecialFishCaught[0], '=', 1, false)
        )
    })

    set.addAchievement({
        title: 'a',
        description: 'Catch the strange fish',
        points: 10,
        conditions: $(
            saveLoaded(),
            comparison(data.Player.SpecialFishCaught[1], '=', 0, true),
            comparison(data.Player.SpecialFishCaught[1], '=', 1, false)
        )
    })

    set.addAchievement({
        title: 'a',
        description: 'Pick a full moon berry',
        points: 1,
        conditions: $(
            saveLoaded(),
            comparison(data.Player.Location, '=', 0x5),
            comparison(data.Player.Holding, '=', 0xff, true),
            comparison(data.Player.Holding, '=', 0xf, false)
        )
    })

    set.addAchievement({
        title: 'a',
        description: 'Become best friends with all the humans in the valley in year 1',
        points: 25,
        conditions: $(
            measuredIf(
                saveLoaded(),
                isFirstYear()
            ),
            ...(
                Array.from({ length: 14 }, (_, i) => i).map(
                    input => calculation(true, data.NPCAP(input), '/', 200, true)
                )
            ),
            '0<14',
            ...(
                Array.from({ length: 14 }, (_, i) => i).map(
                    input => calculation(true, data.NPCAP(input), '/', 200, false)
                )
            ),
            measured('0=14')
            
        )
    })

    set.addAchievement({
        title: 'a',
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
    
}
