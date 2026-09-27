# E-book source (2nd edition)

`book-en.html` is the source of `../Breathing-And-Relaxation-2nd-Edition-EN.pdf`.
It is laid out for print (6 × 9 in, page numbers, clickable table of contents).

## What changed from the 1st edition
- OCR errors fixed ("cairn" → "calm", "persona!", "1s", "exerc1ses", "5-IO", "autonomy nervous system"…)
- Consistent structure: 4 parts, 11 numbered chapters, table of contents matching the content;
  the duplicated "Role of Breathing" section and a misplaced chapter announcement removed
- Benson's components clarified; Systema history nuanced (modern system, Ryabko and Vasiliev)
- Case studies relabeled as illustrative composites; overstated medical claims softened
- Added (marked "New in the 2nd edition", to be reviewed by the author): copyright and health
  disclaimer page, "Try it" box, three classic Systema drills, 7-day starter plan, safety page,
  references, about the author, correct PDF metadata (title)

## Rebuild the PDF after editing
From PowerShell, in the site folder:

```powershell
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$src  = (Resolve-Path "ebook\source\book-en.html").Path
& $edge --headless=new --disable-gpu --no-pdf-header-footer `
  "--print-to-pdf=$((Get-Location).Path)\ebook\Breathing-And-Relaxation-2nd-Edition-EN.pdf" ([Uri]$src).AbsoluteUri
```

Translations (French, Arabic, Spanish): copy `book-en.html` to `book-fr.html` (etc.), set `lang`
(and `dir="rtl"` for Arabic) on `<html>`, translate the text and rebuild with the same command.
