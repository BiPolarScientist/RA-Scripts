import { define as $, ConditionBuilder, Condition } from '@cruncheevos/core'


export function comparison(leftobject: Partial<Condition.Data> | number, cmp:string, rightobject: Partial<Condition.Data> | number, leftdelta:boolean = false, rightdelta:boolean=false): ConditionBuilder {

    let output: ConditionBuilder = $('0'+cmp+'0')

    if (typeof leftobject === 'number') {
        output = output.withLast({ lvalue: { type: 'Value', value: leftobject } })
    }
    else {
        output = output.withLast({ lvalue: leftobject.lvalue })
        if (leftdelta) {
            output = output.withLast({ lvalue: { type: 'Delta' } })
        }
    }

    if (typeof rightobject === 'number') {
        output = output.withLast({ rvalue: { type: 'Value', value: rightobject } })
    }
    else {
        output = output.withLast({ rvalue: rightobject.rvalue })
        if (rightdelta) {
            output = output.withLast({ rvalue: { type: 'Delta' } })
        }
    }

    return output
}