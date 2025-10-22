import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, Leaderboard } from '@cruncheevos/core'
import * as data from './data.js'
import { calculation, comparison, connectAddSourceChains, measureLB } from '../../helpers.js'

export function makeLeaderboards(set: AchievementSet): void {


    set.addLeaderboard({
        title: 'Employment Office - Speedrun',
        description: 'Beat employment office in as few days as possible',
        type: 'UNSIGNED',
        lowerIsBetter: true,
        conditions: {
            start: {
                core: $('1=1'),
                alt1: $(
                    data.usa.checkVersion(),
                    comparison(data.usa.story.meteor.ID, '=', 0x9, true),
                    comparison(data.usa.story.meteor.ID, '=', 0x9, false),
                    comparison(data.usa.story.loadedSave, '=', data.usa.story.loadedSave, true, false),
                    comparison(data.usa.story.meteor.health, '>', 0, true),
                    comparison(data.usa.story.meteor.health, '=', 0, false)
                ),
                alt2: $(
                    data.japan.checkVersion(),
                    comparison(data.japan.story.meteor.ID, '=', 0x9, true),
                    comparison(data.japan.story.meteor.ID, '=', 0x9, false),
                    comparison(data.japan.story.loadedSave, '=', data.japan.story.loadedSave, true, false),
                    comparison(data.japan.story.meteor.health, '>', 0, true),
                    comparison(data.japan.story.meteor.health, '=', 0, false)
                )
            },
            cancel: $('0=1'),
            submit: $('1=1'),
            value: {
                core: $('1=1'),
                alt1: $(
                    data.usa.checkVersion().withLast({ flag: 'MeasuredIf' }),
                    measureLB( data.usa.story.currentDay)
                ),
                alt2: $(
                    data.japan.checkVersion().withLast({ flag: 'MeasuredIf' }),
                    measureLB(data.japan.story.currentDay)
                )
            }
            
        }
    })




    let difficulties:Array<string> = ['Normal', 'Hard', 'Expert']

    for (let freePlay: number = 0; freePlay < 2; freePlay++) {
        let j: number = 0
        for (let i: number = 0; i < 52; i++) {
            if ((i != 23) && (i != 31)) {
                for (let difficulty: number = 0; difficulty < 3; difficulty++) {
                    set.addLeaderboard({
                        title: ((freePlay == 0) ? 'Employment Office - ' : 'Job Fair - ') +
                            data.jobTitles[i] +
                            ' - ' + difficulties[difficulty],
                        description: (freePlay == 0) ? 'Earn the highest paycheck in dollars excluding daily event bonuses' : 'Earn the highest paycheck in dollars',
                        type: 'FIXED2',
                        lowerIsBetter: false,
                        conditions: {
                            start: {
                                core: $('1=1'),
                                alt1: $(
                                    data.usa.checkVersion(),
                                    comparison(data.usa.gameplayID, '>', 1),
                                    comparison(data.usa.story.loadedSave, '=', data.usa.story.loadedSave, true, false),
                                    comparison(data.usa.job[i].arrayAccess(0xc * freePlay + 0x4 * difficulty), '<', data.usa.job[i].arrayAccess(0xc * freePlay + 0x4 * difficulty), true, false)
                                ),
                                alt2: $(
                                    data.japan.checkVersion(),
                                    comparison(data.japan.gameplayID, '>', 1),
                                    comparison(data.japan.story.loadedSave, '=', data.japan.story.loadedSave, true, false),
                                    comparison(data.japan.job[i].arrayAccess(0xc * freePlay + 0x4 * difficulty), '<', data.japan.job[i].arrayAccess(0xc * freePlay + 0x4 * difficulty), true, false)
                                )
                            },
                            cancel: $('0=1'),
                            submit: $('1=1'),
                            value: {
                                core: $('1=1'),
                                alt1: $(
                                    data.usa.checkVersion().withLast({ flag: 'MeasuredIf' }),
                                    measureLB(data.usa.job[i].arrayAccess(0xc * freePlay + 0x4 * difficulty))
                                ),
                                alt2: $(
                                    data.japan.checkVersion().withLast({ flag: 'MeasuredIf' }),
                                    measureLB(data.japan.job[i].arrayAccess(0xc * freePlay + 0x4 * difficulty))
                                )
                            }
                        }
                    })
                } 
            }
        }
    }


    
}