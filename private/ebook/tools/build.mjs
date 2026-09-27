// Builds, from source/book-en.html:
//   1. the full PDF       -> private/ebook/Breathing-And-Relaxation-2nd-Edition-EN.pdf  (sold, never public)
//   2. the free sample    -> ebook/Breathing-And-Relaxation-Free-Sample-EN.pdf          (public, on the website)
//   3. the EPUB for Kindle -> private/ebook/Breathing-And-Relaxation-2nd-Edition-EN.epub
// Usage (Windows, from this folder): npm install, then npm run build
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { randomUUID } from 'crypto';
import JSZip from 'jszip';
import { XMLValidator } from 'fast-xml-parser';

const here = dirname(fileURLToPath(import.meta.url));
const ebookDir = resolve(here, '..');
const siteDir = resolve(ebookDir, '..', '..');
const sourcePath = join(ebookDir, 'source', 'book-en.html');
const buildDir = join(ebookDir, 'build');
const coverPath = join(ebookDir, 'cover', 'cover-2560x1600.jpg');
const SITE_URL = process.env.BOOK_SITE_URL || 'the Breathe & Relax website';
const BASE_NAME = 'Breathing-And-Relaxation-2nd-Edition-EN';

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find(existsSync);

if (!existsSync(buildDir)) mkdirSync(buildDir);
const source = readFileSync(sourcePath, 'utf8');

const printPdf = (htmlPath, pdfPath) => {
  if (!EDGE) throw new Error('Microsoft Edge not found: it is used to print the PDF.');
  execFileSync(EDGE, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    `--user-data-dir=${join(buildDir, 'edge-profile')}`,
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: 'ignore' });
  console.log(`PDF   ${pdfPath}`);
};

// ---------- 1. Full PDF ----------
printPdf(sourcePath, join(ebookDir, `${BASE_NAME}.pdf`));

// ---------- 2. Free sample: introduction + chapters 1 and 2 ----------
const cutAt = source.indexOf('<h2 class="chapter" id="ch3">');
const endBody = source.indexOf('</body>');
const keptIds = new Set(['intro', 'part1', 'ch1', 'ch2']);
let sample = source.slice(0, cutAt) + `
<h2 class="chapter" id="continue"><span>End of the free sample</span>Continue Reading</h2>
<p>You have just read the introduction and the first two chapters of <em>Breathing and Relaxation: The Lost Innate Science</em>.</p>
<p>The full book continues with:</p>
<ul>
  <li>The role of breathing in the Relaxation Response, with four practical techniques</li>
  <li>The Russian Systema approach: its four pillars, its breathing techniques and relaxation practices</li>
  <li>Three classic Systema drills</li>
  <li>Emotional regulation, support for people living with chronic diseases, and daily routines</li>
  <li>High-stress environments and the future of mind-body medicine</li>
  <li>A 7-day starter plan, safety guidelines and scientific references</li>
</ul>
<div class="box"><h4>Get the full book</h4><p>Available on Amazon Kindle and on ${SITE_URL}.</p></div>
` + source.slice(endBody);
// Contents entries for chapters not in the sample keep their title but lose the dead link.
sample = sample.replace(/<a href="#([\w-]+)">([\s\S]*?)<\/a>/g, (match, id, text) => (keptIds.has(id) ? match : text));
sample = sample
  .replace('<div class="edition">Second edition</div>', '<div class="edition">Second edition · Free sample</div>')
  .replace('<title>Breathing and Relaxation: The Lost Innate Science</title>', '<title>Breathing and Relaxation: The Lost Innate Science (Free Sample)</title>');
const samplePath = join(buildDir, 'sample-en.html');
writeFileSync(samplePath, sample.replace('src="../cover/', 'src="../cover/'));
printPdf(samplePath, join(siteDir, 'ebook', 'Breathing-And-Relaxation-Free-Sample-EN.pdf'));

// ---------- 3. EPUB 3 ----------
const bodyHtml = source.slice(source.indexOf('<body>') + 6, endBody);
const toXhtml = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*>/g, '<br/>')
    .replace(/<(img|hr|meta|input)([^>]*?)\s*>/g, (m, tag, attrs) => (attrs.endsWith('/') ? m : `<${tag}${attrs}/>`))
    .replace(/&nbsp;/g, '&#160;');

