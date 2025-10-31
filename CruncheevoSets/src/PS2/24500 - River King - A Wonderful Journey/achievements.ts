import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger, orNext, resetIf, measuredIf } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation } from '../../helpers.js'
import * as fs from 'fs'

let Releases: Array<data.allMemory> = [data.usa, data.japan]
const b = (s) => `local\\\\${s}.png`


function bitflagCondition(flagAccess: string, flag: number, turnOn: boolean = true): any {
    return {
        core: $('1=1'),
        alt1: $(
            data.usa.checkVersion(),
            data.usa.story.storyLoaded(),
            comparison(data.usa.story[flagAccess](flag), '=', turnOn ? 0 : 1, true),
            comparison(data.usa.story[flagAccess](flag), '=', turnOn ? 1 : 0, false)
        ),
        alt2: $(
            data.japan.checkVersion(),
            data.japan.story.storyLoaded(),
            comparison(data.japan.story[flagAccess](flag), '=', turnOn ? 0 : 1, true),
            comparison(data.japan.story[flagAccess](flag), '=', turnOn ? 1 : 0, false)
        )
    }
}

export function makeAchievements(set: AchievementSet): void {


    //
    // Progression Achievements
    //

    let titles: Array<string> = [
        'Revenge for NAZA',
        'Not the Realism!',
        'Not the Food Hygiene!',
        'Not the \'70s!',
        'Not the ABC!',
        'Our Bad',
        'Not Our Memories!',
        'Not Water Based!',
        'Do We Have Anything Stronger?',
        'Good Riddance',
        'It Deserved a Good Beating'
    ]
    let points: Array<number> = [1, 2, 3, 4, 5, 5, 10, 10, 1, 10, 10]
    let numbering: Array<string> = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'tenth']
    for (let meteorID: number = 0; meteorID < 11; meteorID++) {

        let conditions: any = {
            core: $('0=0')
        }

        let i:number = 1
        for (let game of Releases) {
            if (meteorID < 9) {
                conditions['alt' + i.toString()] = $(
                    game.checkVersion(),
                    game.story.storyLoaded(),
                    comparison(game.gameplayID, '=', 1),
                    comparison(game.story.meteor.ID, '=', meteorID),
                    game.story.meteor.killed()
                )
            }
            else {
                conditions['alt' + i.toString()] = $(
                    game.checkVersion(),
                    game.story.storyLoaded(),
                    comparison(game.gameplayID, '=', 1),
                    comparison(
                        game.story.cutsceneUnlockedFlag((meteorID == 9) ? 7 : 8),
                        '=', 0, true
                    ),
                    comparison(
                        game.story.cutsceneUnlockedFlag((meteorID == 9) ? 7 : 8),
                        '=', 1, false
                    )
                )
            }
            
            i = i + 1
        }

        set.addAchievement({
            title: titles[meteorID],
            id: (meteorID != 10) ? 553319 + meteorID : 554124, 
            badge: (meteorID == 1) ? 629102 : (
                (meteorID < 9) ? 628291 + meteorID : (
                (meteorID == 9) ? 629103 : (
                (meteorID == 10) ? 629104 : ''
                ))),
            description: 'Defeat the ' + numbering[meteorID] + ' meteor' + ((meteorID < 9) ? '' :
                ((meteorID == 9)?' by using a Transformowatch' : ' without using a Transformowatch')),
            points: points[meteorID],
            type: (meteorID >= 9) ? 'win_condition' : 'progression',
            conditions: conditions
        })
    }





    //
    // Points channel achievements
    //

    titles = [
        'Cowardly Courage',
        'Oscillation Attack',
        'First Is the Worst',
        'Arpeggiated Shredding',
        'Fore!',
        'Yes Touch Service Ace',
        'Chibi-robo, Roll Out',
        'Second Is the Best',
        'Orbital Flail',
        'Makes You Want a Space Dog Real Bad',
        'A Space Dog!',
        'Good Times'
    ]
    let ids: Array<number> = [8, 6, 5, 18, 4, 17, 12, 9, 13, 7, 14, 15]
    points = [1, 2, 2, 3, 5, 5, 5, 5, 5, 5, 25, 10]
    let itemNames:Array<string> = ['a Scary Mask', 'a Galactic Blaster', 'a Space Fan', 'a Space Guitar', 'a Lucky Drakon Stone', 'an Iron Volleyball', 'a Mini HandyBot', 'a Space Fan 2.0', ' a Lunar Remote', 'some Space Fireworks', 'a Transformowatch before the tenth meteor', 'the Reminiscitron']

    for (let i: number = 0; i < 12; i++) {

        let conditions: any = {
            core: $('0=0')
        }

        // Testing the bits turning off to time them on the screen transistion to the battle phase, except for the trans watch and reminisctron
        // The reminis as it won't turn off as it is never "used", and the watch to avoid the weird cutscene if it's used on the final meteor
        let j: number = 1
        for (let game of Releases) {
            conditions['alt' + j.toString()] = $(
                game.checkVersion(),
                game.story.storyLoaded(),
                comparison(game.gameplayID, '=', 1),
                (i == 10) && comparison(game.story.meteor.ID, '<', 9, true),
                comparison(game.story.pointsItem(ids[i]), '=', 1, (i == 11)?false:true),
                comparison(game.story.pointsItem(ids[i]), '=', 0, (i == 11)?true:false)
            )
            j = j + 1
        }

        set.addAchievement({
            title: titles[i],
            id: 553329 + i,
            badge: i + 628301,
            description: (i == 11) ? ('Receive ' + itemNames[i]) : ('Use ' + itemNames[i]),
            points: points[i],
            conditions: conditions
        })
    }





    //
    // Events
    //

    set.addAchievement({
        title: 'A Fantastic Meal',
        id: 553341,
        badge: 628313,
        description: 'Receive a free support item from either the kids or your mother',
        points: 2,
        conditions: bitflagCondition('dailyEventFlag', 16)
    })

    // Has a strange choice needed, selling a 1k or 3k antique you lose the item and then gain the money a few text boxes later
    // selling a 30k antique, you gain the money first, and then lose the item. 
    set.addAchievement({
        title: 'Flea Market',
        id: 553342,
        badge: 628313+1,
        description: 'Sell an antique at a profit',
        points: 3,
        conditions: {
            core: $(
                '1=1',
                resetIf(
                    andNext(
                        data.usa.checkVersion(),
                        comparison(data.usa.gameplayID, '!=', 1)
                    ),
                    orNext(
                        comparison(data.usa.story.dailyEventFlag(15), '=', 1),
                        andNext(
                            comparison(data.usa.story.dailyEventFlag(20), '=', 1),
                            data.usa.checkVersion(),
                            
                        )
                    ),
                    andNext(
                        data.usa.checkVersion(),
                        comparison(data.usa.story.currentMoney, '!=', data.usa.story.currentMoney, true, false).withLast({ hits: 2 })
                    )
                ),
                resetIf(
                    andNext(
                        data.japan.checkVersion(),
                        comparison(data.japan.gameplayID, '!=', 1)
                    ),
                    orNext(
                        comparison(data.japan.story.dailyEventFlag(15), '=', 1),
                        andNext(
                            comparison(data.japan.story.dailyEventFlag(20), '=', 1),
                            data.japan.checkVersion(),

                        )
                    ),
                    andNext(
                        data.japan.checkVersion(),
                        comparison(data.japan.story.currentMoney, '!=', data.japan.story.currentMoney, true, false).withLast({ hits: 2 })
                    )
                )
            ),
            alt1: $(
                data.usa.checkVersion(),
                andNext(
                    comparison(data.usa.story.dailyEventFlag(15), '=', 1, true),
                    comparison(data.usa.story.dailyEventFlag(15), '=', 0, false).withLast({hits: 1})
                ),
                comparison(data.usa.story.currentMoney, '!=', data.usa.story.currentMoney, true, false).withLast({ hits: 1 }),
                calculation(true, data.usa.story.currentMoney, '-', data.usa.story.currentMoney, false, true),
                '0>100000'
            ),
            alt2: $(
                data.usa.checkVersion(),
                andNext(
                    comparison(data.usa.story.dailyEventFlag(20), '=', 1, true),
                    comparison(data.usa.story.dailyEventFlag(20), '=', 0, false).withLast({ hits: 1 })
                ),
                comparison(data.usa.story.currentMoney, '!=', data.usa.story.currentMoney, true, false).withLast({ hits: 1 }),
                calculation(true, data.usa.story.currentMoney, '-', data.usa.story.currentMoney, false, true),
                '0>300000'
            ),
            alt3: $(
                data.usa.checkVersion(),
                comparison(data.usa.story.dailyEventFlag(21), '=', 1, true),
                comparison(data.usa.story.dailyEventFlag(21), '=', 0, false),
                calculation(true, data.usa.story.currentMoney, '-', data.usa.story.currentMoney, false, true).withLast({ rvalue: { type: 'Prior' } }),
                '0>3000000'
            ),
            alt4: $(
                data.japan.checkVersion(),
                andNext(
                    comparison(data.japan.story.dailyEventFlag(15), '=', 1, true),
                    comparison(data.japan.story.dailyEventFlag(15), '=', 0, false).withLast({ hits: 1 })
                ),
                comparison(data.japan.story.currentMoney, '!=', data.japan.story.currentMoney, true, false).withLast({ hits: 1 }),
                calculation(true, data.japan.story.currentMoney, '-', data.japan.story.currentMoney, false, true),
                '0>100000'
            ),
            alt5: $(
                data.japan.checkVersion(),
                andNext(
                    comparison(data.japan.story.dailyEventFlag(20), '=', 1, true),
                    comparison(data.japan.story.dailyEventFlag(20), '=', 0, false).withLast({ hits: 1 })
                ),
                comparison(data.japan.story.currentMoney, '!=', data.japan.story.currentMoney, true, false).withLast({ hits: 1 }),
                calculation(true, data.japan.story.currentMoney, '-', data.japan.story.currentMoney, false, true),
                '0>300000'
            ),
            alt6: $(
                data.japan.checkVersion(),
                comparison(data.japan.story.dailyEventFlag(21), '=', 1, true),
                comparison(data.japan.story.dailyEventFlag(21), '=', 0, false),
                calculation(true, data.japan.story.currentMoney, '-', data.japan.story.currentMoney, false, true).withLast({ rvalue: { type: 'Prior' } }),
                '0>3000000'
            )
        }
    })


    function wonEvent(flagAccess: string, flags: Array<number>): any {
        return {
            core: $('1=1'),
            alt1: $(
                data.usa.checkVersion(),
                data.usa.story.storyLoaded(),
                orNext(
                    ...flags.map(x => comparison(data.usa.story[flagAccess](x), '=', 1))
                ),
                comparison(data.usa.gameplayID, '=', 2, true),
                comparison(data.usa.gameplayID, '=', 3, false),
                comparison(data.usa.paycheck.stamp, '=', 1)
            ),
            alt2: $(
                data.japan.checkVersion(),
                data.japan.story.storyLoaded(),
                orNext(
                    ...flags.map(x => comparison(data.japan.story[flagAccess](x), '=', 1))
                ),
                comparison(data.japan.gameplayID, '=', 2, true),
                comparison(data.japan.gameplayID, '=', 3, false),
                comparison(data.japan.paycheck.stamp, '=', 1)
            )
        }
    }

    set.addAchievement({
        title: 'Keeping the Manager Happy',
        id: 553343,
        badge: 628313+2,
        description: 'Beat Dinewell\'s quota in any job',
        points: 3,
        conditions: wonEvent('dailyEventFlag', [39,40,41])
    })

    set.addAchievement({
        title: 'Conspiracy Theory',
        id: 553344,
        badge: 628313+3,
        description: 'Avoid a disaster predicted by Nostradamus',
        points: 5,
        conditions: wonEvent('dailyEventFlag', [42])
    })

    set.addAchievement({
        title: 'Old Money',
        id: 553345,
        badge: 628313+4,
        description: 'Earn triple the pay by performing a perfect job for your grandfather',
        points: 5,
        conditions: wonEvent('dailyEventFlag', [35])
    })

    set.addAchievement({
        title: 'Always Growing',
        id: 553346,
        badge: 628313+5,
        description: 'Beat yesterday\'s paycheck to earn double or triple pay',
        points: 10,
        conditions: wonEvent('dailyEventFlag', [47, 48])
    })

    set.addAchievement({
        title: 'Second Verse, Same as the First',
        id: 553347,
        badge: 628313+6,
        description: 'Beat Higgins\' challenge in any job',
        points: 10,
        conditions: wonEvent('dailyEventFlag', [24, 28])
    })




    //
    // Collective Job Level achievements
    //

    titles = [
        'First Promotion',
        'Let\'s Circle Back',
        'Touch Base',
        'Out of Bandwidth',
        'Good Synergy',
        'Master of None',
        'Ducks in a Row',
        'Putting a Pin in It',
        'Let\'s Workshop',
        'Disrupting the Market'
    ]
    let jobNumbers: Array<number> = [1, 10, 20, 35, 50]
    points = [1, 3, 5, 5, 10, 2, 5, 5, 10, 10]

    for (let i: number = 0; i < 10; i++) {

        let conditions: any = {
            core: $('1=1')
        }

        let j:number = 1
        for (let game of Releases) {
            conditions['alt' + j.toString()] = $(
                measuredIf(game.checkVersion()),
                measuredIf(game.story.storyLoaded())
            )
            for (let isDelta of [true, false]) {
                for (let jobid: number = 0; jobid < 52; jobid++) {
                    if ((jobid != 23) && (jobid != 31)) {
                        if (i < 5) {
                            conditions['alt' + j.toString()] = conditions['alt' + j.toString()].also(
                                game.job[jobid].isAtLeastPro(isDelta)
                            )
                        }
                        else {
                            conditions['alt' + j.toString()] = conditions['alt' + j.toString()].also(
                                game.job[jobid].isAtLeastExpert(isDelta)
                            )
                        }
                    }
                }
                conditions['alt' + j.toString()] = conditions['alt' + j.toString()].also(
                    $(
                    [(isDelta ? '' : 'Measured'), 'Value', '', 0, '=', 'Value', '', jobNumbers[i % 5] - (isDelta ? 1 : 0) ]
                    )
                )
            }
            if (i % 5 != 0) {
                for (let jobid: number = 0; jobid < 52; jobid++) {
                    if ((jobid != 23) && (jobid != 31)) {
                        if (i < 5) {
                            conditions['alt' + j.toString()] = conditions['alt' + j.toString()].also(
                                game.job[jobid].isAtLeastPro(false)
                            )
                        }
                        else {
                            conditions['alt' + j.toString()] = conditions['alt' + j.toString()].also(
                                game.job[jobid].isAtLeastExpert(false)
                            )
                        }
                    }
                }
                conditions['alt' + j.toString()] = conditions['alt' + j.toString()].also(
                    $(
                        ['MeasuredIf', 'Value', '', 0, '>=', 'Value', '', jobNumbers[(i % 5) - 1]]
                    )
                )
            }
            
            j = j + 1
        }


        set.addAchievement({
            title: titles[i],
            id: 553348 + i,
            badge: i + 628320,
            description: 'Reach ' + ((i < 5) ? 'Pro ' : 'Expert ') + 'level on ' +
                ((i % 5 == 0) ?
                'your first job' :
                (
                    ((i % 5 == 4) ?
                        'all ' :
                        ''
                    ) + jobNumbers[i % 5].toString() + ' jobs'
                )),
            points: points[i],
            conditions: conditions
        })
    }






    //
    // Collection Achievements
    //



    set.addAchievement({
        title: 'A New Wardrobe',
        id: 553358,
        badge: 628330,
        description: 'Expand the memorial hall to the second story',
        points: 3,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 6, true)
    })

    set.addAchievement({
        title: 'Walk-in Closet',
        id: 553359,
        badge: 628330+1,
        description: 'Expand the memorial hall to the third story',
        points: 5,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 7, true)
    })

    set.addAchievement({
        title: 'Dressing Room',
        id: 553360,
        badge: 628330+2,
        description: 'Obtain all 50 job outfits',
        points: 10,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 15, true)
    })

    set.addAchievement({
        title: 'Needing a Storage Unit',
        id: 553361,
        badge: 628330+3,
        description: 'Upgrade the memorial hall to red and silver',
        points: 5,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 11, true)
    })


    set.addAchievement({
        title: 'Turning Black and Blue',
        id: 553362,
        badge: 628330+4,
        description: 'Upgrade the memorial hall to white and gold',
        points: 10,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 12, true)
    })

    set.addAchievement({
        title: 'A Little Conceited',
        id: 553363,
        badge: 628330+5,
        description: 'Erect a golden statue in the memorial hall lobby',
        points: 25,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 13, true)
    })

    set.addAchievement({
        title: 'Sharing the Wealth',
        id: 553364,
        badge: 628330+6,
        description: 'Purchase the sparkling chandelier',
        points: 5,
        type: 'missable',
        conditions: bitflagCondition('headOrnament', 3, true)
    })

    set.addAchievement({
        title: 'Three of a Kind',
        id: 553365,
        badge: 628330+7,
        description: 'Record 75 visitors in your book',
        points: 5,
        conditions: {
            core: $('1=1'),
            alt1: $(
                measuredIf(data.usa.checkVersion()),
                measuredIf(data.usa.story.storyLoaded()),
                data.usa.story.visitorBook(true, 74),
                data.usa.story.visitorBook(false, 75)
            ),
            alt2: $(
                measuredIf(data.japan.checkVersion()),
                measuredIf(data.japan.story.storyLoaded()),
                data.japan.story.visitorBook(true, 74),
                data.japan.story.visitorBook(false, 75)
            )
        }
    })

    set.addAchievement({
        title: 'Full House',
        id: 553366,
        badge: 628330+8,
        description: 'Record all 150 visitors in your book',
        points: 5,
        conditions: {
            core: $('1=1'),
            alt1: $(
                measuredIf(data.usa.checkVersion()),
                measuredIf(data.usa.story.storyLoaded()),
                data.usa.story.visitorBook(false, 75).withLast({ flag: 'MeasuredIf', cmp: '>=' }),
                data.usa.story.visitorBook(true, 149),
                data.usa.story.visitorBook(false, 150)
            ),
            alt2: $(
                measuredIf(data.japan.checkVersion()),
                measuredIf(data.japan.story.storyLoaded()),
                data.japan.story.visitorBook(false, 75).withLast({ flag: 'MeasuredIf', cmp: '>=' }),
                data.japan.story.visitorBook(true, 149),
                data.japan.story.visitorBook(false, 150)
            )
        }
    })






    //
    // Master Exams
    //

    titles = ['Do You Have a Rewards Card?',
        'Order Up!',
        'Offsides, Ref!',
        'Synchronized Flag Waving',
        'Pass the Bleach',
        'Counting Your Macros',
        'Smoking Hot',
        'You Can\'t Knock It Over',
        'Scene 1, Take 105',
        'Uber Eats',
        'I\'m the Captain Now',
        'Pedal to the Metal',
        'Donning the Shozoku',
        'Hoe Connoisseur',
        'When Will You Wear Wigs?',
        'Is Superglue Conservation Grade?',
        'No Capes',
        'Stayin\' Alive',
        'Order Up!... Outside',
        'Wasabi Challenge',
        'Let\'s Get a Good Stretch',
        'Who Hit a Single!',
        'Walking the Beat',
        '',
        'Who You Gonna Call?',
        'Fluent in Laundry Tags',
        'Polyglot',
        'Segway Chariot Champion',
        'Towers of Hai Phong',
        'P. Sherman, 42 Wallaby Way, Sydney',
        'This Is a Part Time Gig?',
        '',
        'Hagoromo or Nothing',
        'I Wanna Be a Cowboy, Baby',
        'The BS Stands for Babysitter',
        'You Need to Floss More',
        'Fish Fear Me',
        'I So Pale',
        'Junior Dev Graduation',
        'It\'s a Snake, Kid',
        'Donning the Mask',
        'None Pizza with Left Beef',
        'Lights, Lights, Action',
        'Button Mashing Champ',
        'Fell Five Stories Before Lunch',
        '99 Problems and a Kaiju Is One',
        'Take Photos from a High Angle',
        'Nails on Fleek',
        'Shantay, You Stay',
        'SPF 100',
        'Let Them Eat Cake',
        'Frostbiting at the Bit'
    ]

    function _versionMasterExam(version: data.allMemory, id:number): ConditionBuilder {
        return $(
            version.checkVersion(),
            version.story.storyLoaded(),
            version.job[id].becameMaster()
        )
    }

    function _versionBeatPALMasterExam(version: data.allMemory, id: number): ConditionBuilder {
        return $(
            version.checkVersion(),
            version.story.storyLoaded(),
            comparison(version.job[id].unlockedMasterExam, '=', 1),
            comparison(version.gameplayID, '=', 2, true),
            comparison(version.gameplayID, '=', 3, false),
            comparison(version.paycheck.jobCode, '=', id),
            comparison(version.paycheck.paycheckNoBonus, '>=', version.job[id].PALmasterExamQuota)
        )
    }

    function sameMasterExam(id: number): any {

        return {
            core: $('1=1'),
            alt1: _versionMasterExam(data.usa, id),
            alt2: _versionMasterExam(data.japan, id),
        }
    }

    function differentMasterExam(id: number): any {

        return {
            core: $('1=1'),
            alt1: _versionBeatPALMasterExam(data.usa, id),
            alt2: _versionBeatPALMasterExam(data.japan, id),
            alt3: _versionMasterExam(data.pal, id)
        }
    }

    let j:number = 0
    for (let i: number = 0; i < 52; i++) {
        if ((i != 23) && (i != 31)) {
            set.addAchievement({
                title: titles[i],
                id: 553367 + j,
                badge: j + 628339,
                description:  'Pass the ' + data.jobs[0][i].name + ' master exam',
                points: 10,
                conditions: sameMasterExam(i)
            })
            j = j + 1
        }
    }


    let conditions: any = {
        core: $('1=1')
    }
    j = 1
    for (let game of Releases) {
        conditions['alt' + j.toString()] = $(
            measuredIf(game.checkVersion()),
            measuredIf(game.story.storyLoaded())
        )
        for (let isDelta of [true, false]) {
            for (let jobid: number = 0; jobid < 52; jobid++) {
                if ((jobid != 23) && (jobid != 31)) {
                    conditions['alt' + j.toString()] = conditions['alt' + j.toString()].also(
                        game.job[jobid].isAtLeastMaster(isDelta)
                    )
                }
            }
            conditions['alt' + j.toString()] = conditions['alt' + j.toString()].also(
                $(
                    [(isDelta ? '' : 'Measured'), 'Value', '', 0, '=', 'Value', '', 50 - (isDelta ? 1 : 0)]
                )
            )
        }
        
        j = j + 1 
    }


    set.addAchievement({
        title: 'Fun Time Working',
        id: 554125,
        badge: 629105,
        description: 'Pass all 50 master exams',
        points: 25,
        conditions: conditions
    })

}
