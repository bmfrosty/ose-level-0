/**
 * shared-compact-codes.js
 * Lookup tables for compressing common strings in v2 compact character params.
 *
 * Each field uses its own independent table (bg, ar, w, it).
 * Encoding: if the string has a code, use the 2-char code; otherwise keep the full string.
 * Decoding: if a string is EXACTLY 2 chars and matches a code key, expand it; otherwise use as-is.
 *
 * This means new / unknown strings always fall back to the full string gracefully.
 * No equipment string is naturally 2 chars, so the 2-char key uniquely identifies codes.
 */

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
 * m       'A'|'B'|'Z' Mode: A=Advanced, B=Basic, Z=0-Level
 *
 * ── Character identity ────────────────────────────────────────────────────────
 * p       'O'|'S'|'L' Progression mode: O=OSE Standard, S=Smoothified, L=Labyrinth Lord
 * r       2-char code Race code (Advanced only): HU DW EL HA GN
 * c       2-char code Class code: FI CL MU TH SB DW EL HA GN
 * l       number      Level (1–14)
 * n       string      Character name
 * bg      string|code Background profession  (lookup-table compressed)
 *
 * ── Ability scores ────────────────────────────────────────────────────────────
 * s       number[6]   Adjusted ability scores [STR,DEX,CON,INT,WIS,CHA]
 * bs      number[6]   Base scores before racial adjustments (Advanced only, omitted if equal to s)
 *
 * ── Hit points ────────────────────────────────────────────────────────────────
 * h       number      Max HP (total, respects il flag)
 * hr      number[]    HP value per entry — index 0 is ALWAYS the L0 background roll,
 *                     regardless of il.  hr[1]=L1 HP, hr[2]=L2 HP, etc.
 * hd      number[]    Die sides per entry (matches hr[]).  hd[0]=4 (1d4 for L0).
 * il      0|1         includeLevel0HP — if 1, hr[0] is counted in h; if 0, not counted
 *
 * ── Equipment ─────────────────────────────────────────────────────────────────
 * ar      string|null Armor name             (lookup-table compressed)
 * sh      0|1         Shield equipped
 * w       string|null Primary weapon name    (lookup-table compressed)
 * it      string[]    Item list              (each item lookup-table compressed)
 * g       number      Gold remaining after equipment purchase
 * ac      number      Starting AC
 *
 * ── Generation options (preserved for level-up / regeneration) ────────────────
 * rcm     2-char code Race/class mode (Advanced only): ST SH TE AL
 *                       ST=strict, SH=strict+human, TE=traditional-extended, AL=allow-all
 * hc      0|1         healthyCharacters — re-roll HP results that would be < 2 (level 1)
 * wp      number      wealthPct — starting gold % of XP-for-level for level 2+ chars (0–100)
 * prm     0|9|13      primeRequisiteMode — 0=user choice, 9=require ≥9, 13=require ≥13
 * un      0|1         showUndeadNames — show monster names in Turn Undead table
 * qr      0|1         showQRCode — show QR code on page 2
 * ap      0|1         autoPrint — auto-open print dialog when charactersheet.html loads
 * ════════════════════════════════════════════════════════════════════════════════
 */

// ─── WEAPON CODES (for the `w` field) ────────────────────────────────────────
// Covers all weapon names used in WEAPON_PRIORITY + the full WEAPONS map.
export const WEAPON_TO_CODE = {
    'Sword':            'SW',
    'Short sword':      'SS',
    'Mace':             'MA',
    'Hand axe':         'HX',
    'Dagger':           'DA',
    'War hammer':       'WH',
    'Club':             'CL',
    'Staff':            'SF',
    'Sling':            'SG',
    'Crossbow':         'XB',
    'Long bow':         'LB',
    'Short bow':        'SB',
    'Two-handed sword': 'TS',
    'Battle axe':       'BA',
    'Silver dagger':    'SD',
    'Spear':            'SP',
    'Javelin':          'JV',
    'Pole arm':         'PO',
    'Torch':            'TC',
};
export const CODE_TO_WEAPON = Object.fromEntries(Object.entries(WEAPON_TO_CODE).map(([k,v])=>[v,k]));

// ─── ARMOR CODES (for the `ar` field) ────────────────────────────────────────
// Covers ARMOR_PRIORITY + background armor values.
export const ARMOR_TO_CODE = {
    'Plate mail':    'PM',
    'Chain mail':    'CM',  // ARMOR_PRIORITY / purchased
    'Chain Mail':    'C2',  // Background armor field (capital M)
    'Leather':       'LE',
    'Unarmored':     'UN',  // background.armor value
    'Unarmoured':    'UU',  // British spelling variant
    'Shield':        'SH',
    'Plate mail +1': 'P1',
    'Chain mail +1': 'C1',
};
export const CODE_TO_ARMOR = Object.fromEntries(Object.entries(ARMOR_TO_CODE).map(([k,v])=>[v,k]));

