// cs-core.js — cs-only rendering, codecs, and modifier display
// Inlines cs-sheet-renderer.js + cs-modifier-display.js
// Re-exports everything from shared-core.js so cs-sheet-page.js has a single import point.

export * from './shared-core.js';
import { WEAPONS } from './shared-core.js';

/**
 * cs-sheet-renderer.js
 * (formerly cs-character-sheet.js)
 *
 * HTML character sheet renderer — used by cs-sheet-page.js and (for the inline
 * preview) gen-ui.js.  Both exports are character-sheet rendering concerns; neither
 * is independently needed by the generator without the preview feature.
 * ES6 Module
 *
 * Usage: build a normalized sheet object, then call displayCharacterSheet(sheet, targetElement)
 *
 * Sheet object format:
 * {
 *   title: string,          // e.g. "OLD-SCHOOL ESSENTIALS ADVANCED"
 *   subtitle: string,       // e.g. "RETRO ADVENTURE GAME · Smoothified Mode"
 *   header: {
 *     columns: [{ label, value, flex, center }]  // flexible header columns
 *   },
 *   combat: { maxHP, initMod },
 *   abilityScores: [{ name, score, originalScore, effects }],
 *   weaponsAndSkills: { weapon, classAttackBonus, meleeMod, rangedMod, thiefSkills },
 *   abilitiesSection: { header, racial[], class[{name, description}] },
 *   savingThrows: { death, wands, paralysis, breath, spells },
 *   experience: null | { current, forLevel, forNext, bonus },
 *   equipment: { armor, items[], startingAC, startingGold },
 *   spellSlots: null | { [level]: count },
 *   turnUndead: null | { [type]: value },
 *   showUndeadNames: bool,
 *   footer: string,
 *   printTitle: string,
 *   openInNewTab: bool
 * }
 */


// ── URL codec (inlined from cs-url-codec.js) ──────────────────────────────────

// RFC 4648 base32: A–Z = 0–25, 2–7 = 26–31. No padding.
// QR alphanumeric mode supports this character set, giving ~2× more data per version
// than base64url (which forces byte mode due to lowercase letters).
const B32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const B32_LOOKUP = Object.fromEntries([...B32_CHARS].map((c, i) => [c, i]));

function _uint8ToBase32(bytes) {
    let bits = 0, acc = 0, out = '';
    for (const b of bytes) {
        acc = (acc << 8) | b;
        bits += 8;
        while (bits >= 5) {
            bits -= 5;
            out += B32_CHARS[(acc >> bits) & 31];
        }
    }
    if (bits > 0) out += B32_CHARS[(acc << (5 - bits)) & 31];
    return out;
}

function _base32ToUint8(str) {
    let bits = 0, acc = 0;
    const out = [];
    for (const c of str.toUpperCase()) {
        const val = B32_LOOKUP[c];
        if (val === undefined) continue;
        acc = (acc << 5) | val;
        bits += 5;
        if (bits >= 8) { bits -= 8; out.push((acc >> bits) & 0xff); }
    }
    return new Uint8Array(out);
}

/**
 * Gzip-compress a string and return a base32-encoded string (RFC 4648, no padding).
 * Uses QR-friendly alphanumeric characters (A–Z, 2–7) for better QR code efficiency.
 */
export async function compressToBase32(str) {
    const bytes = new TextEncoder().encode(str);
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const compressed = await new Response(cs.readable).arrayBuffer();
    return _uint8ToBase32(new Uint8Array(compressed));
}

/**
 * Decompress a base32-encoded gzip string back to a UTF-8 string.
 */
export async function decompressFromBase32(b32) {
    const bytes = _base32ToUint8(b32);
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const decompressed = await new Response(ds.readable).arrayBuffer();
    return new TextDecoder().decode(decompressed);
}

/**
 * Gzip-compress a string and return a URL-safe Base64 string (base64url, no padding).
 * @param {string} str - UTF-8 string to compress
 * @returns {Promise<string>}
 */
export async function compressToBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const compressed = await new Response(cs.readable).arrayBuffer();
    const uint8 = new Uint8Array(compressed);
    let binary = '';
    for (const b of uint8) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decompress a base64url-encoded gzip string back to a UTF-8 string.
 * @param {string} b64url - base64url-encoded gzip data
 * @returns {Promise<string>}
 */
export async function decompressFromBase64Url(b64url) {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const decompressed = await new Response(ds.readable).arrayBuffer();
    return new TextDecoder().decode(decompressed);
}

// ── Compact params codec (inlined from cs-compact-codes.js) ──────────────────

/**
 * ═══ COMPACT PARAMS v2 — FIELD REFERENCE ════════════════════════════════════
 *
 * The `cp` object is gzip-compressed and base64url-encoded into the `?d=` URL
 * parameter used by charactersheet.html.  String fields (bg, ar, w, it[]) are
 * further compressed with the lookup tables below before gzipping.
 *
 * Field   Type        Description
 * ──────  ──────────  ──────────────────────────────────────────────────────────
 * v       number      Schema version (always 2)
 * m       'A'|'B'    Mode: A=Advanced, B=Basic
 *                    Level 0 characters use A or B with l=0 — there is no separate Z mode.
 *
 * ── Character identity ────────────────────────────────────────────────────────
 * p       'O'|'S'|'L' Progression mode: O=OSE Standard, S=Smoothified, L=Labyrinth Lord
 * r       2-char code Race code (Advanced and 0-Level): HU DW EL HA GN
 * c       2-char code Class code (Basic and Advanced): FI CL MU TH SB DW EL HA GN
 * l       number      Level (0–14)
 * n       string      Character name
 * bg      string|code Background profession  (lookup-table compressed)
 *
 * ── Ability scores ────────────────────────────────────────────────────────────
 * s       number[6]   Adjusted ability scores [STR,DEX,CON,INT,WIS,CHA]
 * bs      number[6]   Base scores before racial adjustments (Advanced only, omitted if equal to s)
 * sm      number[6]   Score minimums used during generation [STR,DEX,CON,INT,WIS,CHA]
 *                     (Advanced and L0 only — not written for Basic L1+; CON default is 6,
 *                     all others default 3; buildGeneratorURL omits the s= param when all match defaults)
 * rr      number      Number of ability score roll attempts before a valid character was produced
 *                     (Advanced and L0 only — not written for Basic L1+)
 *
 * ── Hit points ────────────────────────────────────────────────────────────────
 * h       number      Max HP (total, respects il flag)
 * hr      number[]    HP value per entry — index 0 is ALWAYS the L0 background roll,
 *                     regardless of il.  hr[1]=L1 HP, hr[2]=L2 HP, etc.
 * hd      —           Removed in v3. Die sides are derived from class at render time.
 * il      0|1         includeLevel0HP — if 1, hr[0] is added to h; if 0, hr[0] sets the
 *                     floor for hr[1] but does not count toward h
 * hm      0|1|2|3     HP rolling mode: omit/0=normal random, 1=blessed (roll twice take
 *                     best), 2=5e style (average die value, rounded up), 3=healthy (treat
 *                     every die as its maximum value)
 *
 * ── Saving throws ─────────────────────────────────────────────────────────────
 * sv      number[5]   0-Level only: fixed save values [Death,Wands,Paralysis,Breath,Spells]
 *                     (always D14 W15 P16 B17 S18 before racial bonuses; stored so the sheet
 *                     page does not need to re-derive them, but see v3 plan for removal)
 *
 * ── Equipment ─────────────────────────────────────────────────────────────────
 * ar      string|null Armor name             (lookup-table compressed)
 * sh      0|1         Shield equipped
 * w       string[]    Weapon name(s)         (each lookup-table compressed)
 * it      string[]    Item list              (each item lookup-table compressed)
 * g       number      Gold remaining after equipment purchase
 * ac      number      Starting AC (before DEX modifier)
 *
 * ── Generation options (preserved for level-up / regeneration) ────────────────
 * rcm     2-char code Race/class mode (Advanced only): ST SH TE AL
 *                       ST=strict, SH=strict+human, TE=traditional-extended, AL=allow-all
 * bl      0|1         Basic and L0: character has human racial abilities (Blessed, Decisiveness,
 *                     Leadership displayed on sheet).  Also written for L0 characters in both
 *                     modes.  Does NOT encode HP rolling mode (see hm).
 * dl      0|1         Basic mode: demihuman level limits — 0=standard OSE, 1=extended to 14
 * wp      number      wealthPct — starting gold % of XP-for-level for level 2+ chars (0–100)
 * prm     0|9|13      primeRequisiteMode — 0=user choice, 9=require ≥9, 13=require ≥13
 *
 * ── Display preferences ───────────────────────────────────────────────────────
 * un      0|1         showUndeadNames — show monster names in Turn Undead table
 * qr      0|1         showQRCode — show QR code on page 2
 * ao      0|1         abilityOrder — 0=modern (STR DEX CON INT WIS CHA),
 *                                    1=OSE/Basic (STR INT WIS DEX CON CHA)
 * adm     1|2|3       acDisplayMode — omit=ascending AC only, 1=descending+attack matrix,
 *                                     2=dual (AAC and DAC), 3=dual+attack matrix
 * hhr     0|1         Advanced L1+ only: hide Human race label in race/class display — shows
 *                     class name only (e.g. "Fighter" instead of "Human Fighter")
 * mx      0|1         Modified flag — set to 1 when a character is modified inline on the
 *                     sheet page; prepends "Modified " to the footer identity line
 * ════════════════════════════════════════════════════════════════════════════════
 */

