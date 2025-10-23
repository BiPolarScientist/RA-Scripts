import { define as $, andNext, Condition, ConditionBuilder, orNext, RichPresence } from '@cruncheevos/core'
import { calculation, comparison, conditionRP, connectAddSourceChains, trimRP, altsRP } from '../../helpers.js'
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
                    0x45: 'Maya',
                    0x46: 'Tom',
                    0x4a: 'Lenny',
                    0x4b: 'Lunie'
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
            jobNames: {
                values: {
                    0: 'Clerk',
                    1: 'Chef',
                    2: 'Goalie',
                    3: 'Line Judge',
                    4: 'Cleaning Crew',
                    5: 'Body Builder',
                    6: 'Firefighter',
                    7: 'TV Shopping Crew',
                    8: 'Cameraperson',
                    9: 'Courier',
                    10: 'Resort Captain',
                    11: 'Pit Crew',
                    12: 'Sumo Ref',
                    13: 'Farmer',
                    14: 'Interviewer',
                    15: 'Art Restorer',
                    16: 'Tailor',
                    17: 'Hospital EMT',
                    18: 'Grill Cook',
                    19: 'Sushi Master',
                    20: 'Personal Trainer',
                    21: 'Pinch Hitter',
                    22: 'Police Officer',
                    23: 'EMPTY',
                    24: 'Haunted House Crew',
                    25: 'Dry Cleaner',
                    26: 'Interpreter',
                    27: 'Security Guard',
                    28: 'Crane Operator',
                    29: 'Deep Sea Diver',
                    30: 'Astronaut',
                    31: 'Massage Therapist',
                    32: 'Teacher',
                    33: 'Dairy Farmer',
                    34: 'Babysitter',
                    35: 'Dentist',
                    36: 'Fisher',
                    37: 'Newscaster',
                    38: 'Game Creator',
                    39: 'Clown',
                    40: 'Kabuki Actor',
                    41: 'Pizza Chef',
                    42: 'Lighting Crew',
                    43: 'Master Higgins',
                    44: 'Stuntperson',
                    45: 'Action Hero',
                    46: 'Aerial Camera',
                    47: 'Manicurist',
                    48: 'Makeup Artist',
                    49: 'Tropical Waiting Staff',
                    50: 'CEO',
                    51: 'Arctic Deliverer'
                }
            },
            jobEmotes: {
                values: {
                    0: '🛒',
                    1: '🍳',
                    2: '⚽',
                    3: '🏐',
                    4: '🧹',
                    5: '🏋️',
                    6: '🚒',
                    7: '📺',
                    8: '🎥',
                    9: '📦',
                    10: '🛥️',
                    11: '🏎️',
                    12: '🤼',
                    13: '🥕',
                    14: '🎤',
                    15: '🖼️',
                    16: '🧵',
                    17: '🚑',
                    18: '🔥',
                    19: '🍣',
                    20: '👟',
                    21: '⚾',
                    22: '🚨',
                    24: '👺',
                    25: '👔',
                    26: '🎙️',
                    27: '🔦',
                    28: '🏗️',
                    29: '🤿',
                    30: '🚀',
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
                    44: '🤕',
                    45: '🦖',
                    46: '📸',
                    47: '💅',
                    48: '💄',
                    49: '🍹',
                    50: '💼',
                    51: '🍜'
                }
            },
        },
        displays: ({ lookup, format, macro, tag }) => [
            [
                altsRP([
                    $('1=1'),
                    $(
                        data.usa.checkVersion(),
                        comparison(data.usa.gameplayID, '=', 1),
                        comparison(data.usa.story.meteor.ID, '=', 9),
                        comparison(data.usa.story.meteor.health, '=', 0)
                    ),
                    $(
                        data.usa.checkVersion(),
                        comparison(data.usa.gameplayID, '=', 1),
                        comparison(data.usa.story.meteor.ID, '=', 9),
                        comparison(data.usa.story.pointsItem(14), '=', 1)
                    )
                ]),
                trimRP(tag`
                ${lookup.character.at(
                    'A:' + conditionRP(data.usa.story.storyFlag(0)) + '_M:0xH3'
                )} 
                saved the world 
                by day ${macro.Unsigned.at(
                    conditionRP(data.usa.story.currentDay)
                )} 
                ● Mastered [${macro.Unsigned.at(
                    numberOfMasteries(0)
                )}/50]
                `)
            ],
            [
                altsRP([
                    $('1=1'),
                    $(
                        data.japan.checkVersion(),
                        comparison(data.japan.gameplayID, '=', 1),
                        comparison(data.japan.story.meteor.ID, '=', 9),
                        comparison(data.japan.story.meteor.health, '=', 0)
                    ),
                    $(
                        data.japan.checkVersion(),
                        comparison(data.japan.gameplayID, '=', 1),
                        comparison(data.japan.story.meteor.ID, '=', 9),
                        comparison(data.japan.story.pointsItem(14), '=', 1)
                    )
                ]),
                trimRP(tag`
                ${lookup.character.at(
                    'A:' + conditionRP(data.japan.story.storyFlag(0)) + '_M:0xH3'
                )} 
                saved the world 
                by day ${macro.Unsigned.at(
                    conditionRP(data.japan.story.currentDay)
                )} 
                ● Mastered [${macro.Unsigned.at(
                    numberOfMasteries(1)
                )}/50]
                `)
            ],

            [
                $(
                    data.usa.checkVersion(),
                    andNext(
                        comparison(data.usa.gameplayID, '>', 0),
                        orNext(
                            comparison(data.usa.gameplayID, '<', 5),
                            comparison(data.usa.gameplayID, '=', 13)
                        )
                    )
                ),
                trimRP(tag`
                    ${lookup.jobEmotes.at(conditionRP(data.usa.story.lastJob))} 
                    ${lookup.character.at('A:' + conditionRP(data.usa.story.storyFlag(0)) + '_M:0xH3')} 
                    fighting off the ${lookup.meteor.at(conditionRP(data.usa.story.meteor.ID))} 
                    on day ${macro.Unsigned.at(conditionRP(data.usa.story.currentDay))} 
                    ● Mastered [${macro.Unsigned.at(numberOfMasteries(0))}/50] 
                    ● Points ${macro.Fixed2.at(conditionRP(data.usa.story.currentPoints))}P
                    `
                )
                    
                
            ],
            [
                $(
                    data.japan.checkVersion(),
                    andNext(
                        comparison(data.japan.gameplayID, '>', 0),
                        orNext(
                            comparison(data.japan.gameplayID, '<', 5),
                            comparison(data.japan.gameplayID, '=', 13)
                        )
                    )
                ),
                trimRP(tag`
                    ${lookup.jobEmotes.at(conditionRP(data.japan.story.lastJob))} 
                    ${lookup.character.at('A:' + conditionRP(data.japan.story.storyFlag(0)) + '_M:0xH3')} 
                    fighting off the ${lookup.meteor.at(conditionRP(data.japan.story.meteor.ID))} 
                    on day ${macro.Unsigned.at(conditionRP(data.japan.story.currentDay))} 
                    ● Mastered [${macro.Unsigned.at(numberOfMasteries(1))}/50] 
                    ● Points ${macro.Fixed2.at(conditionRP(data.japan.story.currentPoints))}P
                    `
                )


            ],
            [
                altsRP([
                    $('1=1'),
                    $(
                        data.usa.checkVersion(),
                        orNext(
                            comparison(data.usa.gameplayID, '=', 0),
                            comparison(data.usa.gameplayID, '=', 6),
                            comparison(data.usa.gameplayID, '=', 7),
                            comparison(data.usa.gameplayID, '=', 10),
                            comparison(data.usa.gameplayID, '=', 11),
                            comparison(data.usa.gameplayID, '=', 12)
                        )
                    ),
                    $(
                        data.japan.checkVersion(),
                        orNext(
                            comparison(data.japan.gameplayID, '=', 0),
                            comparison(data.japan.gameplayID, '=', 6),
                            comparison(data.japan.gameplayID, '=', 7),
                            comparison(data.japan.gameplayID, '=', 10),
                            comparison(data.japan.gameplayID, '=', 11),
                            comparison(data.japan.gameplayID, '=', 12)
                        )
                    )
                ]),
                'Sending out job applications'
            ],

            [
                altsRP([
                    $('1=1'),
                    $(
                        data.usa.checkVersion(),
                        comparison(data.usa.gameplayID, '=', 5)
                    ),
                    $(
                        data.japan.checkVersion(),
                        comparison(data.japan.gameplayID, '=', 5)
                    )
                ]),
                'Being trained for the next job'
            ],

            [
                altsRP([
                    $('1=1'),
                    $(
                        data.usa.checkVersion(),
                        comparison(data.usa.gameplayID, '>=', 15),
                        comparison(data.usa.gameplayID, '<=', 19)
                    ),
                    $(
                        data.japan.checkVersion(),
                        comparison(data.japan.gameplayID, '>=', 15),
                        comparison(data.japan.gameplayID, '<=', 19)
                    )
                ]),
                'Playing multiplayer job battle'
            ],

            [
                $(
                    data.usa.checkVersion(),
                    comparison(data.usa.gameplayID, '>=', 20),
                    comparison(data.usa.gameplayID, '<=', 24)
                ),
                trimRP(tag`
                Grinding out high scores for 
                ${lookup.jobNames.at(
                    conditionRP(data.usa.story.lastJob)
                )} 
                in Job Fair mode
                `)
            ],

            [
                $(
                    data.japan.checkVersion(),
                    comparison(data.japan.gameplayID, '>=', 20),
                    comparison(data.japan.gameplayID, '<=', 24)
                ),
                trimRP(tag`
                Grinding out high scores for 
                ${lookup.jobNames.at(
                    conditionRP(data.japan.story.lastJob)
                )} 
                in Job Fair mode in Japan
                `)
            ],

            'Witnessing horrifying events unfold'
        ]

    })
}