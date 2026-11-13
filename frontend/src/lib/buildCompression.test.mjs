import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, writeFile, readFile, rm, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gunzipSync, brotliDecompressSync } from 'node:zlib'
import { compressDirectory } from '../../scripts/compress-build.mjs'

test('build compression preserves originals and creates valid gzip/brotli sidecars only for useful text assets', async () => {
  const prefix = join(tmpdir(), 'tastebook-compression-')
  const directory = await mkdtemp(prefix)
  const source = 'export const value = "TasteBook";\n'.repeat(200)
  try {
    await writeFile(join(directory, 'app.js'), source)
    await writeFile(join(directory, 'small.js'), 'export default 1')
    await writeFile(join(directory, 'photo.webp'), Buffer.alloc(3000))
    assert.equal(await compressDirectory(directory), 1)
    assert.equal(await readFile(join(directory, 'app.js'), 'utf8'), source)
    assert.equal(gunzipSync(await readFile(join(directory, 'app.js.gz'))).toString(), source)
    assert.equal(brotliDecompressSync(await readFile(join(directory, 'app.js.br'))).toString(), source)
    await assert.rejects(access(join(directory, 'small.js.gz')))
    await assert.rejects(access(join(directory, 'photo.webp.br')))
  } finally {
    if (!directory.startsWith(prefix)) throw new Error('Unexpected temporary directory')
    await rm(directory, { recursive: true, force: true })
  }
})
