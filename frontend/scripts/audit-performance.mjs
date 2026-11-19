import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

const require = createRequire(import.meta.url)
const chromePath =
  process.env.CHROME_PATH ||
  (process.platform === 'win32' &&
  existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : chromium.executablePath())
const url =
  process.argv[2] ||
  process.env.PERF_URL ||
  'https://tastebook-frontend.onrender.com/'
const runs = Number(process.env.PERF_RUNS || 3)
if (!Number.isInteger(runs) || runs < 1 || runs > 10)
  throw new Error('PERF_RUNS must be an integer from 1 to 10')
const label = new URL(url).hostname.replaceAll('.', '-')
const directory = resolve(`performance-results/${label}`)
await mkdir(directory, { recursive: true })
const results = []
for (const formFactor of ['mobile', 'desktop']) {
  for (let run = 1; run <= runs; run++) {
    const output = resolve(directory, `${formFactor}-${run}`)
    const args = [
      require.resolve('lighthouse/cli/index.js'),
      url,
      '--only-categories=performance',
      '--output=json',
      '--output=html',
      `--output-path=${output}`,
      '--chrome-flags=--headless --no-sandbox',
      '--quiet',
      '--max-wait-for-load=60000',
      ...(formFactor === 'desktop' ? ['--preset=desktop'] : []),
    ]
    const code = await new Promise((resolveExit, reject) => {
      const child = spawn(process.execPath, args, {
        stdio: 'inherit',
        env: { ...process.env, CHROME_PATH: chromePath },
      })
      child.on('error', reject)
      child.on('exit', resolveExit)
    })
    if (code !== 0)
      throw new Error(
        `Lighthouse failed for ${url} (${formFactor}, run ${run})`,
      )
    const report = JSON.parse(await readFile(`${output}.report.json`, 'utf8'))
    if (report.runtimeError)
      throw new Error(JSON.stringify(report.runtimeError))
    const record = {
      formFactor,
      run,
      requestedUrl: report.requestedUrl,
      finalUrl: report.finalDisplayedUrl,
      fetchTime: report.fetchTime,
      fcpMs: report.audits['first-contentful-paint'].numericValue,
      lcpMs: report.audits['largest-contentful-paint'].numericValue,
      cls: report.audits['cumulative-layout-shift'].numericValue,
      score: report.categories.performance.score,
      throttling: report.configSettings.throttling,
      throttlingMethod: report.configSettings.throttlingMethod,
    }
    results.push(record)
    console.log(
      `${formFactor} ${run}/${runs}: FCP ${Math.round(record.fcpMs)} ms, LCP ${Math.round(record.lcpMs)} ms`,
    )
  }
}
const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const summary = {
  url,
  results,
  acceptance: ['mobile', 'desktop'].map((formFactor) => {
    const fcpMs = median(
      results
        .filter((result) => result.formFactor === formFactor)
        .map((result) => result.fcpMs),
    )
    return { formFactor, medianFcpMs: fcpMs, passes1500ms: fcpMs < 1500 }
  }),
}
await writeFile(
  resolve(directory, 'summary.json'),
  JSON.stringify(summary, null, 2),
)
console.log(JSON.stringify(summary.acceptance, null, 2))
if (summary.acceptance.some((result) => !result.passes1500ms))
  process.exitCode = 1
