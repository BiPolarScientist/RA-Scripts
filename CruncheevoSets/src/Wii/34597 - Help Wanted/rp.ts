import { define as $, Condition, ConditionBuilder, RichPresence } from '@cruncheevos/core'
import { calculation, comparison, conditionRP, connectAddSourceChains, trimRP } from '../../helpers.js'
import * as data from './data.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'

function numberOfMasteries(version: number): ConditionBuilder {
    let output: ConditionBuilder = $()
    for (let job of data.jobs[version]) {
        output = output.also(
            calculation(true, job.level, '/', 3)
        )
    }
    return output.withLast({ flag: 'Measured' })
}

export function makeRP(): any {
    return RichPresence({
        lookupDefaultParameters: { keyFormat: 'dec', compressRanges: true },
        format: {},
        lookup: {
            character: {
                values: {
                    1: 'Tom',
                    0: 'Maya'
                }
            },
            meteor: {
                values: {
                    0: 'Meteor',
                    1: 'Stone Face',
                    2: 'Ramen',
                    3: 'Disco Fever',
                    4: 'Gum Wad',
                    5: 'Space Gal',
                    6: 'Ghost Photo',
                    7: 'Red Liquid',
                    8: 'Space Dad',
                    9: 'Monumental Thingy'
                }
            },
            jobEmotes: {
                values: {
                    0: '🛒',
                    1: '🍳',
                    2: '⚽',
                    3: 'Line Judge',
                    4: '🧹',
                    5: '🏋️',
                    6: '🚒',
                    7: '📺',
                    8: '🎥',
                    9: '📦',
                    10: '🛥️',
                    11: '🏎️',
                    12: 'Sumo Ref',
                    13: '🥕',
                    14: '🎤',
                    15: '🖼️',
                    16: '🧵',
                    17: '🚑',
                    18: '🔥',
                    19: '🍣',
                    20: 'Personal Trainer',
                    21: '⚾',
                    22: '🚨',
                    23: 'EMPTY',
                    24: '👺',
                    25: 'Dry Cleaner',
                    26: '🎙️',
                    27: '🔦',
                    28: '🏗️',
                    29: '🤿',
                    30: '🚀',
                    31: 'Massage Therapist',
                    32: '🍎',
                    33: '🐄',
                    34: '👶',
                    35: '🦷',
                    36: '🐟',
                    37: '📰',
                    38: '🎮',
                    39: '🎪',
                    40: '🎭',
                    41: '🍕',
                    42: '💡',
                    43: '🕹️',
                    44: 'Stuntperson',
                    45: '🦖',
                    46: '📸',
                    47: '💅',
                    48: '💄',
                    49: '🍹',
                    50: '💼',
                    51: '💼'
                }
            },
        },
        displays: ({ lookup, format, macro, tag }) => [
            [
                $(
                    data.usa.checkVersion(),
                    comparison(data.usa.gameplayID, '>', 0),
                    comparison(data.usa.gameplayID, '<', 5)
                ),
                trimRP(tag`
                    ${lookup.jobEmotes.at(conditionRP(data.usa.story.lastJob))} 
                    ${lookup.character.at(conditionRP(data.usa.story.storyFlag(0)))} 
                    fighting off a ${lookup.meteor.at(conditionRP(data.usa.story.meteor.ID))} 
                    on day ${macro.Unsigned.at(conditionRP(data.usa.story.currentDay))} 
                    ● Mastered [${macro.Unsigned.at(numberOfMasteries(0))}/50] 
                    ● Points ${macro.Fixed2.at(conditionRP(data.usa.story.currentPoints))}P
                    `
                )
                    
                
            ],
            [
                $(
                    data.japan.checkVersion(),
                    comparison(data.japan.gameplayID, '>', 0),
                    comparison(data.japan.gameplayID, '<', 5)
                ),
                trimRP(tag`
                    ${lookup.jobEmotes.at(conditionRP(data.japan.story.lastJob))} 
                    ${lookup.character.at(conditionRP(data.japan.story.storyFlag(0)))} 
                    fighting off a ${lookup.meteor.at(conditionRP(data.japan.story.meteor.ID))} 
                    on day ${macro.Unsigned.at(conditionRP(data.japan.story.currentDay))} 
                    ● Mastered [${macro.Unsigned.at(numberOfMasteries(1))}/50] 
                    ● Points ${macro.Fixed2.at(conditionRP(data.japan.story.currentPoints))}P
                    `
                )


            ],
            [
                $(
                    data.usa.checkVersion(),
                    comparison(data.usa.gameplayID, '=', 0)
                ),
                'On the main menu'
            ],
            [
                $(
                    data.japan.checkVersion(),
                    comparison(data.japan.gameplayID, '=', 0)
                ),
                'On the main menu'
            ],

            [
                $(
                    data.usa.checkVersion(),
                    comparison(data.usa.gameplayID, '=', 5)
                ),
                'Reading instructions for the next job'
            ],
            [
                $(
                    data.japan.checkVersion(),
                    comparison(data.japan.gameplayID, '=', 5)
                ),
                'Reading instructions for the next job'
            ],
            'Testing'
        ]

    })
}