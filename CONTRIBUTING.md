# Contributing

Thanks for considering a contribution. This package stays intentionally small and focused: typed helpers for Dataverse client-side scripting (`Xrm.WebApi`, form context) — not a general-purpose Dataverse SDK.

## Setup

```bash
git clone https://github.com/<your-username>/dataverse-ts-utils.git
cd dataverse-ts-utils
npm install
npm run dev   # watches src/ and rebuilds dist/
```

## Adding a new utility

1. Add your function to the relevant file in `src/` (or a new file if it's a new category — e.g. `src/batch.ts` for `$batch` helpers).
2. Export it from `src/index.ts`.
3. Add a JSDoc comment describing what it does, including edge cases (e.g. "returns null if the attribute doesn't exist on the form").
4. Add tests in `src/__tests__/` covering the new function (see existing tests for the mocking pattern — `src/__tests__/mocks/xrm.ts` has reusable fakes for `Xrm.WebApi` and `Xrm.FormContext`).
5. Run `npm run lint` (type check), `npm test`, and `npm run build` before opening a PR.

## Scope guidelines

Good fits:
- Thin wrappers around `Xrm.WebApi` / form-context APIs that remove boilerplate
- Pure helper functions (GUID handling, entity reference parsing, date formatting)

Probably not a good fit:
- Anything requiring a specific framework (React/Angular-specific helpers) — those belong in separate, framework-specific packages
- Business-logic-specific helpers tied to one organization's schema

If you're unsure, open an issue to discuss before submitting a PR — saves everyone rework.

## Pull requests

- One logical change per PR.
- Update `README.md` if you're adding a new exported function — keep the usage example current.
- CI runs type-checking, tests, and build on every PR; all three must pass before merge.

## Releases

Maintainers handle versioning (semver) and publishing via a GitHub Release, which triggers automatic npm publish. Contributors don't need to worry about this.
