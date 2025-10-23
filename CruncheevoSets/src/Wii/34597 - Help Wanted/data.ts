import { define as $, Condition, ConditionBuilder } from '@cruncheevos/core'
import { calculation, comparison, create, sizeDict } from '../../helpers.js'
import * as fs from 'fs'
import * as commentjson from 'comment-json'




let offsets: Array<Array<number>> = [
    [0, 0, 0, 0, 0],
    [-0x3d80, -0x23e80, -0x24408, 0x4f5e0, -0xe85c0],
    [0xc60, 0x1e200, 0x1e200, 0x20590, 0x20a8c]
]


export let jobTitles: any = {
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



class job {
    id: number;
    name: string;
    version: number;

    level: Partial<Condition.Data>;
    beatMasterExam: Partial<Condition.Data>;
    unlockedMasterExam: Partial<Condition.Data>;
    unlockedFreePlay: Partial<Condition.Data>;

    PALmasterExamQuota: number;

    arrayAccess(offset: number): Partial<Condition.Data> {
        return create('32bitBE', 0x247074 + offsets[this.version][1] + 0x44 * this.id + offset)
    }

    becamePro(): ConditionBuilder {
        return $(
            comparison(this.level, '=', 0, true),
            comparison(this.level, '=', 1, false)
        )
    }

    becameExpert(): ConditionBuilder {
        return $(
            comparison(this.level, '=', 1, true),
            comparison(this.level, '=', 2, false)
        )
    }

    becameMaster(): ConditionBuilder {
        return $(
            comparison(this.unlockedMasterExam, '=', 1),
            comparison(this.level, '=', 2, true),
            comparison(this.level, '=', 3, false)
        )
    }

    isAtLeastPro(isDelta: boolean): ConditionBuilder {
        return $(
            calculation(true, this.level, '/', this.level, isDelta, isDelta)
        )
    }

    isAtLeastExpert(isDelta: boolean): ConditionBuilder {
        return $(
            calculation(true, this.level).withLast({ lvalue: { size: 'Bit1', type: isDelta ? 'Delta' : 'Mem' } })
        )
    }

    isAtLeastMaster(isDelta: boolean): ConditionBuilder {
        return $(
            calculation(true, this.level, '/', 3, isDelta)
        )
    }

    /**
     * 
     * @param id
     * @param version 0 = USA, 1 = Japan, 2 = PAL
     */
    constructor(id: number, version: number) {
        this.id = id
        this.name = jobTitles[id]
        this.version = version
         

        this.level = create('8bit', 0x247074 + offsets[this.version][1] + 0x44 * this.id + 0x3c )
        this.beatMasterExam = create('8bit', 0x247074 + offsets[this.version][1] + 0x44 * this.id + 0x3d )
        this.unlockedMasterExam = create('8bit', 0x247074 + offsets[this.version][1] + 0x44 * this.id + 0x3e)
        this.unlockedFreePlay = create('8bit', 0x247074 + offsets[this.version][1] + 0x44 * this.id + 0x3f)

        switch (id) {
            case 7:
                this.PALmasterExamQuota = 20000
                break
            case 9:
                this.PALmasterExamQuota = 18000
                break
            case 10:
                this.PALmasterExamQuota = 20000
                break
            case 11:
                this.PALmasterExamQuota = 27000
                break
            case 12:
                this.PALmasterExamQuota = 25000
                break
            case 15:
                this.PALmasterExamQuota = 26000
                break
            case 18:
                this.PALmasterExamQuota = 13000
                break
            case 20:
                this.PALmasterExamQuota = 25000
                break
            case 26:
                this.PALmasterExamQuota = 15000
                break
            case 28:
                this.PALmasterExamQuota = 17000
                break
            case 29:
                this.PALmasterExamQuota = 20000
                break
            case 34:
                this.PALmasterExamQuota = 25000
                break
            case 52:
                this.PALmasterExamQuota = 24000
                break
            default:
                this.PALmasterExamQuota = 0
                break

        }
    }
}

class meteordata {
    /**
     * 0x0 - Meteor
     * 0x1 - Stone Face
     * 0x2 - Ramen
     * 0x3 - Disco Fever
     * 0x4 - Gum Wad
     * 0x5 - Space Gal
     * 0x6 - Ghost Photo
     * 0x7 - Red Liquid
     * 0x8 - Space Dad
     * 0x9 - Monumental Thingy
    */
    ID: Partial<Condition.Data>
    health: Partial<Condition.Data>
    maxHealth: Partial<Condition.Data>
    daysUntilImpact: Partial<Condition.Data>

    killed(): ConditionBuilder {
        return $(
            comparison(this.health, '>', 0, true),
            comparison(this.health, '=', 0, false)
        )
    }

    constructor(version: number) {
        this.ID = create('8bit', 0x245968 + offsets[version][1])
        this.health = create('32bitBE', 0x24596c + offsets[version][1])
        this.maxHealth = create('32bitBE', 0x245970 + offsets[version][1])
        this.daysUntilImpact = create('16bitBE', 0x24705c + offsets[version][1])
    }

}
class storyData {
    version: number;
    currentDay: Partial<Condition.Data>
    /** Current money in cents */
    currentMoney: Partial<Condition.Data>
    /** Current points in "cents"*/
    currentPoints: Partial<Condition.Data>
    /** Total money earned in cents */
    totalMoney: Partial<Condition.Data>
    /** Save file loaded, 0xffffffff when nothing loaded */
    loadedSave: Partial<Condition.Data>
    lastJob: Partial<Condition.Data>
    baseTutorialFlags: Partial<Condition.Data>;
    meteor: meteordata

    /**
     * 0 = maya/tom switch, 5 = shady characters, 6 = second story built, 7 = third story built
     * 11 = memorial hall upgrade 1, 12 = memorial hall upgrade 2, 13 = golden statue, 15 = all jobs aquired
     * @param i
     * @returns
     */
    storyFlag(i: number): Partial<Condition.Data> {
        return create(sizeDict[i % 8], 0x248218 + Math.floor(offsets[this.version][1] + i/8))
    }
    /**
     * 15 = $1000 antique in possesion
     * 16 = Free support item, 20 = $3000 antique in possesion, 21 = $30000 antique in possesion
     * 28 = Higgen's Challenge, 41 = Dinewell's Quota, 47 = beat yesterday for double pay
     * @param i
     * @returns
     */
    dailyEventFlag(i: number): Partial<Condition.Data> {
        return create(sizeDict[i % 8], 0x24821a + Math.floor(offsets[this.version][1] + i / 8))
    }
    tutorialFlag(i: number): Partial<Condition.Data> {
        return create(sizeDict[i % 8], 0x248221 + Math.floor(offsets[this.version][1] + i / 8))
    }
    /**
     * 7 = beat final meteor with[out] transformowatch, 8 = beat final meteor with[out] transformowatch
     * @param i
     * @returns
     */
    cutsceneUnlockedFlag(i: number): Partial<Condition.Data> {
        return create(sizeDict[i % 8], 0x248225 + Math.floor(offsets[this.version][1] + i / 8))
    }
    /**
     * 4 = Lucky stone, 5 = space fan, 6 = galactic blaster, 7 = space fireworks,
     * 8 = spooky mask, 9 = space fan 2.0, 12 = mini handybot, 13 = lunar remote, 14 = transfomowatch, 15 = reminisctron,
     * 17 = iron volleyball, 18 = space guitar
     * @param i
     * @returns
     */
    pointsItem(i: number): Partial<Condition.Data> {
        return create(sizeDict[i % 8], 0x2482b8 + Math.floor(offsets[this.version][1] + i / 8))
    }
    /**
     * 0 = Disco ball, 1 = ufo, 2 = stadium light, 3 = chandelier, 4 = lightbulb
     * @param i
     * @returns
     */
    headOrnament(i: number): Partial<Condition.Data> {
        return create(sizeDict[i % 8], 0x2482bb + Math.floor(offsets[this.version][1] + i / 8))
    }

    visitorBook(isDelta: boolean, finalAmount: number): ConditionBuilder {
        let output: ConditionBuilder = $()
        for (let i: number = 0; i <= 18; i++) {
            output = output.also(
                isDelta && calculation(true, create('BitCount', 0x2482d8 + offsets[this.version][1] + i)).withLast({ lvalue: { type: 'Delta' } }),
                !isDelta && calculation(true, create('BitCount', 0x2482d8 + offsets[this.version][1] + i))
            )
        }
        return output.withLast({ flag: isDelta ? '' : 'Measured', cmp: '=', rvalue: { type: 'Value', value: finalAmount } })
    }

    storyLoaded(): ConditionBuilder {
        return $(
            comparison(this.loadedSave, '!=', 0xffffffff),
            comparison(this.loadedSave, '=', this.loadedSave, true, false),
            comparison(this.baseTutorialFlags, '=', 0xf, true)
        )
    }

    constructor(version: number) {
        this.version = version
        this.currentDay = create('32bitBE', 0x245958 + offsets[version][1])
        this.currentMoney = create('32bitBE', 0x24595c + offsets[version][1])
        this.currentPoints = create('32bitBE', 0x245964 + offsets[version][1])
        this.totalMoney = create('32bitBE', 0x245960 + offsets[version][1])
        this.loadedSave = create('32bitBE', 0x2df140 + offsets[version][2])
        this.lastJob = create('16bitBE', 0x24705e + offsets[version][1])
        this.baseTutorialFlags = create('Lower4', 0x248221 + offsets[version][1])
        this.meteor = new meteordata(version)
    }

}

class paycheckCalculations {
    jobCode: Partial<Condition.Data>
    paycheckNoBonus: Partial<Condition.Data>
    paycheckBonus: Partial<Condition.Data>
    /**0x0 = No stamp
    0x1 = Goal Reached
    0x2 = Bonus
    0x3 = Failed */
    stamp: Partial<Condition.Data>

    constructor(version: number) {
        this.jobCode = create('32bitBE', 0x47b388 + offsets[version][4])
        this.paycheckNoBonus = create('32bitBE', 0x47b3d0 + offsets[version][4])
        this.paycheckBonus = create('32bitBE', 0x47b3d4 + offsets[version][4])
        this.stamp = create('32bitBE', 0x47b404 + offsets[version][4])
    }

}

export interface allMemory {
    story: storyData,
    job: Array<job>,
    paycheck: paycheckCalculations,
    /**
     * 0x0 = Title screen
       0x1 = Not in a job in employment office
        0x2 = Job select/in job in employment office
        0x3 = Paycheck in employment office
        0x5 = Reading job instructions
        0x6 = Save file select screen
        0xb = Mode select screen
        0xe = Job battle character select
        0xf = Job battle menu
        0x10 = Job battle free for all
        0x11 = Job battle target cash/total rounds/total wins
        0x13 = Job battle in job/paycheck screen
        0x14 = Job fair character select
        0x15 = Job fair job select
        0x16 = Job ready screen / in job
        0x18 = Paycheck screen in job fair
     */
    gameplayID: Partial<Condition.Data>

    checkVersion(): ConditionBuilder 
}





/*


Memory


*/


export let alwaysTrue: Partial<Condition.Data> = create('8bit', 0x0)

/**[8-bit] Version codes
0x45 - Help Wanted
0x4a - Hataraku
0x50 - Job Island */
export let releaseVersion: Partial<Condition.Data> = create('8bit', 0x3)


let versions: Array<string> = ['usa', 'japan', 'pal']

export let jobs: Array<Array<job>> = [[],[],[]]

for (let i in jobTitles) {
    for (let j in versions) {
        jobs[+j][+i] = new job(+i, +j)
    }
}



export let usa: allMemory = {
    story: new storyData(0),
    job: jobs[0],
    paycheck: new paycheckCalculations(0),
    gameplayID: create('32bitBE', 0x2dfdd8),

    checkVersion() {
        return $(
            comparison(releaseVersion, '=', 0x45)
        )
    }
}

export let japan: allMemory = {
    story: new storyData(1),
    job: jobs[1],
    paycheck: new paycheckCalculations(1),
    gameplayID: create('32bitBE', 0x2dfdd8 + offsets[1][2] - 0x40),

    checkVersion() {
        return $(
            comparison(releaseVersion, '=', 0x4a)
        )
    }
}

export let pal: allMemory = {
    story: new storyData(2),
    job: jobs[2],
    paycheck: new paycheckCalculations(2),
    gameplayID: create('32bitBE', 0x2dfdd8 + offsets[2][2]),

    checkVersion() {
        return $(
            comparison(releaseVersion, '=', 0x50)
        )
    }
}