// ─── WEAPON CODES (for the `w` field) ────────────────────────────────────────
export const WEAPON_TO_CODE = {
    'Sword':            'SW', 'Short sword':      'SS', 'Mace':             'MA',
    'Hand axe':         'HX', 'Dagger':           'DA', 'War hammer':       'WH',
    'Club':             'CL', 'Staff':            'SF', 'Sling':            'SG',
    'Crossbow':         'XB', 'Long bow':         'LB', 'Short bow':        'SB',
    'Two-handed sword': 'TS', 'Battle axe':       'BA', 'Silver dagger':    'SD',
    'Spear':            'SP', 'Javelin':          'JV', 'Pole arm':         'PO',
    'Torch':            'TC',
};
export const CODE_TO_WEAPON = Object.fromEntries(Object.entries(WEAPON_TO_CODE).map(([k,v])=>[v,k]));

// ─── ARMOR CODES (for the `ar` field) ────────────────────────────────────────
export const ARMOR_TO_CODE = {
    'Plate mail':    'PM', 'Chain mail':    'CM', 'Chain Mail':    'C2',
    'Leather':       'LE', 'Unarmored':     'UN', 'Unarmoured':    'UU',
    'Shield':        'SH', 'Plate mail +1': 'P1', 'Chain mail +1': 'C1',
};
export const CODE_TO_ARMOR = Object.fromEntries(Object.entries(ARMOR_TO_CODE).map(([k,v])=>[v,k]));

// ─── BACKGROUND / PROFESSION CODES (for the `bg` field) ──────────────────────
export const BG_TO_CODE = {
    // HP 1
    'Acolyte':'AC', 'Actor':'AT', "Alchemist's Apprentice":'AA', 'Artist':'AR',
    'Beggar':'BG', 'Jeweller':'JW', 'Juggler':'JG', 'Money Lender':'ML',
    'Scribe':'SC', 'Trumpet Player':'TP', 'Wealthy Heir':'WL', "Wizard's Apprentice":'WZ',
    // HP 2
    'Butcher':'BU', 'Butler':'BT', 'Cook':'CK', 'Fletcher':'FL', 'Gambler':'GB',
    'Horse Thief':'HT', 'Innkeeper':'IK', 'Navigator':'NV', 'Shepherd':'SX',
    'Tailor':'TA', 'Trader':'TD', 'Weaver':'WV',
    // HP 3
    'Bowyer':'BY', 'Cooper':'CP', 'Executioner':'EX', 'Fisher':'FI', 'Groom':'GR',
    'Hermit':'HM', 'Kennel Master':'KM', 'Leatherworker':'LW', 'Limner':'LI',
    'Sailor':'SA', 'Teamster':'TM', 'Trapper':'TR',
    // HP 4
    'Armourer':'AM', 'Barber Surgeon':'BS', 'Blacksmith':'BL', 'Carpenter':'CA',
    'Farmer':'FA', 'Forester':'FO', 'Hunter':'HN', 'Mason':'MN', 'Miner':'MX',
    'Shipwright':'SI', 'Squire':'SQ', 'Weaponsmith':'WP',
};
export const CODE_TO_BG = Object.fromEntries(Object.entries(BG_TO_CODE).map(([k,v])=>[v,k]));

// ─── ITEM CODES (for each element of the `it` array) ─────────────────────────
export const ITEM_TO_CODE = {
    // Dungeoneering bundle
    'Backpack':'BP', 'Tinder box (flint & steel)':'TB', 'Torches (6)':'T6',
    "Rope (50')":'R5', 'Waterskin':'WS', 'Crowbar':'CR',
    // Class-specific gear
    'Holy symbol':'HS', "Thieves' tools":'TT',
    // Background armor strings
    'Unarmored (background)':'UA', 'Chain Mail (background)':'MC',
    // Background weapon strings
    'Mace (1d6) (background)':'M6', 'Dagger (1d4) (background)':'D4',
    'Club (1d4) (background)':'C4', 'Staff (1d4) (background)':'S4',
    'Hand axe (1d6) (background)':'H6', 'Spear (1d6) (background)':'P6',
    'Crossbow (1d6) + 10 bolts (background)':'X6', 'Shortbow (1d6) + 10 arrows (background)':'N6',
    'Longbow (1d6) + 10 arrows (background)':'G6', 'Sling (1d4) + 10 stones (background)':'L4',
    'Battle axe (1d8) (background)':'B8', 'War hammer (1d6) (background)':'W6',
    'Pitchfork (1d6) (background)':'F6', 'Pick axe (1d6) (background)':'K6',
    'Shortsword (1d6) (background)':'O6', 'Sword (1d8) (background)':'E8',
    'Scissors (1d4) (background)':'SC', 'Scissors (1d3) (background)':'S3',
    'Rock (1d3) (background)':'R3', 'Jewelled dagger (1d4) (background)':'J4',
    'Walking stick (1d4) (background)':'K4', 'Stage sword (1d4) (background)':'Q4',
    'Hammer (1d4) (background)':'V4', '3 x daggers (1d4) (background)':'XD',
    '2 x daggers (1d4) (background)':'YD', 'Awl (1d4) (background)':'A4',
    'Belaying pin (1d4) (background)':'Z4', 'Whip (1d2, hits entangle) (background)':'WT',
    'Razor (1d4) (background)':'RZ',
    // Purchased weapon names
    'Sword':'SW', 'Short sword':'SS', 'Mace':'MA', 'Hand axe':'HX', 'Dagger':'DA',
    'War hammer':'WH', 'Club':'CL', 'Staff':'SF', 'Sling':'SG', 'Crossbow':'XB',
    'Long bow':'LB', 'Short bow':'SB', 'Two-handed sword':'TS', 'Battle axe':'BA',
    // Background items
    'Incense':'IC', '2 x Masks':'MK', '2 x Costumes':'CO', 'Potion of Healing':'PH',
    'Parchment':'PC', 'Paint':'PA', 'Brush':'BR', 'Wooden bowl':'WB',
    'Ostentatious Jewellery (25gp)':'OJ', 'Juggling balls':'JB', '50gp':'5G',
    '3 x Parchment':'P3', 'Ink pot':'IP', 'Quill':'QL', 'Trumpet':'TU',
    'Signet ring':'SR', 'Perfume':'PF', 'Spell book (1 random cantrip)':'ZP',
    "Dried meat (5 days' iron rations)":'DM', 'Livery':'LV', 'Silver serving tray':'SV',
    'Salt':'SL', 'Skillet':'SK', 'Onion':'ON', 'Bag of feathers':'BF', 'Dice':'DC',
    'A horse':'AH', '3 x Bottles of wine':'3B', 'Compass':'CS', 'Chalk':'CK',
    "Pole (10' long, wooden)":'PL', 'Needle':'ND', 'Thread':'TH', 'Bag of buttons':'BB',
    'Rare, fragrant spices':'RS', 'Hand Loom':'HL', 'Yarn':'YN', 'Saw':'ZW',
    'Barrel':'BZ', "50' Rope":'FR', 'Net':'NT', 'A dog':'AG', 'A bearskin':'AK',
    'Lantern':'LN', '2 x Oil flasks':'OF', 'Bottle of rum':'RU', 'Bear trap (1d6)':'BT',
    'Chain mail':'CI', 'Bottle of strong spirits':'ZS', 'Tongs':'TG', 'Apron':'AP',
    'A pig':'AI', 'Tent':'TE', 'Whistle':'WI', 'A bag of rocks':'RK',
    'Pot of tar':'ZT', 'Flag':'FG',
};
export const CODE_TO_ITEM = Object.fromEntries(Object.entries(ITEM_TO_CODE).map(([k,v])=>[v,k]));

/** Encode a single string field using the given code table. */
export function encodeStr(codeTable, str) {
    if (str == null) return str;
    return codeTable[str] ?? str;
}

/** Decode a single string field; 2-char codes expand, others pass through. */
export function decodeStr(revTable, str) {
    if (str == null) return str;
    if (str.length === 2 && revTable[str] !== undefined) return revTable[str];
    return str;
}

