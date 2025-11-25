import { define as $, andNext, Condition, ConditionBuilder, orNext, RichPresence } from '@cruncheevos/core'
import { calculation, comparison, conditionRP, connectAddSourceChains, trimRP, altsRP } from '../../helpers.js'
import * as data from './data.js'
import * as fs from 'fs'


export function makeRP(): any {

    let rememberDiaryStart: ConditionBuilder = $(
        ['Remember', 'Mem', 'Bit2', 0x15512, '*', 'Mem', 'Bit4', 0x15512],
        ['SubSource', 'Recall', '', 0, '*', 'Value', '', 0x630860],
        ['AddSource', 'Mem', 'Bit2', 0x15512, '*', 'Value', '', 0x5d08e8],
        ['Remember', 'Mem', 'Bit4', 0x15512, '*', 'Value', '', 0x614b60],
        'I:{recall}',
        'I:0xX0',
        'A:0xX44*101',
        'I:{recall}',
        'K:0xX0+24096'
    )

    let rDS: string = rememberDiaryStart.toString()

    return RichPresence({
        lookupDefaultParameters: { keyFormat: 'dec', compressRanges: true },
        format: {},
        lookup: {
            Classes: {
                values: { 
                    0x0: 'Fight',
                    0x1: 'Mage',
                    0x2: 'Cleric',
                    0x3: 'Thief',
                    0x4: 'Wizard',
                    0x5: 'Samurai',
                    0x6: 'Lord',
                    0x7: 'Ninja',
                }
            },
            At: {
                values: {
                    0: '',
                    1: '@'
                }
            }
        },
        displays: ({ lookup, format, macro, tag }) => [
            [
                $(
                    comparison(data.game.Map.Floor, '=', 0),
                    orNext(
                        comparison(data.game.Map.Location, '=', 1),
                        comparison(data.game.Map.Location, '=', 0x19)
                    )
                ),
                'The Sorn has Passed Beyond and The Triaxial Balance is restored!'
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '=', 0),
                    comparison(data.game.Map.Location, '=', 2)
                ),
                'At Gilgamesh\'s Tavern, gathering adventurers to delve into the Maelstrom'
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '=', 0),
                    comparison(data.game.Map.Location, '=', 4)
                ),
                'Spending time resting at the Adventurer\'s Tavern'
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '=', 0),
                    comparison(data.game.Map.Location, '=', 5)
                ),
                'Pruchasing items at Boltac\'s Trading Post'
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '=', 0),
                    comparison(data.game.Map.Location, '=', 6)
                ),
                'Reviving the Doomed at the Temple of Cant'
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '=', 0),
                    comparison(data.game.Map.Location, '=', 8)
                ),
                'Rolling dice to create new character sheets'
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '=', 0),
                    orNext(
                        comparison(data.game.Map.Location, '=', 0x3),
                        comparison(data.game.Map.Location, '=', 0x7),
                        comparison(data.game.Map.Location, '=', 0x9)
                    )
                ),
                'Preparing in town'
            ],
            [
                altsRP([
                    $(
                        comparison(data.game.Map.Floor, '=', 8),
                        '0xHdb=6'
                    ),
                    $(
                        comparison(data.game.Map.EWPos, '>', 13),
                        comparison(data.game.Map.EWPos, '<', 243)
                    ),
                    $(
                        comparison(data.game.Map.NSPos, '>', 13),
                        comparison(data.game.Map.NSPos, '<', 243)
                    )
                ]),
                trimRP(tag`
                    Exploring Floor 777 of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHde*128_M:0x1021')} ${lookup.Classes.at('I:0xHde*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHde*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdf*128_M:0x1021')} ${lookup.Classes.at('I:0xHdf*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdf*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHe0*128_M:0x1021')} ${lookup.Classes.at('I:0xHe0*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHe0*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHe1*128_M:0x1021')} ${lookup.Classes.at('I:0xHe1*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHe1*128_M:0xQ1058')} 
                `)
            ],
            [
                altsRP([
                    $(
                        comparison(data.game.Map.Floor, '=', 8),
                        '0xHdb=5'
                    ),
                    $(
                        comparison(data.game.Map.EWPos, '>', 13),
                        comparison(data.game.Map.EWPos, '<', 243)
                    ),
                    $(
                        comparison(data.game.Map.NSPos, '>', 13),
                        comparison(data.game.Map.NSPos, '<', 243)
                    )
                ]),
                trimRP(tag`
                    Exploring Floor 777 of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHde*128_M:0x1021')} ${lookup.Classes.at('I:0xHde*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHde*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdf*128_M:0x1021')} ${lookup.Classes.at('I:0xHdf*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdf*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHe0*128_M:0x1021')} ${lookup.Classes.at('I:0xHe0*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHe0*128_M:0xQ1058')} 
                `)
            ],
            [
                altsRP([
                    $(
                        comparison(data.game.Map.Floor, '=', 8),
                        '0xHdb=4'
                    ),
                    $(
                        comparison(data.game.Map.EWPos, '>', 13),
                        comparison(data.game.Map.EWPos, '<', 243)
                    ),
                    $(
                        comparison(data.game.Map.NSPos, '>', 13),
                        comparison(data.game.Map.NSPos, '<', 243)
                    )
                ]),
                trimRP(tag`
                    Exploring Floor 777 of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHde*128_M:0x1021')} ${lookup.Classes.at('I:0xHde*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHde*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdf*128_M:0x1021')} ${lookup.Classes.at('I:0xHdf*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdf*128_M:0xQ1058')} 
                `)
            ],
            [
                altsRP([
                    $(
                        comparison(data.game.Map.Floor, '=', 8),
                        '0xHdb=3'
                    ),
                    $(
                        comparison(data.game.Map.EWPos, '>', 13),
                        comparison(data.game.Map.EWPos, '<', 243)
                    ),
                    $(
                        comparison(data.game.Map.NSPos, '>', 13),
                        comparison(data.game.Map.NSPos, '<', 243)
                    )
                ]),
                trimRP(tag`
                    Exploring Floor 777 of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHde*128_M:0x1021')} ${lookup.Classes.at('I:0xHde*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHde*128_M:0xQ1058')} 
                `)
            ],
            [
                altsRP([
                    $(
                        comparison(data.game.Map.Floor, '=', 8),
                        '0xHdb=2'
                    ),
                    $(
                        comparison(data.game.Map.EWPos, '>', 13),
                        comparison(data.game.Map.EWPos, '<', 243)
                    ),
                    $(
                        comparison(data.game.Map.NSPos, '>', 13),
                        comparison(data.game.Map.NSPos, '<', 243)
                    )
                ]),
                trimRP(tag`
                    Exploring Floor 777 of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                `)
            ],
            [
                altsRP([
                    $(
                        comparison(data.game.Map.Floor, '=', 8),
                        '0xHdb=1'
                    ),
                    $(
                        comparison(data.game.Map.EWPos, '>', 13),
                        comparison(data.game.Map.EWPos, '<', 243)
                    ),
                    $(
                        comparison(data.game.Map.NSPos, '>', 13),
                        comparison(data.game.Map.NSPos, '<', 243)
                    )
                ]),
                trimRP(tag`
                    Exploring Floor 777 of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                `)
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '>', 0),
                    '0xHdb=6'
                ),
                trimRP(tag`
                    Exploring Floor ${macro.Unsigned.at(conditionRP(data.game.Map.Floor))} of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHde*128_M:0x1021')} ${lookup.Classes.at('I:0xHde*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHde*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdf*128_M:0x1021')} ${lookup.Classes.at('I:0xHdf*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdf*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHe0*128_M:0x1021')} ${lookup.Classes.at('I:0xHe0*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHe0*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHe1*128_M:0x1021')} ${lookup.Classes.at('I:0xHe1*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHe1*128_M:0xQ1058')} 
                `)
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '>', 0),
                    '0xHdb=5'
                ),
                trimRP(tag`
                    Exploring Floor ${macro.Unsigned.at(conditionRP(data.game.Map.Floor))} of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHde*128_M:0x1021')} ${lookup.Classes.at('I:0xHde*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHde*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdf*128_M:0x1021')} ${lookup.Classes.at('I:0xHdf*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdf*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHe0*128_M:0x1021')} ${lookup.Classes.at('I:0xHe0*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHe0*128_M:0xQ1058')} 
                `)
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '>', 0),
                    '0xHdb=4'
                ),
                trimRP(tag`
                    Exploring Floor ${macro.Unsigned.at(conditionRP(data.game.Map.Floor))} of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHde*128_M:0x1021')} ${lookup.Classes.at('I:0xHde*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHde*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdf*128_M:0x1021')} ${lookup.Classes.at('I:0xHdf*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdf*128_M:0xQ1058')} 
                `)
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '>', 0),
                    '0xHdb=3'
                ),
                trimRP(tag`
                    Exploring Floor ${macro.Unsigned.at(conditionRP(data.game.Map.Floor))} of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHde*128_M:0x1021')} ${lookup.Classes.at('I:0xHde*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHde*128_M:0xQ1058')} 
                `)
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '>', 0),
                    '0xHdb=2'
                ),
                trimRP(tag`
                    Exploring Floor ${macro.Unsigned.at(conditionRP(data.game.Map.Floor))} of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                    ● Lvl ${macro.Unsigned.at('I:0xHdd*128_M:0x1021')} ${lookup.Classes.at('I:0xHdd*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdd*128_M:0xQ1058')} 
                `)
            ],
            [
                $(
                    comparison(data.game.Map.Floor, '>', 0),
                    '0xHdb=1'
                ),
                trimRP(tag`
                    Exploring Floor ${macro.Unsigned.at(conditionRP(data.game.Map.Floor))} of the maze with 
                    ● Lvl ${macro.Unsigned.at('I:0xHdc*128_M:0x1021')} ${lookup.Classes.at('I:0xHdc*128_K:0x100a_K:{recall}/4_M:{recall}%8')}${lookup.At.at('I:0xHdc*128_M:0xQ1058')} 
                `)
            ],
            'Can we stop for directions?'
        ]

    })

}