# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [SemVer](https://semver.org/).

## [Unreleased]

### Fixed
- `package.json`'s `exports` map had `"types"` listed after `"import"`/`"require"`, which Node/bundlers ignore (condition order matters - first match wins, and a `types` condition after the others is dead code). Now nests `types` first within each of `import`/`require`, and points each at the matching declaration file tsup actually emits (`index.d.mts` for ESM, `index.d.ts` for CJS) rather than sharing one.
- `RetrieveMultipleResponse` now matches the actual client-side SDK shape (`entities`/`nextLink`) instead of the OData wire-format shape (`value`/`@odata.nextLink`) it was incorrectly modeled on. This affected `retrieveMultipleRecords` and `retrieveAllPages`.
- `setAttributeValue` and `setControlVisible` had type errors against `@types/xrm` — fixed with appropriate casts.
- **`WebApiError` is now a real `Error` subclass instead of a plain object.** Previously, every error from `retrieveRecord`, `createRecord`, `updateRecord`, `deleteRecord`, `retrieveMultipleRecords`, and `executeFetchXml` was normalized into a plain `{ message, errorCode, raw }` object — which meant `instanceof Error` checks (and test matchers relying on them, like Jest's `.toThrow()`) silently failed even though a real error had occurred. If you previously wrote `catch (e) { ... }` and checked `e instanceof Error`, that code was broken before this fix.

## [0.1.0] - 2026-06-19

### Added
- Initial release: Web API CRUD wrappers, form-context helpers, general utilities (GUID handling, entity reference parsing, date formatting).
