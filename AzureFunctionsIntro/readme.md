# Azure Functions: Real World Scenarios and NodeJS Implementation Overview

This repository is a **reference sample**, not a runnable starter kit. It accompanies the session *"Azure Functions: Real World Scenarios and NodeJS Implementation Overview"* and exists to give attendees code to read, revisit, and borrow from — not to spin up.

> ⚠️ **This project is not meant to be run.** `local.settings.json` contains placeholder values (fake GUIDs, `contoso.sharepoint.com`, a dummy Application Insights key), and there is no accompanying Azure infrastructure. Treat every file here as an annotated example, not a working app.

📑 **Slides:** [AzureFunctionsIntro.pdf](../Presentations/AzureFunctionsInto.pdf)

---

## What this project is

A minimal Azure Functions v4 app, written in TypeScript on Node.js, structured the way a real production function app tends to get structured once it grows past a single "hello world" trigger. It's intentionally small — three trigger types and a handful of supporting files — so the patterns stay easy to spot in the code rather than getting lost in a large codebase.

The scenario stitched together across the three functions: an HTTP call drops a work item on a queue, a queue-triggered function processes that item against a downstream system (SharePoint, via PnP.js, as the illustrative example), and a timer-triggered function runs a recurring job on a schedule. All three share the same authentication, logging, and service-layer building blocks.

## Real-world patterns demonstrated

### 1. The three core trigger types

| Function | File | Pattern |
| --- | --- | --- |
| HTTP trigger | [src/functions/httpTrigger.ts](src/functions/httpTrigger.ts) | Accepts a POST request and hands work off asynchronously |
| Queue trigger | [src/functions/queueTrigger.ts](src/functions/queueTrigger.ts) | Processes a queued work item; runs on its own schedule/concurrency |
| Timer trigger | [src/functions/timerTrigger.ts](src/functions/timerTrigger.ts) | Runs on a CRON schedule ([host.json](host.json) / `SCHEDULE` app setting) for recurring jobs |

All three are registered using the **Node.js v4 programming model** (`app.http`, `app.storageQueue`, `app.timer`) — function bindings are declared in code (`src/functions/*.ts`) rather than in separate `function.json` files, which is the current recommended approach for Node.js function apps.

### 2. Decoupling work with output bindings

[httpTrigger.ts](src/functions/httpTrigger.ts) doesn't do the real work itself — it validates the incoming request and writes it to a Storage Queue via an `output.storageQueue` binding, then returns immediately. This is a common real-world shape: keep the HTTP response fast, and let a queue-triggered function absorb the actual processing time, retries, and failure handling. It also means the HTTP endpoint and the processing logic can scale, fail, and be redeployed independently of each other.

### 3. Retry and requeue handling

[queueTrigger.ts](src/functions/queueTrigger.ts) shows two ways to handle a failed processing attempt:

- **Throwing**, which lets the Functions runtime's built-in queue retry/poison-queue behavior (configured in [host.json](host.json)) take over.
- **Manually requeuing** a message with a visibility delay via `QueueClient.updateMessage`, for cases where you want custom backoff or retry logic instead of the platform default.

Both are shown side by side so the trade-off is visible rather than hidden behind a single "right" answer.

### 4. Credential-free authentication with Managed Identity

[src/common/auth.ts](src/common/auth.ts) centralizes authentication using `DefaultAzureCredential` from `@azure/identity`, then hands that credential to PnP.js (`@pnp/sp`, `@pnp/graph`, `@pnp/azidjsclient`) to talk to SharePoint and Microsoft Graph. No client secrets or passwords are stored or referenced in code — in Azure, this resolves to the function app's Managed Identity; locally, it falls back through the credential chain (e.g. Azure CLI login or a certificate, as hinted at by the `AZURE_CLIENT_CERTIFICATE_PATH` setting). This is the pattern to reach for any time a function needs to call another Azure or Microsoft 365 service.

### 5. Centralized, structured logging with Application Insights

[src/common/appinsightutil.ts](src/common/appinsightutil.ts) is the most "production-grade" file in the sample, and worth slowing down on:

- Wraps the `applicationinsights` SDK behind a small `AppInsightUtil` class so every function logs through one consistent interface (`Log`, with `Event` / `Exception` / `Metric` / `Trace` message types and severity levels).
- Correlates logs back to the parent request using OpenTelemetry trace context (`traceParent`), so a queue-triggered function's logs can be tied back to the HTTP call that originally queued the work.
- Filters out expected-but-noisy `DefaultAzureCredential` chain-walk failures (`EnvironmentCredential`, `WorkloadIdentityCredential`) so they don't show up as false-positive exceptions in Application Insights.
- Explicitly exposes a `Flush()` call — because timer- and queue-triggered function workers can be frozen or recycled shortly after the handler resolves, telemetry has to be actively flushed rather than assumed to make it out on its own.

### 6. A thin service/model layer

[src/services/myService.ts](src/services/myService.ts) and [src/models/models.ts](src/models/models.ts) show business logic kept out of the trigger files entirely. The trigger functions are responsible for wiring (bindings, auth, logging) and delegate the actual work to a service class. This keeps trigger files small and makes the business logic testable independent of the Functions runtime.

## Project structure

```text
├── host.json                    Function app host configuration (extension bundle, App Insights sampling)
├── local.settings.json          Local settings — placeholder values only, not real credentials
├── package.json                 Dependencies: @azure/functions, PnP.js, applicationinsights
├── tsconfig.json                TypeScript compiler configuration
└── src/
    ├── functions/
    │   ├── httpTrigger.ts        HTTP → Queue: accepts a request, queues work
    │   ├── queueTrigger.ts       Queue-triggered processing with retry/requeue example
    │   └── timerTrigger.ts       CRON-scheduled recurring job
    ├── common/
    │   ├── auth.ts                Managed Identity auth service (SharePoint + Graph via PnP.js)
    │   └── appinsightutil.ts      Structured Application Insights logging wrapper
    ├── services/
    │   └── myService.ts           Business logic layer, decoupled from trigger bindings
    └── models/
        └── models.ts               Shared TypeScript interfaces
```

## How to use this repo

Read it alongside the slides, in whatever order the session calls out. Each file above is short enough to read top to bottom, and the comments in [appinsightutil.ts](src/common/appinsightutil.ts) and [queueTrigger.ts](src/functions/queueTrigger.ts) call out *why* a given approach was taken, not just *what* it does. Feel free to copy patterns out of here into your own projects — just remember to replace every placeholder value with real configuration and secrets management appropriate to your environment (e.g. Azure Key Vault, App Configuration, or your Function App's own application settings).

## License

MIT — see [LICENSE](../LICENSE).
