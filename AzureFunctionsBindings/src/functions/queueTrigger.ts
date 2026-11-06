import { app, InvocationContext } from "@azure/functions";
import { QueueClient } from "@azure/storage-queue";
import { IMyQueueItem } from "../models/models";
import { myService } from "../services/myService";

export async function queueTrigger(queueItem: IMyQueueItem, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "queueTrigger";

  try {
    // process queueItem
    const success = myService.ProcessQueueItem(queueItem);

    // Alternate: Requeue logic
    if (!success) {
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
    } else {
      context.log(LOG_SOURCE, "Queue item processed successfully.");
    }
  } catch (err) {
    console.error(LOG_SOURCE, "Queue item was not processed.", err);
    throw err;
  }
}

app.storageQueue('queueTrigger', {
  queueName: process.env.MyQueuePath,
  connection: 'AzureWebJobsStorage',
  handler: queueTrigger
});
