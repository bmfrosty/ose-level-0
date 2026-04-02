/**
 * cs-url-codec.js
 *
 * URL codec helpers: gzip compress/decompress via the browser's native
 * CompressionStream API.  Shared by cs-sheet-renderer.js and cs-sheet-page.js
 * so neither file needs its own copy.
 */

/**
 * Gzip-compress a string and return a URL-safe Base64 string
 * (base64url, no padding).
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
