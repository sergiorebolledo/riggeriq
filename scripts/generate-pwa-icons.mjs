// Genera iconos PWA de marcador de posición (monograma "R") a partir de un
// SVG simple. Reemplazar por el logo real de Rigging Pro AI cuando exista.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#18181b"/>
  <text x="256" y="340" font-family="Arial, Helvetica, sans-serif" font-size="280" font-weight="700" fill="#ffffff" text-anchor="middle">R</text>
</svg>`;

const outDir = path.resolve(import.meta.dirname, "..", "public", "icons");

async function main() {
  await mkdir(outDir, { recursive: true });
  const sizes = [192, 512];
  for (const size of sizes) {
    const buffer = await sharp(Buffer.from(svg(size))).resize(size, size).png().toBuffer();
    await writeFile(path.join(outDir, `icon-${size}.png`), buffer);
    console.log(`Generado icon-${size}.png`);
  }

  const maskableBuffer = await sharp(Buffer.from(svg(512))).resize(512, 512).png().toBuffer();
  await writeFile(path.join(outDir, "icon-maskable-512.png"), maskableBuffer);
  console.log("Generado icon-maskable-512.png");

  const appleTouchBuffer = await sharp(Buffer.from(svg(180))).resize(180, 180).png().toBuffer();
  await writeFile(path.join(outDir, "apple-touch-icon.png"), appleTouchBuffer);
  console.log("Generado apple-touch-icon.png");
}

main();
