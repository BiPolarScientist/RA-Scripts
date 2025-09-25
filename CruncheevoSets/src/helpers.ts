import { define as $, ConditionBuilder, Condition } from '@cruncheevos/core'


/**
 * Returns a flagless condition that compares the left to the right objects. Objects can be either Memory data, a value, a float (has to have a nonzero decimal), or a string to stand in as Recall.
 * You can make the left or right sides of the comparison delta with extra booleans.
 * @param leftobject
 * @param cmp
 * @param rightobject
 * @param leftdelta
 * @param rightdelta
 * @returns
 */
export function comparison(leftobject: Partial<Condition.Data> | number | string, cmp:string, rightobject: Partial<Condition.Data> | number | string, leftdelta:boolean = false, rightdelta:boolean=false): ConditionBuilder {

    let output: ConditionBuilder = $('0'+cmp+'0')

    if (typeof leftobject == 'string') {
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
 * Returns an AddSource (if true) or SubSource (if false) line, add/subtracting off either a memory location, value, float, or Recall (if you imput a string)
 * @param isAddSource
 * @param leftobject
 * @param cmp
 * @param rightobject
 * @param leftdelta
 * @param rightdelta
 * @returns
 */
export function calculation(isAddSource: boolean, leftobject: Partial<Condition.Data> | number | string, cmp: string = 'none', rightobject: Partial<Condition.Data> | number | string = 0, leftdelta: boolean = false, rightdelta: boolean = false): ConditionBuilder {

    let output: ConditionBuilder

    if (cmp == 'none') {
        if (typeof leftobject == 'string') {
            output = $('B:{recall}')
        }
        else if (typeof leftobject == 'number') {
            output = $('B:' + leftobject.toString())
        }
        else {
            output = $('B:0').withLast({ lvalue: leftobject.lvalue })
        } 


        if (isAddSource) {
            output = output.withLast({ flag: 'AddSource' })
        }


    }

    else {

        if (isAddSource) {
            output = $('A:0' + cmp + '0')
        }
        else {
            output = $('B:0' + cmp + '0')
        }




        if (typeof leftobject == 'string') {
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

/** Putting in a measured line with only a left side for leaderboards */
export function measureLB(leftobject: Partial<Condition.Data> | number | string): ConditionBuilder {
    if (typeof leftobject == 'string') {
        return $('M:{recall}')
    }
    else if (typeof leftobject == 'number') {
        return $('M:' + leftobject.toString())
    }
    else {
        return $('M:0').withLast({ lvalue: leftobject.lvalue })
    } 
}

/**
 * RP script stuff is weird, it doesn't like certain characters in the middle of lookups so we have to use a helper function.
 * @param stuff
 * @returns
 */
export function conditionRP(stuff: Partial<Condition.Data>): string {
    let output: string = '0x'
    if (stuff.lvalue?.type == 'Delta') {
        output = 'd' + output
    }

    if (stuff.lvalue?.size == '8bit') {
        output = output + 'H'
    }
    else if (stuff.lvalue?.size == '32bit') {
        output = output + 'X'
    }
    else if (stuff.lvalue?.size == 'Lower4') {
        output = output + 'L'
    }
    else if (stuff.lvalue?.size == 'Upper4') {
        output = output + 'U'
    }

    return output + stuff.lvalue?.value.toString(16)
}

/**
 * Gets rid of any additional white space in RP clause, e.g. takes '  a   \n  b ' into 'a b'
 * @param clause
 * @returns
 */
export function trimRP(clause: string): string {
    return clause.replace(/(\r\n|\n|\r|\t)/gm, "").replace(/\s+/gm, ' ').trim()
}