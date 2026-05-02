# NPM Libraries for SPFx

This sample demonstrates how to build external React component libraries that are consumed by a SharePoint Framework (SPFx) application customizer. The libraries are compiled to UMD bundles and loaded by the SPFx AMD module loader at runtime — either from localhost (during development) or from Azure Blob Storage (in production).

This pattern is useful when you want to share React components across multiple SPFx solutions without bundling them into each solution's webpack output.

## Project Structure

```text
NPMLibraries/
├── certs/              # Shared SSL certificates for webpack-dev-server (see setup below)
├── Lib1-1/             # Base React component library (@juliemturner/lib1_1)
├── Lib1/               # React component library that depends on Lib1-1 (@juliemturner/lib1)
└── SPExt/              # SPFx Application Customizer that consumes Lib1 and Lib1-1
```

### How the pieces fit together

- **Lib1-1** compiles to a UMD bundle (`dist/lib1_1.js`) with the global name `lib11`. It externalizes React and react-dom.
- **Lib1** compiles to a UMD bundle (`dist/lib1.js`) with the global name `lib1`. It externalizes React, react-dom, and Lib1-1.
- **SPExt** is an SPFx Application Customizer. It declares both libraries as `externals` in `config/config.json` so the SPFx AMD loader fetches them at runtime rather than bundling them.

---

## Adapting this sample for your own project

Before you start, rename the npm scope and package names throughout the project to reflect your own organization. Search for `@juliemturner` across all files and replace it with your own npm scope (e.g. `@yourorg`).

The places that need updating are:

| File | What to change |
| --- | --- |
| `Lib1-1/package.json` | `"name": "@juliemturner/lib1_1"` → `"@yourorg/your-lib-name"` |
| `Lib1/package.json` | `"name": "@juliemturner/lib1"` → `"@yourorg/your-lib-name"` |
| `Lib1/package.json` | `devDependencies` entry `"@juliemturner/lib1_1"` → `"@yourorg/your-lib-name"` |
| `Lib1/webpack.config.js` | `externals` key `'@juliemturner/lib1_1'` → `'@yourorg/your-lib-name'` |
| `SPExt/package.json` | `dependencies` entries for both `@juliemturner` packages |
| `SPExt/config/config.json` | `externals` keys for both packages |
| `SPExt/src/extensions/spExt/SpExtApplicationCustomizer.ts` | import statement |

You may also want to rename the `lib1` / `lib1_1` UMD global names (`library.name` in `webpack.config.js` and `globalName` in `config/config.json`) to something meaningful for your project. If you do, keep them in sync — the webpack output global and the SPFx `globalName` must be identical.

---

## Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | `>=22.14.0 < 23.0.0` (required for SPFx 1.22.1) |
| npm | bundled with Node |
| SharePoint Framework | 1.22.1 |

