// Writes a result table to the GitHub job summary from Playwright JSON reports
// (`node scripts/ci-summary.mjs Smoke=reports/smoke.json Regression=reports/regression.json`).
// Flaky tests (passed only on retry) do not fail the build, but they are always visible here.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const suites = (process.argv.length > 2 ? process.argv.slice(2) : ['All=reports/results.json']).map(
  (arg) => {
    const [name, path] = arg.includes('=') ? arg.split('=') : [arg, arg];
    return { name, path };
  },
);

const lines = [
  '### E2E results',
  '',
  '| Suite | Passed | Failed | Flaky | Skipped | Duration |',
  '|---|---|---|---|---|---|',
];
let flaky = 0;
const runErrors = [];
for (const { name, path } of suites) {
  if (!existsSync(path)) {
    lines.push(`| ${name} | – | – | – | – | did not run |`);
    continue;
  }
  const { stats, errors = [] } = JSON.parse(readFileSync(path, 'utf8'));
  flaky += stats.flaky;
  // Run-level errors (global setup, import errors, worker crashes) are not counted in stats.
  const failed =
    errors.length > 0 ? `${stats.unexpected} + ${errors.length} run error(s)` : stats.unexpected;
  lines.push(
    `| ${name} | ${stats.expected} | ${failed} | ${stats.flaky} | ${stats.skipped} | ${(stats.duration / 1000).toFixed(1)} s |`,
  );
  for (const error of errors) {
    runErrors.push(`**${name}:** ${String(error.message ?? error).split('\n')[0]}`);
  }
}
if (runErrors.length > 0) {
  lines.push(
    '',
    '> ❌ The run failed before or outside the tests:',
    ...runErrors.map((e) => `> - ${e}`),
  );
}
if (flaky > 0) {
  lines.push('', `> ⚠️ ${flaky} flaky test(s) passed only on retry. Open the report for details.`);
}

const text = lines.join('\n') + '\n';
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
else process.stdout.write(text);
