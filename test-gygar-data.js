/**
 * Test script for class-data-gygar.js
 * Tests Smoothified Mode (Gygar) class progressions
 */

import {
  ATTACK_BONUS_PROGRESSIONS,
  ATTACK_BONUS_SCALE,
  SAVING_THROWS,
  getXPRequired,
  getHitDice,
  getAttackBonus,
  getSavingThrows,
  getSpellSlots,
  getThiefSkills,
  getTurnUndead,
  getLevelFromXP,
  getXPToNextLevel
} from './class-data-gygar.js';

import { XP_REQUIREMENTS, HIT_DICE_SCALE, SPELL_SLOT_SCALE } from './class-data-shared.js';

console.log('='.repeat(80));
console.log('TESTING SMOOTHIFIED MODE (GYGAR) CLASS DATA');
console.log('='.repeat(80));

let passedTests = 0;
let totalTests = 0;

function test(description, condition) {
  totalTests++;
  if (condition) {
    console.log(`✓ ${description}`);
    passedTests++;
  } else {
    console.log(`✗ ${description}`);
  }
}

// Test 1: XP Requirements
console.log('\n--- Test 1: XP Requirements ---');
test('Fighter_CLASS level 1 requires 0 XP', getXPRequired('Fighter_CLASS', 1) === 0);
test('Fighter_CLASS level 14 requires 840,000 XP', getXPRequired('Fighter_CLASS', 14) === 840000);
test('Spellblade_CLASS max level is 10', XP_REQUIREMENTS.Spellblade_CLASS.length === 10);
test('Dwarf_CLASS can reach level 14 (no limit)', XP_REQUIREMENTS.Dwarf_CLASS.length === 14);
test('Elf_CLASS can reach level 14 (no limit)', XP_REQUIREMENTS.Elf_CLASS.length === 14);
test('Halfling_CLASS can reach level 14 (no limit)', XP_REQUIREMENTS.Halfling_CLASS.length === 14);
test('Gnome_CLASS can reach level 14 (no limit)', XP_REQUIREMENTS.Gnome_CLASS.length === 14);

// Test 2: Attack Bonus Progressions (Smoothified)
console.log('\n--- Test 2: Attack Bonus Progressions (Smoothified) ---');
test('Fighter level 1 has +1 attack bonus', getAttackBonus('Fighter_CLASS', 1) === 1);
test('Fighter level 14 has +9 attack bonus', getAttackBonus('Fighter_CLASS', 14) === 9);
test('Cleric level 1 has +0 attack bonus', getAttackBonus('Cleric_CLASS', 1) === 0);
test('Cleric level 14 has +7 attack bonus', getAttackBonus('Cleric_CLASS', 14) === 7);
test('Magic-User level 1 has +0 attack bonus', getAttackBonus('Magic-User_CLASS', 1) === 0);
test('Magic-User level 14 has +5 attack bonus', getAttackBonus('Magic-User_CLASS', 14) === 5);
test('Spellblade level 1 has +1 attack bonus', getAttackBonus('Spellblade_CLASS', 1) === 1);
test('Spellblade level 10 has +7 attack bonus', getAttackBonus('Spellblade_CLASS', 10) === 7);

// Test 3: Saving Throws (Gradual Improvements)
console.log('\n--- Test 3: Saving Throws (Gradual Improvements) ---');
const clericSaves1 = getSavingThrows('Cleric_CLASS', 1);
const clericSaves14 = getSavingThrows('Cleric_CLASS', 14);
test('Cleric level 1 Death save is 11', clericSaves1.death === 11);
test('Cleric level 14 Death save is 3', clericSaves14.death === 3);
test('Cleric saves improve gradually (not big jumps)', clericSaves1.death > clericSaves14.death);

const fighterSaves1 = getSavingThrows('Fighter_CLASS', 1);
const fighterSaves14 = getSavingThrows('Fighter_CLASS', 14);
test('Fighter level 1 Death save is 12', fighterSaves1.death === 12);
test('Fighter level 14 Death save is 4', fighterSaves14.death === 4);

// Test 4: Hit Dice (No Level Limits for Demihumans)
console.log('\n--- Test 4: Hit Dice (No Level Limits) ---');
test('Dwarf uses D8_2 progression', HIT_DICE_SCALE.Dwarf_CLASS === 'D8_2');
test('Dwarf level 14 HD exists', getHitDice('Dwarf_CLASS', 14) !== null);
test('Elf uses D6_1 progression', HIT_DICE_SCALE.Elf_CLASS === 'D6_1');
test('Elf level 14 HD exists', getHitDice('Elf_CLASS', 14) !== null);
test('Halfling level 14 HD exists', getHitDice('Halfling_CLASS', 14) !== null);
test('Gnome level 14 HD exists', getHitDice('Gnome_CLASS', 14) !== null);

