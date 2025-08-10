import { define as $, ConditionBuilder, Condition } from '../node_modules/@cruncheevos/core'
import * as data from './data.ts'

function beatLevelOnToughFirstTime(levelID: number): ConditionBuilder {
    return $('=2').with({ lvalue: data.difficulty })
    
}
console.log(beatLevelOnToughFirstTime(0x5).toString())

