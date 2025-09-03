import { define as $, ConditionBuilder, Condition } from '@cruncheevos/core'


export function comparison(leftobject: Partial<Condition.Data> | number, cmp:string, rightobject: Partial<Condition.Data> | number | string, leftdelta:boolean = false, rightdelta:boolean=false): ConditionBuilder {

    let output: ConditionBuilder = $('0'+cmp+'0')

    if (typeof rightobject == 'string') {
        output = output.withLast({ lvalue: { type: 'Recall' } })
    }
    else if (typeof leftobject === 'number') {
        if (leftobject % 1 == 0) {
            output = output.withLast({ lvalue: { type: 'Value', value: leftobject } })
        }
        else {
            output = output.withLast({ lvalue: { type: 'Float', value: leftobject } })
        }
    }
    else {
        output = output.withLast({ lvalue: leftobject.lvalue })
        if (leftdelta) {
            output = output.withLast({ lvalue: { type: 'Delta' } })
        }
    }


    if (typeof rightobject == 'string') {
        output = output.withLast({ rvalue: { type: 'Recall' } })
    }
    else if (typeof rightobject === 'number') {
        if (rightobject % 1 == 0) {
            output = output.withLast({ rvalue: { type: 'Value', value: rightobject } })
        }
        else {
            output = output.withLast({ rvalue: { type: 'Float', value: rightobject } })
        }
    }
    else {
        output = output.withLast({ rvalue: rightobject.rvalue })
        if (rightdelta) {
            output = output.withLast({ rvalue: { type: 'Delta' } })
        }
    }

    return output
}

/**
 * Takes in an addsource chain that ends with =value, spits out the same addsource chain extended ready to be attached to more addsources, and the value this section was tested against previously
 * @param chain
 * @returns
 */
export function connectAddSourceChains(chain: ConditionBuilder): any {

    if (chain.conditions.length == 0) {
        return {
            chain: $(),
            tally: 0
        }
    }

    let tally: number = chain.conditions[chain.conditions.length - 1].rvalue.value
    let condOutput = chain
    condOutput.conditions[chain.conditions.length - 1] = new Condition('A:' + chain.conditions[chain.conditions.length - 1].toString().split('=')[0])
    return {
        chain: condOutput,
        tally: tally
    }
}

export function conditionRP(stuff: Partial<Condition.Data>): Condition{
        return new Condition('').with({ lvalue: stuff.lvalue })
 }