// Test 5: Spell Slots
console.log('\n--- Test 5: Spell Slots ---');
const clericSpells2 = getSpellSlots('Cleric_CLASS', 2);
const muSpells1 = getSpellSlots('Magic-User_CLASS', 1);
test('Cleric level 2 has 1 first-level spell', clericSpells2['1'] === 1);
test('Magic-User level 1 has 1 first-level spell', muSpells1['1'] === 1);
test('Spellblade has spell slots', getSpellSlots('Spellblade_CLASS', 1) !== null);
test('Elf has spell slots (no level limit)', getSpellSlots('Elf_CLASS', 14) !== null);

// Test 6: Thief Skills
console.log('\n--- Test 6: Thief Skills ---');
const thiefSkills1 = getThiefSkills(1);
const thiefSkills14 = getThiefSkills(14);
test('Thief level 1 climb sheer surfaces is 87%', thiefSkills1.climbSheerSurfaces === 87);
test('Thief level 14 climb sheer surfaces is 99%', thiefSkills14.climbSheerSurfaces === 99);
test('Thief skills improve with level', thiefSkills14.openLocks > thiefSkills1.openLocks);

// Test 7: Turn Undead
console.log('\n--- Test 7: Turn Undead ---');
test('Cleric level 1 turns 1HD undead on 7+', getTurnUndead(1, '1HD') === 7);
test('Cleric level 4 destroys 1HD undead', getTurnUndead(4, '1HD') === 'D');
test('Cleric level 11+ destroys all undead', getTurnUndead(11, '7-9HD') === 'D');

// Test 8: Level from XP
console.log('\n--- Test 8: Level from XP ---');
test('Fighter with 0 XP is level 1', getLevelFromXP('Fighter_CLASS', 0) === 1);
test('Fighter with 2000 XP is level 2', getLevelFromXP('Fighter_CLASS', 2000) === 2);
test('Fighter with 840000 XP is level 14', getLevelFromXP('Fighter_CLASS', 840000) === 14);
test('Spellblade with 600000 XP is level 10', getLevelFromXP('Spellblade_CLASS', 600000) === 10);

// Test 9: XP to Next Level
console.log('\n--- Test 9: XP to Next Level ---');
test('Fighter at 0 XP needs 2000 for level 2', getXPToNextLevel('Fighter_CLASS', 0) === 2000);
test('Fighter at max level returns null', getXPToNextLevel('Fighter_CLASS', 840000) === null);
test('Spellblade at max level returns null', getXPToNextLevel('Spellblade_CLASS', 600000) === null);

// Test 10: Class Name Consistency
console.log('\n--- Test 10: Class Name Consistency ---');
test('Fighter_CLASS name works', getXPRequired('Fighter_CLASS', 1) === 0);
test('Cleric_CLASS name works', getAttackBonus('Cleric_CLASS', 1) === 0);
test('Magic-User_CLASS name works', getSavingThrows('Magic-User_CLASS', 1) !== null);
test('Dwarf_CLASS name works', getHitDice('Dwarf_CLASS', 1) !== null);

// Test 11: Smoothified vs OSE Differences
console.log('\n--- Test 11: Smoothified Mode Differences ---');
test('Fighter attack bonus is smoother (level 2 = +2)', getAttackBonus('Fighter_CLASS', 2) === 2);
test('Fighter attack bonus is smoother (level 3 = +3)', getAttackBonus('Fighter_CLASS', 3) === 3);
test('Cleric saves improve gradually (level 3 vs level 4)', 
  getSavingThrows('Cleric_CLASS', 3).spells > getSavingThrows('Cleric_CLASS', 4).spells);
test('No demihuman level limits (Dwarf can reach 14)', XP_REQUIREMENTS.Dwarf_CLASS.length === 14);
test('No demihuman level limits (Elf can reach 14)', XP_REQUIREMENTS.Elf_CLASS.length === 14);

// Test 12: All 9 Classes
console.log('\n--- Test 12: All 9 Classes ---');
const classes = ['Fighter_CLASS', 'Cleric_CLASS', 'Magic-User_CLASS', 'Thief_CLASS', 
                 'Dwarf_CLASS', 'Elf_CLASS', 'Halfling_CLASS', 'Gnome_CLASS', 'Spellblade_CLASS'];
classes.forEach(className => {
  test(`${className} has XP requirements`, XP_REQUIREMENTS[className] !== undefined);
  test(`${className} has attack bonus scale`, ATTACK_BONUS_SCALE[className] !== undefined);
  test(`${className} has saving throws`, SAVING_THROWS[className] !== undefined);
  test(`${className} level 1 data works`, getXPRequired(className, 1) === 0);
});

// Summary
console.log('\n' + '='.repeat(80));
console.log(`TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
console.log('='.repeat(80));

if (passedTests === totalTests) {
  console.log('✓ ALL TESTS PASSED!');
  process.exit(0);
} else {
  console.log(`✗ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}
