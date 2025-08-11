import { AchievementSet, define as $ } from '@cruncheevos/core'

import { makeAchievements } from './achievements.js'
//import {makeLeaderboards} from './leaderboards.js'
//import {makeRp} from './rp.js'

const set = new AchievementSet({
    gameId: 24497,
    title: 'Rugrats: Royal Ransom'
})


makeAchievements(set)
//makeLeaderboards(set)
//export const rich = makeRp()

export default set 