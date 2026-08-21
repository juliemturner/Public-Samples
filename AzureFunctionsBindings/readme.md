# Deep Dive into Azure Function Bindings: Blob, Queues, Event Grid & More

Companion code repository for the conference session **"Deep Dive into Azure Function Bindings: Blob, Queues, Event Grid & More."**

This project is a set of small, focused Azure Functions (Node.js v4 programming model, TypeScript) that each demonstrate a specific binding type or pattern discussed in the session — triggers, inputs, and outputs across Blob Storage, Queue Storage, Event Grid, and Azure SQL. It's meant to be read alongside the talk, not deployed as a real application.

📊 **Slides:** [AzureFunctionsBindings.pdf](../Presentations/AzureFunctionsBindings.pdf)

---

## What's covered

| Binding type | Direction(s) demonstrated | File |
| --- | --- | --- |
| Storage Blob | Trigger, Input, Output | [`src/functions/blobTIO.ts`](src/functions/blobTIO.ts) |
| Storage Queue | Output (from an HTTP trigger) | [`src/functions/queueOut.ts`](src/functions/queueOut.ts) |
| Storage Queue | Trigger | [`src/functions/queueTrigger.ts`](src/functions/queueTrigger.ts) |
| Event Grid | Trigger, Output (conditional/dual) | [`src/functions/eventGridTO.ts`](src/functions/eventGridTO.ts) |
| Azure SQL | Input, Output | [`src/functions/sqlIO.ts`](src/functions/sqlIO.ts) |
| Azure SQL | Trigger (change tracking) | [`src/functions/sqlTrigger.ts`](src/functions/sqlTrigger.ts) |

Each file is self-contained and independently readable — pick the one that matches whatever part of the talk you're following.

## Project structure

```text
src/
  functions/    One file per binding demo (see table above)
  models/       Shared TypeScript interfaces for the shapes flowing through these bindings
  services/     A small "do the actual work" service the trigger handlers delegate to
```

The functions deliberately keep binding wiring (the `app.*`/`input.*`/`output.*` calls) separate from business logic (`src/services/myService.ts`) — the point of each file is to show *how the binding is declared and used*, not to be a realistic business process.

## Binding walkthroughs

### Blob Storage — trigger, input, and output together

[`blobTIO.ts`](src/functions/blobTIO.ts) is triggered by new/updated blobs matching a path pattern (`{name}` binding-expression token, captured into `context.triggerMetadata.name`). In the same invocation it also declares a secondary blob **input** and blob **output**, both pointed at a separate, fixed blob — showing how a trigger can read one blob via `context.extraInputs.get()` and write back to a *different* blob via `context.extraOutputs.set()`. Blob content arrives as a raw `Buffer`.

### Storage Queue — two angles

- [`queueOut.ts`](src/functions/queueOut.ts): an HTTP-triggered function writes its request body straight to a queue via an **output** binding — showing that a binding's direction (output) is independent of what triggered the function (HTTP here, not another queue).
- [`queueTrigger.ts`](src/functions/queueTrigger.ts): a queue **trigger** that, on failed processing, doesn't just fall back to the platform's built-in poison-queue handling — it explicitly calls `QueueClient.updateMessage()` (from `@azure/storage-queue`) to delay redelivery, demonstrating when you reach past the declarative binding into the raw SDK client for finer control.

### Event Grid — one trigger, conditional dual output

[`eventGridTO.ts`](src/functions/eventGridTO.ts) receives an Event Grid event and branches on its content: matching events go to a Storage Queue output, everything else is forwarded as-is to a *second*, downstream custom Event Grid topic. It shows a single function with multiple registered `extraOutputs`, writing to only the one relevant to that invocation — and is a good jumping-off point for the "queue vs. pub/sub fan-out" conversation from the talk.

### Azure SQL — input vs. output

[`sqlIO.ts`](src/functions/sqlIO.ts) contrasts the two SQL binding directions in one function:

- **`input.sql`** used with `commandType: 'StoredProcedure'` to *invoke* stored procedures with parameters bound from the incoming item — a pattern for triggering writes that need stored-proc logic.
- **`output.sql`** pointed at a table name rather than a proc — the binding automatically upserts a row, merged on the table's primary key.

### Azure SQL — trigger (change tracking)

[`sqlTrigger.ts`](src/functions/sqlTrigger.ts) polls a table for changes using SQL Change Tracking. Its handler receives an *array* of `SqlChange<T>` objects (`{ Item, Operation }`) — a batch, since one poll can pick up several row changes at once — which is a different shape than every other trigger in this repo (all of which hand you a single item).

## Notes / known gaps

This repo favors showing binding *code* clearly over being a turnkey, deployable app — a few things are illustrative rather than fully provisioned:

- The `dbo.JobStatus` table and stored procedures (`sproc_UpdateLastToken`, `sproc_UpdateSPSiteUrl`) referenced in `sqlIO.ts`/`sqlTrigger.ts` don't exist anywhere as SQL scripts in this repo — you'd need to create them yourself (and enable Change Tracking + grant the SQL trigger's additional permissions) before those two functions would actually run.
- `ForwardTopicEndpointUri` / `ForwardTopicKey` in `local.settings.json` are placeholder values — a real custom Event Grid topic's endpoint and access-key setting names would be needed to exercise the forwarding path in `eventGridTO.ts`.
- An earlier timer-triggered demo was removed mid-build and isn't part of this repo's final set.

## Reference only

This code is meant to be read, not run. It's here to illustrate binding patterns alongside the talk — it isn't a working, buildable application, and several pieces it references (SQL tables/stored procedures, a live Event Grid topic, etc.) aren't provisioned anywhere. See [Notes / known gaps](#notes--known-gaps) above.

## License

MIT — see [LICENSE](../LICENSE).
