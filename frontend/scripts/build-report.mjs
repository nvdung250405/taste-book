import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { gzipSync, brotliCompressSync } from 'node:zlib'

const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'))
const entry = Object.keys(manifest).find((key) => manifest[key].isEntry)
const visited = new Set()
const initial = new Set()
function visit(key) {
  if (visited.has(key)) return
  visited.add(key)
  const chunk = manifest[key]
  initial.add(chunk.file)
  for (const dependency of chunk.imports || []) visit(dependency)
}
visit(entry)
const assets = await Promise.all(
  [...initial].map(async (file) => {
    const source = await readFile(`dist/${file}`)
    return {
      file,
      bytes: source.length,
      gzip: gzipSync(source).length,
      brotli: brotliCompressSync(source).length,
    }
  }),
)
const report = {
  initialJavaScript: assets,
  initialJavaScriptBytes: assets.reduce(
    (total, asset) => total + asset.bytes,
    0,
  ),
  initialGzipBytes: assets.reduce((total, asset) => total + asset.gzip, 0),
  initialBrotliBytes: assets.reduce((total, asset) => total + asset.brotli, 0),
  lazyChunks: Object.values(manifest).filter((chunk) => chunk.isDynamicEntry)
    .length,
}
await mkdir('performance-results', { recursive: true })
await writeFile(
  'performance-results/build-report.json',
  JSON.stringify(report, null, 2),
)
console.log(JSON.stringify({
  initialJavaScriptBytes: report.initialJavaScriptBytes,
  initialGzipBytes: report.initialGzipBytes,
  initialBrotliBytes: report.initialBrotliBytes,
  lazyChunks: report.lazyChunks,
  report: 'performance-results/build-report.json',
}, null, 2))
if (report.initialGzipBytes > 150 * 1024)
  throw new Error('Initial JavaScript exceeded the 150 KiB gzip budget')
