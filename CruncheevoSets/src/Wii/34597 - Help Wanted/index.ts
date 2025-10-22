import { AchievementSet, define as $ } from '@cruncheevos/core'

import { makeAchievements } from './achievements.js'
import {makeLeaderboards} from './leaderboards.js'
import {makeRP} from './rp.js'

const sett = new AchievementSet({
    gameId: 34597,
    title: 'Help Wanted: 50 Wacky Jobs!'
})


makeAchievements(sett)
makeLeaderboards(sett)
export const rich = makeRP()

export const set = sett
