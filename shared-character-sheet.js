/**
 * shared-character-sheet.js
 * Shared HTML character sheet renderer for all three generators (0-level, Basic, Advanced)
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
 *   openInNewTab: bool,
 *   autoPrint: bool
 * }
 */

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

    // ── Ability scores rows ──────────────────────────────────────────────────
    const abilityRows = sheet.abilityScores.map(a => {
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
    const thiefSkillsHTML = ws.thiefSkills ? `
        <div style='margin-top: 8px; border-top: 1px solid #ccc; padding-top: 4px;'>
            ${Object.entries(ws.thiefSkills).map(([skill, value]) => {
                const displayName = skill.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                return `<span style='font-size:0.85em;'><strong>${displayName}:</strong> ${value}</span>`;
            }).join(' &nbsp; ')}
        </div>` : '';

    // ── Abilities section ────────────────────────────────────────────────────
    const sec = sheet.abilitiesSection;
    const hasRacial = sec.racial && sec.racial.length > 0;
    const hasClass = sec.class && sec.class.length > 0;
    const racialHTML = hasRacial
        ? `<ul style='margin: 0; padding-left: 18px;'>${sec.racial.map(a => `<li style='margin-bottom: 2px;'>${a}</li>`).join('')}</ul>`
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

    // ── Experience ────────────────────────────────────────────────────────────
    const experienceHTML = sheet.experience ? `
                <!-- EXPERIENCE -->
                <div style='${sectionHeader}'>EXPERIENCE</div>
                <div style='${box} margin-bottom: 8px; font-size: 0.85em;'>
                    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 2px;'>
                        <div><strong>Current XP:</strong> ${sheet.experience.current}</div>
                        <div><strong>XP Bonus:</strong> ${sheet.experience.bonus}</div>
                        <div><strong>Lvl ${sheet.experience.forLevel} XP:</strong> ${sheet.experience.forLevelXP}</div>
                        <div><strong>Next Lvl XP:</strong> ${sheet.experience.forNext || 'Max!'}</div>
                    </div>
                </div>` : '';

    // ── Equipment ─────────────────────────────────────────────────────────────
    const eq = sheet.equipment;
    const itemsHTML = eq.items.map(item => `<li>${item}</li>`).join('');
    const startingGoldHTML = eq.startingGold !== null && eq.startingGold !== undefined
        ? ` &nbsp; <strong>Starting Gold:</strong> ${eq.startingGold} gp`
        : '';
    const equipmentInnerHTML = eq.armor !== null
        ? `
            <div><strong>Armor:</strong> ${eq.armor}</div>
            <div style='margin-top: 4px;'><strong>Items:</strong>
                <ul style='margin: 2px 0; padding-left: 18px;'>${itemsHTML}</ul>
            </div>
            <div style='border-top: 1px solid #ccc; margin-top: 6px; padding-top: 4px; line-height: 1.8em;'>
                &nbsp;<br>&nbsp;<br>&nbsp;
            </div>
            <div style='margin-top: 4px; border-top: 1px solid #ccc; padding-top: 4px;'><strong>Starting AC:</strong> ${eq.startingAC}${startingGoldHTML}</div>`
        : `<span style='color:#666;'>No starting equipment</span>`;

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

    // ── Full HTML ─────────────────────────────────────────────────────────────
    return `
        <div style='font-family: Arial, sans-serif; max-width: 760px;'>

        <!-- Header -->
        <div style='margin-bottom: 8px;'>
            <div style='font-size: 1.3em; font-weight: bold;'>${sheet.title}</div>
            <div style='font-size: 0.85em; color: #444;'>${sheet.subtitle}</div>
            <hr style='margin: 6px 0; border-color: #000;'>
            <div style='display: grid; grid-template-columns: ${colTemplate}; gap: 0; font-size: 0.85em;'>
                ${headerCols}
            </div>
        </div>

        <!-- COMBAT -->
        <div style='${sectionHeader}'>COMBAT</div>
        <div style='display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-bottom: 8px;'>
            <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>MAX HP</div>${sheet.combat.maxHP}</div>
            <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>CUR HP</div>&nbsp;</div>
            <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>INIT</div>${fmt(sheet.combat.initMod)}</div>
            <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>AC</div>&nbsp;</div>
        </div>

        <!-- Two column layout -->
        <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 8px;'>

            <!-- LEFT COLUMN -->
            <div>
                <!-- ABILITY SCORES -->
                <div style='${sectionHeader}'>ABILITY SCORES</div>
                <table style='width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 0.85em;'>
                    <tr style='background-color: #eee;'>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: center; width: 20%;'>Ability</th>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: center; width: 15%;'>Score</th>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: left;'>Effects</th>
                    </tr>
                    ${abilityRows}
                </table>

                <!-- WEAPONS AND SKILLS -->
                <div style='${sectionHeader}'>WEAPONS AND SKILLS</div>
                <div style='${box} margin-bottom: 8px; min-height: 60px;'>
                    ${ws.weapon ? `<div><strong>Weapon:</strong> ${ws.weapon}</div>` : ''}
                    <div style='margin-top: 4px;'><strong>Class Attack Bonus:</strong> ${fmt(ws.classAttackBonus)}</div>
                    <div style='margin-top: 2px;'><strong>Melee Modifier (STR):</strong> ${fmt(ws.meleeMod)}</div>
                    <div style='margin-top: 2px;'><strong>Ranged Modifier (DEX):</strong> ${fmt(ws.rangedMod)}</div>
                    ${thiefSkillsHTML}
                </div>

                <!-- ABILITIES -->
                <div style='${sectionHeader}'>${sec.header}</div>
                <div style='${box} min-height: 80px;'>${abilitiesHTML}</div>
            </div>

            <!-- RIGHT COLUMN -->
            <div>
                <!-- SAVING THROWS -->
                <div style='${sectionHeader}'>SAVING THROWS</div>
                <div style='display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; margin-bottom: 8px;'>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Death</div>${sv.death}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Wands</div>${sv.wands}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Petrify</div>${sv.paralysis}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Breath</div>${sv.breath}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Spells</div>${sv.spells}</div>
                </div>

                ${experienceHTML}

                <!-- EQUIPMENT AND ITEMS -->
                <div style='${sectionHeader}'>EQUIPMENT AND ITEMS</div>
                <div style='${box} margin-bottom: 8px;'>${equipmentInnerHTML}</div>

                ${spellSlotsHTML}
                ${turnUndeadHTML}

                <!-- TREASURE -->
                <div style='${sectionHeader}'>TREASURE</div>
                <div style='${box} margin-bottom: 4px; line-height: 2em;'>
                    &nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
                </div>
                <table style='width: 100%; border-collapse: collapse; font-size: 0.85em;'>
                    ${coinRows}
                </table>
            </div>
        </div>

        <!-- Footer -->
        <hr style='margin-top: 12px; border-color: #ccc;'>
        <p style='font-size: 0.8em; color: #666; margin: 4px 0;'>${sheet.footer}</p>
        </div>
    `;
}

/**
 * Open a character sheet in a new print tab
 * @param {string} html - Rendered character sheet HTML
 * @param {string} printTitle - Title for the new tab
 * @param {boolean} autoPrint - Whether to auto-open print dialog
 */
function openCharacterInPrintTab(html, printTitle, autoPrint = false) {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${printTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .print-controls { background: #f0f0f0; border-bottom: 2px solid #333; padding: 10px 0; margin-bottom: 20px; display: flex; gap: 10px; align-items: center; }
                    .print-controls button { padding: 8px 16px; font-size: 14px; font-weight: bold; border: none; border-radius: 3px; cursor: pointer; }
                    .btn-print { background-color: #4CAF50; color: white; }
                    .btn-print:hover { background-color: #45a049; }
                    .btn-close { background-color: #ccc; color: #333; }
                    .btn-close:hover { background-color: #bbb; }
                    .print-hint { color: #666; font-size: 0.85em; font-style: italic; }
                    @media print {
                        .print-controls { display: none !important; }
                        body { margin: 0; padding: 0; }
                        @page { size: letter; margin: 0.5in; }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    }
                </style>
            </head>
            <body>
                <div class="print-controls">
                    <button class="btn-print" onclick="window.print()">🖨 Print / Save as PDF</button>
                    <button class="btn-close" onclick="window.close()">✕ Close</button>
                    <span class="print-hint">Tip: In the print dialog, choose "Save as PDF" and set margins to None or Minimum</span>
                </div>
                ${html}
                ${autoPrint ? `<script>window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 400); });<\/script>` : ''}
            </body>
            </html>
        `);
        newWindow.document.close();
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
        openCharacterInPrintTab(html, sheet.printTitle, sheet.autoPrint);
        if (targetInfo) {
            targetInfo.innerHTML = '<p style="text-align: center;">Character opened in new tab.</p>';
        }
        if (targetDisplay) {
            targetDisplay.classList.add('visible');
        }
    } else {
        if (targetInfo) {
            // Inject print button above the character sheet
            const printBarHTML = `
                <div class='ose-print-bar' style='margin-bottom: 12px; padding: 8px 12px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; gap: 10px; border: 1px solid #ddd;'>
                    <button id='openPrintTabBtn' style='padding: 7px 16px; font-size: 13px; font-weight: bold; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;'>🖨 Print / Save as PDF</button>
                    <span style='color: #666; font-size: 0.85em; font-style: italic;'>Tip: In the print dialog, choose "Save as PDF" and set margins to None or Minimum</span>
                </div>
            `;
            targetInfo.innerHTML = printBarHTML + html;

            // Attach event listener to button (after it's in the DOM)
            const btn = targetInfo.querySelector('#openPrintTabBtn');
            if (btn) {
                btn.addEventListener('click', () => {
                    window.print();
                });
            }
        }
        if (targetDisplay) {
            targetDisplay.classList.add('visible');
            targetDisplay.scrollIntoView({ behavior: 'smooth' });
        }
    }
}
