import { app, InvocationContext, input, output } from "@azure/functions";
import { IEGNotification, SubscriptionConfig } from "../models/SubscriptionModels.js";
import { AppInsightUtil, MessageType, SeverityLevel } from "../common/appinsightutil.js";
import { AuthService } from "../common/auth.js";
import { MyService } from "../services/myService.js";

const blobInput = input.storageBlob({
  path: process.env.SubscriptionFile,
  connection: 'AzureWebJobsStorage',
});

const blobOutput = output.storageBlob({
  path: process.env.SubscriptionFile,
  connection: 'AzureWebJobsStorage',
});

export async function notificationQueue(queueItem: IEGNotification, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "notificationQueue";
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
      let subscriptionConfig: SubscriptionConfig = context.extraInputs.get(blobInput) as SubscriptionConfig;
      if (subscriptionConfig == null) {
        subscriptionConfig = {
          subscriptionId: queueItem.data.subscriptionId,
          expirationDateTime: queueItem.data.subscriptionExpirationDateTime,
          lastToken: null,
          graphResource: queueItem.data.resource
        };
      }
      const lastToken = subscriptionConfig.lastToken;
      const lns = new MyService(_apu, auth);
      const updatedSubConfig = await lns.Process(subscriptionConfig);
      result = (lastToken !== updatedSubConfig.lastToken || updatedSubConfig.lastToken !== null);
      if (result) {
        context.extraOutputs.set(blobOutput, updatedSubConfig);
      }
      _apu.Log(MessageType.Trace, {
        message: `Completed: Initialized ${initialized} - Change Queue Processed ${result}`,
        logSource: LOG_SOURCE,
        properties: {
          initialized: initialized,
          changeQueueProcessed: result,
          lastToken: updatedSubConfig.lastToken,
          updatedLastToken: updatedSubConfig.lastToken
        },
        severity: (result) ? SeverityLevel.Information : SeverityLevel.Critical
      });
      if(!result){
        throw Error(`Failed to process queue item ${JSON.stringify(queueItem)}.`);
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
    throw Error(`Queue item was not processed. Error: ${err}`);
  }
}

app.storageQueue('notificationQueue', {
  queueName: process.env.NotificationQueuePath,
  connection: 'AzureWebJobsStorage',
  extraInputs: [blobInput],
  extraOutputs: [blobOutput],
  handler: notificationQueue
});
