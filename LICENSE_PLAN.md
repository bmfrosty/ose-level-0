# LICENSE_PLAN.md
# Necrotic Gnome "Designed for Use With Old-School Essentials" — Compliance Plan

This document tracks what this project must do to comply with the
[Necrotic Gnome Third-Party License](https://necroticgnome.com/pages/licences)
for products designed for use with **Old-School Essentials**.

---

## ✅ Already Compliant

| Requirement | Status | Notes |
|---|---|---|
| Product title does not include "Old-School Essentials" or "OSE" as the title itself | ✅ | Tool is titled informally; the HTML pages say "OLD-SCHOOL ESSENTIALS" as a *subtitle/header*, not a product name |
| Not claiming to be an official release | ✅ | No such claim exists |
| Not claiming affiliation with or approval by Necrotic Gnome | ✅ | No such claim exists |
| No replication of Player Characters or Adventuring text from OSE core | ✅ | Project generates characters algorithmically; no OSE text copied |
| Rules compatibility — mechanics are compatible with OSE rules | ✅ | The tool implements OSE stat blocks, saving throws, HP, classes, etc. |
| References to classes, spells, monsters, etc. by name | ✅ | Permitted under this license |

---

## 🔲 Action Items Required

### 1. Legal Text
**Requirement:** The product's legal text must contain:
> "Old-School Essentials is a trademark of Necrotic Gnome. The trademark and
> Old-School Essentials logo are used with permission of Necrotic Gnome, under license."

- [ ] Add this required legal text to the site footer or a dedicated `/legal` page.
- [ ] The text should appear on every page (`index.html`, `basic.html`, `advanced.html`, `0level.html`) — either inline in the footer or via a linked "Legal" page.

---

### 2. "Designed for Use With Old-School Essentials" Logo
**Requirement:** The logo must appear somewhere on the product's cover (front or back).
- For a web tool, the equivalent is the main landing page (`index.html`).

- [ ] Add one of the `Designed*.png` logo images to `index.html` (and optionally to `basic.html`, `advanced.html`, `0level.html`).
- [ ] Logo must be **smaller** than the page/product title.
- [ ] Logo must **not** be colourised, made transparent, or have its aspect ratio altered.
- [ ] Logo must **not** form part of the product's title (keep it separate from the main heading).

Suggested placement: footer of `index.html`, below the navigation links.

---

### 3. "Requires Old-School Essentials" Statement
**Requirement:** Must state "Requires Old-School Essentials" on the back cover (or introductory text for a web product).

- [ ] Add "Requires Old-School Essentials" text to `index.html` (main landing page) and/or the footer of all pages.
- [ ] Optionally specify the flavour, e.g. "Requires Old-School Essentials Classic Fantasy or Advanced Fantasy".

---

### 4. Trade Dress
**Requirement:** Must use trade dress *distinct* from official OSE products.

- [ ] Verify that fonts, colours, layout, and cover design are clearly different from official Necrotic Gnome OSE books.
- [ ] The current web-based design (dark background, button grid, etc.) is likely sufficiently distinct, but should be reviewed.
- [ ] Consider adding a note in the credits: *"Layout inspired by Old-School Essentials by Necrotic Gnome"* (optional but encouraged if following OSE two-page layout conventions).

---

### 5. Complimentary Copy to Necrotic Gnome
**Requirement:** After publication, provide one copy (print or PDF) to Necrotic Gnome.

- [ ] Once the tool is considered "published" / publicly released, email a link or PDF export to **summon@necroticgnome.com**.

---

## 📋 Suggested Footer / Legal Snippet

Add something like this to each page's `<footer>` section:

```html
<footer>
  <img src="Designed_for_use_with_OSE.png" alt="Designed for use with Old-School Essentials"
       style="height: 40px; width: auto;">
  <p>Requires Old-School Essentials</p>
  <p class="legal">
    Old-School Essentials is a trademark of Necrotic Gnome. The trademark and
    Old-School Essentials logo are used with permission of Necrotic Gnome, under license.
  </p>
</footer>
```

---

## 📁 Logo Assets

The following logo files have been added to the repository:
- `Designed*.png` — "Designed for Use With Old-School Essentials" logo(s)

Use the light or dark version as appropriate for the page background.

---

## 🔗 Reference

Full license text: https://necroticgnome.com/pages/licences
Contact for complimentary copy: summon@necroticgnome.com
