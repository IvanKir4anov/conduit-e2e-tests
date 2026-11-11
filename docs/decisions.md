# Engineering decisions

Short records of the decisions that shape this suite: the context, the choice, and what it
costs. Newest last. A decision changes only through a new record that supersedes the old one.

## 1. Run the application under test locally, pinned

**Context.** A public demo instance changes and goes down without notice, and tests cannot
create or reset its data. Each of those makes CI red for reasons that have nothing to do with the
code under test.

**Decision.** Build the upstream backend (ASP.NET Core) and frontend (Angular) from **pinned
commits** with Docker Compose. nginx serves the frontend and proxies `/api` to the backend on the
same origin. The frontend is used unmodified except for one line: its hardcoded public API base
is rewritten to `/api` during the build. Guards make the build fail if the line has changed
upstream or if the public URL survives in the output.

**Consequences.** Runs are reproducible and need no secrets. Updating the app is a deliberate
change: bump the SHA, fix what breaks, all in one PR. Building the app costs about 1m45s per CI
run (see 8).

## 2. Prepare data through the API, verify behaviour through the UI

**Context.** Clicking through forms to create preconditions is slow and makes a test fail for
reasons unrelated to what it checks.

**Decision.** Fixtures create users and articles through a typed API client. The browser is used
only for the behaviour under test. Where the UI could show a value without the server storing it
(the page renders from the POST response, or computes a counter locally), the test reads the
value back through the API or reloads the page.

**Consequences.** UI tests are short and focused. API and UI must agree on the data model, so the
client is typed and kept small.

## 3. Inject the session instead of logging in through the form

**Decision.** `authedPage` and `signInAs(page, user)` put the API-issued token into
`localStorage['jwtToken']`, where the app keeps it, and wait until the header shows the user.
Only the sign-in tests use the form. The token is injected once per page, so a test that logs out
stays logged out.

**Consequences.** Saves one UI login per test. If the app changes how it stores the session,
one function changes.

## 4. Isolation through unique data and a fresh database per CI run

**Context.** RealWorld cannot delete users, and tests run in parallel against one database.

**Decision.** Every test creates its own data with ids built from the worker index, a timestamp,
a counter and random characters. Fixtures delete what can be deleted. Shared lists are checked
for the test's own data only, never by position or count. CI starts from an empty database on
every run; `npm run env:reset` does the same locally. `test.describe.serial` and serial mode are
lint errors.

**Consequences.** Tests pass in any order and on a database full of earlier data. The local
database grows until it is reset, which is harmless.

## 5. One retry in CI, flaky tests visible, strict nightly

**Decision.** CI allows one retry. A test that passes only on retry does not fail the build, but
it is counted as flaky in the job summary and the report. The nightly run executes every test
three times with `failOnFlakyTests`, so instability that one retry would hide fails there and
opens an issue. Policy: [stability.md](stability.md).

**Consequences.** A single infrastructure hiccup does not block a merge, and flakiness is still
tracked rather than absorbed.

## 6. Quarantine instead of skipping

**Decision.** A test that cannot be fixed quickly gets the `@quarantine` tag and a link to an
issue. Quarantined tests are excluded from the blocking runs and still run in a non-blocking step
of CI and in the nightly run, so their state stays visible. No test is quarantined to demonstrate
the mechanism; it is used only for real problems.

**Consequences.** A known problem does not hold the team hostage, and it cannot be forgotten:
it stays in the summary until it is fixed or deleted.

## 7. Smoke as a gate, regression after it

**Decision.** `@smoke` marks the critical path (about six tests: the stack is up, accounts,
publishing, commenting). CI runs smoke first; regression runs only if smoke passes. Each has its
own report.

**Consequences.** A broken critical path is reported in seconds with a short report. The tag
needs discipline: smoke stays small.

## 8. No sharding and no Docker layer cache yet

**Context.** Measured on GitHub-hosted `ubuntu-latest` (run of 2026-11-11): building and starting
the app 106 s, installing Chromium 48 s, smoke 13 s, regression 22 s. The whole e2e job takes about
3.5 minutes.

**Decision.** Do not shard: tests take 35 s of the job, and each shard would pay the 2.5 minutes of
setup again. Do not add Docker layer caching yet: it saves time but adds moving parts to CI, and
the job is well under the 10-minute target.

**Revisit when** test execution exceeds about 3 minutes (shard, merging reports with
`merge-reports`) or the job exceeds 10 minutes (cache image layers and browsers first).

## 9. Chromium only

**Decision.** Tests run in Chromium. The suite checks application behaviour, not browser
compatibility, and the app uses no browser-specific features.

**Revisit when** cross-browser bugs become a real risk for the product; then add Firefox and
WebKit to the nightly run first.

## 10. Accessible locators first, CSS only with a reason

**Decision.** Locators use roles, labels and text. Where the app offers no accessible hook (the
error list, the article banner, comment cards, the profile header), a CSS class is used and the
reason is written next to it in the Page Object.

**Consequences.** Tests read like the UI and survive markup changes. The few CSS locators are the
first place to look when an upstream bump breaks something.
