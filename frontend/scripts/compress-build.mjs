import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'

export async function compressDirectory(directory) {
  let files = 0
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files += await compressDirectory(path)
      continue
    }
    if (!/\.(?:html|css|js|json|svg|txt|xml)$/.test(entry.name)) continue
    const source = await readFile(path)
    if (source.length < 1024) continue
    for (const [extension, compressed] of [
      ['gz', gzipSync(source, { level: 9 })],
      [
        'br',
        brotliCompressSync(source, {
          params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
        }),
      ],
    ]) {
      if (compressed.length < source.length)
        await writeFile(`${path}.${extension}`, compressed)
    }
    files++
  }
  return files
}

// serve-dist.mjs negotiates these files for local production audits.
// Deployment hosts must provide their own Content-Encoding negotiation.
export function compressedBuild() {
  let outDir
  let failed = false
  return {
    name: 'tastebook-compressed-build',
    apply: 'build',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir)
    },
    buildEnd(error) {
      failed = !!error
    },
    async closeBundle() {
      if (failed) return
      const count = await compressDirectory(outDir)
      console.log(`Precompressed ${count} text assets as Gzip and Brotli.`)
    },
  }
}
