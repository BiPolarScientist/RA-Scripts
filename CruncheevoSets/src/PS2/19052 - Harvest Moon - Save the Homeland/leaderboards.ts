import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, Leaderboard, orNext, measuredIf, resetIf, resetNextIf } from '@cruncheevos/core'
import * as data from './data.js'
import { calculation, comparison, connectAddSourceChains, create, measureLB } from '../../helpers.js'
import { isFirstYear, saveLoaded, watchEvent } from './achievements.js'

export function makeLeaderboards(set: AchievementSet): void {

    const FrameTimer: Partial<Condition.Data> = create('32bit', 0x14)

    set.addLeaderboard({
        title: 'Speedrun - Horse Race',
        description: 'Complete the three laps around the course as fast as possible',
        lowerIsBetter: true,
        type: 'FRAMES',
        conditions: {
            start: $(
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
                comparison(FrameTimer, '=', FrameTimer, true, false).withLast({ hits: 5 }) //Wait for the timer to stop for at least 5 frames in a row, for saftey

            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                'I:0xX2675d0',
                'M:0xX14'
            )
        }
    })

    set.addLeaderboard({
        title: 'High Score - Bluebird\'s Song',
        description: 'Earn a high score in the recorder playing rhythm game',
        lowerIsBetter: false,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                comparison(data.S2Event, '=', 0xff),
                comparison(data.S0Event, '=', 0x05),
                'I:0xX2675c4',
                'd0xHb=55',
                'I:0xX2675c4',
                '0xHb=56'
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                'I:0xX2675c4',
                'M:0xH8'
            )
        }
    })

    set.addLeaderboard({
        title: 'High Score - Money',
        description: 'End the first year with as much money as possible',
        lowerIsBetter: false,
        type: 'UNSIGNED',
        conditions: {
            start: {
                core: $(
                    saveLoaded(),
                    isFirstYear()
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
                ),
                alt10: $(
                    comparison(data.Player.Season, '=', 3),
                    comparison(data.Player.Day, '=', 29, true),
                    comparison(data.Player.Day, '=', 30, false)
                )
            },
            cancel: $('0=1'),
            submit: $('1=1'),
            value: measureLB(data.Player.Money)
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - Treaure Hunt I',
        description: 'Complete Treaure Hunt I in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x1e)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - Treaure Hunt II',
        description: 'Complete Treaure Hunt II in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x1d)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - Azure Swallowtail',
        description: 'Complete Azure Swallowtail in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x2c)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - A Fishy Story',
        description: 'Complete A Fishy Story in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x7e)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - Goddess Dress',
        description: 'Complete Goddess Dress in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x73)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - Cake Contest',
        description: 'Complete Cake Contest in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x63)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - Bluebird',
        description: 'Complete Bluebird in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x92)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - Horse Race',
        description: 'Complete Horse Race in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x41)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })

    set.addLeaderboard({
        title: 'Speedrun - Endangered Weasel',
        description: 'Complete Endangered Weasel in as few days as possible',
        lowerIsBetter: true,
        type: 'UNSIGNED',
        conditions: {
            start: $(
                saveLoaded(),
                watchEvent(0x88)
            ),
            cancel: $('0=1'),
            submit: $('1=1'),
            value: $(
                calculation(false, 1),
                calculation(true, data.Player.Season, '*', 30),
                measureLB(data.Player.Day)
            )
        }
    })


}