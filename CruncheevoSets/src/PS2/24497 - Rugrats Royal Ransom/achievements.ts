import { define as $, ConditionBuilder, Condition } from '@cruncheevos/core'
import * as data from './data.js'

export function beatLevelOnToughFirstTime(levelID: number): ConditionBuilder {
    return $('0=2').withLast({ lvalue: data.difficulty.lvalue })
    
}


