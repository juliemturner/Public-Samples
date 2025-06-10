import { app, InvocationContext } from "@azure/functions";
import { AppInsightUtil, MessageType, SeverityLevel } from "../common/appinsightutil.js";
import { AuthService } from "../common/auth.js";
import { IMyQueueItem } from "../models/models.js";
import { MyService } from "../services/myService.js";

export async function queueTrigger(queueItem: IMyQueueItem, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "provisionQueue";
  const _apu = new AppInsightUtil();
  _apu.Init(context.invocationId);

  _apu.Log(MessageType.Event, {
    logSource: `${LOG_SOURCE}`,
    properties: {
      source: LOG_SOURCE,
      message: "Starting notification queue trigger"
    }
  });

  try {
    const auth = new AuthService(_apu);
    const initialized = await auth.Init();
    let result = false;
    if (initialized) {
      const myService = new MyService(_apu, auth);
      result = await myService.Process(queueItem);
    }
    _apu.Log(MessageType.Trace, {
      message: `Completed: Initialized ${initialized} - Processed ${result}`,
      logSource: LOG_SOURCE,
      properties: {
        initialized: initialized,
        provisionProcessed: result
      },
      severity: (result) ? SeverityLevel.Information : SeverityLevel.Critical
    });
    if (!result) {
      throw Error(`Error processing queue item ${JSON.stringify(queueItem)}`);
    }
  } catch (err) {
    _apu.Log(MessageType.Exception, {
      logSource: LOG_SOURCE,
      exception: err,
      severity: SeverityLevel.Critical,
      properties: {
        method: "notificationQueue"
      }
    });
    throw Error(`Queue item was not processed. ${err}`);
  }
}

app.storageQueue('queueTrigger', {
  queueName: process.env.MyQueuePath,
  connection: 'AzureWebJobsStorage',
  handler: queueTrigger
});
