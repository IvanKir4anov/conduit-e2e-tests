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
| CI                     | GitHub Actions: lint + typecheck → app in Docker → smoke → regression   |
| Debugging              | HTML report, trace, screenshot and video for every failed test          |

## Quick start

Requirements: Node.js 22+, Docker with Compose v2.

```bash
npm ci
npx playwright install chromium   # on Linux: --with-deps chromium
npm run env:up      # builds and starts the app at http://localhost:8080, waits until ready
npm test            # all tests (smoke + regression)
npm run report      # open the HTML report
```

| Command                   | What it does                                                      |
| ------------------------- | ----------------------------------------------------------------- |
| `npm run env:up`          | Start the app; creates `.env` with a JWT signing key on first run |
| `npm run env:down`        | Stop the app, **keep** the database                               |
| `npm run env:reset`       | Stop the app, **delete** the database volume, start again         |
| `npm run test:smoke`      | Critical path only (`@smoke`): a quick gate, about 6 tests        |
| `npm run test:regression` | Everything else (`@regression` and unit tests)                    |
| `npm run lint`            | ESLint (incl. Playwright rules) + Prettier check                  |
| `npm run typecheck`       | TypeScript in strict mode                                         |

## What is covered

Tests are tagged by purpose: `@smoke` is the critical path that must never break; `@regression` is
everything else. In CI smoke runs first, and regression runs only if smoke passes.

| Area     | Scenario                                            | Level       | Tag        |
| -------- | --------------------------------------------------- | ----------- | ---------- |
| Stack    | Frontend and API are served from one origin         | API         | smoke      |
| Accounts | Register and sign in with the same credentials      | API         | smoke      |
|          | Sign in through the form                            | UI          | smoke      |
|          | Wrong password is rejected                          | API, UI     | regression |
|          | Sign up through the form; account usable via API    | UI          | regression |
|          | Taken username / taken email are rejected           | UI          | regression |
|          | Update bio in settings, see it on the profile       | UI          | regression |
|          | Sign out, stay signed out after reload              | UI          | regression |
| Articles | Create, read, delete                                | API         | smoke      |
|          | Publish from the editor; saved data checked via API | UI          | smoke      |
|          | Edit own article                                    | UI          | regression |
|          | Delete own article                                  | UI          | regression |
|          | Other users see no edit / delete controls           | UI          | regression |
|          | Filter by tag and by author                         | API         | regression |
| Social   | Comment on another user's article                   | Hybrid      | smoke      |
|          | Comment via API                                     | API         | regression |
|          | Favorite / unfavorite: flag and counter             | API, hybrid | regression |
|          | Follow an author: their article appears in the feed | API, hybrid | regression |
|          | Unfollow: the article leaves the feed               | API         | regression |
| Guests   | Read an article; commenting requires sign-in        | UI          | regression |
|          | Editor redirects to sign in                         | UI          | regression |

_Hybrid_ means the data is prepared through the API and only the behaviour under test goes
through the browser. This keeps UI tests short and focused.

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
  and to check results. A failed call throws an `ApiError` with the HTTP status, so tests assert
  on the status rather than on message text. Errors never include the request body, because that
  may contain a password.
- **`src/pages`**: Page Objects expose actions and locators only. Assertions stay in tests.
  Locators are role/label based. Where the app has no accessible hook, a CSS class is used and
  the reason is written next to it.
- **`src/fixtures`**: `user`, `userApi`, `article`, `authedPage`, `deleteAfterTest`, plus a
  `signInAs(page, user)` helper for tests with a second user. A UI test gets a signed-in browser
  by injecting the token the way the app stores it, without clicking through the login form.
  Only the sign-in tests use the form.
- **`src/data`**: factories that generate unique users, articles and tags (checked by a unit test
  in `tests/unit`).

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
3. **No cross-worker conflicts.** Rule for tests on shared lists (feed, tags): look for the
   test's own data, never assert on position or count.
4. **Sessions per test.** The token comes from the API and is injected into the browser.
5. **Cleanup.** Fixtures delete what they create. Articles created inside a test are registered
   for deletion as soon as their slug is known, so they are removed even if a later assertion
   fails. Users cannot be deleted in RealWorld, so
   isolation relies on uniqueness. In CI every run starts on a fresh runner with an empty
   database; locally, `npm run env:reset` gives the same clean state.

Checked by running the suite repeatedly in parallel, e.g.
`npx playwright test --repeat-each=5 --workers=6`. Keep workers at or below the number of CPU
cores: all workers share one SQLite backend, and heavy oversubscription makes writes slow enough
to hit the default 5-second assertion timeout.

## Reliability approach

- No fixed waits (`waitForTimeout` is a lint error); only web-first assertions that retry until
  the condition holds.
- `npm run env:up` (used locally and in CI) waits until the API answers (`GET /api/tags`) before
  returning, so tests never hit a half-started stack. If the app is not running at all, a global
  setup stops the run with one clear message instead of a wall of "connection refused" errors.
- **One retry in CI.** A test that passes only on retry does not fail the build, but it is marked
  as _flaky_ in the report and in the job summary. A flaky test is a defect to fix, not noise to
  live with. A test that cannot be fixed quickly goes into quarantine (a separate, non-blocking
  run) with a linked issue. The quarantine mechanism and a strict nightly run are planned next.

## Debugging a failure

1. Open the failed run in **Actions**. The job summary shows passed / failed / flaky counts.
2. Download the `playwright-reports` artifact (one HTML report for smoke, one for regression) and
   run `npx playwright show-report <folder>`.
3. Open the failed test's **trace** for the timeline, DOM snapshots, network and console:
   `npx playwright show-trace <path-to-trace.zip>`. Screenshot and video are attached as well.
4. Backend and nginx logs are printed by the `Application logs` step.

Traces record network traffic, so they contain the disposable credentials of the users a test
created (random passwords and tokens for a throwaway database). No real secret ever
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
