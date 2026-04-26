import { define as $, andNext, Condition, ConditionBuilder, orNext, RichPresence } from '@cruncheevos/core'
import { calculation, comparison, conditionRP, connectAddSourceChains, trimRP, altsRP, create } from '../../helpers.js'
import * as data from './data.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'



export function makeRP(): any {
    return RichPresence({
        lookupDefaultParameters: { keyFormat: 'dec', compressRanges: true },
        format: {},
        lookup: {
            actonetwo: {
                values: {
                    0x0: 'Frankenstein\'s lab',
                    0x1: 'Frankenstein\'s lab',
                    0x2: 'the lab store room',
                    0x3: 'the lab entryway',
                    0x4: 'Victor\'s bedroom',
                    0x5: 'the alchemist\'s shop',
                    0x6: 'the jailor\'s house',
                    0x7: 'the jail',
                    0x8: 'the general store',
                    0x9: 'the stables',
                    0xa: 'the store owner\'s house',
                    0xb: 'the city guard room',
                    0xc: 'the sewer',
                    '*': 'Ingolstadt',
                }
            },
            actthree: {
                values: {
                    0x3: 'the crossroads',
                    0x5: 'the outlaw\'s camp', 
                    0x12: 'the old lady\'s house',
                    0x13: 'the barn',
                    0x14: 'the pumpkin cottage',
                    0x15: 'the old lady\'s house',
                    0x16: 'the barn',
                    0x17: 'the pumpkin cottage',
                    0x18: 'the pumpkin cottage',
                    0x19: 'the pumpkin cottage',
                    0x1c: 'the outlaw\'s camp',
                    '*': 'the woods'
                }
            },
            actfour: {
                values: {
                    0x4: 'the Frankenstein Mansion',
                    0x5: 'the Frankenstein Mansion',
                    0x6: 'the Frankenstein Mansion',
                    0x7: 'the grocery stall',
                    0x8: 'the general store',
                    0x9: 'the opulent house',
                    0xa: 'the opulent garden',
                    0xb: 'the old man\'s house',
                    0xc: 'the old man\'s house',
                    0xd: 'the old man\'s house',
                    0xe: 'the old woman\'s house',
                    0xf: 'the old woman\'s house',
                    0x10: 'the Frankenstein Mansion',
                    0x11: 'the Frankenstein Mansion',
                    0x12: 'the Frankenstein Mansion',
                    0x13: 'the Frankenstein Mansion',
                    0x14: 'the Frankenstein Mansion',
                    0x15: 'the Frankenstein Mansion',
                    0x17: 'the Frankenstein Mansion',
                    '*': 'Geneva'
                }
            },
            actfive: {
                values: {
                    0x4: 'Victor\'s lab',
                    0x5: 'the jail',
                    0x6: 'the market stall',
                    0x7: 'the stables',
                    0x8: 'Victor\'s lab',
                    0x9: 'the sewer',
                    0xa: 'the guard\'s quarters',
                    0xb: 'Victor\'s lab',
                    '*': 'Ingolstatd'
                }
            },
            actsix: {
                values: {
                    0x4: 'the Frankenstein Mansion',
                    0x5: 'the Frankenstein Mansion',
                    0x6: 'the Frankenstein Mansion',
                    0x7: 'the Frankenstein Mansion',
                    0x8: 'the Frankenstein Mansion',
                    0x9: 'the Frankenstein Mansion',
                    0xa: 'the Frankenstein Mansion',
                    0xb: 'the general store',
                    0xd: 'the Frankenstein Mansion',
                    '*': 'Geneva'
                }
            },
        },
        displays: ({ lookup, format, macro, tag }) => [
            [
                $(
                    comparison(data.chapter, '=', 0),
                    comparison(create('Bit1', 0x15b43), '=', 0)
                ),
                trimRP(tag`Practising Fights`)
            ],
            [
                $(
                    comparison(data.chapter, '=', 0)
                ),
                trimRP(tag`On the Main Menu`)
            ],
            [
                $(
                    comparison(data.chapter, '>', 0),
                    comparison(create('Bit1', 0x15b43), '=', 0)
                ),
                trimRP(tag`Act ${macro.Number.at(conditionRP(data.chapter))}: Fighting for your life`)
            ],
            [
                $(
                    comparison(data.chapter, '<=', 2)
                ),
                trimRP(tag`Act ${macro.Number.at(conditionRP(data.chapter))}: In ${lookup.actonetwo.at('I:0xX15b80_M:0xe686')}`)
            ],
            [
                $(
                    comparison(data.chapter, '=', 3)
                ),
                trimRP(tag`Act 3: In ${lookup.actthree.at('I:0xX15b80_M:0xe686')}`)
            ],
            [
                $(
                    comparison(data.chapter, '=', 4)
                ),
                trimRP(tag`Act 4: In ${lookup.actfour.at('I:0xX15b80_M:0xe686')}`)
            ],
            [
                $(
                    comparison(data.chapter, '=', 5)
                ),
                trimRP(tag`Act 5: In ${lookup.actfive.at('I:0xX15b80_M:0xe686')}`)
            ],
            [
                $(
                    comparison(data.chapter, '=', 6)
                ),
                trimRP(tag`Act 6: In ${lookup.actsix.at('I:0xX15b80_M:0xe686')}`)
            ],
            [
                $(
                    comparison(data.chapter, '=', 7)
                ),
                trimRP(tag`Act 7: In the Arctic`)
            ],

            'Witnessing horrifying events unfold'
        ]

    })
}