// ─── BACKGROUND / PROFESSION CODES (for the `bg` field) ──────────────────────
// All 48 professions from shared-backgrounds.js background tables (HP 1–4 × 12 each).
export const BG_TO_CODE = {
    // HP 1
    'Acolyte':                  'AC',
    'Actor':                    'AT',
    "Alchemist's Apprentice":   'AA',
    'Artist':                   'AR',
    'Beggar':                   'BG',
    'Jeweller':                 'JW',
    'Juggler':                  'JG',
    'Money Lender':             'ML',
    'Scribe':                   'SC',
    'Trumpet Player':           'TP',
    'Wealthy Heir':             'WL',
    "Wizard's Apprentice":      'WZ',
    // HP 2
    'Butcher':                  'BU',
    'Butler':                   'BT',
    'Cook':                     'CK',
    'Fletcher':                 'FL',
    'Gambler':                  'GB',
    'Horse Thief':              'HT',
    'Innkeeper':                'IK',
    'Navigator':                'NV',
    'Shepherd':                 'SX',   // SH reserved for Shield in armor table
    'Tailor':                   'TA',
    'Trader':                   'TD',
    'Weaver':                   'WV',
    // HP 3
    'Bowyer':                   'BY',
    'Cooper':                   'CP',
    'Executioner':              'EX',
    'Fisher':                   'FI',
    'Groom':                    'GR',
    'Hermit':                   'HM',
    'Kennel Master':            'KM',
    'Leatherworker':            'LW',
    'Limner':                   'LI',
    'Sailor':                   'SA',
    'Teamster':                 'TM',
    'Trapper':                  'TR',
    // HP 4
    'Armourer':                 'AM',
    'Barber Surgeon':           'BS',
    'Blacksmith':               'BL',
    'Carpenter':                'CA',
    'Farmer':                   'FA',
    'Forester':                 'FO',
    'Hunter':                   'HN',
    'Mason':                    'MN',
    'Miner':                    'MX',
    'Shipwright':               'SI',   // SI unused in bg (Scissors→item table)
    'Squire':                   'SQ',
    'Weaponsmith':              'WP',
};
export const CODE_TO_BG = Object.fromEntries(Object.entries(BG_TO_CODE).map(([k,v])=>[v,k]));

