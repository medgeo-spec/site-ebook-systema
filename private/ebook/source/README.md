# E-book source (2nd edition, 4 languages)

`book-en.html` is the original; `book-fr.html`, `book-es.html` and `book-ar.html` are translations with the same
structure and ids (Arabic is right-to-left). They are laid out for print (6 × 9 in, page numbers, clickable table of
contents).

## Rebuild after editing
From `private/ebook/tools` (Windows, uses Microsoft Edge):

```powershell
npm install          # once
npm run build        # all languages
npm run build -- fr  # one language
```

For each language this writes the cover (`../cover/cover-<lang>.jpg`, from `../cover/cover.html`), the full PDF and
EPUB (`../`), and the free sample PDF (`ebook/` at the site root). File names are listed in `tools/build.mjs`
(`LANGS`) and in `netlify/functions/ebook-download.mjs` (`EDITIONS`): keep them in sync.

## What changed from the 1st edition
- OCR errors fixed ("cairn" → "calm", "persona!", "1s", "exerc1ses", "5-IO", "autonomy nervous system"…)
- Consistent structure: 4 parts, 11 numbered chapters, table of contents matching the content;
  the duplicated "Role of Breathing" section and a misplaced chapter announcement removed
- Benson's components clarified; Systema history nuanced (modern system, Ryabko and Vasiliev)
- Case studies relabeled as illustrative composites; overstated medical claims softened
- Added: copyright and health disclaimer page, "Try it" box, three classic Systema drills, 7-day starter plan,
  safety page, references, about the author, correct PDF metadata (title)
- November 2026: French, Spanish and Arabic translations of the 2nd edition
