import sharp from 'sharp'
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const output = new URL('../public/images/optimized/', import.meta.url)
await mkdir(output, { recursive: true })
for (const [name, widths] of [
  ['hero-bg', [640, 1280, 1920]],
  ['auth-login-bg', [960]],
  ['auth-register-bg', [960]],
]) {
  const input = await readFile(
    new URL(`../public/images/${name}.jpg`, import.meta.url),
  )
  const digest = createHash('sha256')
    .update(input)
    .update('webp-quality74-v1')
    .digest('hex')
  const marker = new URL(`${name}.sha256`, output)
  const targets = widths.map(
    (width) => new URL(`${name}-${width}.webp`, output),
  )
  try {
    if ((await readFile(marker, 'utf8')) === digest) {
      await Promise.all(targets.map((path) => access(path)))
      continue
    }
  } catch {
    /* Generate missing or stale outputs. */
  }
  for (const [index, width] of widths.entries()) {
    await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74 })
      .toFile(fileURLToPath(targets[index]))
  }
  await writeFile(marker, digest)
}
