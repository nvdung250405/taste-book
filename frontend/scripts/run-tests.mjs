import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

function discover(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory()
      ? discover(path)
      : entry.name.endsWith('.test.mjs')
        ? [path]
        : []
  })
}

const result = spawnSync(
  process.execPath,
  ['--test', '--test-concurrency=1', ...discover('src')],
  { stdio: 'inherit' },
)
if (result.error) throw result.error
process.exitCode = result.status ?? 1
