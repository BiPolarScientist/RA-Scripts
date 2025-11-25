import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, Leaderboard, orNext, measuredIf } from '@cruncheevos/core'
import * as data from './data.js'
import * as cheevo from './achievements.js'
import { calculation, comparison, connectAddSourceChains, measureLB } from '../../helpers.js'

export function makeLeaderboards(set: AchievementSet): void {



    let conditions: any = cheevo.itemPickUpCore(0x83, false)
    data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x83)

    

    set.addLeaderboard({
        title: 'Low Level - SORN',
        description: 'Kill the SORN with the lowest level party possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: conditions,
            cancel: $('0=1'),
            submit: $('1=1'),
            value: {
                core: $(
                    'O:0xH00db=0',
                    'Q:0xH00db>6',
                    'M:999999'
                ),
                alt1: $(
                    'Q:0xH00db=1',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt2: $(
                    'Q:0xH00db=2',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt3: $(
                    'Q:0xH00db=3',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'I:0xHde*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt4: $(
                    'Q:0xH00db=4',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'I:0xHde*128',
                    'A:0x1021',
                    'I:0xHdf*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt5: $(
                    'Q:0xH00db=5',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'I:0xHde*128',
                    'A:0x1021',
                    'I:0xHdf*128',
                    'A:0x1021',
                    'I:0xHe0*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt6: $(
                    'Q:0xH00db=6',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'I:0xHde*128',
                    'A:0x1021',
                    'I:0xHdf*128',
                    'A:0x1021',
                    'I:0xHe0*128',
                    'A:0x1021',
                    'I:0xHe1*128',
                    'A:0x1021',
                    'M:0'
                )
            }
        }
    })


    conditions = $(
        cheevo.inMazeInFight(1, 151, 151),
        data.game.Enemies.uniqueBattleFinished(0xab)
    )

    set.addLeaderboard({
        title: 'Low Level - The Ultimate Enemy',
        description: 'Kill LaLa Moo-Moo with the lowest level party possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: conditions,
            cancel: $('0=1'),
            submit: $('1=1'),
            value: {
                core: $(
                    'O:0xH00db=0',
                    'Q:0xH00db>6',
                    'M:999999'
                ),
                alt1: $(
                    'Q:0xH00db=1',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt2: $(
                    'Q:0xH00db=2',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt3: $(
                    'Q:0xH00db=3',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'I:0xHde*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt4: $(
                    'Q:0xH00db=4',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'I:0xHde*128',
                    'A:0x1021',
                    'I:0xHdf*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt5: $(
                    'Q:0xH00db=5',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'I:0xHde*128',
                    'A:0x1021',
                    'I:0xHdf*128',
                    'A:0x1021',
                    'I:0xHe0*128',
                    'A:0x1021',
                    'M:0'
                ),
                alt6: $(
                    'Q:0xH00db=6',
                    'I:0xHdc*128',
                    'A:0x1021',
                    'I:0xHdd*128',
                    'A:0x1021',
                    'I:0xHde*128',
                    'A:0x1021',
                    'I:0xHdf*128',
                    'A:0x1021',
                    'I:0xHe0*128',
                    'A:0x1021',
                    'I:0xHe1*128',
                    'A:0x1021',
                    'M:0'
                )
            }
        }
    })

}