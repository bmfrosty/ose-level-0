# Cline Notes

## Git Commands
- Always use `git --no-pager diff` to avoid pager issues
- Always use `git --no-pager log` to avoid pager issues

## Development Environment

- **OS:** Bazzite (immutable Fedora-based)
- **Container:** Uses distrobox with Fedora container for Node.js development
- **Node.js:** Installed in distrobox container
- **Package Manager:** npm (in distrobox)

### Important: Node.js Commands Must Run in Distrobox

**All Node.js commands (including tests) must be run inside the distrobox container.**

The `generate-pdf.sh` script automatically detects Bazzite and enters the distrobox container if needed. However, when running Node.js commands directly (like tests), you must manually enter distrobox first:

```bash
# Enter distrobox
distrobox enter fedora

# Then run Node.js commands
node -e "..."
npm test
npm rebuild canvas
```

**Why:** The `canvas` npm module is a native Node.js addon that must be compiled for the specific Node.js version. On Bazzite (immutable OS), Node.js runs in distrobox, so the canvas module must be rebuilt inside distrobox whenever the Node.js version changes.

**If you see "NODE_MODULE_VERSION" errors:** This means the canvas module was compiled for a different Node.js version. Run `npm rebuild canvas` inside distrobox to fix it.
