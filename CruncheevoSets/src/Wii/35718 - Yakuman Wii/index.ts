import { AchievementSet, define as $ } from '@cruncheevos/core'

import { makeAchievements } from './achievements.js'
//import {makeLeaderboards} from './leaderboards.js'
//import {makeRP} from './rp.js'

const sett = new AchievementSet({
    gameId: 35718,
    title: 'Yakuman Wii: Ide Yosuke no Kenkou Mahjong'
})


makeAchievements(sett)
//makeLeaderboards(sett)
//export const rich = makeRP()

export const set = sett
