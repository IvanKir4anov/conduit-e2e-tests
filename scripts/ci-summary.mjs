// Writes a short result table to the GitHub job summary from Playwright's JSON report.
// Flaky tests (passed only on retry) do not fail the build, but they are always visible here.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const reportPath = process.argv[2] ?? 'test-results/results.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

let lines;
if (!existsSync(reportPath)) {
  lines = ['### E2E results', '', 'No report found: tests did not run.'];
} else {
  const { stats } = JSON.parse(readFileSync(reportPath, 'utf8'));
  lines = [
    '### E2E results',
    '',
    '| Passed | Failed | Flaky | Skipped | Duration |',
    '|---|---|---|---|---|',
    `| ${stats.expected} | ${stats.unexpected} | ${stats.flaky} | ${stats.skipped} | ${(stats.duration / 1000).toFixed(1)} s |`,
  ];
  if (stats.flaky > 0) {
    lines.push(
      '',
      `> ⚠️ ${stats.flaky} flaky test(s) passed only on retry. Open the Playwright report artifact for details.`,
    );
  }
}

const text = lines.join('\n') + '\n';
if (summaryPath) appendFileSync(summaryPath, text);
else process.stdout.write(text);