// ─── ITEM CODES (for each element of the `it` array) ─────────────────────────
// Covers: dungeoneering bundle, class gear, purchased weapon names, background
// weapon/armor strings (with "(background)" suffix), and background item strings.
// Any item string NOT in this table falls back to the full string as-is.
export const ITEM_TO_CODE = {
    // ── Dungeoneering bundle (most frequently purchased) ──────────────────────
    'Backpack':                                  'BP',
    'Tinder box (flint & steel)':                'TB',
    'Torches (6)':                               'T6',
    "Rope (50')":                                'R5',
    'Waterskin':                                 'WS',
    'Crowbar':                                   'CR',

    // ── Class-specific gear ───────────────────────────────────────────────────
    'Holy symbol':                               'HS',
    "Thieves' tools":                            'TT',

    // ── Background armor strings (armor field → item with "(background)") ─────
    'Unarmored (background)':                    'UA',
    'Chain Mail (background)':                   'MC',

    // ── Background weapon strings (with "(background)" suffix) ───────────────
    'Mace (1d6) (background)':                   'M6',
    'Dagger (1d4) (background)':                 'D4',
    'Club (1d4) (background)':                   'C4',
    'Staff (1d4) (background)':                  'S4',
    'Hand axe (1d6) (background)':               'H6',
    'Spear (1d6) (background)':                  'P6',
    'Crossbow (1d6) + 10 bolts (background)':    'X6',
    'Shortbow (1d6) + 10 arrows (background)':   'N6',
    'Longbow (1d6) + 10 arrows (background)':    'G6',
    'Sling (1d4) + 10 stones (background)':      'L4',
    'Battle axe (1d8) (background)':             'B8',
    'War hammer (1d6) (background)':             'W6',
    'Pitchfork (1d6) (background)':              'F6',
    'Pick axe (1d6) (background)':               'K6',
    'Shortsword (1d6) (background)':             'O6',
    'Sword (1d8) (background)':                  'E8',
    'Scissors (1d4) (background)':               'SC', // no conflict in item table
    'Scissors (1d3) (background)':               'S3',
    'Rock (1d3) (background)':                   'R3',
    'Jewelled dagger (1d4) (background)':        'J4',
    'Walking stick (1d4) (background)':          'K4',
    'Stage sword (1d4) (background)':            'Q4',
    'Hammer (1d4) (background)':                 'V4',
    '3 x daggers (1d4) (background)':            'XD',
    '2 x daggers (1d4) (background)':            'YD',
    'Awl (1d4) (background)':                    'A4',
    'Belaying pin (1d4) (background)':           'Z4',
    'Whip (1d2, hits entangle) (background)':    'WT',
    'Razor (1d4) (background)':                  'RZ',

    // ── Purchased weapon names (also pushed into items array) ─────────────────
    'Sword':                                     'SW',
    'Short sword':                               'SS',
    'Mace':                                      'MA',
    'Hand axe':                                  'HX',
    'Dagger':                                    'DA',
    'War hammer':                                'WH',
    'Club':                                      'CL',
    'Staff':                                     'SF',
    'Sling':                                     'SG',
    'Crossbow':                                  'XB',
    'Long bow':                                  'LB',
    'Short bow':                                 'SB',
    'Two-handed sword':                          'TS',
    'Battle axe':                                'BA',

    // ── Background items (from background.item arrays) ────────────────────────
    'Incense':                                   'IC',
    '2 x Masks':                                 'MK',
    '2 x Costumes':                              'CO',
    'Potion of Healing':                         'PH',
    'Parchment':                                 'PC',
    'Paint':                                     'PA',
    'Brush':                                     'BR',
    'Wooden bowl':                               'WB',
    'Ostentatious Jewellery (25gp)':             'OJ',
    'Juggling balls':                            'JB',
    '50gp':                                      '5G',
    '3 x Parchment':                             'P3',
    'Ink pot':                                   'IP',
    'Quill':                                     'QL',
    'Trumpet':                                   'TU',
    'Signet ring':                               'SR',
    'Perfume':                                   'PF',
    'Spell book (1 random cantrip)':             'ZP',
    "Dried meat (5 days' iron rations)":         'DM',
    'Livery':                                    'LV',
    'Silver serving tray':                       'SV',
    'Salt':                                      'SL',
    'Skillet':                                   'SK',
    'Onion':                                     'ON',
    'Bag of feathers':                           'BF',
    'Dice':                                      'DC',
    'A horse':                                   'AH',
    '3 x Bottles of wine':                       '3B',
    'Compass':                                   'CS',
    'Chalk':                                     'CK',
    "Pole (10' long, wooden)":                   'PL',
    'Needle':                                    'ND',
    'Thread':                                    'TH',
    'Bag of buttons':                            'BB',
    'Rare, fragrant spices':                     'RS',
    'Hand Loom':                                 'HL',
    'Yarn':                                      'YN',
    'Saw':                                       'ZW',
    'Barrel':                                    'BZ',
    "50' Rope":                                  'FR',   // background format, different from "Rope (50')"
    'Net':                                       'NT',
    'A dog':                                     'AG',
    'A bearskin':                                'AK',
    'Lantern':                                   'LN',
    '2 x Oil flasks':                            'OF',
    'Bottle of rum':                             'RU',
    'Bear trap (1d6)':                           'BT',
    'Chain mail':                                'CI',   // Armourer background item (lowercase)
    'Bottle of strong spirits':                  'ZS',
    'Tongs':                                     'TG',
    'Apron':                                     'AP',
    'A pig':                                     'AI',
    'Tent':                                      'TE',
    'Whistle':                                   'WI',
    'A bag of rocks':                            'RK',
    'Pot of tar':                                'ZT',
    'Flag':                                      'FG',
};
export const CODE_TO_ITEM = Object.fromEntries(Object.entries(ITEM_TO_CODE).map(([k,v])=>[v,k]));

// ─── Helper functions ─────────────────────────────────────────────────────────

/**
 * Encode a single string field using the given code table.
 * Returns the 2-char code if found, otherwise the original string.
 */
export function encodeStr(codeTable, str) {
    if (str == null) return str;
    return codeTable[str] ?? str;
}

/**
 * Decode a single string field using the given reverse-code table.
 * If the string is EXACTLY 2 chars and the code exists, expands it.
 * Otherwise returns the string as-is (safe fallback for unknown codes or full strings).
 */
export function decodeStr(revTable, str) {
    if (str == null) return str;
    if (str.length === 2 && revTable[str] !== undefined) return revTable[str];
    return str;
}

