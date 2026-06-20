# dataverse-ts-utils

[![CI](https://github.com/dataverse-ts-utils/dataverse-ts-utils/actions/workflows/ci.yml/badge.svg)](https://github.com/dataverse-ts-utils/dataverse-ts-utils/actions/workflows/ci.yml)

Common TypeScript utility methods for Dataverse client-side scripting (forms, ribbon) and PCF development. Wraps `Xrm.WebApi` and form-context patterns you'd otherwise rewrite in every project.

## Setup

```bash
npm install
```

This installs `typescript`, `tsup` (the bundler), and `@types/xrm` (Dataverse client API typings) as dev dependencies. There are no runtime dependencies — `Xrm` is expected to be available as a global at runtime (which it is, inside a model-driven form, ribbon command, or any page Dataverse has loaded its client API into).

## Build

```bash
npm run build
```

`tsup` outputs to `dist/`:
- `index.js` — CommonJS
- `index.mjs` — ESM
- `index.d.ts` — type declarations

Both module formats are emitted so the package works whether a consuming project uses `require` or `import`, and PCF's webpack-based tooling can tree-shake the ESM build.

## Tests

```bash
npm test
```

Unit tests (Jest + ts-jest) live in `src/__tests__/`. Since there's no real Dataverse environment in CI, `Xrm.WebApi` and `Xrm.FormContext` are mocked via lightweight fakes in `src/__tests__/mocks/xrm.ts` — see that file before adding new tests rather than writing your own mock from scratch.

## Test locally before publishing (npm link)

From this package's folder:

```bash
npm run build
npm link
```

From your PCF project or web resource TypeScript project:

```bash
npm link dataverse-ts-utils
```

Now `import { retrieveRecord, getLookupValue } from "dataverse-ts-utils"` resolves to your local build. Re-run `npm run build` here after changes — no need to re-link.

When done testing:

```bash
npm unlink dataverse-ts-utils   # in the consuming project
```

> **Note:** This package's types reference `@types/xrm`. If you want full type checking on the exported functions, install it in your own project too: `npm install --save-dev @types/xrm`.

## Usage example

```typescript
import { retrieveRecord, getLookupValue, setControlVisible } from "dataverse-ts-utils";

async function onLoad(executionContext: Xrm.Events.EventContext) {
  const formContext = executionContext.getFormContext();

  const account = await retrieveRecord("account", formContext.data.entity.getId(), "?$select=name,revenue");

  const owner = getLookupValue(formContext, "ownerid");
  setControlVisible(formContext, "revenue", !!owner);
}
```

For web resources (not bundled via webpack/PCF), bundle with `tsup`/`esbuild` into a single IIFE and upload that as your web resource — don't rely on `require`/`import` resolving in the form script sandbox.

## Publishing (maintainers)

Releases are automated via `.github/workflows/publish.yml` — publishing manually with `npm publish` shouldn't be necessary for the public package.

**One-time setup:**
1. Generate an npm Automation token (npmjs.com → Access Tokens → Generate New Token → Automation).
2. Add it as a repo secret named `NPM_TOKEN` (GitHub repo → Settings → Secrets and variables → Actions).

**Each release:**
```bash
npm version patch   # or minor / major — bumps package.json and creates a git tag
git push && git push --tags
```
Then on GitHub: Releases → Draft a new release → pick the tag you just pushed → Publish release. That triggers the workflow, which builds and runs `npm publish --access public --provenance` for you.

**Private feed instead of public npm** (common for client/enterprise work — Azure DevOps Artifacts, GitHub Packages, etc.) — publish manually rather than via the automated workflow:

1. Add a `.npmrc` in this folder (don't commit tokens):
   ```
   registry=https://pkgs.dev.azure.com/<org>/_packaging/<feed>/npm/registry/
   always-auth=true
   ```
2. Authenticate (`vsts-npm-auth -config .npmrc` for ADO, or a PAT-based `_authToken` line for GitHub Packages).
3. `npm run build && npm publish`

## Extending

Add new files under `src/` (e.g. `src/batch.ts` for `$batch` request helpers, `src/optionSets.ts` for metadata-driven optionset lookups) and re-export them from `src/index.ts`. Keep functions pure/stateless where possible so they're easy to unit test outside of an actual Dataverse context (mock the `Xrm` global with `jest`).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions and scope guidelines. This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](./LICENSE).
