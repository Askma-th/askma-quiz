import { promises as fs } from 'fs';
import https from 'https';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const quizzesDir = path.join(__dirname, '..', 'src', 'content', 'quizzes');
const outDir = path.join(__dirname, '..', 'public', 'og');
const cacheDir = path.join(__dirname, '.twemoji-cache');

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(cacheDir, { recursive: true });

function emojiToCodepoint(emoji) {
  const codepoints = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp === 0xfe0f) continue;
    codepoints.push(cp.toString(16));
  }
  return codepoints.join('-');
}

async function fetchTwemoji(codepoint) {
  const cachePath = path.join(cacheDir, `${codepoint}.svg`);

  try {
    return await fs.readFile(cachePath, 'utf8');
  } catch {
    // not cached
  }

  const url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${codepoint}.svg`;

  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (res.statusCode !== 200) {
          reject(new Error(`Twemoji ${codepoint} not found (${res.statusCode})`));
          return;
        }
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', async () => {
          await fs.writeFile(cachePath, data, 'utf8');
          resolve(data);
        });
      })
      .on('error', reject);
  });
}

function extractSvgInner(svgString) {
  const viewBoxMatch = svgString.match(/viewBox=["']([^"']+)["']/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 36 36';

  const inner = svgString
    .replace(/<\?xml[^>]+\?>/g, '')
    .replace(/<!DOCTYPE[^>]+>/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();

  return { inner, viewBox };
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseGradient(gradStr) {
  if (!gradStr) return { from: '#0d0d1a', to: '#1a1a28' };
  const colors = gradStr.match(/#[0-9a-fA-F]{3,8}/g) || [];
  return {
    from: colors[0] || '#0d0d1a',
    to: colors[1] || '#1a1a28',
  };
}

async function generateSVG({ emoji, title, bgFrom, bgTo, accentColor }) {
  let emojiSvg = '';
  try {
    const codepoint = emojiToCodepoint(emoji);
    const rawSvg = await fetchTwemoji(codepoint);
    const { inner, viewBox } = extractSvgInner(rawSvg);

    const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
    const targetSize = 320;
    const scale = targetSize / Math.max(vbW || 36, vbH || 36);
    const tx = 600 - (vbW || 36) * scale * 0.5;
    const ty = 280 - (vbH || 36) * scale * 0.5;

    emojiSvg = `<g transform="translate(${tx}, ${ty}) scale(${scale})">${inner}</g>`;
  } catch (err) {
    console.warn(`⚠️ Twemoji fetch failed for "${emoji}": ${err.message}`);
    emojiSvg = `<text x="600" y="290" font-size="220" text-anchor="middle" dominant-baseline="middle">${emoji}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgFrom}"/>
      <stop offset="100%" stop-color="${bgTo}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>

  ${emojiSvg}

  <text x="600" y="490" font-size="52" text-anchor="middle" font-family="Sarabun, IBM Plex Sans Thai, sans-serif" font-weight="700" fill="#FFFFFF">${escapeXml(title)}</text>

  <text x="600" y="555" font-size="30" text-anchor="middle" font-family="Sarabun, IBM Plex Sans Thai, sans-serif" font-weight="500" fill="${accentColor}">Askma Quiz</text>
</svg>`;
}

const quizFiles = (await fs.readdir(quizzesDir)).filter(f => f.endsWith('.json'));

for (const file of quizFiles) {
  const slug = file.replace('.json', '');
  const raw = await fs.readFile(path.join(quizzesDir, file), 'utf8');
  const content = JSON.parse(raw);

  const { from, to } = parseGradient(content.theme?.bgGradient);

  const svg = await generateSVG({
    emoji: content.emoji || '⭐',
    title: content.title || 'Askma Quiz',
    bgFrom: from,
    bgTo: to,
    accentColor: content.theme?.accentColor || '#FFD600',
  });

  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, `${slug}.png`));

  console.log(`✅ Generated: og/${slug}.png`);
}

const hubSvg = await generateSVG({
  emoji: '🎯',
  title: 'Askma Quiz',
  bgFrom: '#0d0d1a',
  bgTo: '#2a1a3a',
  accentColor: '#FFD600',
});

await sharp(Buffer.from(hubSvg)).png().toFile(path.join(outDir, 'hub.png'));
console.log('✅ Generated: og/hub.png');

await sharp(Buffer.from(hubSvg)).png().toFile(path.join(outDir, 'default.png'));
console.log('✅ Generated: og/default.png');

console.log('\n✨ All OG images generated in public/og/');
