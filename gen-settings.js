/**
 * gen-settings.js
 * Lightweight localStorage-based settings persistence.
 * Used by all three generator pages (0level, basic, advanced).
 */

const PREFIX = 'ose_settings_';

/**
 * Save settings for a given page key.
 * @param {string} pageKey - e.g. 'basic', 'advanced', '0level'
 * @param {Object} values  - plain object of setting values
 */
export function saveSettings(pageKey, values) {
    try {
        localStorage.setItem(PREFIX + pageKey, JSON.stringify(values));
    } catch (e) {
        console.warn('OSE: could not save settings:', e);
    }
}

/**
 * Load settings for a given page key.
 * @param {string} pageKey
 * @returns {Object|null} - parsed settings object, or null if nothing saved
 */
export function loadSettings(pageKey) {
    try {
        const raw = localStorage.getItem(PREFIX + pageKey);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn('OSE: could not load settings:', e);
        return null;
    }
}

/**
 * Clear saved settings for a given page key.
 * @param {string} pageKey
 */
export function clearSettings(pageKey) {
    try {
        localStorage.removeItem(PREFIX + pageKey);
    } catch (e) {
        console.warn('OSE: could not clear settings:', e);
    }
}
