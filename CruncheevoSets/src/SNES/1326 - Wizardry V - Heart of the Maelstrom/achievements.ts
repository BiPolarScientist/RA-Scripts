import { define as $, ConditionBuilder, Condition, AchievementSet, andNext, trigger, orNext, resetIf, measuredIf, measured, addHits, resetNextIf, pauseIf } from '@cruncheevos/core'
import * as data from './data.js'
import { comparison, connectAddSourceChains, calculation, create } from '../../helpers.js'
import * as fs from 'fs'
import { once } from 'events'

const b = (s) => `local\\\\${s}.png`
let c: number = 637983

function alwaysTrueCore(): any {
	return {
		core: $('1=1')
	}
}

export function inMazeInFight(floor: number = 0, East: number = 0, North: number = 0): ConditionBuilder {
	return $(
		(floor == 0) && comparison(data.game.Map.Floor, '>=', 1),
		(floor != 0) && comparison(data.game.Map.Floor, '=', floor),
		(floor != 0) && comparison(data.game.Map.EWPos, '=', East),
		(floor != 0) && comparison(data.game.Map.NSPos, '=', North),
		comparison(data.game.inBattle, '=', 1, true),
		comparison(data.game.inBattle, '=', 1, false)
	)
	
}


export function itemPickUpCore(itemcode: number, provideLocation:boolean = false, floor:number = 0, East:number = 0, North:number = 0): any {
	let output = $()
	for (let i: number = 0; i < 160; i++) {
		output = output.also($(
			orNext(
				comparison(data.game.Characters[Math.floor(i / 8)].MetaStatus, '!=', 0x85, true),
				comparison(data.game.Characters[Math.floor(i / 8)].Inventory[i % 8], '!=', itemcode, true)
			)
		))
	}

	return {
		core: $(
			!provideLocation && comparison(data.game.Map.Floor, '>', 0),
			provideLocation && comparison(data.game.Map.Floor, '=', floor),
			provideLocation && comparison(data.game.Map.EWPos, '=', East),
			provideLocation && comparison(data.game.Map.NSPos, '=', North),
			output
		)
	}
}

/**
 * 0 = G'bli, 1 = Ironose, 2 = Ruby Warlock, 3 = Duck of Sparks
 * 4 = Lorn Henmitey, 5 = Loon, 6 = Big Max, 7 = Might Yog
 * 8 = Evil Eyes, 9 = Mad Stomper, 10 = Snatch, 11 = Lord of Spades
 * 12 = Lord of Hearts, 13 = Lord of Diamonds, 14 = Lord of Clubs
 * 17 = The Laughing Kettle
 * @param floor
 * @param NPCNumber
 * @returns
 */
function killNPC(floor: number, NPCNumber: number): ConditionBuilder {
	return $(
		comparison(data.game.Map.Floor, '=', floor),
		comparison(create('8bit', 0x1b00 + NPCNumber), '=', 0, true),
		comparison(create('8bit', 0x1b00 + NPCNumber), '=', 1, false)
	)
}

