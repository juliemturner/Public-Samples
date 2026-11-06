import { app, HttpRequest, HttpResponseInit, InvocationContext, output } from "@azure/functions";
import { IMyQueueItem } from "../models/models.js";

const queueOutput = output.storageQueue({
  queueName: process.env.MyQueuePath,
  connection: 'AzureWebJobsStorage',
});

export async function httpRequest(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const LOG_SOURCE = "queueTrigger";
  try {
    var requestBody = await request.json();
    var data: IMyQueueItem = requestBody as IMyQueueItem;
    context.extraOutputs.set(queueOutput, JSON.stringify(data));
    return { status: 200 };
  } catch (err) {
    console.error(LOG_SOURCE, "Failed http request", err);
    return { status: 500, body: JSON.stringify({ message: `Critical error - ${err}` }) };
  }
};

app.http('httpRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  extraOutputs: [queueOutput],
  handler: httpRequest,
});
