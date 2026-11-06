import { app, InvocationContext, output, input } from "@azure/functions";
import { IBindingInfo } from "../models/models.js";
import { myService } from "../services/myService.js";

const blobInput = input.storageBlob({
  path: process.env.BindingInfoFile,
  connection: 'AzureWebJobsStorage',
});

const blobOutput = output.storageBlob({
  path: process.env.BindingInfoFile,
  connection: 'AzureWebJobsStorage',
});

export async function blobTrigger(blobItem: Buffer, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "blobTrigger";

  try {
    // Get bindingInfo file from blob storage
    const bindingInfo = context.extraInputs.get(blobInput) as IBindingInfo;

    // Do something with the blobItem
    const success = myService.ProcessBlobItem(blobItem);

    // Update bindingInfo and write to blob storage
    bindingInfo.lastRun = new Date();
    context.extraOutputs.set(blobOutput, bindingInfo);
  } catch (err) {
    console.error(LOG_SOURCE, "Blob item was not processed.", err);
    throw err;
  }
};

app.storageBlob('blobTrigger', {
  path: process.env.MyBlobPath,
  connection: 'AzureWebJobsStorage',
  extraInputs: [blobInput],
  extraOutputs: [blobOutput],
  handler: blobTrigger
});
