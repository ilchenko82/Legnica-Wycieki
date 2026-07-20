# SOP: Create and Maintain English Localization

## Goal
To programmatically generate and maintain the English version of the WyciekiPro website without manually duplicating layout efforts, ensuring SEO best practices and preventing path errors.

## Inputs
- Fully finalized Polish HTML files in the root directory.
- `execution/setup_en_structure.py` script.

## Process
1. **Finalize Polish Version First:** Ensure all structural changes to the HTML design, CSS, and JS are finalized in the root Polish `.html` files.
2. **Run Execution Script:** Execute `python execution/setup_en_structure.py`. This script will:
   - Create the `en/` folder if it doesn't exist.
   - Parse all `.html` files in the root directory.
   - Inject `<link rel="alternate" hreflang="...">` tags into both root and `en/` files for SEO.
   - Convert `href` and `src` paths in the `en/` files to refer to the parent directory (`../css/`, `../js/`, `../images/`).
   - Re-route the `PL | EN` language switcher buttons to `<a href="...">` tags with correct paths.
3. **Translate Content:** Open the generated `en/*.html` files and translate text content inside tags. DO NOT change the HTML structure.
4. **Localize Images (Optional but recommended):** Copy key SEO images to `images/en/` and rename them. Update the `src` references in `en/*.html`.

## Outputs
- Root HTML files with injected `hreflang` tags and working `PL | EN` switches.
- `en/` directory containing structurally identical, path-corrected HTML files ready for English translation.

## Edge Cases
- **Anchor Links:** `href="#contact"` should remain `#contact`, the script must not prepend `../` to it.
- **External Links:** `href="https://..."` should remain untouched.
- **Canonical URLs:** The script must update `<link rel="canonical" href="https://wyciekipro.pl/">` to `<link rel="canonical" href="https://wyciekipro.pl/en/">`.
