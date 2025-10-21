import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation } from '../../helpers.js'
import * as fs from 'fs'

let Releases: Array<data.allMemory> = [data.usa, data.japan]
const b = (s) => `local\\\\${s}.png`

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
        'Not our Memories!',
        'Not Water Based!',
        'Do We Have Anything Stronger?',
        'Good Riddance'
    ]
    let points: Array<number> = [1, 2, 3, 4, 5, 5, 10, 10, 1, 25]
    let numbering: Array<string> = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth']
    for (let meteorID: number = 0; meteorID < 10; meteorID++) {

        let conditions: any = {
            core: $('0=0')
        }

        let i:number = 1
        for (let game of Releases) {
            conditions['alt' + i.toString()] = $(
                game.checkVersion(),
                game.story.storyLoaded(),
                comparison(game.story.meteor.ID, '=', meteorID),
                game.story.meteor.killed()
            )
            i = i + 1
        }

        set.addAchievement({
            title: titles[meteorID],
            badge: b((meteorID+1).toString()),
            description: 'Defeat the ' + numbering[meteorID] + ' meteor',
            points: points[meteorID],
            type: (meteorID == 9) ? 'win_condition' : 'progression',
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
        'Chibi-robo, Rollout',
        'Second Is the Best',
        'Orbital Flail',
        'Makes You Want a Space Dog Real Bad',
        'A Space Dog!',
        'Good Times'
    ]
    let ids: Array<number> = [8, 6, 9, 18, 4, 17, 12, 9, 13, 7, 14, 15]
    points = [1, 2, 2, 3, 5, 5, 5, 5, 5, 5, 25, 10]
    let itemNames:Array<string> = ['a scary mask', 'a galactic blaster', 'a space fan', 'a space guitar', 'a lucky drakon stone', 'an iron volleyball', 'a mini handybot', 'a space fan 2.0', ' a lunar remote', 'some space fireworks', 'a transformowatch', 'the reminiscitron']

    for (let i: number = 0; i < 12; i++) {

        let conditions: any = {
            core: $('0=0')
        }

        let j: number = 1
        for (let game of Releases) {
            conditions['alt' + j.toString()] = $(
                game.checkVersion(),
                game.story.storyLoaded(),
                comparison(game.story.pointsItem(ids[i]), '=', 1, (i==11)?false:true),
                comparison(game.story.pointsItem(ids[i]), '=', 0, (i==11)?true:false)
            )
            j = j + 1
        }

        set.addAchievement({
            title: titles[i],
            badge: b((i + 11).toString()),
            description: (i == 11) ? ('Receive ' + itemNames[i]) : ('Use ' + itemNames[i]),
            points: points[i],
            conditions: conditions
        })
    }





    //
    // Collective Job Level achievements
    // NEEDS MEASUREIFS
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
                game.checkVersion(),
                game.story.storyLoaded()
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
            
            j = j + 1
        }


        set.addAchievement({
            title: titles[i],
            badge: b((i + 30).toString()),
            description: 'Reach ' + ((i < 5) ? 'Pro ' : 'Expert ') + 'level in ' +
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

    function bitflagCondition(flagAccess: string, flag: number, turnOn:boolean = true): any {
        return {
            core: $('1=1'),
            alt1: $(
                data.usa.checkVersion(),
                data.usa.story.storyLoaded(),
                comparison(data.usa.story[flagAccess](flag), '=', turnOn ? 0:1, true),
                comparison(data.usa.story[flagAccess](flag), '=', turnOn ? 1:0, false)
            ),
            alt2: $(
                data.japan.checkVersion(),
                data.japan.story.storyLoaded(),
                comparison(data.japan.story[flagAccess](flag), '=', turnOn ? 0:1, true),
                comparison(data.japan.story[flagAccess](flag), '=', turnOn ? 1:0, false)
            )
        }
    }


    set.addAchievement({
        title: 'A New Wardrobe',
        badge: b('40'),
        description: 'Expand the memorial hall to the second story',
        points: 3,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 6, true)
    })

    set.addAchievement({
        title: 'Walk-in Closet',
        badge: b('41'),
        description: 'Expand the memorial hall to the third story',
        points: 5,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 7, true)
    })

    set.addAchievement({
        title: 'Dressing Room',
        badge: b('42'),
        description: 'Obtain all 50 job outfits',
        points: 10,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 15, true)
    })

    set.addAchievement({
        title: 'Needing a Storage Unit',
        badge: b('43'),
        description: 'Upgrade the memorial hall to red and silver',
        points: 3,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 11, true)
    })


    set.addAchievement({
        title: 'Turning Black and Blue',
        badge: b('44'),
        description: 'Upgrade the memorial hall to white and gold',
        points: 5,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 12, true)
    })

    set.addAchievement({
        title: 'A Little Conceited',
        badge: b('45'),
        description: 'Erect a golden statue in the memorial hall lobby',
        points: 10,
        type: 'missable',
        conditions: bitflagCondition('storyFlag', 13, true)
    })

    set.addAchievement({
        title: 'Sharing the Wealth',
        badge: b('46'),
        description: 'Purchase the sparkling chandelier',
        points: 5,
        type: 'missable',
        conditions: bitflagCondition('headOrnament', 3, true)
    })

    set.addAchievement({
        title: 'Three of a Kind',
        badge: b('47'),
        description: 'Record 75 visitors in your book',
        points: 5,
        conditions: {
            core: $('1=1'),
            alt1: $(
                data.usa.checkVersion(),
                data.usa.story.storyLoaded(),
                data.usa.story.visitorBook(true, 74),
                data.usa.story.visitorBook(false, 75)
            ),
            alt2: $(
                data.japan.checkVersion(),
                data.japan.story.storyLoaded(),
                data.japan.story.visitorBook(true, 74),
                data.japan.story.visitorBook(false, 75)
            )
        }
    })

    set.addAchievement({
        title: 'Full House',
        badge: b('48'),
        description: 'Record all 150 visitors in your book',
        points: 5,
        conditions: {
            core: $('1=1'),
            alt1: $(
                data.usa.checkVersion(),
                data.usa.story.storyLoaded(),
                data.usa.story.visitorBook(false, 75).withLast({ flag: 'MeasuredIf', cmp: '>=' }),
                data.usa.story.visitorBook(true, 149),
                data.usa.story.visitorBook(false, 150)
            ),
            alt2: $(
                data.japan.checkVersion(),
                data.japan.story.storyLoaded(),
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
        'Order up!',
        'Offsides, Ref!',
        'Syncronized Flag Waving',
        'Pass the Bleach',
        'Counting Your Macros',
        'Smoking Hot',
        'You Can\'t Knock it Over',
        'Scene 1, Take 105',
        'Uber Eats',
        'I\'m the Captain Now',
        'Pedal to Metal',
        'Nokotta, Nokotta!',
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
                badge: b((j + 49).toString()),
                description:  'Pass the ' + data.jobs[0][i].name + ' master exam',
                points: 5,
                conditions: sameMasterExam(i)
            })
            j = j + 1
        }
    }
}