// Front matter: title page and copyright (the cover image and the printed contents are replaced by EPUB features).
const frontSections = [...bodyHtml.matchAll(/<section class="front[^"]*"[^>]*>[\s\S]*?<\/section>/g)]
  .map((m) => m[0])
  .filter((s) => !s.includes('class="front toc"'));

// Main content: split before each part or chapter heading.
const mainStart = bodyHtml.indexOf('<h2 class="chapter" id="intro">');
const pieces = bodyHtml.slice(mainStart).split(/(?=<h2 class="(?:part|chapter)" id=")/).filter((p) => p.trim());

const docs = [];
docs.push({ id: 'front', title: 'Title page', html: frontSections.join('\n') });
for (const piece of pieces) {
  const id = piece.match(/id="([\w-]+)"/)[1];
  const heading = piece.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)[1];
  const title = heading.replace(/<span>[\s\S]*?<\/span>/, '').replace(/<[^>]+>/g, '').trim();
  const label = (heading.match(/<span>([\s\S]*?)<\/span>/) || [])[1];
  const isPart = piece.startsWith('<h2 class="part"');
  docs.push({ id, title: label && !label.startsWith('New in') ? `${label}: ${title}` : title, html: piece, isPart });
}

const epubCss = `
body { font-family: Georgia, serif; line-height: 1.5; margin: 0 5%; }
h2 { color: #1b4d57; margin: 1.5em 0 0.8em; line-height: 1.25; }
h2 span { display: block; font-size: 0.6em; letter-spacing: 0.12em; text-transform: uppercase; color: #6b9aa2; }
h2.part { text-align: center; margin-top: 30%; }
h3 { color: #24606b; margin: 1.2em 0 0.4em; }
p { margin: 0 0 0.7em; text-align: justify; }
.box { border: 1px solid #b9d6db; background: #f1f8f9; padding: 0.6em 0.8em; margin: 1em 0; }
.box.warning { border-color: #e7c07a; background: #fdf7ea; }
.new { font-size: 0.7em; letter-spacing: 0.08em; text-transform: uppercase; color: #8a5a00; display: block; }
table { border-collapse: collapse; width: 100%; font-size: 0.85em; }
th, td { border: 1px solid #c9dde0; padding: 0.3em; vertical-align: top; }
.title-page { text-align: center; margin-top: 25%; }
.title-page h1 { color: #1b4d57; }
.small { font-size: 0.85em; }
`;

const xhtmlPage = (title, content) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head><meta charset="UTF-8"/><title>${title}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
${content}
</body>
</html>`;

const escapeXml = (s) => s.replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');

const zip = new JSZip();
zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`);

const files = {};
files['OEBPS/style.css'] = epubCss;
files['OEBPS/cover.xhtml'] = xhtmlPage('Cover', '<div style="text-align:center"><img src="cover.jpg" alt="Breathing and Relaxation: The Lost Innate Science" style="max-width:100%;height:auto"/></div>');
for (const doc of docs) {
  // Internal links "#chX" must point to the chapter file in the EPUB.
  const content = toXhtml(doc.html).replace(/href="#([\w-]+)"/g, (m, target) =>
    docs.some((d) => d.id === target) ? `href="${target}.xhtml"` : m
  );
  files[`OEBPS/${doc.id}.xhtml`] = xhtmlPage(escapeXml(doc.title), content);
}
const navItems = docs
  .filter((d) => d.id !== 'front')
  .map((d) => `      <li><a href="${d.id}.xhtml">${escapeXml(d.title)}</a></li>`)
  .join('\n');
files['OEBPS/nav.xhtml'] = xhtmlPage('Contents', `<nav epub:type="toc" id="toc"><h2>Contents</h2><ol>\n${navItems}\n    </ol></nav>`);

const modified = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
files['OEBPS/content.opf'] = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${randomUUID()}</dc:identifier>
    <dc:title>Breathing and Relaxation: The Lost Innate Science</dc:title>
    <dc:creator>Mohamed Hassan Bouazzaoui</dc:creator>
    <dc:language>en</dc:language>
    <dc:rights>© 2026 Mohamed Hassan Bouazzaoui. All rights reserved.</dc:rights>
    <meta property="dcterms:modified">${modified}</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="style.css" media-type="text/css"/>
    <item id="cover-image" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
${docs.map((d) => `    <item id="${d.id}" href="${d.id}.xhtml" media-type="application/xhtml+xml"/>`).join('\n')}
  </manifest>
  <spine>
    <itemref idref="cover" linear="yes"/>
${docs.map((d) => `    <itemref idref="${d.id}"/>`).join('\n')}
  </spine>
</package>`;

// Every XHTML/XML file must be well-formed, or Kindle rejects the book.
let errors = 0;
for (const [name, content] of Object.entries(files)) {
  zip.file(name, content);
  if (name.endsWith('.css')) continue;
  const result = XMLValidator.validate(content.replace(/<!DOCTYPE html>/, ''));
  if (result !== true) {
    errors += 1;
    console.error(`INVALID ${name}: ${result.err.msg} (line ${result.err.line})`);
  }
}
zip.file('OEBPS/cover.jpg', readFileSync(coverPath));
if (errors) throw new Error(`${errors} invalid EPUB file(s)`);

const epubPath = join(ebookDir, `${BASE_NAME}.epub`);
const buffer = await zip.generateAsync({ type: 'nodebuffer', mimeType: 'application/epub+zip', compression: 'DEFLATE' });
writeFileSync(epubPath, buffer);
console.log(`EPUB  ${epubPath} (${docs.length} sections, all well-formed)`);
