import { app, EventGridEvent, InvocationContext, output } from "@azure/functions";

const eventGridOutput = output.eventGrid({
  topicEndpointUri: 'ForwardTopicEndpointUri',
  topicKeySetting: 'ForwardTopicKey',
});

const queueOutput = output.storageQueue({
  queueName: process.env.MyQueuePath,
  connection: 'AzureWebJobsStorage',
});

export async function eventGridListChanged(event: EventGridEvent, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "eventGridListChanged";

  try {
    if (event.data.resource === "Groups/cf653542-be15-4568-87d4-37613d8a21f5") {
      context.extraOutputs.set(queueOutput, JSON.stringify(event.data));
    } else {
      // Forward the received event as-is to the downstream custom topic
      context.extraOutputs.set(eventGridOutput, event);
    }
  } catch (err) {
    console.error(LOG_SOURCE, "General Failure", err);
    throw err;
  }
}

app.eventGrid('eventGridListChanged', {
  handler: eventGridListChanged,
  extraOutputs: [eventGridOutput, queueOutput]
});
