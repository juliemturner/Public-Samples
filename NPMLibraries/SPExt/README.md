# NPM Libraries Demo - SPFx consumer

Demo site: https://sympjt.sharepoint.com/sites/demos

## External library hosting

Configured in `config/config.json` → `externals`. Swap `path` values between dev (localhost) and production (blob storage) as needed. `globalName` and `globalDependencies` stay the same in both environments.

| Package | Dev (localhost) | Production (Azure Blob) |
| --- | --- | --- |
| `@juliemturner/lib1` | `https://localhost:3010/lib1.js` | `https://jmtdemos.blob.core.windows.net/npmlib/lib1.js` |
| `@juliemturner/lib1_1` | `https://localhost:3000/lib1_1.js` | `https://jmtdemos.blob.core.windows.net/npmlib/lib1_1.js` |

Global names: `lib1` → `lib1`, `lib1_1` → `lib11` (note: two digits, no underscore).
