// Builds, for each language (source/book-<lang>.html):
//   1. the cover           -> cover/cover-<lang>.jpg (English keeps cover/cover-2560x1600.jpg), from cover/cover.html
//   2. the full PDF        -> private/ebook/<base>.pdf   (sold, never public)
//   3. the free sample     -> ebook/<sample>.pdf          (public, on the website)
//   4. the EPUB for Kindle -> private/ebook/<base>.epub
// Usage (Windows, from this folder): npm install, then npm run build           (all languages)
//                                                     npm run build -- fr es   (some languages)
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
const buildDir = join(ebookDir, 'build');
const coverDir = join(ebookDir, 'cover');
const SITE_URL = process.env.BOOK_SITE_URL || '';

// Everything that differs between languages, outside the book text itself.
export const LANGS = {
  en: {
    base: 'Breathing-And-Relaxation-2nd-Edition-EN',
    sample: 'Breathing-And-Relaxation-Free-Sample-EN',
    cover: 'cover-2560x1600.jpg',
    title: 'Breathing and Relaxation: The Lost Innate Science',
    author: 'Mohamed Hassan Bouazzaoui',
    rights: '© 2026 Mohamed Hassan Bouazzaoui. All rights reserved.',
    edition: 'Second edition',
    sampleEdition: 'Second edition · Free sample',
    sampleTitleSuffix: ' (Free Sample)',
    titlePage: 'Title page',
    contents: 'Contents',
    coverAlt: 'Book cover',
    newLabel: 'New in',
    website: 'the Breathe & Relax website',
    sampleEnd: {
      kicker: 'End of the free sample',
      heading: 'Continue Reading',
      intro: 'You have just read the introduction and the first two chapters of <em>Breathing and Relaxation: The Lost Innate Science</em>.',
      next: 'The full book continues with:',
      items: [
        'The role of breathing in the Relaxation Response, with four practical techniques',
        'The Russian Systema approach: its four pillars, its breathing techniques and relaxation practices',
        'Three classic Systema drills',
        'Emotional regulation, support for people living with chronic diseases, and daily routines',
        'High-stress environments and the future of mind-body medicine',
        'A 7-day starter plan, safety guidelines and scientific references',
      ],
      boxTitle: 'Get the full book',
      boxText: (site) => `Available on Amazon Kindle and on ${site}.`,
    },
  },
  fr: {
    base: 'Respiration-et-Relaxation-2e-Edition-FR',
    sample: 'Respiration-et-Relaxation-Extrait-Gratuit-FR',
    cover: 'cover-fr.jpg',
    title: 'Respiration et relaxation : la science innée oubliée',
    author: 'Mohamed Hassan Bouazzaoui',
    rights: '© 2026 Mohamed Hassan Bouazzaoui. Tous droits réservés.',
    edition: 'Deuxième édition',
    sampleEdition: 'Deuxième édition · Extrait gratuit',
    sampleTitleSuffix: ' (extrait gratuit)',
    titlePage: 'Page de titre',
    contents: 'Table des matières',
    coverAlt: 'Couverture du livre',
    newLabel: 'Nouveau dans',
    website: 'le site Breathe & Relax',
    coverText: {
      kicker: 'Deuxième édition',
      title: 'RESPIRATION<br>ET<br>RELAXATION',
      titleSize: 158,
      subtitle: 'La science innée oubliée',
      tagline: 'La réponse de relaxation · Systema russe',
    },
    sampleEnd: {
      kicker: 'Fin de l’extrait gratuit',
      heading: 'Poursuivre la lecture',
      intro: 'Vous venez de lire l’introduction et les deux premiers chapitres de <em>Respiration et relaxation : la science innée oubliée</em>.',
      next: 'Le livre complet continue avec :',
      items: [
        'Le rôle de la respiration dans la réponse de relaxation, avec quatre techniques pratiques',
        'L’approche du Systema russe : ses quatre piliers, ses techniques de respiration et ses pratiques de relaxation',
        'Trois exercices classiques du Systema',
        'La régulation des émotions, l’accompagnement des maladies chroniques et des routines quotidiennes',
        'Les environnements à fort stress et l’avenir de la médecine corps-esprit',
        'Un programme de démarrage en 7 jours, des consignes de sécurité et des références scientifiques',
      ],
      boxTitle: 'Obtenir le livre complet',
      boxText: (site) => `Disponible sur Amazon Kindle et sur ${site}.`,
    },
  },
  es: {
    base: 'Respiracion-y-Relajacion-2a-Edicion-ES',
    sample: 'Respiracion-y-Relajacion-Muestra-Gratis-ES',
    cover: 'cover-es.jpg',
    title: 'Respiración y relajación: la ciencia innata olvidada',
    author: 'Mohamed Hassan Bouazzaoui',
    rights: '© 2026 Mohamed Hassan Bouazzaoui. Todos los derechos reservados.',
    edition: 'Segunda edición',
    sampleEdition: 'Segunda edición · Muestra gratuita',
    sampleTitleSuffix: ' (muestra gratuita)',
    titlePage: 'Portadilla',
    contents: 'Índice',
    coverAlt: 'Portada del libro',
    newLabel: 'Novedad',
    website: 'el sitio web Breathe & Relax',
    coverText: {
      kicker: 'Segunda edición',
      title: 'RESPIRACIÓN<br>Y<br>RELAJACIÓN',
      titleSize: 158,
      subtitle: 'La ciencia innata olvidada',
      tagline: 'La respuesta de relajación · Systema ruso',
    },
    sampleEnd: {
      kicker: 'Fin de la muestra gratuita',
      heading: 'Siga leyendo',
      intro: 'Acaba de leer la introducción y los dos primeros capítulos de <em>Respiración y relajación: la ciencia innata olvidada</em>.',
      next: 'El libro completo continúa con:',
      items: [
        'El papel de la respiración en la respuesta de relajación, con cuatro técnicas prácticas',
        'El enfoque del Systema ruso: sus cuatro pilares, sus técnicas de respiración y sus prácticas de relajación',
        'Tres ejercicios clásicos del Systema',
        'La regulación emocional, el apoyo a las personas con enfermedades crónicas y rutinas diarias',
        'Los entornos de alto estrés y el futuro de la medicina mente-cuerpo',
        'Un plan de inicio de 7 días, pautas de seguridad y referencias científicas',
      ],
      boxTitle: 'Consiga el libro completo',
      boxText: (site) => `Disponible en Amazon Kindle y en ${site}.`,
    },
  },
  ar: {
    base: 'Breathing-And-Relaxation-2nd-Edition-AR',
    sample: 'Breathing-And-Relaxation-Free-Sample-AR',
    cover: 'cover-ar.jpg',
    title: 'التنفّس والاسترخاء: العلم الفطري المنسي',
    author: 'محمد حسن بوعزاوي',
    rights: '© 2026 محمد حسن بوعزاوي. جميع الحقوق محفوظة.',
    edition: 'الطبعة الثانية',
    sampleEdition: 'الطبعة الثانية · مقتطف مجاني',
    sampleTitleSuffix: ' (مقتطف مجاني)',
    titlePage: 'صفحة العنوان',
    contents: 'المحتويات',
    coverAlt: 'غلاف الكتاب',
    newLabel: 'جديد في',
    website: 'موقع Breathe & Relax',
    rtl: true,
    coverText: {
      kicker: 'الطبعة الثانية',
      title: 'التنفّس<br>والاسترخاء',
      titleSize: 210,
      subtitle: 'العلم الفطري المنسي',
      tagline: 'استجابة الاسترخاء · السيستيما الروسية',
    },
    sampleEnd: {
      kicker: 'نهاية المقتطف المجاني',
      heading: 'تابع القراءة',
      intro: 'قرأت للتو المقدمة والفصلين الأولين من كتاب <em>التنفّس والاسترخاء: العلم الفطري المنسي</em>.',
      next: 'ويتابع الكتاب الكامل مع:',
      items: [
        'دور التنفّس في استجابة الاسترخاء، مع أربع تقنيات عملية',
        'منهج السيستيما الروسية: ركائزه الأربع وتقنيات التنفّس وممارسات الاسترخاء',
        'ثلاثة تمارين كلاسيكية في السيستيما',
        'تنظيم المشاعر، ودعم المصابين بالأمراض المزمنة، والروتين اليومي',
        'البيئات شديدة التوتر ومستقبل طب العقل والجسد',
        'خطة للبدء في 7 أيام، وإرشادات السلامة، والمراجع العلمية',
      ],
      boxTitle: 'احصل على الكتاب الكامل',
      boxText: (site) => `متوفر على Amazon Kindle وعلى ${site}.`,
    },
  },
};

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find(existsSync);

