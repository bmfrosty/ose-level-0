#!/usr/bin/env node
// fix-md-tables.js — reformat markdown table column widths to be uniform
// Usage: node fix-md-tables.js file.md [file2.md ...]
//        node fix-md-tables.js --check file.md   (exit 1 if any table would change)

import { readFileSync, writeFileSync } from 'fs';

const CHECK = process.argv[2] === '--check';
const files = CHECK ? process.argv.slice(3) : process.argv.slice(2);

if (!files.length) {
    console.error('Usage: fix-md-tables.js [--check] <file.md> [...]');
    process.exit(1);
}

// Split a raw markdown table row into cell strings (trim surrounding spaces).
function splitRow(line) {
    // strip leading/trailing pipe then split
    const inner = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
    return inner.split('|').map(c => c.trim());
}

// True if every cell in the row is made up only of hyphens, colons, and spaces.
function isSeparatorRow(cells) {
    return cells.every(c => /^:?-+:?$/.test(c));
}

// Rebuild a separator cell that preserves alignment markers (: chars).
function makeSep(cell, width) {
    if (cell.startsWith(':') && cell.endsWith(':')) return ':' + '-'.repeat(Math.max(1, width - 2)) + ':';
    if (cell.endsWith(':'))                          return '-'.repeat(Math.max(1, width - 1)) + ':';
    if (cell.startsWith(':'))                        return ':' + '-'.repeat(Math.max(1, width - 1));
    return '-'.repeat(Math.max(1, width));
}

function formatTable(lines) {
    const rows = lines.map(splitRow);
    const cols = Math.max(...rows.map(r => r.length));

    // Pad all rows to the same column count.
    for (const row of rows) {
        while (row.length < cols) row.push('');
    }

    // Compute max display width per column (separator rows treated as width 3 minimum).
    const widths = Array.from({ length: cols }, (_, ci) => {
        return Math.max(3, ...rows.map((row, ri) => {
            if (isSeparatorRow(row)) return 3;
            return row[ci].length;
        }));
    });

    return rows.map(row => {
        if (isSeparatorRow(row)) {
            return '| ' + row.map((c, i) => makeSep(c, widths[i])).join(' | ') + ' |';
        }
        return '| ' + row.map((c, i) => c.padEnd(widths[i])).join(' | ') + ' |';
    }).join('\n');
}

// Scan text for markdown tables, reformat each one, return updated text.
function fixTables(text) {
    const lines = text.split('\n');
    const out = [];
    let tableStart = -1;
    let tableLines = [];

    function flush() {
        if (tableLines.length >= 2) {
            out.push(formatTable(tableLines));
        } else {
            tableLines.forEach(l => out.push(l));
        }
        tableLines = [];
        tableStart = -1;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isTableLine = /^\s*\|/.test(line);

        if (isTableLine) {
            tableLines.push(line);
        } else {
            if (tableLines.length) flush();
            out.push(line);
        }
    }
    if (tableLines.length) flush();

    return out.join('\n');
}

let anyChanged = false;

for (const file of files) {
    let original;
    try {
        original = readFileSync(file, 'utf8');
    } catch (e) {
        console.error(`Cannot read ${file}: ${e.message}`);
        process.exit(1);
    }

    const fixed = fixTables(original);

    if (fixed === original) {
        if (!CHECK) console.log(`${file}: no changes`);
        continue;
    }

    anyChanged = true;

    if (CHECK) {
        console.log(`${file}: would be reformatted`);
    } else {
        writeFileSync(file, fixed, 'utf8');
        console.log(`${file}: reformatted`);
    }
}

if (CHECK && anyChanged) process.exit(1);