export function makeAchievements(set: AchievementSet): void {

	let conditions = alwaysTrueCore()
	let i: number = 1
	for (let character of data.game.Characters) {
		let delalt: ConditionBuilder = $()
		let memalt: ConditionBuilder = $()
		for (let spells of [...character.MageSpellsUnlocked, ...character.ClericSpellsUnlocked]) {
			delalt = delalt.also(
				$(
					calculation(true, spells).withLast({ lvalue: { type: 'Delta', size: 'BitCount' } })
				)
			)
			memalt = memalt.also(
				$(
					calculation(true, spells).withLast({ lvalue: { size: 'BitCount' } })
				)
			)
		}
		conditions['alt' + i.toString()] = $(
			delalt,
			'0=62',
			memalt,
			'M:0=63',
			measuredIf(
				comparison(character.MetaStatus, '!=', 0),
				comparison(character.Name1, '=', character.Name1, true, false),
				comparison(character.Name2, '=', character.Name2, true, false)
			)
		)

		i = i + 1
	}

	set.addAchievement({
		title: 'Master of Magic',
		description: 'Learn every spell on any character',
		id: 29915,
		points: 25,
		conditions: conditions,
		badge: c
	})

	conditions = alwaysTrueCore()
	i = 1
	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			comparison(character.AC, '<', 0x80, true),
			comparison(character.AC, '>=', 0x80, false)
		)
		i = i + 1
	}

	c=c+1	set.addAchievement({
		title: 'Ironclad',
		description: 'Achieve a negative armor class value on any character',
		id: 29916,
		points: 25,
		conditions: conditions, 		badge: c
	})

	conditions = alwaysTrueCore()
	i = 1
	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			orNext(
				comparison(character.AC, '<', 0x80, true),
				comparison(character.AC, '>=', 0xf7, true)
			),
			comparison(character.AC, '>=', 0x80, false),
			comparison(character.AC, '<=', 0xf6, false)
		)
		i = i + 1
	}


	c=c+1	set.addAchievement({
		title: 'Lo Rider',
		description: 'Achieve an armor class of Low ("LO") on any character',
		id: 29917,
		points: 25,
		conditions: conditions, 		badge: c
	})

	conditions = alwaysTrueCore()
	i = 1
	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			orNext(
				comparison(character.AC, '<', 0x80, true),
				comparison(character.AC, '>=', 0xed, true)
			),
			comparison(character.AC, '>=', 0x80, false),
			comparison(character.AC, '<=', 0xec, false)
		)
		i = i + 1
	}


	c=c+1	set.addAchievement({
		title: 'Untouchable',
		description: 'Achieve an armor class of Very Low ("VL") on any character',
		id: 29918,
		points: 25,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		comparison(data.game.Map.Floor, '=', 1, true),
		comparison(data.game.Map.Floor, '=', 2, false),
		'0xH00db>0'
	)

	c=c+1	set.addAchievement({
		title: 'The Depths of the Maelstrom',
		description: 'Delve to level 2 of the maze',
		id: 29919,
		points: 5,
		conditions: conditions, 		badge: c
	})

	conditions = {
		core: $(
			comparison(data.game.Map.Floor, '=', 1),
			comparison(data.game.Map.EWPos, '=', 8, true),
			comparison(data.game.Map.NSPos, '=', 16, true),
			comparison(data.game.Map.EWPos, '=', 8, false),
			comparison(data.game.Map.NSPos, '=', 17, false)
		)
	}
	data.game.addAltsAnyActiveCharactersHaveItem(conditions, 0x82)

	c=c+1	set.addAchievement({
		title: 'Proving Your Worth',
		description: 'Demonstrate your worthiness with the Orb of Llylgamyn',
		id: 29920,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(1, 20, 27),
		data.game.Enemies.uniqueBattleFinished(0x85)
	)

	c=c+1	set.addAchievement({
		title: 'Vampire Slayer',
		description: 'Kill the Werebat',
		id: 29921,
		points: 5,
		type: 'missable',
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(1, 15, 23),
		data.game.Enemies.uniqueBattleFinished(0x1a)
	)

	c=c+1	set.addAchievement({
		title: 'Rock Crusher',
		description: 'Kill the Golem on floor 1 of the maze',
		id: 29922,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(),
		data.game.Enemies.uniqueBattleFinished(0x86)
	)

	c=c+1	set.addAchievement({
		title: 'Hurkle Hurkle',
		description: 'Kill the Hurkle Beast',
		id: 29923,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = {
		core: $(
			comparison(data.game.Map.Floor, '=', 4)
		),
		alt1: $(
			comparison(data.game.Map.EWPos, '=', 8, true),
			comparison(data.game.Map.NSPos, '=', 254, true),
			comparison(data.game.Map.EWPos, '=', 9, false),
			comparison(data.game.Map.NSPos, '=', 254, false)
		),
		alt2: $(
			comparison(data.game.Map.EWPos, '=', 10, true),
			comparison(data.game.Map.NSPos, '=', 255, true),
			comparison(data.game.Map.EWPos, '=', 10, false),
			comparison(data.game.Map.NSPos, '=', 254, false)
		)
	}

	c=c+1	set.addAchievement({
		title: 'A Shady Establishment',
		description: 'Discover the Den of Thieves',
		id: 29924,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x80, true, 1, 4, 4)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x80)

	c=c+1	set.addAchievement({
		title: 'Disturbing the Dead',
		description: 'Discover a purse on an undead adventuring party',
		id: 29925,
		points: 10,
		conditions: conditions, 		badge: c
	})

	conditions = {
		core: $(
			'1=1'
		)
	}
	for (let i: number = 1; i < 21; i++) {
		conditions['alt' + i.toString()] = $(
			comparison(data.game.Characters[i - 1].MetaStatus, '=', 0x85),
			calculation(true, 1),
			comparison(data.game.Characters[i - 1].ClericSlots[6], '=', data.game.Characters[i - 1].ClericSlots[6], true, false).withLast({
				lvalue: { size: 'Upper4' }, rvalue: { size: 'Upper4' }
			}),
			comparison(data.game.Characters[i - 1].ClericSpellsUnlocked[6], '>', data.game.Characters[i - 1].ClericSpellsUnlocked[6], true, false).withLast({
				lvalue: { size: 'Bit2' }, rvalue: { size: 'Bit2' }
			})
		)
	}

	c=c+1	set.addAchievement({
		title: 'Wishes Do Come True',
		description: 'Cast an Ihalon',
		id: 29926,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = {
		core: $(
			comparison(data.game.Map.Floor, '=', 2),
			comparison(data.game.Map.EWPos, '=', 249),
			comparison(data.game.Map.NSPos, '=', 3),
			comparison(data.game.Enemies.BattleID, '=', 0xa8)
		)
	}

	data.game.addAltsAnyActiveCharactersLoseItem(conditions, 0x7e)

	c=c+1	set.addAchievement({
		title: 'Fill My Cup',
		description: 'Help the Ruby Warlock',
		id: 29927,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = {
		core: $(
			comparison(data.game.Map.Floor, '=', 2),
			comparison(data.game.Map.EWPos, '=', 13),
			comparison(data.game.Map.NSPos, '=', 9),
			comparison(data.game.Enemies.BattleID, '!=', 0xf, true),
			comparison(data.game.Enemies.BattleID, '=', 0xf, false)
		)
	}

	c=c+1	set.addAchievement({
		title: 'Drinking Buddies',
		description: 'Encounter some patrons of the Dragon\'s Flagon',
		id: 29928,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(2, 8, 7),
		data.game.Enemies.uniqueBattleFinished(0x87)
	)

	c=c+1	set.addAchievement({
		title: 'Gouge the Guardian',
		description: 'Defeat the Guardian',
		id: 29929,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x78, true, 3, 254, 242)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x78)


	c=c+1	set.addAchievement({
		title: 'Plunging the Depths',
		description: 'Kill Makara to find a figurine',
		id: 29930,
		points: 10,
		conditions: conditions, 		badge: c
	})

	conditions = killNPC(3, 4)

	c=c+1	set.addAchievement({
		title: 'Deserved Demise',
		description: 'Kill Lord Hienmitey',
		id: 29931,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x7a, true, 3, 12, 8)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x7a)

	c=c+1	set.addAchievement({
		title: 'Blown Away',
		description: 'Kill the Wind King to find a tallow stick',
		id: 29932,
		points: 10,
		conditions: conditions, 		badge: c
	})

	conditions = itemPickUpCore(0x75, true, 4, 9, 247)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x75)

	c=c+1	set.addAchievement({
		title: 'Mincing the Myth',
		description: 'Kill Nessie to find a key',
		id: 29933,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = {
		core: $(
			comparison(data.game.Map.Floor, '=', 4),
			data.game.addTotalInventoryHeldInActiveParty(false),
			'K:0',
			data.game.addTotalInventoryHeldInActiveParty(true),
			'1={recall}'
		),
		alt1: $(
			comparison(data.game.Map.EWPos, '=', 243),
			comparison(data.game.Map.NSPos, '=', 226)
		),
		alt2: $(
			comparison(data.game.Map.EWPos, '=', 248),
			comparison(data.game.Map.NSPos, '=', 236)
		),
		alt3: $(
			comparison(data.game.Map.EWPos, '=', 243),
			comparison(data.game.Map.NSPos, '=', 232)
		)
	}

	c=c+1	set.addAchievement({
		title: 'Making a Withdrawl',
		description: 'Find an item in a safety deposit box',
		id: 29934,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(),
		data.game.Enemies.uniqueBattleFinished(0x8c)
	)

	c=c+1	set.addAchievement({
		title: 'Gold Dismember',
		description: 'Kill a Golden Statue',
		id: 29935,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x72, true, 6, 0, 254)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x72)

	c=c+1	set.addAchievement({
		title: 'Frozen Shut',
		description: 'Open the crypt to find a key',
		id: 29936,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x66, true, 6, 248, 247)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x66)

	c=c+1	set.addAchievement({
		title: 'M\'lady',
		description: 'Kill Lady Neptune to find a card',
		id: 29937,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(),
		data.game.Enemies.uniqueBattleFinished(0x59)
	)

	c=c+1	set.addAchievement({
		title: 'They\'re Like Onions',
		description: 'Kill a group of Swamp Things',
		id: 29938,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x67, true, 4, 11, 240)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x67)

	c=c+1	set.addAchievement({
		title: 'Euphamisms Anyone?',
		description: 'Open the Sly Woman\'s box to find a card',
		id: 29939,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x65, true, 6, 8, 231)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x65)


	c=c+1	set.addAchievement({
		title: 'Cold Blooded',
		description: 'Kill the Ice King to find a card',
		id: 29940,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x6c, true, 7, 10, 12)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x6c)


	c=c+1	set.addAchievement({
		title: 'Finnish Them',
		description: 'Kill a Dragonfinn to find a staff',
		id: 29941,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x6d, true, 7, 13, 247)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x6d)

	c=c+1	set.addAchievement({
		title: 'Fanning the Flame',
		description: 'Defeat the Fire Queen to find a staff',
		id: 29942,
		points: 10,
		conditions: conditions, 		badge: c
	})



	conditions = $(
		inMazeInFight(7, 244, 249),
		data.game.Enemies.uniqueBattleFinished(0x9a)
	)

	c=c+1	set.addAchievement({
		title: 'Ashes to Ashes',
		description: 'Kill the Pheonix',
		id: 29943,
		points: 10,
		conditions: conditions, 		badge: c
	})

	conditions = itemPickUpCore(0x83, false)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x83)

	c=c+1	set.addAchievement({
		title: 'Scorn the SORN',
		description: 'Kill the SORN and obtain the heart',
		id: 29944,
		points: 10,
		type: 'progression',
		conditions: conditions, 		badge: c
	})


	conditions = $(
		comparison(data.game.Map.Floor, '=', 0),
		comparison(data.game.Map.Location, '=', 0x19, true),
		comparison(data.game.Map.Location, '=', 0x1, false)
	)


	c=c+1	set.addAchievement({
		title: 'Congratulations!',
		description: 'Witness the endgame credit scroll',
		id: 29945,
		points: 25,
		type: 'win_condition',
		conditions: conditions, 		badge: c
	})


	conditions =  $(
		comparison(data.game.Map.Floor, '=', 8),
		comparison(data.game.Map.EWPos, '=', 23, true),
		comparison(data.game.Map.NSPos, '=', 91, true),
		comparison(data.game.Map.EWPos, '=', 24, false),
		comparison(data.game.Map.NSPos, '=', 91, false)
	)

	c=c+1	set.addAchievement({
		title: 'Props from the Devs',
		description: 'Receive a salute from the gods of Wizardry',
		id: 29946,
		points: 5,
		conditions: conditions, 		badge: c
	})



	conditions = $(
		inMazeInFight(),
		data.game.Enemies.uniqueBattleFinished(0x82)
	)

	c=c+1	set.addAchievement({
		title: 'Nether Regions',
		description: 'Kill a group led by a Nether Demon',
		id: 29947,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(),
		data.game.Enemies.uniqueBattleFinished(0x81)
	)

	c=c+1	set.addAchievement({
		title: 'Defeating the Darkness',
		description: 'Kill a group led by a Dark Lord',
		id: 29948,
		points: 10,
		conditions: conditions, 		badge: c
	})



	conditions = $(
		inMazeInFight(),
		data.game.Enemies.uniqueBattleFinished(0x83)
	)

	c=c+1	set.addAchievement({
		title: 'Felling the Fiend',
		description: 'Kill a group led by a Arch Fiend',
		id: 29949,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(1, 151, 151),
		data.game.Enemies.uniqueBattleFinished(0xab)
	)

	c=c+1	set.addAchievement({
		title: 'La La Be Slain',
		description: 'Defeat the ultimate enemy',
		id: 29950,
		points: 25,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x74, true, 5, 7, 255)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x74)

	c=c+1	set.addAchievement({
		title: 'Enjoy the Show',
		description: 'Gain access to Manfretti\'s',
		id: 29951,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = {
		core: $(
			comparison(data.game.Map.Floor, '=', 7, true),
			comparison(data.game.Map.Floor, '=', 8, false),
		),
		alt1: $(
			comparison(data.game.Map.EWPos, '=', 14),
			comparison(data.game.Map.NSPos, '=', 14)
		),
		alt2: $(
			comparison(data.game.Map.EWPos, '=', 241),
			comparison(data.game.Map.NSPos, '=', 241)
		),
		alt3: $(
			comparison(data.game.Map.EWPos, '=', 241),
			comparison(data.game.Map.NSPos, '=', 14)
		)
}


	c=c+1	set.addAchievement({
		title: 'Bring the Pain',
		description: 'Fall into the Pits of Pain',
		id: 29952,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = $(
		inMazeInFight(8, 79, 193),
		data.game.Enemies.uniqueBattleFinished(0x6a)
	)

	c=c+1	set.addAchievement({
		title: 'Ghost Busting',
		description: 'Kill Manfretti\'s Ghost',
		id: 29953,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(3, 9)

	c=c+1	set.addAchievement({
		title: 'Stomp the Stomper',
		description: 'Kill the Mad Stomper',
		id: 29954,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(4, 5)

	c=c+1	set.addAchievement({
		title: 'Lick the Loon',
		description: 'Kill the Loon',
		id: 29955,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(6, 8)

	c=c+1	set.addAchievement({
		title: 'Anneyehilate',
		description: 'Kill Evil Eyes',
		id: 29956,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(6, 7)

	c=c+1	set.addAchievement({
		title: 'Yoginator',
		description: 'Kill the Yog',
		id: 29957,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(5, 10)

	c=c+1	set.addAchievement({
		title: 'Snipe the Snatch',
		description: 'Kill The Snatch',
		id: 29958,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(1, 17)

	c=c+1	set.addAchievement({
		title: 'Cooking the Kettle',
		description: 'Kill the Laughing Kettle',
		id: 29959,
		points: 25,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(7, 13)

	c=c+1	set.addAchievement({
		title: 'Destroy the Diamond',
		description: 'Kill the Lord of Diamonds',
		id: 29960,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(7, 11)

	c=c+1	set.addAchievement({
		title: 'Splay the Spade',
		description: 'Kill the Lord of Spades',
		id: 29961,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(7, 12)

	c=c+1	set.addAchievement({
		title: 'Harm the Heart',
		description: 'Kill the Lord of Hearts',
		id: 29962,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = killNPC(7, 14)

	c=c+1	set.addAchievement({
		title: 'Club the Club',
		description: 'Kill the Lord of Clubs',
		id: 29963,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = {
		core: $(
			comparison(data.game.Map.Location, '=', 0x8)
		)
	}

	i = 1

	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0x0),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			character.AddClass(true),
			'0!=6',
			character.AddClass(false),
			'0=6'
		)
		i = i + 1
	}

	c=c+1	set.addAchievement({
		title: 'Lordly Laurels',
		description: 'Change the class of one of your adventurers to Lord',
		id: 29964,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = {
		core: $(
			comparison(data.game.Map.Location, '=', 0x8)
		)
	}

	i = 1

	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0x0),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			character.AddClass(true),
			'0!=5',
			character.AddClass(false),
			'0=5'
		)
		i = i + 1
	}

	c=c+1	set.addAchievement({
		title: 'Bushido Code',
		description: 'Change the class of one of your adventurers to Samurai',
		id: 29965,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = {
		core: $(
			comparison(data.game.Map.Location, '=', 0x8)
		)
	}

	i = 1

	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0x0),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			character.AddClass(true),
			'0!=7',
			character.AddClass(false),
			'0=7'
		)
		i = i + 1
	}

	c=c+1	set.addAchievement({
		title: 'Way of the Ninja',
		description: 'Change the class of one of your adventurers to Ninja',
		id: 29966,
		points: 10,
		conditions: conditions, 		badge: c
	})


	conditions = alwaysTrueCore()
	i = 1

	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0x0),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			character.AddClass(false),
			'O:0=5',
			character.AddClass(false),
			'0=6',
			character.AddAlignment(true),
			'0!=2',
			character.AddAlignment(false),
			'0=2'
		)
		i = i + 1
	}

	c=c+1	set.addAchievement({
		title: 'Corruption',
		description: 'Convert a Lord or Samurai to Evil alignment',
		id: 29967,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = alwaysTrueCore()
	i = 1

	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0x0),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			character.AddClass(false),
			'O:0=3',
			character.AddClass(false),
			'0=7',
			character.AddAlignment(true),
			'0!=0',
			character.AddAlignment(false),
			'0=0'
		)
		i = i + 1
	}

	c=c+1	set.addAchievement({
		title: 'Salvation',
		description: 'Convert a Thief or Ninja to Good alignment',
		id: 29968,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = alwaysTrueCore()
	i = 1

	for (let character of data.game.Characters) {
		conditions['alt' + i.toString()] = $(
			comparison(character.MetaStatus, '!=', 0x0, true),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			character.AddClass(true),
			'0=5',
			character.AddClass(false),
			'0=5',
			character.AddAlignment(true),
			'0!=1',
			character.AddAlignment(false),
			'0=1'
		)
		conditions['alt' + (i+20).toString()] = $(
			comparison(character.MetaStatus, '!=', 0x0, true),
			comparison(character.Name1, '=', character.Name1, true, false),
			comparison(character.Name2, '=', character.Name2, true, false),
			character.AddClass(true),
			'0!=5',
			character.AddClass(false),
			'0=5',
			character.AddAlignment(true),
			'0=1',
			character.AddAlignment(false),
			'0=1'
		)
		conditions['alt' + (i+40).toString()] = $(
			comparison(character.MetaStatus, '=', 0x0, true),
			comparison(character.MetaStatus, '!=', 0x0, false),
			character.AddClass(false),
			'0=5',
			character.AddAlignment(false),
			'0=1'
		)
		i = i + 1
	}

	c=c+1	set.addAchievement({
		title: 'Ronin',
		description: 'Create a Samurai of neutral alignment',
		id: 29969,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = inMazeInFight().also(
		comparison(data.game.Summon, '!=', 0x7d, true),
		comparison(data.game.Summon, '=', 0x7d, false)
	)

	c=c+1	set.addAchievement({
		title: 'Devil Summoner',
		description: 'Summon a Greater Demon',
		id: 29970,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x4c, false)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x4c)


	c=c+1	set.addAchievement({
		title: 'Odinson',
		description: 'Obtain the ultimate sword',
		id: 30010,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x4b, false)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x4b)

	c=c+1	set.addAchievement({
		title: 'Blade of Legend',
		description: 'Obtain the ultimate katana',
		id: 30011,
		points: 5,
		conditions: conditions, 		badge: c
	})


	conditions = itemPickUpCore(0x4a, false)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x4a)

	c=c+1	set.addAchievement({
		title: 'Fury of the Wood',
		description: 'Obtain the ultimate bow',
		id: 30012,
		points: 5,
		conditions: conditions,
		badge: c
	})


	conditions = itemPickUpCore(0x4d, false)
	data.game.addAltsAnyActiveCharactersPickUpItem(conditions, 0x4d)

	c=c+1	set.addAchievement({
		title: 'All Clad in Gold',
		description: 'Obtain the ultimate armor',
		id: 30013,
		points: 5,
		conditions: conditions,
		badge: c
	})

}