const edge = (args) => {
  if (!EDGE) throw new Error('Microsoft Edge not found: it is used to print the PDF and render the covers.');
  execFileSync(EDGE, ['--headless=new', '--disable-gpu', `--user-data-dir=${join(buildDir, 'edge-profile')}`, ...args], { stdio: 'ignore' });
};

const printPdf = (htmlPath, pdfPath) => {
  edge(['--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href]);
  console.log(`PDF   ${pdfPath}`);
};

// ---------- Cover: same design as cover.html, with the text of the language ----------
const buildCover = (lang, cfg) => {
  const t = cfg.coverText;
  if (!t) return; // English: the original cover is kept as is.
  let html = readFileSync(join(coverDir, 'cover.html'), 'utf8')
    .replace('<html lang="en">', `<html lang="${lang}"${cfg.rtl ? ' dir="rtl"' : ''}>`)
    .replace('<div class="kicker">Second edition</div>', `<div class="kicker">${t.kicker}</div>`)
    .replace('<h1>BREATHING<br>AND<br>RELAXATION</h1>', `<h1>${t.title}</h1>`)
    .replace('<div class="subtitle">The Lost Innate Science</div>', `<div class="subtitle">${t.subtitle}</div>`)
    .replace('<div class="tagline">The Relaxation Response · Russian Systema</div>', `<div class="tagline">${t.tagline}</div>`)
    .replace('<div class="author">Mohamed Hassan Bouazzaoui</div>', `<div class="author">${cfg.author}</div>`);
  // Arabic letters must stay joined: no letter spacing, no italics, and an Arabic-capable font.
  const extra = cfg.rtl
    ? `h1 { font-size: ${t.titleSize}px; letter-spacing: 0; line-height: 1.25; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
  .kicker, .tagline { letter-spacing: 0; }
  .subtitle, .author { font-style: normal; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; letter-spacing: 0; }`
    : `h1 { font-size: ${t.titleSize}px; letter-spacing: 3px; }`;
  html = html.replace('</style>', `  ${extra}\n</style>`);
  const htmlPath = join(buildDir, `cover-${lang}.html`);
  const pngPath = join(buildDir, `cover-${lang}.png`);
  writeFileSync(htmlPath, html);
  edge(['--hide-scrollbars', '--window-size=1600,2560', `--screenshot=${pngPath}`, pathToFileURL(htmlPath).href]);
  // PNG -> JPEG (quality 90) with the .NET imaging library built into Windows.
  const jpgPath = join(coverDir, cfg.cover);
  const ps = `Add-Type -AssemblyName System.Drawing; $img = [System.Drawing.Image]::FromFile('${pngPath}');
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' };
$p = New-Object System.Drawing.Imaging.EncoderParameters(1);
$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90);
$img.Save('${jpgPath}', $enc, $p); $img.Dispose()`;
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { stdio: 'inherit' });
  console.log(`COVER ${jpgPath}`);
};

const buildLanguage = async (lang, cfg) => {
  const sourcePath = join(ebookDir, 'source', `book-${lang}.html`);
  const source = readFileSync(sourcePath, 'utf8');
  const site = SITE_URL || cfg.website;

  buildCover(lang, cfg);

  // ---------- Full PDF ----------
  printPdf(sourcePath, join(ebookDir, `${cfg.base}.pdf`));

  // ---------- Free sample: introduction + chapters 1 and 2 ----------
  const cutAt = source.indexOf('<h2 class="chapter" id="ch3">');
  const endBody = source.indexOf('</body>');
  const keptIds = new Set(['intro', 'part1', 'ch1', 'ch2']);
  const e = cfg.sampleEnd;
  let sample = source.slice(0, cutAt) + `
<h2 class="chapter" id="continue"><span>${e.kicker}</span>${e.heading}</h2>
<p>${e.intro}</p>
<p>${e.next}</p>
<ul>
${e.items.map((item) => `  <li>${item}</li>`).join('\n')}
</ul>
<div class="box"><h4>${e.boxTitle}</h4><p>${e.boxText(site)}</p></div>
` + source.slice(endBody);
  // Contents entries for chapters not in the sample keep their title but lose the dead link.
  sample = sample.replace(/<a href="#([\w-]+)">([\s\S]*?)<\/a>/g, (match, id, text) => (keptIds.has(id) ? match : text));
  sample = sample
    .replace(`<div class="edition">${cfg.edition}</div>`, `<div class="edition">${cfg.sampleEdition}</div>`)
    .replace(/<title>([\s\S]*?)<\/title>/, (m, title) => `<title>${title}${cfg.sampleTitleSuffix}</title>`);
  const samplePath = join(buildDir, `sample-${lang}.html`);
  writeFileSync(samplePath, sample);
  printPdf(samplePath, join(siteDir, 'ebook', `${cfg.sample}.pdf`));

  // ---------- EPUB 3 ----------
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
  docs.push({ id: 'front', title: cfg.titlePage, html: frontSections.join('\n') });
  for (const piece of pieces) {
    const id = piece.match(/id="([\w-]+)"/)[1];
    const heading = piece.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)[1];
    const title = heading.replace(/<span>[\s\S]*?<\/span>/, '').replace(/<[^>]+>/g, '').trim();
    const label = (heading.match(/<span>([\s\S]*?)<\/span>/) || [])[1];
    docs.push({ id, title: label && !label.startsWith(cfg.newLabel) ? `${label}: ${title}` : title, html: piece });
  }

  const dir = cfg.rtl ? 'rtl' : 'ltr';
  const epubCss = `
body { font-family: ${cfg.rtl ? "'Segoe UI', Tahoma, Arial, sans-serif" : 'Georgia, serif'}; line-height: ${cfg.rtl ? 1.7 : 1.5}; margin: 0 5%; }
h2 { color: #1b4d57; margin: 1.5em 0 0.8em; line-height: 1.25; }
h2 span { display: block; font-size: 0.6em; ${cfg.rtl ? '' : 'letter-spacing: 0.12em; text-transform: uppercase; '}color: #6b9aa2; }
h2.part { text-align: center; margin-top: 30%; }
h3 { color: #24606b; margin: 1.2em 0 0.4em; }
p { margin: 0 0 0.7em; text-align: justify; }
.box { border: 1px solid #b9d6db; background: #f1f8f9; padding: 0.6em 0.8em; margin: 1em 0; }
.box.warning { border-color: #e7c07a; background: #fdf7ea; }
.new { font-size: 0.7em; ${cfg.rtl ? '' : 'letter-spacing: 0.08em; text-transform: uppercase; '}color: #8a5a00; display: block; }
table { border-collapse: collapse; width: 100%; font-size: 0.85em; }
th, td { border: 1px solid #c9dde0; padding: 0.3em; vertical-align: top; text-align: ${cfg.rtl ? 'right' : 'left'}; }
.refs { direction: ltr; text-align: left; }
.title-page { text-align: center; margin-top: 25%; }
.title-page h1 { color: #1b4d57; }
.small { font-size: 0.85em; }
`;

  const xhtmlPage = (title, content) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}" dir="${dir}">
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
  files['OEBPS/cover.xhtml'] = xhtmlPage('Cover', `<div style="text-align:center"><img src="cover.jpg" alt="${escapeXml(cfg.coverAlt)}" style="max-width:100%;height:auto"/></div>`);
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
  files['OEBPS/nav.xhtml'] = xhtmlPage(escapeXml(cfg.contents), `<nav epub:type="toc" id="toc"><h2>${escapeXml(cfg.contents)}</h2><ol>\n${navItems}\n    </ol></nav>`);

  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  files['OEBPS/content.opf'] = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${lang}"${cfg.rtl ? ' dir="rtl"' : ''}>
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${randomUUID()}</dc:identifier>
    <dc:title>${escapeXml(cfg.title)}</dc:title>
    <dc:creator>${escapeXml(cfg.author)}</dc:creator>
    <dc:language>${lang}</dc:language>
    <dc:rights>${escapeXml(cfg.rights)}</dc:rights>
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
  <spine${cfg.rtl ? ' page-progression-direction="rtl"' : ''}>
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
      console.error(`INVALID ${lang} ${name}: ${result.err.msg} (line ${result.err.line})`);
    }
  }
  zip.file('OEBPS/cover.jpg', readFileSync(join(coverDir, cfg.cover)));
  if (errors) throw new Error(`${errors} invalid EPUB file(s) for ${lang}`);

  const epubPath = join(ebookDir, `${cfg.base}.epub`);
  const buffer = await zip.generateAsync({ type: 'nodebuffer', mimeType: 'application/epub+zip', compression: 'DEFLATE' });
  writeFileSync(epubPath, buffer);
  console.log(`EPUB  ${epubPath} (${docs.length} sections, all well-formed)`);
};

if (!existsSync(buildDir)) mkdirSync(buildDir);
const requested = process.argv.slice(2).filter((a) => LANGS[a]);
for (const lang of requested.length ? requested : Object.keys(LANGS)) {
  console.log(`--- ${lang}`);
  await buildLanguage(lang, LANGS[lang]);
}
