import { app, EventGridEvent, InvocationContext, output } from "@azure/functions";
import { IEGNotification } from "../models/SubscriptionModels.js";
import { AppInsightUtil, MessageType, SeverityLevel } from "../common/appinsightutil.js";
import { AuthService } from "../common/auth.js";
import "@pnp/graph/subscriptions/index.js";

const queueOutput = output.storageQueue({
  queueName: process.env.SubscriptionQueuePath,
  connection: 'AzureWebJobsStorage',
});

export async function eventGridSubscription(event: EventGridEvent, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "eventGridSubscription";
  let _apu = null;

  try {
    _apu = new AppInsightUtil();
    _apu?.Init(context.invocationId);

    _apu?.Log(MessageType.Event, {
      logSource: `${LOG_SOURCE}`,
      properties: {
        source: LOG_SOURCE,
        message: "Starting event grid subscription trigger",
        gridEvent: JSON.stringify(event)
      }
    });

    const expTime = new Date();
    expTime.setDate(expTime.getDate() + 29);

    const _auth = new AuthService(_apu);
    const success = _auth.Init();
    if(success){
      // Reauthorize subscription
      const subId = (event as unknown as IEGNotification).data.subscriptionId;
      const z = await _auth.graph.subscriptions.getById(subId).update({expirationDateTime: expTime.toISOString()});
      if(z.id.toLowerCase() === subId.toLowerCase()){
        _apu?.Log(MessageType.Trace, {
          message: `Subscription has been successfully renewed.`,
          logSource: LOG_SOURCE,
          severity: SeverityLevel.Information,
          properties: {
            subId: subId,
            expTime: expTime
          }
        });
      }else{
        _apu?.Log(MessageType.Trace, {
          message: `Subscription renewal failed, putting notification on queue.`,
          logSource: LOG_SOURCE,
          severity: SeverityLevel.Error,
          properties: {
            subId: subId,
            expTime: expTime
          }
        });
        context.extraOutputs.set(queueOutput, JSON.stringify(event));
      }
    }
  } catch (err) {
    // If error then put event notification on the queue
    context.extraOutputs.set(queueOutput, JSON.stringify(event));
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

app.eventGrid('eventGridSubscription', {
  handler: eventGridSubscription,
  extraOutputs: [queueOutput]
});
