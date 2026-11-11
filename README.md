# Conduit E2E tests

[![CI](https://github.com/IvanKir4anov/conduit-e2e-tests/actions/workflows/ci.yml/badge.svg)](https://github.com/IvanKir4anov/conduit-e2e-tests/actions/workflows/ci.yml)

End-to-end test suite for [RealWorld Conduit](https://github.com/realworld-apps/realworld), a
Medium-like app with a REST API and a web frontend, built with **Playwright + TypeScript**.

It is a demo project, not a generic template. The aim is to show how a test suite is built so the
team can trust it: tests that are isolated, fast to debug, and run against an environment the
suite controls. A red build should always mean a real problem.

| What                   | How                                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| Application under test | Pinned upstream backend + frontend, started locally with Docker Compose |
| Test layers            | Typed API client · Page Objects · Playwright fixtures · data factories  |
| Test types             | API, UI, and hybrid (data via API, behaviour via UI)                    |
| CI                     | GitHub Actions: lint + typecheck → app in Docker → tests → report       |
| Debugging              | HTML report, trace, screenshot and video for every failed test          |

## Quick start

Requirements: Node.js 22+, Docker with Compose v2.

```bash
npm ci
npx playwright install chromium
npm run env:up      # builds and starts the app at http://localhost:8080, waits until ready
npm test            # all tests;  npm run test:smoke for the smoke set
npm run report      # open the HTML report
```

| Command             | What it does                                                      |
| ------------------- | ----------------------------------------------------------------- |
| `npm run env:up`    | Start the app; creates `.env` with a JWT signing key on first run |
| `npm run env:down`  | Stop the app, **keep** the database                               |
| `npm run env:reset` | Stop the app, **delete** the database volume, start again         |
| `npm run lint`      | ESLint (incl. Playwright rules) + Prettier check                  |
| `npm run typecheck` | TypeScript in strict mode                                         |

## Architecture

```
 tests/api ── tests/ui ── tests/hybrid          what is checked
        │          │           │
        ▼          ▼           ▼
   src/fixtures  (users, sessions, articles; created and cleaned up per test)
        │                      │
        ▼                      ▼
   src/api  (typed client)   src/pages  (Page Objects)
        │                      │
        └──────────┬───────────┘
                   ▼
         http://localhost:8080
         nginx ── /      → Angular frontend
               └─ /api/* → ASP.NET Core backend ── SQLite (Docker volume)
```

- **`src/api`**: a small typed client for the RealWorld API. Tests use it to prepare data
  and to check results. It fails fast with method, URL, status and response body, and never
  logs the request body, because that may contain a password.
- **`src/pages`**: Page Objects expose actions and locators only. Assertions stay in tests.
  Locators are role/label based. Where the app has no accessible hook, a CSS class is used and
  the reason is written next to it.
- **`src/fixtures`**: `user`, `userApi`, `article`, `authedPage`. A UI test gets a signed-in
  browser by injecting the token the way the app stores it, without clicking through the login
  form. Only the login test itself uses the form.
- **`src/data`**: factories that generate unique users, articles and tags.

```ts
test('reader comments on an article created via API @smoke', async ({ api, article, page }) => {
  const reader = await api.register(buildUser());
  await signInAs(page, reader);

  const articlePage = new ArticlePage(page);
  await articlePage.goto(article.slug);
  const text = `Comment ${uniqueId('c')}`;
  await articlePage.addComment(text);

  await expect(articlePage.comment(text)).toBeVisible();
  await expect(articlePage.commentAuthor(text)).toHaveText(reader.username);
});
```

## Test isolation

Every test must pass on its own, in any order, in parallel, and against a database that already
holds data from earlier runs.

1. **Unique data.** Each test creates its own users and articles. Ids combine the worker index,
   a timestamp, a counter and random characters. There are no shared accounts.
2. **No order dependencies.** `fullyParallel: true`; `test.describe.serial` is banned by lint.
3. **No cross-worker conflicts.** Shared lists (feed, tags) are checked only for the test's own
   data, never by position or count.
4. **Sessions per test.** The token comes from the API and is injected into the browser.
5. **Cleanup.** Fixtures delete what they create. Users cannot be deleted in RealWorld, so
   isolation relies on uniqueness. In CI every run starts on a fresh runner with an empty
   database; locally, `npm run env:reset` gives the same clean state.

Checked by running the suite repeatedly in parallel:
`npx playwright test --repeat-each=3 --workers=4`.

## Reliability approach

- No fixed waits (`waitForTimeout` is a lint error); only web-first assertions that retry until
  the condition holds.
- The app is started and checked for readiness (`GET /api/tags`) before tests run, so tests never
  hit a half-started stack.
- **One retry in CI.** A test that passes only on retry does not fail the build, but it is marked
  as _flaky_ in the report and in the job summary. A flaky test is a defect to fix, not noise to
  live with. A test that cannot be fixed quickly goes into quarantine (a separate, non-blocking
  run) with a linked issue. The quarantine mechanism and a strict nightly run are planned next.

## Debugging a failure

1. Open the failed run in **Actions**. The job summary shows passed / failed / flaky counts.
2. Download the `playwright-report` artifact and run `npx playwright show-report <folder>`.
3. Open the failed test's **trace** for the timeline, DOM snapshots, network and console:
   `npx playwright show-trace <path-to-trace.zip>`. Screenshot and video are attached as well.
4. Backend and nginx logs are printed by the `Application logs` step.

Traces record network traffic, so they contain the disposable credentials of the users a test
created (random passwords, short-lived tokens for a throwaway database). No real secret ever
reaches the tests: the only one, the backend's JWT signing key, is generated into the git-ignored
`.env` and never logged.

## Application under test

The app's code is not part of this repository. It is built from upstream at pinned commits:

| Part     | Upstream                                                                                               | Commit    |
| -------- | ------------------------------------------------------------------------------------------------------ | --------- |
| Backend  | [aspnetcore-realworld-example-app](https://github.com/realworld-apps/aspnetcore-realworld-example-app) | `9345f18` |
| Frontend | [angular-realworld-example-app](https://github.com/realworld-apps/angular-realworld-example-app)       | `d426ec8` |

There is one change to upstream code. The frontend calls the public demo API
(`https://api.realworld.show/api`), and the Docker build rewrites that base to the same-origin
`/api`, which nginx proxies to the local backend. The build fails if the original line is not
found, if the patched line is missing, or if the public URL is still present in the build output.
That way an upstream change can never silently point tests at the public API.

The Angular project has its own Playwright tests. They are not used here. All tests, fixtures and
Page Objects in this repository were written for this project. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for upstream licenses.

## License

[MIT](LICENSE) © Ivan Kirchanov
