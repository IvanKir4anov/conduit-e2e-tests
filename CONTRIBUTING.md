# Contributing

## Setup

```bash
npm ci
npx playwright install chromium   # on Linux: --with-deps chromium
npm run env:up
npm test
```

Before pushing: `npm run lint && npm run typecheck && npm test`.

## Writing a test

**Pick the cheapest level that proves the behaviour.**

| Level  | Folder         | Use it for                                                         |
| ------ | -------------- | ------------------------------------------------------------------ |
| API    | `tests/api`    | Business rules, validation, data returned by the backend           |
| UI     | `tests/ui`     | What a user does and sees in the browser                           |
| Hybrid | `tests/hybrid` | UI behaviour that needs preconditions (other users, existing data) |
| Unit   | `tests/unit`   | Helpers of this framework                                          |

**Rules**

1. **Own your data.** Create users and articles in the test or through fixtures (`user`,
   `article`), using the factories in `src/data`. Never rely on data from another test or on an
   empty database.
2. **Clean up what you create.** Use fixtures; for an article created inside the test, call
   `deleteAfterTest(slug)` as soon as the slug is known.
3. **Prepare through the API, act through the UI.** Do not click through forms to reach the
   starting point of a UI test. Use `authedPage` or `signInAs` instead of logging in through the
   form.
4. **Prove the result is stored.** If the page could show a value it rendered itself, check it
   through the API or after a reload.
5. **Locators:** role, label or text first. A CSS class only when the app has no accessible
   hook, with a comment explaining why. Locators live in Page Objects; assertions live in tests.
6. **Waiting:** only web-first assertions (`await expect(locator)...`) and `waitForURL` after
   navigation. `waitForTimeout` and `force: true` are lint errors.
7. **Independence:** every test must pass alone, in any order, in parallel and repeated. Serial
   mode is a lint error.
8. **Name and tag:** the title says what the user achieves (`author edits their article`). Tag
   it `@regression`; `@smoke` is only for the critical path and needs a reason in the PR.

Check a new test before opening a PR:

```bash
npx playwright test path/to/new.spec.ts --repeat-each=10 --workers=4
```

## Review checklist

- [ ] The test fails when the feature is broken (try breaking it once).
- [ ] It creates its own data and cleans it up; nothing depends on order or on other tests.
- [ ] No fixed waits, no `force`, no retries or longer timeouts added to make it pass.
- [ ] Locators are accessible-first; any CSS locator has a comment.
- [ ] Assertions check the end state the user cares about, not implementation details.
- [ ] Persisted data is verified through the API or a reload where the UI could fake it.
- [ ] No secrets or real personal data in code, fixtures or logs.
- [ ] README and docs still describe the suite correctly.

## Flaky and quarantined tests

See [docs/stability.md](docs/stability.md).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `test(ui): ...`, `fix: ...`,
`ci: ...`, `docs: ...`. One logical change per commit.
