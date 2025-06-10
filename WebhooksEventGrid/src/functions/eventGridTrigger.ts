import { app, EventGridEvent, InvocationContext, output } from "@azure/functions";
import { AppInsightUtil, MessageType, SeverityLevel } from "../common/appinsightutil.js";

const queueOutput = output.storageQueue({
  queueName: process.env.NotificationQueuePath,
  connection: 'AzureWebJobsStorage',
});

export async function eventGridListChanged(event: EventGridEvent, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "eventGridListChanged";
  let _apu = null;

  try {
    _apu = new AppInsightUtil();
    _apu?.Init(context.invocationId);

    _apu?.Log(MessageType.Event, {
      logSource: `${LOG_SOURCE}`,
      properties: {
        source: LOG_SOURCE,
        message: "Starting event grid list changed trigger",
        gridEvent: JSON.stringify(event)
      }
    });
    
    context.extraOutputs.set(queueOutput, JSON.stringify(event));
  } catch (err) {
    if (_apu != null) {
      _apu.Log(MessageType.Exception, {
        logSource: LOG_SOURCE,
        exception: err,
        severity: SeverityLevel.Critical,
        properties: {
          method: "eventGridSubscription"
        }
      });
    } else {
      console.error(`${this.LOG_SOURCE} - General Failure`, err);
    }
  }
}

app.eventGrid('eventGridListChanged', {
  handler: eventGridListChanged,
  extraOutputs: [queueOutput]
});