/** Encode an array of item strings. */
export function encodeItems(items) {
    if (!Array.isArray(items)) return items;
    return items.map(item => encodeStr(ITEM_TO_CODE, item));
}

/** Decode an array of item strings. */
export function decodeItems(items) {
    if (!Array.isArray(items)) return items;
    return items.map(item => decodeStr(CODE_TO_ITEM, item));
}

/** Encode all compressible string fields in a compact params v2 object. */
export function encodeCompactParams(cp) {
    const out = { ...cp };
    if (out.bg != null) out.bg = encodeStr(BG_TO_CODE,     out.bg);
    if (out.ar != null) out.ar = encodeStr(ARMOR_TO_CODE,  out.ar);
    if (Array.isArray(out.w)) out.w = out.w.map(w => encodeStr(WEAPON_TO_CODE, w));
    if (Array.isArray(out.it)) out.it = encodeItems(out.it);
    return out;
}

/** Decode all compressible fields in a compact params v2 object. */
export function decodeCompactParams(cp) {
    const out = { ...cp };
    if (out.bg != null) out.bg = decodeStr(CODE_TO_BG,     out.bg);
    if (out.ar != null) out.ar = decodeStr(CODE_TO_ARMOR,  out.ar);
    if (Array.isArray(out.w)) out.w = out.w.map(w => decodeStr(CODE_TO_WEAPON, w));
    if (Array.isArray(out.it)) out.it = decodeItems(out.it);
    return out;
}

/**
 * Build a compact options summary line from a raw compact params v2 object.
 * Returns an HTML string, or '' if no notable options.
 */
export function buildOptionsLine(cp) {
    const parts = [];
    const lvl = cp.l ?? 0;
    const progLabel = { O: 'OSE Standard', S: 'Smoothified', L: 'Labyrinth Lord' };
    parts.push(progLabel[cp.p] || 'OSE Standard');
    if (cp.m === 'A') {
        const rcmLabel = { ST:'Strict OSE', SH:'Human Racial Abilities', TE:'Extended Levels + Human Abilities', AL:'Allow All Classes' };
        parts.push(rcmLabel[cp.rcm] || 'Strict OSE');
    } else if (cp.m === 'B') {
        parts.push(cp.bl ? 'Human Racial Abilities' : 'Strict OSE');
        parts.push(cp.dl ? 'Extended Levels' : 'Standard Level Limits');
    }
    if (cp.hm === 2)      parts.push('5e HP (max L1 / avg L2+)');
    else if (cp.hm === 1) parts.push('Blessed HP');
    if (cp.hm === 3)      parts.push('Re-roll 1s and 2s');
    if (lvl >= 1) parts.push(cp.il ? 'L0 HP: Yes' : 'L0 HP: No');
    if (cp.prm != null) parts.push(cp.prm ? `Prime Req \u2265${cp.prm}` : 'User Min Scores');
    if (lvl >= 2 && cp.wp != null) parts.push(`Wealth: ${cp.wp}%`);
    if (Array.isArray(cp.sm)) {
        const ORDER = ['STR','DEX','CON','INT','WIS','CHA'];
        const minParts = ORDER.map((a, i) => (cp.sm[i] || 3) > 3 ? `${a}\u2265${cp.sm[i]}` : null).filter(Boolean);
        if (minParts.length > 0) parts.push(`Min: ${minParts.join(' ')}`);
    }
    if (cp.fs) {
        parts.push('Fixed Scores');
    } else if (cp.rr != null) {
        parts.push(`${cp.rr} roll${cp.rr === 1 ? '' : 's'}`);
    }
    return parts.join(' &nbsp;·&nbsp; ');
}

// ── HTML renderer ─────────────────────────────────────────────────────────────

// CSS helpers (shared across all renders)
const CSS = {
    sectionHeader: `background-color: #000; color: #fff; padding: 4px 8px; font-weight: bold; font-size: 0.9em; letter-spacing: 0.05em;`,
    box: `border: 1px solid #000; padding: 8px; font-size: 0.9em;`,
    statBox: `border: 1px solid #000; padding: 6px; text-align: center; font-size: 0.85em;`
};

/**
 * Format a modifier number as a string with sign
 */
function fmt(n) {
    return n >= 0 ? `+${n}` : `${n}`;
}

/**
 * Render the character sheet as an HTML string
 * @param {Object} sheet - Normalized sheet object
 * @returns {string} HTML string
 */