Use [nvm for Windows](https://github.com/coreybutler/nvm-windows) or [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.

---

## Step 1 — Create SSL certificates

The webpack-dev-server for both Lib1 and Lib1-1 serves over HTTPS. This requires a locally trusted certificate. Certificates are stored in the shared `certs/` folder at the root of this repo and are referenced by both webpack configs.

> The `certs/` folder is excluded from source control (`.gitignore`). You must generate your own.

### Generate a self-signed CA and server certificate

The simplest approach uses [mkcert](https://github.com/FiloSottile/mkcert):

```bash
# Install mkcert (Windows via Chocolatey, or download the binary)
choco install mkcert

# Create a local CA and install it into your system trust store
mkcert -install

# From the repo root, generate certs for localhost
mkdir certs
cd certs
mkcert -key-file cert.key -cert-file cert.crt localhost 127.0.0.1
```

Then copy the CA root certificate into the same folder:

```bash
# Windows — mkcert prints the CA location; copy it here
copy "%LOCALAPPDATA%\mkcert\rootCA.pem" ca.crt
```

> On macOS/Linux the path will be different — run `mkcert -CAROOT` to find it.

The webpack configs expect these four files inside `certs/`:

```text
certs/
├── ca.crt
├── ca.key      # (optional — only needed if you regenerate certs)
├── cert.crt
└── cert.key
```

---

## Step 2 — Install dependencies

Install dependencies for each project separately. The libraries use `devDependencies` only (no runtime peers are published).

```bash
cd Lib1-1
npm install

cd ../Lib1
npm install

cd ../SPExt
npm install
```

---

## Step 3 — Build the libraries

The SPExt project compiles Lib1 and Lib1-1 from their TypeScript source (via `file:` references in `package.json`). You must build them at least once before building SPExt, and any time you change their source.

```bash
cd Lib1-1
npm run build

cd ../Lib1
npm run build
```

Both projects output a UMD bundle into their `dist/` folder and TypeScript declaration files alongside it.

---

## Step 4 — Run locally for development

Open three terminals:

### Terminal 1 — Lib1-1 dev server (port 3000)

```bash
cd Lib1-1
npm start
```

### Terminal 2 — Lib1 dev server (port 3010)

```bash
cd Lib1
npm start
```

### Terminal 3 — SPExt workbench

```bash
cd SPExt
npm run serve
```

The SPExt `config/config.json` externals point to the localhost dev servers by default:

```json
"externals": {
  "@yourorg/lib1": {
    "path": "https://localhost:3010/lib1.js",
    "globalName": "lib1",
    "globalDependencies": ["@yourorg/lib1_1"]
  },
  "@yourorg/lib1_1": {
    "path": "https://localhost:3000/lib1_1.js",
    "globalName": "lib11"
  }
}
```

---

## Step 5 — Deploy to production

### 5a. Build and upload the library bundles

```bash
cd Lib1-1
npm run build
# Upload dist/lib1_1.js to your CDN / Azure Blob Storage

cd ../Lib1
npm run build
# Upload dist/lib1.js to your CDN / Azure Blob Storage
```

### 5b. Update SPExt externals to production URLs

Edit `SPExt/config/config.json` and swap the `path` values to your production URLs. The `globalName` and `globalDependencies` values do not change.

```json
"externals": {
  "@yourorg/lib1": {
    "path": "https://<your-cdn>/lib1.js",
    "globalName": "lib1",
    "globalDependencies": ["@yourorg/lib1_1"]
  },
  "@yourorg/lib1_1": {
    "path": "https://<your-cdn>/lib1_1.js",
    "globalName": "lib11"
  }
}
```

### 5c. Build and package SPExt

```bash
cd SPExt
npm run bundle -- --ship
npm run package-solution -- --ship
```

Deploy the resulting `.sppkg` from `sharepoint/solution/` to your App Catalog.

---

## Key implementation details

### UMD global names

The webpack `library.name` in each project's `webpack.config.js` sets the UMD global:

| Package | webpack `library.name` | SPFx `globalName` |
| --- | --- | --- |
| `@yourorg/lib1_1` | `lib11` | `lib11` |
| `@yourorg/lib1` | `lib1` | `lib1` |

These must match exactly or the SPFx AMD loader will fail to find the module at runtime.

### Externalizing React

Both webpack configs declare React and react-dom as UMD externals using the full object format:

```js
externals: {
  'react': { root: 'React', commonjs: 'react', commonjs2: 'react', amd: 'react' },
  'react-dom': { root: 'ReactDOM', commonjs: 'react-dom', commonjs2: 'react-dom', amd: 'react-dom' }
}
```

The lowercase key (`'react'`) must match the import string in the source. SPFx supplies React via its own AMD loader, so bundling React into the library bundles would cause version conflicts.

### TypeScript declarations

Both libraries are configured with `emitDeclarationOnly: true` and `declarationDir: ./dist` in their `tsconfig.json`. The SPExt project resolves types via the `file:../Lib1` reference in its `package.json`, which points at the TypeScript source directly (`"main": "./src/index.ts"`).
