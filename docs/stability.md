# Flaky tests: policy

A flaky test is one that can both pass and fail on the same code. It costs more than a missing
test: the team learns to ignore red builds. The goal of this policy is that a red build always
means a real problem.

## How flakiness is detected

- **CI** allows one retry. A test that passes only on retry is reported as _flaky_ in the job
  summary and the HTML report. The build stays green.
- **Nightly** runs every test three times with `failOnFlakyTests`. Any flaky result fails the
  run; a failed scheduled run opens (or updates) the "Nightly run failed" issue. Manual runs
  (`workflow_dispatch`) report only in the job summary.
- **Locally**, reproduce with repetition and parallelism, keeping workers at or below the number
  of CPU cores:

  ```bash
  npx playwright test path/to/test.spec.ts --repeat-each=20 --workers=4
  ```

## What to do with a flaky test

1. **Investigate within two working days.** Open the trace of the failed attempt
   (`npx playwright show-trace`): it shows the timeline, DOM snapshots and network calls.
2. **Fix the cause, not the symptom.** Typical causes and fixes:

   | Cause                                                                 | Fix                                                                                      |
   | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
   | Asserting before the app has finished (navigation, request in flight) | Web-first assertion on the end state; `waitForURL` after an action that navigates        |
   | Shared data: two tests touch the same user, article or list           | Create the data in the test with the factories; check only your own data in shared lists |
   | Locator matches more than one element, or the wrong one               | Scope it (banner, card) or make it exact                                                 |
   | The UI shows a value the server never stored                          | Read the value back through the API or reload the page                                   |
   | Environment slow under load                                           | Find the slow request in the trace; never add `waitForTimeout`                           |

3. **If it cannot be fixed within two days, quarantine it** (below). Retries, longer timeouts and
   `test.skip` are not fixes.

## Quarantine

Put a test in quarantine by tagging it and linking the issue that tracks the fix:

```ts
test(
  'reader sees the comment counter update',
  {
    tag: ['@regression', '@quarantine'],
    annotation: { type: 'issue', description: 'https://github.com/<owner>/<repo>/issues/<n>' },
  },
  async ({ page }) => {
    // ...
  },
);
```

- Quarantined tests are excluded from `npm test`, smoke and regression.
- They still run in a **non-blocking** CI step (even when smoke or regression failed) and in the
  nightly run (`npm run test:quarantine`), so the summary always shows how many there are and
  whether they pass.
- **Exit:** after the fix, the test must pass the nightly run (three repetitions, strict) before
  the tag is removed. A test that stays in quarantine for more than two weeks is either fixed or
  deleted; quarantine is not a place to keep tests forever.
- A test that fails because of a **product bug** may also be quarantined, with the bug report as
  the linked issue. It leaves quarantine when the bug is fixed.