/**
 * Encode an array of item strings.  Each item is encoded individually;
 * items without a known code are kept as the full string.
 */
export function encodeItems(items) {
    if (!Array.isArray(items)) return items;
    return items.map(item => encodeStr(ITEM_TO_CODE, item));
}

/**
 * Decode an array of item strings.
 * Each 2-char code is expanded; unrecognised strings (or longer strings) pass through.
 */
export function decodeItems(items) {
    if (!Array.isArray(items)) return items;
    return items.map(item => decodeStr(CODE_TO_ITEM, item));
}

/**
 * Encode all compressible fields in a compact params v2 object.
 * bg, ar, w → single string lookup; it → per-item lookup.
 * Returns a new object; the input is not mutated.
 */
export function encodeCompactParams(cp) {
    const out = { ...cp };
    if (out.bg != null) out.bg = encodeStr(BG_TO_CODE,     out.bg);
    if (out.ar != null) out.ar = encodeStr(ARMOR_TO_CODE,  out.ar);
    if (out.w  != null) out.w  = encodeStr(WEAPON_TO_CODE, out.w);
    if (Array.isArray(out.it)) out.it = encodeItems(out.it);
    return out;
}

/**
 * Decode all compressible fields in a compact params v2 object.
 * Returns a new object with codes expanded back to full strings.
 * Unknown codes / full strings pass through unchanged.
 */
export function decodeCompactParams(cp) {
    const out = { ...cp };
    if (out.bg != null) out.bg = decodeStr(CODE_TO_BG,     out.bg);
    if (out.ar != null) out.ar = decodeStr(CODE_TO_ARMOR,  out.ar);
    if (out.w  != null) out.w  = decodeStr(CODE_TO_WEAPON, out.w);
    if (Array.isArray(out.it)) out.it = decodeItems(out.it);
    return out;
}

/**
 * Build a compact options summary line from a raw (encoded) compact params v2 object.
 * Returns an HTML string suitable for embedding in a footer, or '' if no notable options.
 * Works with the raw cp object (codes not yet decoded).
 *
 * @param {Object} cp - Raw compact params v2 object
 * @returns {string} Pipe-separated options label string (HTML-safe)
 */
export function buildOptionsLine(cp) {
    const parts = [];
    const lvl = cp.l ?? 0;

    // Progression mode — always show
    const progLabel = { O: 'OSE Standard', S: 'Smoothified', L: 'Labyrinth Lord' };
    parts.push(progLabel[cp.p] || 'OSE Standard');

    // Race/class restrictions or human racial abilities — always show
    if (cp.m === 'A') {
        const rcmLabel = { ST:'Strict OSE', SH:'Human Racial Abilities', TE:'Extended Levels + Human Abilities', AL:'Allow All Classes' };
        parts.push(rcmLabel[cp.rcm] || 'Strict OSE');
    } else if (cp.m === 'B') {
        parts.push(cp.bl ? 'Human Racial Abilities' : 'Strict OSE');
        parts.push(cp.dl ? 'Extended Levels' : 'Standard Level Limits');
    }

    // HP-affecting options — always show
    parts.push(cp.hc ? 'Healthy Characters' : 'Standard HP');

    // L0 HP inclusion — always show for level 1+ characters
    if (lvl >= 1) parts.push(cp.il ? 'L0 HP: Yes' : 'L0 HP: No');

    // Prime Requisite mode — show whenever explicitly set (affects score rolling at all levels)
    if (cp.prm != null) parts.push(cp.prm ? `Prime Req \u2265${cp.prm}` : 'User Min Scores');

    // Starting wealth — only meaningful at level 2+
    if (lvl >= 2 && cp.wp != null) parts.push(`Wealth: ${cp.wp}%`);

    // Score minimums — show non-default (>3) values, e.g. "Min: STR≥10 INT≥12"
    if (Array.isArray(cp.sm)) {
        const ORDER = ['STR','DEX','CON','INT','WIS','CHA'];
        const minParts = ORDER.map((a, i) => (cp.sm[i] || 3) > 3 ? `${a}\u2265${cp.sm[i]}` : null).filter(Boolean);
        if (minParts.length > 0) parts.push(`Min: ${minParts.join(' ')}`);
    }

    // Fixed scores vs roll attempts
    if (cp.fs) {
        parts.push('Fixed Scores');
    } else if (cp.rr != null) {
        parts.push(`${cp.rr} roll${cp.rr === 1 ? '' : 's'}`);
    }

    return parts.join(' &nbsp;·&nbsp; ');
}
