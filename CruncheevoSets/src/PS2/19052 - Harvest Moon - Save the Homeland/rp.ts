import { define as $, andNext, Condition, ConditionBuilder, orNext, RichPresence } from '@cruncheevos/core'
import { calculation, comparison, conditionRP, connectAddSourceChains, trimRP, altsRP } from '../../helpers.js'
import * as data from './data.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'
import { saveLoaded } from './achievements.js'


export function makeRP(): any {

    return RichPresence({
        lookupDefaultParameters: { keyFormat: 'dec', compressRanges: true },
        format: {},
        lookup: {
            Season: {
                values: {
                    0:'🌸Spring',
                    1:'☀️Summer',
                    2:'🍂Fall',
                    3:'❄️Winter'
                }
            },
            DayEnds: {
                values: {
                    1: 'st',
                    21: 'st',
                    2: 'nd',
                    22: 'nd',
                    3: 'rd',
                    23: 'rd',
                    '*': 'th'
                }
            },
            Weather: {
                values: {
                    0x0: 'Sunny',
                    0x1: 'Rainy',
                    0x2: 'Really Rainy',
                    0x3: 'Lightning Storm',
                    0x4: 'Cloudy'
                }
            },
            Animals: {
                values: {
                    0: '⋅',
                    1: '🐶',
                    2: '🐎',
                    3: '🐔',
                    4: '🐮'
                }
            },
            Fish: {
                values: {
                    0: '⋅',
                    1: '🎖️',
                    2: '🥈',
                    3: '🥉'
                }
            },
        },
        displays: ({ lookup, format, macro, tag }) => [
            [
                saveLoaded(),
                trimRP(tag`
                    Ends: [${macro.Number.at('A:0xK80da17_M:0xK80da18')}/9]
                    ● ${lookup.Weather.at('0xH267834')} on ${lookup.Season.at('0xH85a2f7')} the ${macro.Number.at('0xH85a2f6')}${lookup.DayEnds.at('0xH85a2f6')} 
                    ● $${macro.Number.at('Q:0xX267864<999999_M:0xX267864$Q:0xX267864>=999999_M:999999')} 
                    ● Animals: [${lookup.Animals.at('0xM859fe0')}
                    ${lookup.Animals.at('0xM859fc0*2')}
                    ${lookup.Animals.at('0xM859e60*3$0xM859e80*3$0xM859ea0*3$0xM859ec0*3$0xM859ee0*3$0xM859f00*3')}
                    ${lookup.Animals.at('0xM859f20*4$0xM859f40*4$0xM859f60*4$0xM859f80*4$0xM859fa0*4')}]
                    ● Legendary Fish: [${lookup.Fish.at('0xM26785c')}${lookup.Fish.at('0xN26785c*2')}${lookup.Fish.at('0xO26785c*3')}]
                `)
            ],
            'Saving the Homeland'
        ]

    })


}