export function renderCharacterSheetHTML(sheet) {
    const { sectionHeader, box, statBox } = CSS;

    // ── Header columns ──────────────────────────────────────────────────────
    const colTemplate = sheet.header.columns.map(c => `${c.flex || 1}fr`).join(' ');
    const headerCols = sheet.header.columns.map((col, i) => {
        const borderLeft = i > 0 ? 'border-left: none;' : '';
        const align = col.center ? 'text-align: center;' : '';
        return `
        <div style='border: 1px solid #000; ${borderLeft} padding: 4px 8px; ${align}'>
            <div style='font-weight: bold; font-size: 0.75em; color: #666; text-transform: uppercase;'>${col.label}</div>
            <div>${col.value}</div>
        </div>`;
    }).join('');

    // ── Ability score ordering ────────────────────────────────────────────────
    // abilityOrder: 1 (default) = OSE/Basic order (STR, INT, WIS, DEX, CON, CHA)
    //               0           = Modern/Advanced order (STR, DEX, CON, INT, WIS, CHA)
    const _OSE_ABILITY_ORDER = ['STR', 'INT', 'WIS', 'DEX', 'CON', 'CHA'];
    const _MOD_ABILITY_ORDER = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    const _abilityOrderArr = (sheet.abilityOrder !== 0) ? _OSE_ABILITY_ORDER : _MOD_ABILITY_ORDER;
    const _sortedAbilityScores = [...sheet.abilityScores].sort(
        (a, b) => _abilityOrderArr.indexOf(a.name) - _abilityOrderArr.indexOf(b.name)
    );

    // ── Ability scores rows ──────────────────────────────────────────────────
    const abilityRows = _sortedAbilityScores.map(a => {
        const scoreDisplay = (a.originalScore !== null && a.originalScore !== undefined && a.originalScore !== a.score)
            ? `<span style='text-decoration:line-through; color:#999; font-size:0.85em; margin-right:4px;'>${a.originalScore}</span>${a.score}`
            : `${a.score}`;
        return `
                    <tr>
                        <td style='border: 1px solid #000; padding: 3px 6px; text-align: center; font-weight: bold;'>${a.name}</td>
                        <td style='border: 1px solid #000; padding: 3px 6px; text-align: center;'>${scoreDisplay}</td>
                        <td style='border: 1px solid #000; padding: 3px 6px;'>${a.effects}</td>
                    </tr>`;
    }).join('');

    // ── Weapons & skills ─────────────────────────────────────────────────────
    const ws = sheet.weaponsAndSkills;

    // ── AC display mode ───────────────────────────────────────────────────────
    const acDisplayMode = sheet.acDisplayMode || 'aac';
    const isDACMode  = acDisplayMode === 'dac-matrix';
    const isDualMode = acDisplayMode === 'dual' || acDisplayMode === 'dual-matrix';
    const showMatrix = acDisplayMode === 'dac-matrix' || acDisplayMode === 'dual-matrix';
    const thac0      = 19 - (ws.classAttackBonus ?? 0);

    const thiefSkillsHTML = ws.thiefSkills ? `
        <div style='margin-top: 8px; border-top: 1px solid #ccc; padding-top: 4px;'>
            ${Object.entries(ws.thiefSkills).map(([skill, value]) => {
                const displayName = skill.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                return `<span style='font-size:0.85em;'><strong>${displayName}:</strong> ${value}</span>`;
            }).join(' &nbsp; ')}
        </div>` : '';

    // ── Item categorisation (run before equipment section) ────────────────────
    // Identify background weapons: items containing a damage-die notation like "(1d6)"
    const _bgWeaponPattern = /\(\d+d\d+/;
    const _eq = sheet.equipment;  // early reference for categorisation
    const bgWeapons = (_eq.items || []).filter(i => _bgWeaponPattern.test(i));
    // All weapons to display in the Weapons/Armor/Skills box
    const allWeapons = [...(ws.weapons || [])];
    bgWeapons.forEach(w => { if (!allWeapons.includes(w)) allWeapons.push(w); });
    // Shield — stored as a boolean on equipment, not as an item string
    const hasShield = !!_eq.shield;
    // Armor for the box (skip "Unarmored" entries)
    const armorForBox = (_eq.armor && !/unarmored/i.test(_eq.armor)) ? _eq.armor : null;
    // Helmet — shown in Weapons box, not in ITEMS column
    const hasHelmet = (_eq.items || []).includes('Helmet');
    // Set of weapon items that belong in Weapons/Armor/Skills (not in ITEMS column)
    const _weaponSet = new Set(allWeapons);
    // Filtered items for ITEMS column: exclude weapons, armor (and its background variant), "Unarmored", and Helmet
    const _armorLower = _eq.armor ? _eq.armor.toLowerCase() : null;
    const filteredItems = (_eq.items || []).filter(item => {
        if (_weaponSet.has(item)) return false;                // weapons
        if (/unarmored/i.test(item)) return false;             // "Unarmored (background)"
        if (_armorLower && item.toLowerCase().includes(_armorLower)) return false; // armor + "(background)" variant
        if (item === 'Helmet') return false;                   // shown in Weapons/Armor box
        return true;
    });

    // ── Weapon lines (always 3 slots, no underlines for empty) ──────────────
    const _weaponSlots = [...allWeapons];
    while (_weaponSlots.length < 3) _weaponSlots.push(null);
    const weaponLinesHTML = _weaponSlots.map((w, i) => {
        const margin = i > 0 ? " style='margin-top: 2px;'" : '';
        if (w === null) return `<div${margin}><strong>Weapon:</strong></div>`;
        const hasDmgInName = /\(\d+d\d+/.test(w);
        if (hasDmgInName) return `<div${margin}><strong>Weapon:</strong> ${w}</div>`;
        const baseName = w.replace(/\s*\(background\)\s*$/i, '').trim();
        const dmg = WEAPONS[baseName]?.damage;
        const display = dmg ? `${w} (${dmg})` : w;
        return `<div${margin}><strong>Weapon:</strong> ${display}</div>`;
    }).join('');

    // ── Abilities section ────────────────────────────────────────────────────
    const sec = sheet.abilitiesSection;
    const FOOTNOTE_PREFIX = '\x00footnote:';
    const racialItems = (sec.racial || []).filter(a => !a.startsWith(FOOTNOTE_PREFIX));
    const racialFootnote = (sec.racial || []).find(a => a.startsWith(FOOTNOTE_PREFIX));
    const hasRacial = racialItems.length > 0;
    const hasClass = sec.class && sec.class.length > 0;
    const racialHTML = hasRacial
        ? `<ul style='margin: 0; padding-left: 18px;'>${racialItems.map(a => `<li style='margin-bottom: 2px;'>${a}</li>`).join('')}</ul>`
          + (racialFootnote ? `<div style='margin-top:4px;font-size:0.8em;font-style:italic;color:#555;'>${racialFootnote.slice(FOOTNOTE_PREFIX.length)}</div>` : '')
        : '';
    const classHTML = hasClass
        ? `${hasRacial ? `<div style='margin-top: 6px; border-top: 1px solid #ccc; padding-top: 4px;'>` : ''}
           <ul style='margin: 0; padding-left: 18px;'>
               ${sec.class.map(a => `<li style='margin-bottom: 2px;'><strong>${a.name}:</strong> ${a.description}</li>`).join('')}
           </ul>
           ${hasRacial ? '</div>' : ''}`
        : '';
    const abilitiesHTML = (racialHTML || classHTML)
        ? (racialHTML + classHTML)
        : `<span style='color: #666;'>None at this level</span>`;

    // ── Saving throws ─────────────────────────────────────────────────────────
    const sv = sheet.savingThrows;


    // ── Equipment ─────────────────────────────────────────────────────────────
    const eq = sheet.equipment;
    // Items list for page 2 ITEMS column — weapons/armor/shield already in Weapons box
    const filteredItemsHTML = filteredItems.map(item => `<li>${item}</li>`).join('');
    const equipmentListHTML = filteredItems.length > 0
        ? `<div style='font-size: 0.85em;'>
            <div><strong>Items:</strong>
                <ul style='margin: 2px 0; padding-left: 18px;'>${filteredItemsHTML}</ul>
            </div>
           </div>`
        : `<span style='color:#666; font-size:0.85em;'>No additional items</span>`;
    // Starting AC + gold for the footer
    const startingAC = eq.startingAC;
    const startingACDisplay = (startingAC !== null && startingAC !== undefined)
        ? isDACMode  ? `${19 - startingAC}`
        : isDualMode ? `${19 - startingAC} [${startingAC}]`
        : `${startingAC}`
        : null;
    const startingGold = eq.startingGold !== null && eq.startingGold !== undefined
        ? eq.startingGold
        : null;

    // ── Spell slots ───────────────────────────────────────────────────────────
    const spellSlotsHTML = (sheet.spellSlots && Object.values(sheet.spellSlots).some(v => v > 0)) ? `
                <!-- SPELL SLOTS -->
                <div style='${sectionHeader}'>SPELL SLOTS</div>
                <div style='${box} margin-bottom: 8px;'>
                    <div style='display: flex; gap: 8px; flex-wrap: wrap;'>
                        ${Object.entries(sheet.spellSlots).filter(([_, slots]) => slots > 0).map(([level, slots]) => `
                        <div style='border: 1px solid #000; padding: 4px 8px; text-align: center;'>
                            <div style='font-weight: bold; font-size: 0.75em;'>Lvl ${level}</div>
                            <div>${slots}</div>
                        </div>`).join('')}
                    </div>
                </div>` : '';

    // ── Turn undead ───────────────────────────────────────────────────────────
    const monsterNames = {'1HD':'Skeleton','2HD':'Zombie','2*HD':'Ghoul','3HD':'Wight','4HD':'Wraith','5HD':'Mummy','6HD':'Spectre','7-9HD':'Vampire'};
    const turnUndeadHTML = sheet.turnUndead ? `
                <!-- TURN UNDEAD -->
                <div style='${sectionHeader}'>TURN UNDEAD</div>
                <div style='${box} margin-bottom: 8px; font-size: 0.85em;'>
                    <div style='display: flex; flex-wrap: wrap; gap: 6px;'>
                        ${Object.entries(sheet.turnUndead).map(([type, target]) => {
                            const displayType = sheet.showUndeadNames ? monsterNames[type] || type : type;
                            const displayTarget = target !== null && target !== undefined ? target : '-';
                            return `<div><strong>${displayType}:</strong> ${displayTarget}</div>`;
                        }).join('')}
                    </div>
                </div>` : '';

    // ── Treasure coin rows ────────────────────────────────────────────────────
    const coinRows = ['PP', 'GP', 'EP', 'SP', 'CP'].map(coin => `
                    <tr>
                        <td style='background-color: #000; color: #fff; padding: 3px 8px; font-weight: bold; width: 40px;'>${coin}</td>
                        <td style='border: 1px solid #000; border-left: none; padding: 3px;'>&nbsp;</td>
                    </tr>`).join('');

    // ── Attack matrix box (for dac-matrix and dual-matrix modes) ──────────────
    const attackMatrixBoxHTML = (() => {
        if (!showMatrix) return '';
        const DAC_RANGE = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const rolls = DAC_RANGE.map(ac => Math.max(2, Math.min(20, thac0 - ac)));
        const hdrCells = DAC_RANGE.map((ac, i) => {
            const bl = i > 0 ? 'border-left:none;' : '';
            return `<div style='border:1px solid #000;${bl}border-bottom:none;padding:2px 3px;text-align:center;font-weight:bold;font-size:0.75em;background:#eee;'>${ac}</div>`;
        }).join('');
        const rollCells = DAC_RANGE.map((ac, i) => {
            const bl = i > 0 ? 'border-left:none;' : '';
            return `<div style='border:1px solid #000;${bl}border-top:none;padding:4px 3px;text-align:center;font-size:0.85em;font-weight:bold;'>${rolls[i]}</div>`;
        }).join('');
        return `<div style='margin-bottom:6px;'>
            <div style='${sectionHeader}'>ATTACK MATRIX <span style='font-weight:normal;font-size:0.9em;opacity:0.8;'>(d20 roll needed to hit Descending AC)</span></div>
            <div style='display:flex;'>
                <div style='min-width:60px;flex-shrink:0;'>
                    <div style='border:1px solid #000;border-bottom:none;padding:2px 4px;font-weight:bold;font-size:0.75em;background:#eee;text-align:center;'>THAC0: ${thac0}</div>
                    <div style='border:1px solid #000;border-top:none;padding:4px;text-align:center;font-size:0.75em;font-weight:bold;color:#555;'>D20 Roll</div>
                </div>
                <div style='flex:1;overflow:hidden;'>
                    <div style='display:grid;grid-template-columns:repeat(13,1fr);'>${hdrCells}</div>
                    <div style='display:grid;grid-template-columns:repeat(13,1fr);'>${rollCells}</div>
                </div>
            </div>
        </div>`;
    })();

    // ── Page-2 mini-header (character name + class reminder) ──────────────────
    const nameVal  = sheet.header.columns[0]?.value || '';
    // Find class by label — robust against the Background column being inserted at index 1
    const _classCol = sheet.header.columns.find(c => c.label === 'Class' || c.label === 'Race & Class' || c.label === 'Race/Class');
    const classVal  = _classCol?.value || sheet.header.columns[1]?.value || '';
    const page2MiniHeader = `
        <div style='font-size: 0.8em; color: #444; margin-bottom: 10px;
                    border-bottom: 1px solid #bbb; padding-bottom: 4px;
                    display: flex; gap: 12px; align-items: baseline;'>
            <strong style='font-size: 1.05em;'>${nameVal}</strong>
            <span style='color: #666;'>${classVal}</span>
            <span style='margin-left: auto; color: #999; font-style: italic;'>continued →</span>
        </div>`;

    // ── Full HTML ─────────────────────────────────────────────────────────────
    return `
        <style>
            /* Page 1 wrapper: flex column so spacer can push footer to the bottom */
            .ose-page1 { display: flex; flex-direction: column; min-height: 900px; }
            .ose-page1-spacer { flex: 1; min-height: 16px; }
            /* Page 2: flex column so item/notes/row3 fill the full page */
            .ose-page2 { display: flex; flex-direction: column; min-height: 920px; }
            .ose-p2-row1 { flex: 2; margin-bottom: 8px; }
            .ose-p2-row2 { flex: 3; margin-bottom: 8px; display: flex; flex-direction: column; }
            .ose-p2-row2-notes { flex: 1; }
            .ose-p2-row3 { flex: 2; }
            @media print {
                /* Match letter paper content area (11in − 0.5in top − 0.5in bottom = 10in) */
                .ose-page1 { height: 10in; }
                .ose-page2 { height: 10in; break-before: page !important; page-break-before: always !important; }
                .ose-page-break-indicator { display: none !important; }
            }
        </style>
        <div style='font-family: Arial, sans-serif; max-width: 760px;'>
        <div class='ose-page1'>

        <!-- Header -->
        <div style='margin-bottom: 8px;'>
            <div style='font-size: 1.3em; font-weight: bold;'>${sheet.title}</div>
            <div style='font-size: 0.85em; color: #444;'>${sheet.subtitle}</div>
            <hr style='margin: 6px 0; border-color: #000;'>
            <div style='display: grid; grid-template-columns: ${colTemplate}; gap: 0; font-size: 0.85em;'>
                ${headerCols}
            </div>
        </div>

        <!-- ═══ PAGE 1: two-column layout of main stats ═══ -->
        <!-- COMBAT is first so it lands in the left column naturally -->
        <div style='columns: 2; column-gap: 8px; column-fill: balance;'>

            <!-- COMBAT -->
            <div style='break-inside: avoid; margin-bottom: 8px;'>
                <div style='${sectionHeader}'>COMBAT</div>
                <div style='display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;'>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>MAX HP</div>${sheet.combat.maxHP}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>CUR HP</div>&nbsp;</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>INIT</div>${fmt(sheet.combat.initMod)}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>AC</div>&nbsp;</div>
                </div>
            </div>

            <!-- ABILITY SCORES -->
            <div style='break-inside: avoid; margin-bottom: 8px;'>
                <div style='${sectionHeader}'>ABILITY SCORES</div>
                <table style='width: 100%; border-collapse: collapse; font-size: 0.85em;'>
                    <tr style='background-color: #eee;'>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: center; width: 20%;'>Ability</th>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: center; width: 15%;'>Score</th>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: left;'>Effects</th>
                    </tr>
                    ${abilityRows}
                </table>
            </div>

            <!-- SAVING THROWS -->
            <div style='break-inside: avoid; margin-bottom: 8px;'>
                <div style='${sectionHeader}'>SAVING THROWS</div>
                <div style='display: grid; grid-template-columns: repeat(5, 1fr); gap: 0;'>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Death</div>${sv.death}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Wands</div>${sv.wands}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Petrify</div>${sv.paralysis}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Breath</div>${sv.breath}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Spells</div>${sv.spells}</div>
                </div>
            </div>

            <!-- WEAPONS, ARMOR, AND SKILLS -->
            <div style='break-inside: avoid; margin-bottom: 8px;'>
                <div style='${sectionHeader}'>WEAPONS, ARMOR, AND SKILLS</div>
                <div style='${box}'>
                    ${weaponLinesHTML}
                    <div style='margin-top: 2px;'><strong>Armor:</strong>${armorForBox ? ` ${armorForBox}` : ''}</div>
                    ${hasShield ? `<div style='margin-top: 2px;'><strong>Shield:</strong> Yes (+1 AC)</div>` : ''}
                    <div style='margin-top: 2px;'><strong>Helmet:</strong>${hasHelmet ? ' Yes' : ''}</div>
                    ${isDACMode
                        ? `<div style='margin-top: 2px;'><strong>THAC0:</strong> ${thac0} <span style='color:#666;font-size:0.9em;'>(${thac0} [${fmt(ws.classAttackBonus)}])</span></div>`
                        : isDualMode
                            ? `<div style='margin-top: 2px;'><strong>Class Attack Bonus:</strong> ${fmt(ws.classAttackBonus)} &nbsp;/&nbsp; <strong>THAC0:</strong> ${thac0} <span style='color:#666;font-size:0.9em;'>(${thac0} [${fmt(ws.classAttackBonus)}])</span></div>`
                            : `<div style='margin-top: 2px;'><strong>Class Attack Bonus:</strong> ${fmt(ws.classAttackBonus)} <span style='color:#666;font-size:0.9em;'>(${thac0} [${fmt(ws.classAttackBonus)}])</span></div>`}
                    <div style='margin-top: 2px;'><strong>Melee Modifier (STR):</strong> ${fmt(ws.meleeMod)}</div>
                    <div style='margin-top: 2px;'><strong>Ranged Modifier (DEX):</strong> ${fmt(ws.rangedMod)}</div>
                    ${thiefSkillsHTML}
                </div>
            </div>

            <!-- ABILITIES -->
            <div style='break-inside: avoid; margin-bottom: 8px;'>
                <div style='${sectionHeader}'>${sec.header}</div>
                <div style='${box}'>${abilitiesHTML}</div>
            </div>

            ${spellSlotsHTML ? `<div style='break-inside: avoid; margin-bottom: 8px;'>${spellSlotsHTML}</div>` : ''}
            ${turnUndeadHTML ? `<div style='break-inside: avoid; margin-bottom: 8px;'>${turnUndeadHTML}</div>` : ''}

        </div><!-- end page-1 columns -->

        <!-- Spacer: pushes footer to bottom of page 1 -->
        <div class='ose-page1-spacer'></div>

        ${attackMatrixBoxHTML}

        <!-- Footer lives on page 1 -->
        <hr style='margin-top: 0; border-color: #ccc;'>
        <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;'>
            <!-- Left column: footer text + legend -->
            <div style='font-size: 0.8em; color: #666;'>
                <p style='margin: 0 0 4px;'>${sheet.footer}</p>
                <div style='font-size:0.72em;color:#aaa;font-style:italic;'><span style='text-decoration:line-through;color:#ccc;'>00</span> = ability score before racial adjustment</div>
            </div>
            <!-- Right column: starting stats + HP rolls -->
            <div style='font-size:0.7em;color:#444;text-align:right;'>
                ${(startingACDisplay !== null && startingACDisplay !== undefined) || eq.startingHD || startingGold !== null ? `
                <div style='margini-bottom:3px;display:flex;column-gap:12px;row-gap:0;justify-content:flex-end;flex-wrap:wrap;'>
                    ${startingACDisplay !== null && startingACDisplay !== undefined ? `<span><strong>Starting AC:</strong> ${startingACDisplay}</span>` : ''}
                    ${eq.startingHD ? `<span><strong>Starting HD:</strong> ${eq.startingHD}</span>` : ''}
                    ${startingGold !== null ? `<span><strong>Starting Gold:</strong> ${startingGold} gp</span>` : ''}
                </div>` : ''}
                ${(() => {
                    const _cpConMod = (() => { const s = sheet.cp?.s?.[2]; if (s == null) return 0; return s>=15?1:s>=13?1:s<=6?-1:s<=8?-1:0; })();
                    const _hpRolls = (sheet.editState?.hpRolls?.length > 0 ? sheet.editState.hpRolls : null) || sheet.cp?.hr || [];
                    const _conMod  = sheet.editState?.conModifier ?? _cpConMod;
                    if (_hpRolls.length === 0) return '';
                    const conStr = `CON ${_conMod >= 0 ? '+' : ''}${_conMod}`;
                    const items = _hpRolls.map((hp, i) => {
                        const label = i === 0 ? 'L0' : `L${i}`;
                        return `<span style='white-space:nowrap;'><strong>${label}:</strong>&nbsp;${hp}</span>`;
                    }).join('');
                    return `<div style='font-weight:bold;font-size:0.75em;color:#666;text-transform:uppercase;margin-bottom:1px;'>HP Rolls <span style='font-weight:normal;font-style:italic;'>${conStr}</span></div>
                    <div style='display:flex;flex-wrap:wrap;justify-content:flex-end;gap:2px 10px;'>${items}</div>`;
                })()}
            </div>
        </div>
        </div><!-- end ose-page1 -->

        <!-- ── On-screen page-break indicator (hidden when printing) ── -->
        <div class='ose-page-break-indicator'
             style='margin: 20px 0 0; border-top: 2px dashed #bbb;
                    text-align: center; padding-top: 6px;'>
            <span style='font-size: 0.75em; color: #aaa; font-style: italic;
                         background: white; padding: 0 10px;'>— Page 2 —</span>
        </div>

        <!-- ═══ PAGE 2 ═══ -->
        <div class='ose-page2'>

            ${page2MiniHeader}

            <!-- ── Row 1: 3-column item tracking ── -->
            <div class='ose-p2-row1' style='display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; align-items: stretch;'>

                <!-- MAGIC ITEMS -->
                <div style='display: flex; flex-direction: column;'>
                    <div style='${sectionHeader}'>MAGIC ITEMS</div>
                    <div style='border: 1px solid #000; padding: 6px; flex: 1; min-height: 180px; font-size: 0.85em; line-height: 2.1em;'>
                        &nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
                    </div>
                </div>

                <!-- ITEMS — pre-filled with starting equipment -->
                <div style='display: flex; flex-direction: column;'>
                    <div style='${sectionHeader}'>ITEMS</div>
                    <div style='border: 1px solid #000; padding: 6px; flex: 1; min-height: 180px;'>
                        ${equipmentListHTML}
                    </div>
                </div>

                <!-- ITEMS (cont.) -->
                <div style='display: flex; flex-direction: column;'>
                    <div style='${sectionHeader}'>ITEMS (cont.)</div>
                    <div style='border: 1px solid #000; padding: 6px; flex: 1; min-height: 180px; font-size: 0.85em; line-height: 2.1em;'>
                        &nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
                    </div>
                </div>

            </div>

            <!-- ── Row 2: full-width OTHER NOTES ── -->
            <div class='ose-p2-row2'>
                <div style='${sectionHeader}'>OTHER NOTES</div>
                <div class='ose-p2-row2-notes' style='border: 1px solid #000; padding: 8px; font-size: 0.85em; line-height: 2.1em;'>
                    &nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
                </div>
            </div>

            <!-- ── Row 3: 3-column money / experience / QR ── -->
            <div class='ose-p2-row3' style='display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; align-items: stretch;'>

                <!-- MONEY AND TREASURE -->
                <div style='display: flex; flex-direction: column;'>
                    <div style='${sectionHeader}'>MONEY AND TREASURE</div>
                    <div style='border: 1px solid #000; padding: 6px; margin-bottom: 4px; font-size: 0.85em; line-height: 2.1em;'>
                        &nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
                    </div>
                    <table style='width: 100%; border-collapse: collapse; font-size: 0.85em;'>
                        ${coinRows}
                    </table>
                </div>

                <!-- EXPERIENCE -->
                <div style='display: flex; flex-direction: column;'>
                    <div style='${sectionHeader}'>EXPERIENCE</div>
                    ${sheet.experience ? `
                    <div style='border: 1px solid #000; padding: 6px; font-size: 0.85em; flex: 1;'>
                        <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 4px;'>
                            <div><strong>Lvl ${sheet.experience.forLevel} XP:</strong> ${sheet.experience.forLevelXP}</div>
                            <div><strong>Next Lvl:</strong> ${sheet.experience.forNext || 'Max!'}</div>
                            <div><strong>XP Bonus:</strong> ${sheet.experience.bonus}</div>
                        </div>
                    </div>` : `
                    <div style='border: 1px solid #000; padding: 6px; font-size: 0.85em; line-height: 2.1em; flex: 1;'>
                        &nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
                    </div>`}
                </div>

                <!-- QR CODE -->
                <div style='display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 4px;'>
                    ${sheet.showQRCode !== false ? `
                    <a id='ose-qr-link' href='#' target='_blank'
                       style='display: block; width: 200px; height: 200px;'
                       title='Click or scan to open this character sheet'>
                        <img id='ose-qr-img' style='width: 200px; height: 200px; display: block;' alt='QR code'>
                    </a>
                    <div style='font-size: 0.7em; color: #888; text-align: center; margin-top: 4px;'>Scan to reopen sheet</div>` : ''}
                </div>

            </div>

        </div><!-- end ose-page2 -->
        </div>
    `;
}

/**
 * Render the inline edit panel HTML
 * @param {Object} editState - Current character state values for pre-filling the form
 */
function renderEditPanel(editState) {
    const levelBtns = Array.from({ length: 14 }, (_, i) => i + 1).map(lvl => {
        const isSel = lvl === editState.level;
        const selStyle = isSel ? 'background:#2196F3;color:white;' : 'background:white;color:#2196F3;';
        return `<button class='ose-edit-level-btn${isSel ? ' ose-edit-selected' : ''}' data-level='${lvl}' ` +
            `style='padding:4px 8px;font-size:11px;font-weight:bold;border:2px solid #2196F3;border-radius:3px;cursor:pointer;transition:all 0.15s;${selStyle}'>${lvl}</button>`;
    }).join('');

    const progModes = [
        { value: 'ose', label: 'OSE Standard' },
        { value: 'smoothprog', label: 'Smoothified' },
        { value: 'll', label: 'Labyrinth Lord' }
    ].map(m => `<label style='display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;'>` +
        `<input type='radio' name='editProgression' value='${m.value}'${editState.progressionMode === m.value ? ' checked' : ''}> ${m.label}</label>`).join('');

    const abilities = ['STR', 'INT', 'WIS', 'DEX', 'CON', 'CHA'].map(a => {
        const base  = editState[a] || 3;
        const adj   = editState[`adj${a}`] !== undefined ? editState[`adj${a}`] : 0;
        const final = base + adj;
        return `
        <div style='display:flex;align-items:center;gap:4px;'>
            <label style='font-weight:bold;min-width:35px;font-size:11px;'>${a}</label>
            <input type='number' id='oseEdit${a}' value='${base}' min='3' max='18'
                style='width:42px;padding:3px;text-align:center;border:1px solid #ccc;border-radius:3px;font-size:12px;font-weight:bold;'>
            <span style='font-size:10px;color:#888;'>±adj</span>
            <input type='number' id='oseEditAdj${a}' value='${adj}' min='-10' max='10' step='1'
                style='width:36px;padding:3px;text-align:center;border:1px solid #b0b0b0;border-radius:3px;font-size:12px;color:#444;background:#fafafa;'>
            <span style='font-size:11px;color:#555;font-weight:bold;'>=</span>
            <span id='oseEditFinal${a}' style='font-size:13px;font-weight:bold;color:#111;min-width:20px;'>${final}</span>
        </div>`;
    }).join('');

    const extraHTML = (editState.extraSections || []).map(section => {
        const opts = section.options.map(opt => `
            <label style='display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;'>
                <input type='radio' name='${section.name}' value='${opt.value}'${opt.checked ? ' checked' : ''}> ${opt.label}
            </label>`).join('');
        return `<div style='margin-bottom:10px;'>
            <strong style='font-size:11px;'>${section.label}:</strong>
            <div style='display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;'>${opts}</div>
        </div>`;
    }).join('');

    const safeName = (editState.name || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    return `<div id='oseEditPanel' style='display:none;margin-bottom:12px;padding:14px;background:#e3f2fd;border:2px solid #2196F3;border-radius:5px;font-size:11px;'>
        <div style='font-weight:bold;font-size:1.1em;color:#1565C0;margin-bottom:12px;'>✏️ Edit Character</div>
        <div style='margin-bottom:10px;'>
            <strong>1. Level:</strong>
            <div style='display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;'>${levelBtns}</div>
        </div>
        <div style='margin-bottom:10px;'>
            <strong>2. Progression Mode:</strong>
            <div style='display:flex;gap:12px;flex-wrap:wrap;margin-top:4px;'>${progModes}</div>
        </div>
        <div style='margin-bottom:10px;'>
            <strong>4. Name:</strong>
            <input type='text' id='oseEditName' value='${safeName}'
                style='margin-left:8px;padding:5px;border:1px solid #ccc;border-radius:3px;width:200px;font-size:11px;'>
        </div>
        <div style='margin-bottom:10px;'>
            <strong>5. Ability Scores:</strong>
            <div style='display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px;max-width:320px;'>${abilities}</div>
        </div>
        ${extraHTML}
        <div style='margin-bottom:10px;'>
            <strong>3. Options:</strong>
            <div style='display:flex;flex-wrap:wrap;gap:12px;margin-top:4px;'>
                <label style='display:flex;align-items:center;gap:4px;cursor:pointer;'>
                    <input type='checkbox' id='oseEditIncludeLevel0HP'${editState.includeLevel0HP ? ' checked' : ''}> Include Level 0 HP
                </label>
                <label style='display:flex;align-items:center;gap:4px;cursor:pointer;'>
                    <input type='checkbox' id='oseEditShowUndeadNames'${editState.showUndeadNames ? ' checked' : ''}> Show Undead Monster Names
                </label>
                <label style='display:flex;align-items:center;gap:4px;cursor:pointer;'>
                    <input type='checkbox' id='oseEditShowQRCode'${editState.showQRCode !== false ? ' checked' : ''}> Show QR Code in Footer
                </label>
            </div>
        </div>
        ${(editState.hpRolls && editState.hpRolls.length > 0) ? `
        <div style='margin-bottom:10px;'>
            <strong>HP per Level:</strong>
            <span style='font-size:10px;color:#555;margin-left:8px;'>CON mod: ${editState.conModifier >= 0 ? '+' : ''}${editState.conModifier || 0} &nbsp;·&nbsp; 🎲 rerolls 1 die</span>
            <div style='display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;'>
                ${editState.hpRolls.map((hp, i) => {
                    const isL0 = i === 0;   // L0 always at index 0
                    const label = isL0 ? 'L0' : `L${i}`;
                    const sides = editState.hpDice ? (editState.hpDice[i] || 0) : 0;
                    const rerollBtn = sides > 0
                        ? `<button class='ose-hp-reroll' data-index='${i}' data-sides='${sides}'
                               title='Reroll 1d${sides}+CON'
                               style='padding:2px 5px;font-size:11px;border:1px solid #aaa;border-radius:3px;cursor:pointer;background:white;line-height:1;'>🎲</button>`
                        : '';
                    return `<div style='display:flex;align-items:center;gap:3px;'>
                        <label style='font-size:11px;min-width:22px;font-weight:bold;color:#444;text-align:right;'>${label}:</label>
                        <input type='number' class='ose-edit-hp' data-index='${i}' value='${hp}' min='1' max='99'
                            style='width:38px;padding:3px;text-align:center;border:1px solid #ccc;border-radius:3px;font-size:12px;font-weight:bold;'>
                        ${rerollBtn}
                    </div>`;
                }).join('')}
            </div>
        </div>` : ''}
        <div style='margin-bottom:10px;'>
            <strong>Starting Gold:</strong>
            <input type='number' id='oseEditStartingGold' value='${editState.startingGold || 0}' min='0' max='99999'
                style='margin-left:6px;width:65px;padding:3px;text-align:center;border:1px solid #ccc;border-radius:3px;font-size:12px;font-weight:bold;'> gp
            <button id='oseEditRerollGold' title='Reroll starting gold (3d6×10)'
                style='margin-left:4px;padding:2px 5px;font-size:11px;border:1px solid #aaa;border-radius:3px;cursor:pointer;background:white;line-height:1;'>🎲</button>
        </div>
        <div style='margin-top:12px;display:flex;gap:8px;'>
            <button id='oseEditApplyBtn' style='padding:6px 14px;font-size:12px;font-weight:bold;background:#1976D2;color:white;border:none;border-radius:3px;cursor:pointer;'>Apply Changes</button>
            <button id='oseEditCancelBtn' style='padding:6px 14px;font-size:12px;font-weight:bold;background:#ccc;color:#333;border:none;border-radius:3px;cursor:pointer;'>Cancel</button>
        </div>
    </div>`;
}

/**
 * Read current values from the edit panel
 */
function readEditPanelValues(panel, editState) {
    const clamp = (v, def) => isNaN(v) ? def : Math.min(18, Math.max(3, v));
    const selLvlBtn = panel.querySelector('.ose-edit-level-btn.ose-edit-selected');
    const level = selLvlBtn ? parseInt(selLvlBtn.dataset.level) : editState.level;
    const progressionMode = panel.querySelector('input[name="editProgression"]:checked')?.value || editState.progressionMode;
    const name = panel.querySelector('#oseEditName')?.value ?? editState.name ?? '';
    const STR = clamp(parseInt(panel.querySelector('#oseEditSTR')?.value), editState.STR);
    const INT = clamp(parseInt(panel.querySelector('#oseEditINT')?.value), editState.INT);
    const WIS = clamp(parseInt(panel.querySelector('#oseEditWIS')?.value), editState.WIS);
    const DEX = clamp(parseInt(panel.querySelector('#oseEditDEX')?.value), editState.DEX);
    const CON = clamp(parseInt(panel.querySelector('#oseEditCON')?.value), editState.CON);
    const CHA = clamp(parseInt(panel.querySelector('#oseEditCHA')?.value), editState.CHA);
    // Ability score adjustments
    const adjClamp = v => isNaN(v) ? 0 : Math.max(-10, Math.min(10, v));
    const adjSTR = adjClamp(parseInt(panel.querySelector('#oseEditAdjSTR')?.value));
    const adjINT = adjClamp(parseInt(panel.querySelector('#oseEditAdjINT')?.value));
    const adjWIS = adjClamp(parseInt(panel.querySelector('#oseEditAdjWIS')?.value));
    const adjDEX = adjClamp(parseInt(panel.querySelector('#oseEditAdjDEX')?.value));
    const adjCON = adjClamp(parseInt(panel.querySelector('#oseEditAdjCON')?.value));
    const adjCHA = adjClamp(parseInt(panel.querySelector('#oseEditAdjCHA')?.value));
    // HP per level
    const hpInputs = panel.querySelectorAll('.ose-edit-hp');
    const hpRolls = hpInputs.length > 0
        ? Array.from(hpInputs).map(inp => Math.max(1, parseInt(inp.value) || 1))
        : (editState.hpRolls || []);
    // Starting gold
    const goldVal = parseInt(panel.querySelector('#oseEditStartingGold')?.value);
    const startingGold = isNaN(goldVal) ? (editState.startingGold || 0) : goldVal;
    // Checkboxes
    const includeLevel0HP = panel.querySelector('#oseEditIncludeLevel0HP')?.checked || false;
    const showUndeadNames = panel.querySelector('#oseEditShowUndeadNames')?.checked || false;
    const showQRCode      = panel.querySelector('#oseEditShowQRCode')?.checked ?? true;
    const extra = {};
    (editState.extraSections || []).forEach(section => {
        const checked = panel.querySelector(`input[name="${section.name}"]:checked`);
        if (checked) extra[section.name] = checked.value;
    });
    return { level, progressionMode, name, STR, INT, WIS, DEX, CON, CHA,
             adjSTR, adjINT, adjWIS, adjDEX, adjCON, adjCHA,
             hpRolls, startingGold, includeLevel0HP, showUndeadNames, showQRCode, ...extra };
}

/**
 * Build the charactersheet.html URL for a printSheet object.
 * If printSheet.cp (compact params v2) is present, encodes only the compact object.
 * Otherwise falls back to full sheet encoding.
 * @param {Object} printSheet - Sheet with optional .cp compact params
 * @returns {Promise<string>}
 */
async function buildPrintUrl(printSheet) {
    const base = window.location.origin +
        window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    if (printSheet.cp) {
        const cp = encodeCompactParams(printSheet.cp);
        const encoded = await compressToBase32(JSON.stringify(cp));
        return `${base}charactersheet.html?d=${encoded}`;
    }
    // Fall back: full sheet (strip cp to avoid duplication)
    const { cp: _cp, ...sheetData } = printSheet;
    const encoded = await compressToBase32(JSON.stringify(sheetData));
    return `${base}charactersheet.html?d=${encoded}`;
}

/**
 * Open a character sheet in a new print tab via charactersheet.html?d=...
 * Uses compact params (v2) if sheet.cp is present for a short, QR-friendly URL.
 * @param {Object} sheet - Normalized sheet object
 */
async function openCharacterInPrintTab(sheet, backgroundTab = false) {
    const { onEditUpdate, editState, ...printSheet } = sheet;
    const url = await buildPrintUrl(printSheet);
    const newWin = window.open(url, '_blank');
    if (backgroundTab && newWin) {
        // Keep the new tab in the background — blur it and refocus the generator
        newWin.blur();
        window.focus();
    }
}

/**
 * Generate a QR code data URL for the given URL.
 * Uses toDataURL so the result can be set as an <img> src — img tags respect CSS sizing perfectly.
 * @param {string} url - URL to encode
 * @returns {Promise<string|null>} PNG data URL or null on failure
 */
async function generateQRDataURL(url) {
    try {
        const { default: QRCode } = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm');
        return await QRCode.toDataURL(url, { margin: 1, color: { dark: '#000000ff', light: '#ffffffff' } });
    } catch (e) {
        console.warn('QR code generation failed:', e);
        return null;
    }
}

/**
 * Display character sheet — render HTML and show in page or new tab
 * @param {Object} sheet - Normalized sheet object
 * @param {HTMLElement} targetInfo - Element to display character info in
 * @param {HTMLElement} targetDisplay - Display container element
 */
export function displayCharacterSheet(sheet, targetInfo, targetDisplay) {
    const html = renderCharacterSheetHTML(sheet);

    if (sheet.openInNewTab) {
        openCharacterInPrintTab(sheet, sheet.backgroundTab || false);
        if (targetInfo) {
            targetInfo.innerHTML = '<p style="text-align: center;">Character opened in new tab.</p>';
        }
        if (targetDisplay) {
            targetDisplay.classList.add('visible');
        }
    } else {
        if (targetInfo) {
            const printBarHTML = `
                <div class='ose-print-bar' style='margin-bottom: 12px; padding: 8px 12px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; border: 1px solid #ddd;'>
                    <button id='openPrintTabBtn' style='padding: 7px 16px; font-size: 13px; font-weight: bold; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;'>🖨 Print / Save as PDF / EDIT</button>
                    <span style='color: #666; font-size: 0.85em; font-style: italic;'>Tip: Opens character sheet in new tab — print, save, or edit there</span>
                </div>
            `;
            targetInfo.innerHTML = printBarHTML + html;

            // Print button — open character in a clean new tab for printing/editing
            const btn = targetInfo.querySelector('#openPrintTabBtn');
            if (btn) btn.addEventListener('click', () => openCharacterInPrintTab(sheet));

            // Async: generate inline QR code + make it clickable
            if (sheet.showQRCode !== false) {
                const qrImg  = targetInfo.querySelector('#ose-qr-img');
                const qrLink = targetInfo.querySelector('#ose-qr-link');
                if (qrImg) {
                    (async () => {
                        const { onEditUpdate, editState, ...printSheet } = sheet;
                        const printUrl = await buildPrintUrl(printSheet);
                        if (qrLink) qrLink.href = printUrl;
                        const dataUrl = await generateQRDataURL(printUrl);
                        if (dataUrl) qrImg.src = dataUrl;
                    })();
                }
            }

            // Edit button — toggle the inline edit panel
            const editBtn = targetInfo.querySelector('#editCharacterBtn');
            const editPanel = targetInfo.querySelector('#oseEditPanel');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    if (editPanel) {
                        const isHidden = editPanel.style.display === 'none' || !editPanel.style.display;
                        editPanel.style.display = isHidden ? 'block' : 'none';
                        if (isHidden) editPanel.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }

            // Wire up level buttons inside the edit panel
            if (editPanel) {
                const levelBtns = editPanel.querySelectorAll('.ose-edit-level-btn');
                levelBtns.forEach(lb => {
                    lb.addEventListener('click', () => {
                        levelBtns.forEach(b => {
                            b.classList.remove('ose-edit-selected');
                            b.style.background = 'white';
                            b.style.color = '#2196F3';
                        });
                        lb.classList.add('ose-edit-selected');
                        lb.style.background = '#2196F3';
                        lb.style.color = 'white';
                    });
                });

                // Live-update final score display when base score or adjustment changes
                ['STR','INT','WIS','DEX','CON','CHA'].forEach(a => {
                    const baseInp = editPanel.querySelector(`#oseEdit${a}`);
                    const adjInp  = editPanel.querySelector(`#oseEditAdj${a}`);
                    const finalEl = editPanel.querySelector(`#oseEditFinal${a}`);
                    const update  = () => {
                        const base = parseInt(baseInp?.value) || 3;
                        const adj  = parseInt(adjInp?.value)  || 0;
                        if (finalEl) finalEl.textContent = base + adj;
                    };
                    baseInp?.addEventListener('input', update);
                    adjInp?.addEventListener('input',  update);
                });

                // 🎲 HP per-level reroll buttons — roll 1dX + CON modifier, min 1
                const conMod = sheet.editState?.conModifier || 0;
                editPanel.querySelectorAll('.ose-hp-reroll').forEach(rb => {
                    rb.addEventListener('click', () => {
                        const idx   = parseInt(rb.dataset.index);
                        const sides = parseInt(rb.dataset.sides);
                        if (sides > 0) {
                            const roll = Math.floor(Math.random() * sides) + 1;
                            const hp   = Math.max(1, roll + conMod);
                            const inp  = editPanel.querySelector(`.ose-edit-hp[data-index='${idx}']`);
                            if (inp) inp.value = hp;
                        }
                    });
                });

                // 🎲 Starting gold reroll — 3d6 × 10 gp
                const rerollGoldBtn = editPanel.querySelector('#oseEditRerollGold');
                if (rerollGoldBtn) {
                    rerollGoldBtn.addEventListener('click', () => {
                        const roll = ((Math.floor(Math.random()*6)+1)
                                    + (Math.floor(Math.random()*6)+1)
                                    + (Math.floor(Math.random()*6)+1)) * 10;
                        const inp = editPanel.querySelector('#oseEditStartingGold');
                        if (inp) inp.value = roll;
                    });
                }

                // Apply Changes
                const applyBtn = editPanel.querySelector('#oseEditApplyBtn');
                if (applyBtn && sheet.onEditUpdate) {
                    applyBtn.addEventListener('click', () => {
                        const values = readEditPanelValues(editPanel, sheet.editState);
                        sheet.onEditUpdate(values);
                    });
                }

                // Cancel
                const cancelBtn = editPanel.querySelector('#oseEditCancelBtn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        editPanel.style.display = 'none';
                    });
                }
            }
        }
        if (targetDisplay) {
            targetDisplay.classList.add('visible');
            targetDisplay.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ── Modifier display (from cs-modifier-display.js) ──────────────────────────


/**
 * Get detailed modifier effects based on OSE rules
 * @param {string} ability - Ability score name (STR, DEX, CON, INT, WIS, CHA)
 * @param {number} modifier - Ability modifier (-3 to +3)
 * @param {number} score - Raw ability score (3-18)
 * @returns {string} Formatted string describing the effects
 */
export function getModifierEffects(ability, modifier, score) {
    switch(ability) {
        case "STR":
            let doorChance;
            if (score <= 5) doorChance = "1-in-6";
            else if (score <= 8) doorChance = "1-in-6";
            else if (score <= 12) doorChance = "2-in-6";
            else if (score <= 15) doorChance = "3-in-6";
            else if (score <= 17) doorChance = "4-in-6";
            else doorChance = "5-in-6";
            return `Melee: ${modifier >= 0 ? '+' : ''}${modifier} (Attack & Damage), Open Doors: ${doorChance}`;

        case "DEX":
            return `AC: ${modifier >= 0 ? '+' : ''}${modifier}, Missile: ${modifier >= 0 ? '+' : ''}${modifier} (Just Attacks), Initiative: ${modifier >= 0 ? '+' : ''}${modifier}`;

        case "CON":
            return `Hit Points: ${modifier >= 0 ? '+' : ''}${modifier} at each level`;

        case "INT":
            let languages, literacy;
            if (score <= 3) { languages = "Native (broken)"; literacy = "Illiterate"; }
            else if (score <= 5) { languages = "Native"; literacy = "Illiterate"; }
            else if (score <= 8) { languages = "Native"; literacy = "Basic"; }
            else if (score <= 12) { languages = "Native"; literacy = "Literate"; }
            else if (score <= 15) { languages = "Native + 1"; literacy = "Literate"; }
            else if (score <= 17) { languages = "Native + 2"; literacy = "Literate"; }
            else { languages = "Native + 3"; literacy = "Literate"; }
            return `Languages: ${languages}, Literacy: ${literacy}`;

        case "WIS":
            return `Magic Saves: ${modifier >= 0 ? '+' : ''}${modifier}`;

        case "CHA":
            let npcReaction = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            let maxRetainers, loyalty;
            if (score <= 3) { maxRetainers = 1; loyalty = 4; }
            else if (score <= 5) { maxRetainers = 2; loyalty = 5; }
            else if (score <= 8) { maxRetainers = 3; loyalty = 6; }
            else if (score <= 12) { maxRetainers = 4; loyalty = 7; }
            else if (score <= 15) { maxRetainers = 5; loyalty = 8; }
            else if (score <= 17) { maxRetainers = 6; loyalty = 9; }
            else { maxRetainers = 7; loyalty = 10; }
            return `NPC Reactions: ${npcReaction}, Max Retainers: ${maxRetainers}, Loyalty: ${loyalty}`;

        default:
            return "";
    }
}
