import { app, InvocationContext } from "@azure/functions";
import { QueueClient } from "@azure/storage-queue";
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
    // Used to throw exception in AppInsights and will be requeued based on settings in host.json
    if (!result) {
      throw Error(`Error processing queue item ${JSON.stringify(queueItem)}`);
    }
    // Alternate: Requeue logic
    if (!result) {
      const queueClient = new QueueClient(
        process.env.AzureWebJobsStorage,
        process.env.MyQueuePath
      );

      const response = await queueClient.updateMessage(
        context.triggerMetadata.id as string,
        context.triggerMetadata.popReceipt as string,
        Buffer.from(JSON.stringify(queueItem)).toString("base64"),
        300
      );

      _apu.Log(MessageType.Trace, {
        message: `Requeued Item - Incomplete`,
        logSource: LOG_SOURCE,
        properties: {
          method: "{function}",
          result: response.errorCode || "Success",
          messageId: context.triggerMetadata.id,
          popReceipt: context.triggerMetadata.popReceipt,
          queueItem: JSON.stringify(queueItem)
        },
        severity: (response.errorCode) ? SeverityLevel.Error : SeverityLevel.Information
      });

      if (response.errorCode) {
        throw Error(`Could not requeue item.`);
      }
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
